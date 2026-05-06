import type { ReactNode } from "react";
import type { SignalSource } from "@/types/intake";
import { ConnectorIcon } from "./connector-icon";

interface Props {
  source: SignalSource;
  children: ReactNode;
}

export function SourcePreview({ source, children }: Props) {
  const label: Record<SignalSource, string> = {
    outlook: "Outlook", sap: "SAP MM", salesforce: "Salesforce",
    coupa: "Coupa", slack: "Slack", drive: "Drive", teams: "Teams",
  };
  return (
    <div className="bg-app border border-border-DEFAULT rounded-[10px] overflow-hidden">
      <div className="flex items-center gap-2 px-3.5 py-2 bg-subtle border-b border-border-subtle">
        <ConnectorIcon kind={source} size={13} />
        <span className="text-[11px] font-medium tracking-[0.06em] uppercase text-text-tertiary">
          Original signal · {label[source]}
        </span>
      </div>
      <div className="p-3.5">{children}</div>
    </div>
  );
}
