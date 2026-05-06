"use client";

import { useEffect, useState } from "react";
import { AgentNarrative } from "./agent-narrative";
import { SourcePreview } from "./source-preview";
import { SentState } from "./sent-state";
import { Pill } from "@/components/pill";
import { Btn } from "@/components/btn";

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="px-4 py-3 border-t border-border-subtle grid gap-3.5 items-start"
      style={{ gridTemplateColumns: "120px 1fr" }}>
      <div className="text-[12px] text-text-tertiary">{label}</div>
      <div>
        <div className="text-[13.5px] font-medium text-text-primary">{value}</div>
        {sub && <div className="text-[12px] text-text-tertiary mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export function DraftCoupa() {
  const [seconds, setSeconds] = useState(30);
  const [paused, setPaused] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (paused || sent) return;
    if (seconds <= 0) { setSent(true); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, paused, sent]);

  if (sent) return <SentState rfqId="RFQ-2026-0423" suppliers={3} deadline="May 12, 5 PM IST" />;

  return (
    <div className="overflow-auto p-[22px] flex flex-col gap-4">
      <SourcePreview source="coupa">
        <div className="text-[12px] text-text-tertiary">Coupa · Req-9921 · approved by D. Mehta</div>
        <div className="text-[13px] text-text-primary mt-1.5 leading-[1.5]">
          50 boxes · ESAB welding electrodes E7018 · Plant 2 fab shop · need by May 15
        </div>
      </SourcePreview>

      <AgentNarrative signalId="s6" />

      <div className="bg-app border border-border-DEFAULT rounded-[10px] overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          {paused ? (
            <Pill tone="neutral" size="md">Auto-send paused</Pill>
          ) : (
            <Pill tone="agent" icon="spark" size="md">
              Auto-send in {seconds}s
            </Pill>
          )}
          <Btn kind="ghost" size="sm" onClick={() => setPaused((p) => !p)}>
            {paused ? "Resume" : "Pause"}
          </Btn>
        </div>
        <Row label="Material" value="ESAB E7018 welding electrodes · 3.15mm" />
        <Row label="Quantity" value="50 boxes (5 kg each)" />
        <Row label="Required by" value="May 15, 2026" />
        <Row label="Suppliers" value="3 ESAB-authorised dealers"
          sub="Sai Welding, Ador Welding, Bhilai Steel Tools" />
      </div>

      {paused && (
        <div className="flex justify-end gap-2">
          <Btn kind="ghost" size="md">Edit fields</Btn>
          <Btn kind="dark" size="md" iconRight="arrowRight" onClick={() => setSent(true)}>
            Send now
          </Btn>
        </div>
      )}
    </div>
  );
}
