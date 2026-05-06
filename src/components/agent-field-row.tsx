"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icon";
import { Btn } from "@/components/btn";
import { Pill } from "@/components/pill";
import type { AgentField, AgentSource } from "@/types/agent-field";
import { isLowConfidence } from "@/types/agent-field";

const sourceIcon: Record<AgentSource, IconName> = {
  outlook: "mail",
  sap: "package",
  salesforce: "building",
  coupa: "rupee",
  slack: "slack",
  drive: "file",
  teams: "user",
  agent: "spark",
  user: "user",
};

const sourceLabel: Record<AgentSource, string> = {
  outlook: "Outlook",
  sap: "SAP",
  salesforce: "Salesforce",
  coupa: "Coupa",
  slack: "Slack",
  drive: "Drive",
  teams: "Teams",
  agent: "ProcureAI",
  user: "User",
};

interface Props<T> {
  label: string;
  field: AgentField<T>;
  /** Render value (defaults to String(value)) */
  render?: (value: T) => ReactNode;
  /** Show "Confirm" button if confidence < 80%. Defaults true. */
  allowConfirm?: boolean;
  onConfirm?: () => void;
  numeric?: boolean;
  className?: string;
}

/**
 * The shared provenance row — every agent-supplied field renders through this.
 * Produces:
 *   <Label>
 *   <Value>            <Confirm? if low confidence>
 *   <SourceIcon> Source · primary citation · NN%
 */
export function AgentFieldRow<T>({
  label,
  field,
  render,
  allowConfirm = true,
  onConfirm,
  numeric,
  className,
}: Props<T>) {
  const lowConf = isLowConfidence(field);
  const primaryCitation = field.citations?.[0];
  const pct = Math.round(field.confidence * 100);
  return (
    <div className={cn("py-2", className)}>
      <div className="text-[12px] text-text-tertiary">{label}</div>
      <div className="mt-0.5 flex items-center gap-2">
        <div className={cn("text-sm text-text-primary", numeric && "num font-medium")}>
          {render ? render(field.value) : String(field.value)}
        </div>
        {lowConf && allowConfirm && (
          <Btn kind="secondary" size="sm" onClick={onConfirm} icon="check">
            Confirm
          </Btn>
        )}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-text-tertiary">
        <Icon name={sourceIcon[field.source]} size={11} />
        <span>
          {sourceLabel[field.source]}
          {primaryCitation && <> · {primaryCitation.ref}</>}
        </span>
        <span aria-hidden="true">·</span>
        <Pill tone={lowConf ? "warn" : "agent"} size="sm">
          {pct}%
        </Pill>
      </div>
    </div>
  );
}
