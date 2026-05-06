"use client";

import { useState } from "react";
import type { DraftField as DraftFieldType } from "@/types/intake";
import { ConnectorIcon } from "./connector-icon";
import { Btn } from "@/components/btn";
import { cn } from "@/lib/cn";

interface Props {
  field: DraftFieldType;
}

export function DraftField({ field }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.value);

  const lowConf = field.confidence < 90;
  const sourceLabel: Record<string, string> = {
    email: "Email", outlook: "Outlook", sap: "SAP", salesforce: "Salesforce",
    coupa: "Coupa", slack: "Slack", drive: "Drive", teams: "Teams",
  };

  return (
    <div className="px-4 py-3 border-t border-border-subtle grid gap-3.5 items-start"
      style={{ gridTemplateColumns: "120px 1fr auto" }}>
      {/* Label */}
      <div className="text-[12px] text-text-tertiary pt-0.5">{field.label}</div>

      {/* Value + provenance */}
      <div>
        {editing ? (
          <input
            autoFocus
            className="w-full h-7 px-2 text-[13px] border border-accent rounded-md bg-app text-text-primary outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
          />
        ) : (
          <div className="text-[13.5px] font-medium text-text-primary">{editValue}</div>
        )}
        {field.sub && (
          <div className="text-[12px] text-text-secondary mt-0.5">{field.sub}</div>
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <ConnectorIcon kind={field.source} size={11} />
          <span className="text-[11px] text-text-tertiary">{sourceLabel[field.source]}</span>
          <span className="text-[11px] text-text-tertiary">·</span>
          <span className="text-[11px] text-text-tertiary truncate max-w-[260px]">{field.provenance}</span>
          {field.enriched && (
            <>
              <span className="text-[11px] text-text-tertiary">·</span>
              <span className="text-[11px] text-agent">cross-checked {field.enriched.toUpperCase()}</span>
            </>
          )}
        </div>
      </div>

      {/* Confidence + action */}
      <div className="flex items-center gap-2 pt-0.5">
        <span className={cn("text-[11px] font-medium num tabular-nums",
          lowConf ? "text-warn" : "text-success"
        )}>
          {field.confidence}%
        </span>
        {lowConf && !confirmed ? (
          <Btn kind="secondary" size="sm" icon="check" onClick={() => setConfirmed(true)}>
            Confirm
          </Btn>
        ) : (
          <Btn kind="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Btn>
        )}
      </div>
    </div>
  );
}
