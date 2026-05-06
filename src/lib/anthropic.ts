import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Real Anthropic Claude client — used for agent-layer reasoning across
 * Intake (drafting RFQs from signals), Buyer dashboard (recommendations),
 * Approver (rationale generation), Supplier (clarification routing), etc.
 *
 * Per build decision (2026-05-04): we wire the real LLM from Phase 0 — no
 * mocking. Each call site provides its own system prompt; the model + caching
 * defaults are centralized here.
 *
 * Caching strategy: long, static system prompts (persona-specific instructions
 * + master data references) are marked with cache_control so we hit the
 * 5-minute cache TTL on repeated calls. Use the helper `buildSystemBlocks`
 * to wire that up at call sites.
 */

const defaultModel = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-7";

// Lightweight model for fast tasks: narrative generation, field enrichment, routing
export const HAIKU_MODEL = "claude-haiku-4-5";

/**
 * Lazily-initialized Anthropic client. Deferred so module-level evaluation
 * during `next build` does NOT throw — the check runs at the first real
 * API call (request time), not at module import time.
 */
let _anthropic: Anthropic | null = null;

/**
 * Resolve the Anthropic API key.
 *
 * Next.js loads .env.local but will NOT override a shell variable that is
 * already set — even to an empty string. Claude Code's shell exports
 * ANTHROPIC_API_KEY="" which blocks the .env.local value from being seen.
 *
 * Fix: if process.env is empty/missing, read .env.local directly. This is
 * server-only code so fs access is safe. In production the platform sets the
 * real key and we never reach the file-fallback path.
 */
function resolveApiKey(): string {
  const fromEnv = process.env.ANTHROPIC_API_KEY;
  if (fromEnv) return fromEnv;

  // Fallback: parse .env.local ourselves (dev only)
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
    const m = raw.match(/^ANTHROPIC_API_KEY=["']?([^"'\r\n]+)["']?/m);
    if (m?.[1]) return m[1];
  } catch { /* .env.local not present — production is fine */ }

  throw new Error("ANTHROPIC_API_KEY is not set in environment or .env.local");
}

export function getAnthropicClient(): Anthropic {
  if (_anthropic) return _anthropic;
  _anthropic = new Anthropic({ apiKey: resolveApiKey() });
  return _anthropic;
}

/** @deprecated Use getAnthropicClient() — kept for compat while migrating call sites */
export const anthropic = new Proxy({} as Anthropic, {
  get(_target, prop) {
    return (getAnthropicClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const ANTHROPIC_MODEL = defaultModel;

/**
 * Build a system content array with cache_control on the static portion.
 * The first block is treated as the long, cacheable preamble; the second
 * (optional) is per-request dynamic context.
 */
type CacheableTextBlock = Anthropic.Messages.TextBlockParam & {
  cache_control?: { type: "ephemeral" };
};

export function buildSystemBlocks(staticPreamble: string, dynamic?: string): CacheableTextBlock[] {
  const blocks: CacheableTextBlock[] = [
    {
      type: "text",
      text: staticPreamble,
      cache_control: { type: "ephemeral" },
    },
  ];
  if (dynamic) blocks.push({ type: "text", text: dynamic });
  return blocks;
}
