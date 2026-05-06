"use client";

import { Icon } from "@/components/icon";
import { Btn } from "@/components/btn";
import type { Result, AuthMethod } from "@/types/approver";

interface Props {
  result: Result;
  authMethod: AuthMethod;
  rfqId: string;
  actorName: string;
  onReplay: () => void;
}

interface ResultConfig {
  icon: "check" | "arrowLeft" | "x";
  bg: string;
  border: string;
  iconColor: string;
  title: string;
  body: string;
  metaChip: string;
  chipTone: string;
}

const RESULT_CONFIG: Record<Result, ResultConfig> = {
  approved: {
    icon: "check",
    bg: "var(--success-soft)",
    border: "var(--success-border)",
    iconColor: "var(--success)",
    title: "Purchase order sent",
    body: "PO-2026-0512 sent to Hindalco Forgings Pvt Ltd. Supplier acknowledgement due in 24h.",
    metaChip: "Approved",
    chipTone: "var(--success-soft)",
  },
  sentback: {
    icon: "arrowLeft",
    bg: "var(--info-soft)",
    border: "var(--info-border)",
    iconColor: "var(--info)",
    title: "Sent back for revision",
    body: "Asha will revise and resubmit. You’ll get a new email when it’s ready.",
    metaChip: "Sent back",
    chipTone: "var(--info-soft)",
  },
  rejected: {
    icon: "x",
    bg: "var(--danger-soft)",
    border: "var(--danger-border)",
    iconColor: "var(--danger)",
    title: "RFQ rejected",
    body: "Sourcing for RFQ-2026-0418 will restart. Estimated delivery delay: 9–14 days.",
    metaChip: "Rejected",
    chipTone: "var(--danger-soft)",
  },
};

export function ResultView({ result, authMethod, rfqId, actorName, onReplay }: Props) {
  const cfg = RESULT_CONFIG[result];
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZoneName: "short" });

  return (
    <div style={{ background: "var(--bg-canvas)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      <div style={{
        background: "var(--bg-app)", border: "1px solid var(--border-default)",
        borderRadius: 10, padding: 32, maxWidth: 480, width: "100%",
        textAlign: "center", boxShadow: "var(--shadow-2)",
        animation: "fadeIn 200ms ease-in-out",
      }}>
        {/* Icon tile */}
        <div style={{
          width: 60, height: 60, borderRadius: "50%", margin: "0 auto 16px",
          background: cfg.bg, border: `2px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name={cfg.icon} size={26} color={cfg.iconColor} strokeWidth={2} />
        </div>

        <div style={{ fontSize: 21, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          {cfg.title}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.55, marginTop: 8, maxWidth: 400, margin: "8px auto 0" }}>
          {cfg.body}
        </div>

        {/* Meta chip */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          marginTop: 16, padding: "4px 10px", borderRadius: 20,
          background: cfg.chipTone, border: `1px solid ${cfg.border}`,
          fontSize: 12.5, fontWeight: 500, color: cfg.iconColor,
        }}>
          <Icon name={cfg.icon} size={12} color={cfg.iconColor} />
          {cfg.metaChip} · {rfqId}
        </div>

        {/* Mandatory audit-log line */}
        <div style={{
          marginTop: 20, fontSize: 11.5, color: "var(--text-tertiary)",
          borderTop: "1px solid var(--border-subtle)", paddingTop: 14,
        }}>
          ✓ Audit log: {actorName} · {authMethod === "passkey" ? "passkey" : "email OTP"} · {timeStr} · MacBook Pro
        </div>

        {/* Replay */}
        <div style={{ marginTop: 16 }}>
          <Btn kind="ghost" onClick={onReplay}>Replay from email</Btn>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
