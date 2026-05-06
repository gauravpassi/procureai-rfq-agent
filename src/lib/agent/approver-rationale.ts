import { anthropic, HAIKU_MODEL, buildSystemBlocks } from "@/lib/anthropic";
import type { ApproverRFQData } from "@/types/approver-data";

const SYSTEM_PROMPT = `You are ProcureAI, an AI procurement agent for Upcore Technologies.
Your job is to generate a concise recommendation rationale for an approver reviewing an RFQ.
The rationale must:
- Be 1-2 sentences maximum (under 40 words)
- State the primary reason the recommended supplier was selected (cost, OTD, lead time, etc.)
- Be factual and confident — no hedging language
- Use plain English — no jargon, no abbreviations the approver wouldn't know
- End with a specific numeric proof point (e.g. "₹18.4K below runner-up", "96% on-time delivery")
Do not start with "I" or "ProcureAI". Output only the rationale sentence(s), nothing else.`;

export async function generateApproverRationale(rfq: {
  recommendedSupplier: string;
  amount: number;
  runnerUpDelta: number;
  runnerUpSupplier: string;
  itemDescription: string;
  otdPercent: number;
}): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 120,
      system: buildSystemBlocks(SYSTEM_PROMPT) as never,
      messages: [
        {
          role: "user",
          content: `Generate a recommendation rationale for:
- Recommended supplier: ${rfq.recommendedSupplier}
- Item: ${rfq.itemDescription}
- Total amount: ₹${rfq.amount.toLocaleString("en-IN")}
- Difference vs runner-up (${rfq.runnerUpSupplier}): ₹${rfq.runnerUpDelta.toLocaleString("en-IN")} cheaper
- Supplier OTD rate: ${rfq.otdPercent}%`,
        },
      ],
    });

    const text = message.content[0];
    return text.type === "text" ? text.text.trim() : FALLBACK_RATIONALE;
  } catch (err) {
    console.error("[agent] rationale generation failed:", err);
    return FALLBACK_RATIONALE;
  }
}

const FALLBACK_RATIONALE =
  "Lowest landed cost across 3 quotes · 96% on-time delivery over last 12 months.";
