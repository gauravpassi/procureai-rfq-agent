"use client";

import { AgentNarrative } from "./agent-narrative";
import { SourcePreview } from "./source-preview";
import { Pill } from "@/components/pill";
import { Btn } from "@/components/btn";
import { Icon } from "@/components/icon";

const BOM_PACKAGES = [
  { label: "Structures · galvanised steel", qty: "14 lines · ~₹1.4 Cr", status: "Match · 5 vendors", done: true },
  { label: "Modules · 540W bifacial",       qty: "4 lines · ~₹2.1 Cr",  status: "Match · 3 vendors", done: true },
  { label: "Inverters · string 100kW",      qty: "6 lines · ~₹0.8 Cr",  status: "Matching…",         done: false },
  { label: "Cables & accessories",          qty: "8 lines · ~₹0.5 Cr",  status: "Queued",            done: false },
];

export function DraftSalesforce() {
  return (
    <div className="overflow-auto p-[22px] flex flex-col gap-4">
      <SourcePreview source="salesforce">
        <div className="flex items-center gap-2.5">
          <Pill tone="info" size="sm">Opportunity</Pill>
          <span className="text-[13px] font-medium">Project Aurora · 0061a0000aBcDeF</span>
        </div>
        <div className="text-[12.5px] text-text-secondary mt-2 leading-[1.55]">
          Solar tracker rollout · 18 sites in Gujarat. BOM uploaded by{" "}
          <strong>Vivek Rao</strong> (Project Manager): 32 line items totalling ₹4.8 Cr.
        </div>
        <div className="mt-2.5 p-2.5 bg-inset rounded-lg text-[12px] text-text-secondary">
          Attached: <strong>Aurora-BOM-v3.xlsx</strong> · 32 lines · last edited 14 min ago
        </div>
      </SourcePreview>

      <AgentNarrative signalId="s3" />

      <div className="bg-app border border-border-DEFAULT rounded-[10px] overflow-hidden">
        <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
          <Pill tone="info" icon="refresh" size="md">Splitting BOM into 4 RFQs</Pill>
          <span className="text-[12px] text-text-tertiary num">~40s remaining</span>
        </div>
        {BOM_PACKAGES.map((pkg) => (
          <div key={pkg.label}
            className="px-4 py-3 border-t border-border-subtle flex items-center gap-3">
            <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 ${
              pkg.done ? "bg-success-soft text-success" : "bg-muted text-text-tertiary"
            }`}>
              {pkg.done
                ? <Icon name="check" size={11} strokeWidth={2.5} />
                : <div className="w-[5px] h-[5px] rounded-full bg-current" />
              }
            </div>
            <div className="flex-1 text-[13.5px] font-medium text-text-primary">{pkg.label}</div>
            <div className="text-[12px] text-text-tertiary num">{pkg.qty}</div>
            <div className={`text-[12px] w-32 text-right ${pkg.done ? "text-success" : "text-text-tertiary"}`}>
              {pkg.status}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Btn kind="secondary" size="md" disabled>Review when ready</Btn>
      </div>
    </div>
  );
}
