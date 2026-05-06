"use client";

import { useState } from "react";
import { AgentNarrative } from "./agent-narrative";
import { SourcePreview } from "./source-preview";
import { Pill } from "@/components/pill";
import { Btn } from "@/components/btn";
import { Icon } from "@/components/icon";

export function DraftSlack() {
  const [raised, setRaised] = useState(false);

  return (
    <div className="overflow-auto p-[22px] flex flex-col gap-4">
      <SourcePreview source="slack">
        <div className="text-[12px] text-text-tertiary">#plant2-maint · Anand Iyer · 1h ago</div>
        <div className="text-[13px] text-text-primary mt-1.5 leading-[1.5]">
          &ldquo;@procureai bearings 6205 again, conveyor 3 noisy. need 4 ish? can someone order&rdquo;
        </div>
        <div className="text-[12px] text-text-tertiary mt-1.5">3 reactions · 1 reply</div>
      </SourcePreview>

      <AgentNarrative signalId="s4" />

      {!raised ? (
        <div className="bg-app border border-border-DEFAULT rounded-[10px] overflow-hidden">
          <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2.5">
            <Pill tone="warn" icon="info" size="md">Stock available — RFQ may not be needed</Pill>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="text-[13.5px] text-text-primary">
              <strong>Available:</strong> 42 × SKF 6205-2RS · Plant 1 Stores · 2-day transfer
            </div>
            <div className="text-[12.5px] text-text-secondary leading-[1.55]">
              Agent suggests: reply to Anand on Slack with &ldquo;Stock available, raising STO instead. ETA 2 days.&rdquo;{" "}
              If you&apos;d rather order new, agent can draft an RFQ for 4 units to 2 SKF distributors.
            </div>
            <div className="flex gap-2 mt-1">
              <Btn kind="dark" size="md" icon="package" onClick={() => setRaised(true)}>
                Raise STO from Plant 1
              </Btn>
              <Btn kind="secondary" size="md">Draft RFQ instead</Btn>
              <Btn kind="ghost" size="md">Reply to Anand</Btn>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-4 bg-success-soft border border-success-border rounded-[10px]">
          <Icon name="check" size={18} className="text-success shrink-0" />
          <div className="text-[13px] text-text-primary">
            STO raised. Agent replied on Slack:{" "}
            <em className="not-italic text-text-secondary">
              &ldquo;Stock at Plant 1, 42 units. Transfer ETA May 6.&rdquo;
            </em>
          </div>
        </div>
      )}
    </div>
  );
}
