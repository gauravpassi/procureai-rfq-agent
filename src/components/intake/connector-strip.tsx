import type { Connector } from "@/types/intake";
import { ConnectorIcon } from "./connector-icon";
import { cn } from "@/lib/cn";

const CONNECTORS: Connector[] = [
  { key: "sap",        label: "SAP MM",     status: "on",  count: "3 PRs" },
  { key: "outlook",    label: "Outlook",    status: "on",  count: "12 emails" },
  { key: "salesforce", label: "Salesforce", status: "on",  count: "1 BOM" },
  { key: "coupa",      label: "Coupa",      status: "on",  count: "2 reqs" },
  { key: "slack",      label: "Slack",      status: "on",  count: "4 msgs" },
  { key: "drive",      label: "Drive",      status: "on",  count: "6 files" },
  { key: "teams",      label: "Teams",      status: "on",  count: "—" },
];

function ConnectorChip({ connector }: { connector: Connector }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-app border border-border-DEFAULT rounded-[7px] text-[12px] shrink-0">
      <ConnectorIcon kind={connector.key} size={14} />
      <span className="font-medium text-text-primary">{connector.label}</span>
      <span className="text-text-tertiary">· {connector.count}</span>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full ml-0.5",
        connector.status === "on" ? "bg-success" : connector.status === "degraded" ? "bg-warn" : "bg-text-tertiary",
      )} />
    </div>
  );
}

export function ConnectorStrip() {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border-subtle bg-subtle overflow-x-auto shrink-0">
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-text-tertiary shrink-0">
        Connectors
      </span>
      <div className="flex gap-2">
        {CONNECTORS.map((c) => <ConnectorChip key={c.key} connector={c} />)}
      </div>
      <div className="flex-1" />
      <span className="text-[11.5px] text-text-tertiary shrink-0">
        Last sync: <span className="num">12s ago</span>
      </span>
    </div>
  );
}
