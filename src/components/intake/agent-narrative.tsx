"use client";

/**
 * AgentNarrative — purple reasoning block that streams Claude Haiku tokens
 * word-by-word from /api/intake/narrate. The streaming effect is the key
 * demo moment: buyer watches the agent explain its reasoning in real time.
 *
 * Uses fetch + ReadableStream (not EventSource) for abort control.
 */

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/cn";

interface Props {
  signalId: string;
  className?: string;
}

export function AgentNarrative({ signalId, className }: Props) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    setText("");
    setDone(false);

    const abort = new AbortController();
    abortRef.current = abort;

    (async () => {
      try {
        const res = await fetch(`/api/intake/narrate?signal=${signalId}`, {
          signal: abort.signal,
        });
        if (!res.ok || !res.body) { setDone(true); return; }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done: rdDone, value } = await reader.read();
          if (rdDone) break;

          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const payload = JSON.parse(line.slice(6));
              if (payload.token) setText((prev) => prev + payload.token);
              if (payload.done) setDone(true);
            } catch { /* malformed line */ }
          }
        }
        setDone(true);
      } catch (e: unknown) {
        // AbortError is expected on signal change — silence it
        if (e instanceof Error && e.name !== "AbortError") console.error("[AgentNarrative]", e);
        setDone(true);
      }
    })();

    return () => abort.abort();
  }, [signalId]);

  // Parse **bold** markdown into JSX
  const renderText = (raw: string) => {
    const parts = raw.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i} className="text-text-primary font-semibold">{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <div
      className={cn(
        "flex gap-2.5 items-start rounded-[10px] px-3.5 py-3",
        "bg-agent-soft border border-agent-border",
        className,
      )}
    >
      <div className="text-agent mt-0.5 shrink-0">
        <Icon name="spark" size={15} />
      </div>
      <p className="text-[12.5px] leading-[1.6] text-text-secondary min-h-[18px]">
        {text ? renderText(text) : null}
        {/* Blinking cursor while streaming */}
        {!done && (
          <span className="inline-block w-[2px] h-[13px] bg-agent align-[-2px] ml-0.5 animate-pulse" />
        )}
        {/* Placeholder dots before first token */}
        {!text && !done && <span className="text-text-tertiary">···</span>}
      </p>
    </div>
  );
}
