import { AgentNarrative } from "./agent-narrative";
import { SourcePreview } from "./source-preview";
import { Btn } from "@/components/btn";
import { Icon } from "@/components/icon";

export function DraftDrive() {
  return (
    <div className="overflow-auto p-[22px] flex flex-col gap-4">
      <SourcePreview source="drive">
        <div className="flex items-center gap-2.5">
          <Icon name="file" size={20} className="text-text-tertiary" />
          <div>
            <div className="text-[13.5px] font-medium text-text-primary">
              Hydraulic-hose-spec-v2.pdf
            </div>
            <div className="text-[11.5px] text-text-tertiary mt-0.5">
              Drive · /specs/inbox · uploaded by Ravi (Engineering)
            </div>
          </div>
        </div>
      </SourcePreview>

      <AgentNarrative signalId="s5" />

      <div className="bg-app border border-border-DEFAULT rounded-[10px] p-4 flex flex-col gap-2">
        <div className="text-[13.5px] font-medium text-text-primary">Awaiting linked PR</div>
        <div className="text-[12.5px] text-text-secondary leading-[1.55]">
          Spec is parsed and shelved. Agent will draft RFQ automatically once a purchase
          request cites this file.
        </div>
        <div className="flex gap-2 mt-1">
          <Btn kind="secondary" size="sm" icon="mail">Ping Ravi for PR</Btn>
          <Btn kind="ghost" size="sm">Create PR for Ravi</Btn>
        </div>
      </div>

      {/* Parsed spec summary */}
      <div className="bg-app border border-border-DEFAULT rounded-[10px] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border-subtle">
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-tertiary">
            Parsed spec
          </span>
        </div>
        {[
          ["Material", "1-inch braided hydraulic hose"],
          ["Pressure", "280 bar working pressure"],
          ["Variants", "6 quantity variants"],
          ["Lead time", "21 days target"],
        ].map(([k, v]) => (
          <div key={k} className="px-4 py-2.5 border-t border-border-subtle grid gap-3.5"
            style={{ gridTemplateColumns: "120px 1fr" }}>
            <div className="text-[12px] text-text-tertiary">{k}</div>
            <div className="text-[13px] font-medium text-text-primary">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
