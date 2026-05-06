"use client";

import { useState } from "react";
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

export function DraftSAP() {
  const [sent, setSent] = useState(false);
  if (sent) return <SentState rfqId="RFQ-2026-0422" suppliers={3} />;

  return (
    <div className="overflow-auto p-[22px] flex flex-col gap-4">
      <SourcePreview source="sap">
        <div className="font-mono text-[12px] text-text-secondary leading-[1.75]">
          {[
            ["Doc type", "NB · Standard PR"],
            ["PR no", "4500001234"],
            ["Material", "700-CNC-INS-CNMG"],
            ["Qty / UOM", "200 / EA"],
            ["Plant / SLoc", "2000 / 0001"],
            ["Cost ctr", "PLT2-PROD-Q2"],
            ["Delivery", "14.05.2026"],
            ["Created by", "RAJESH.K"],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="text-text-tertiary">{k}:</span>{" "}
              <strong className="text-text-primary">{v}</strong>
            </div>
          ))}
        </div>
      </SourcePreview>

      <AgentNarrative signalId="s2" />

      <div className="bg-app border border-border-DEFAULT rounded-[10px] overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Pill tone="agent" icon="spark" size="md">Drafted RFQ</Pill>
            <span className="mono text-[12px] text-text-tertiary">RFQ-2026-0422 · draft</span>
          </div>
          <Pill tone="success" icon="check" size="sm">100% mapped from SAP</Pill>
        </div>
        <Row label="Material" value="CNC turning inserts · CNMG 120408 · TiAlN coated" sub="SAP code 700-CNC-INS-CNMG" />
        <Row label="Quantity" value="200 EA" />
        <Row label="Required by" value="May 14, 2026" />
        <Row label="Cost center" value="PLT2-PROD-Q2 · ₹4.6L remaining" sub="Within budget" />
        <Row label="Suppliers" value="3 shortlisted" sub="Mitsubishi Materials, Sandvik, Kennametal" />
      </div>

      <div className="flex justify-end gap-2">
        <Btn kind="ghost" size="md">Edit</Btn>
        <Btn kind="dark" size="md" iconRight="arrowRight" onClick={() => setSent(true)}>
          Send to 3 suppliers
        </Btn>
      </div>
    </div>
  );
}
