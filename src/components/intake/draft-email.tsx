"use client";

import { useState } from "react";
import { AgentNarrative } from "./agent-narrative";
import { SourcePreview } from "./source-preview";
import { DraftField } from "./draft-field";
import { SentState } from "./sent-state";
import { Pill } from "@/components/pill";
import { Btn } from "@/components/btn";
import type { DraftField as DraftFieldType } from "@/types/intake";

const FIELDS: DraftFieldType[] = [
  {
    key: "material", label: "Material",
    value: "Stainless steel 316 flanges, 80mm slip-on, IS 6392",
    provenance: "Email line 3 + thread spec attachment", confidence: 98, source: "outlook",
  },
  {
    key: "qty", label: "Quantity", value: "500 kg",
    provenance: "Email line 3", confidence: 99, source: "outlook",
  },
  {
    key: "need", label: "Required by", value: "May 14, 2026",
    provenance: 'Email subject ("urgent") + SAP plant maintenance schedule',
    confidence: 88, source: "outlook", enriched: "sap",
  },
  {
    key: "plant", label: "Deliver to", value: "Plant 2, Pune (411 026)",
    provenance: "Sender profile in SAP HCM", confidence: 100, source: "sap",
  },
  {
    key: "cost", label: "Cost center", value: "PLT2-MAINT-Q2",
    provenance: "SAP HR cost center for Priya Menon", confidence: 100, source: "sap",
  },
  {
    key: "budget", label: "Budget", value: "₹18.2L remaining",
    sub: "Estimated PO ₹3.4L · within budget",
    provenance: "SAP CO budget snapshot", confidence: 100, source: "sap",
  },
  {
    key: "suppliers", label: "Suppliers", value: "4 shortlisted",
    sub: "Hindalco Forgings, Bharat Steel, Steelmark, MTI Forge",
    provenance: "Vendor master · IS 6392 certified · last 12mo OTD ≥ 85%",
    confidence: 95, source: "sap",
  },
];

export function DraftEmail() {
  const [sent, setSent] = useState(false);

  if (sent) return <SentState rfqId="RFQ-2026-0421" suppliers={4} />;

  return (
    <div className="overflow-auto p-[22px] flex flex-col gap-4">
      {/* Source: original email */}
      <SourcePreview source="outlook">
        <div className="text-[12px] text-text-tertiary">
          From <strong className="text-text-primary">Priya Menon</strong> · Plant 2 Maintenance Head · 9:42 AM
        </div>
        <div className="text-[13px] text-text-primary mt-1.5 leading-[1.6]">
          &ldquo;Asha — we need{" "}
          <mark className="bg-accent-soft rounded-sm px-0.5 font-medium text-text-primary not-italic">
            500 kg of SS 316 flanges
          </mark>{" "}
          (80mm slip-on, IS 6392) for the boiler retrofit at Plant 2. Need them{" "}
          <mark className="bg-accent-soft rounded-sm px-0.5 font-medium text-text-primary not-italic">
            by mid-May at the latest
          </mark>
          . Shop floor team has the spec PDF — attaching. Push this through, please.&rdquo;
        </div>
        <div className="text-[11px] text-text-tertiary mt-2">
          1 attachment ·{" "}
          <span className="text-text-secondary">SS316-flange-IS6392.pdf</span>
        </div>
      </SourcePreview>

      {/* Streaming Claude Haiku narrative */}
      <AgentNarrative signalId="s1" />

      {/* Draft fields */}
      <div className="bg-app border border-border-DEFAULT rounded-[10px] overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Pill tone="agent" icon="spark" size="md">Drafted RFQ</Pill>
            <span className="mono text-[12px] text-text-tertiary">RFQ-2026-0421 · draft</span>
          </div>
          <Btn kind="ghost" size="sm" icon="eye">Supplier preview</Btn>
        </div>
        {FIELDS.map((f) => <DraftField key={f.key} field={f} />)}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-app border border-border-DEFAULT rounded-[10px]">
        <div className="text-[12.5px] text-text-secondary">
          Sending to <strong className="text-text-primary">4 suppliers</strong> · quote deadline{" "}
          <strong className="text-text-primary">May 8, 5 PM IST</strong>
        </div>
        <div className="flex gap-2">
          <Btn kind="ghost" size="md">Edit fields</Btn>
          <Btn kind="secondary" size="md" icon="user">Add suppliers</Btn>
          <Btn kind="dark" size="md" iconRight="arrowRight" onClick={() => setSent(true)}>
            Send RFQ
          </Btn>
        </div>
      </div>
    </div>
  );
}
