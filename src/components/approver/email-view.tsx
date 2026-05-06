"use client";

import { Avatar } from "@/components/avatar";
import { Btn } from "@/components/btn";
import { MiniStat } from "@/components/mini-stat";
import { Pill } from "@/components/pill";
import { Icon } from "@/components/icon";
import { AgentTag } from "@/components/agent-tag";
import { fmtINR, fmtINRFull } from "@/lib/format";
import type { Action } from "@/types/approver";
import type { ApproverRFQData } from "@/types/approver-data";

interface Props {
  rfq: ApproverRFQData;
  onAction: (action: Action) => void;
}

export function EmailView({ rfq, onAction }: Props) {
  return (
    <div style={{ background: "var(--bg-canvas)", minHeight: "100vh", paddingBottom: 40 }}>
      {/* Mock email-client chrome — Outlook indicator */}
      <div style={{
        height: 40, background: "var(--bg-app)", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 20, background: "#0078d4", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="mail" size={12} color="#fff" />
          </div>
          <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>
            Inbox › <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Approval needed · ProcureAI</span>
          </span>
        </div>
        <Avatar name={rfq.approver.name} size={26} />
      </div>

      {/* Email body */}
      <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
        <div style={{
          background: "var(--bg-app)", border: "1px solid var(--border-default)",
          borderRadius: 10, overflow: "hidden", boxShadow: "var(--shadow-1)",
        }}>

          {/* Email header */}
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
                Approval needed: {fmtINRFull(rfq.amount)} PO for {rfq.itemDescription} — Plant 2 needs delivery in {rfq.daysUntilDelivery} days
              </div>
              <Pill tone="warn" icon="clock" size="sm" style={{ flexShrink: 0 }}>Approve by 3 PM today</Pill>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <Avatar name="Asha Krishnan" size={28} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                  ProcureAI <span style={{ fontWeight: 400, color: "var(--text-tertiary)" }}>via asha.krishnan@upcore.io</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  To: {rfq.approver.email} · {rfq.rfqId}
                </div>
              </div>
            </div>
          </div>

          {/* Email body */}
          <div style={{ padding: "22px 22px 0" }}>
            {/* Eyebrow */}
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              You are approving
            </div>

            {/* Plain description */}
            <div style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.3, letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
              {rfq.title}
            </div>

            {/* Total */}
            <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
              <span className="num" style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
                {fmtINRFull(rfq.amount)}
              </span>
              <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
                total · {rfq.qty} {rfq.uom} · {rfq.spec}
              </span>
            </div>

            {/* Recommendation block */}
            <div style={{
              marginTop: 18, background: "var(--bg-inset)", borderRadius: 8, padding: 14,
              border: "1px solid var(--border-subtle)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <AgentTag size="sm">Recommended</AgentTag>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{rfq.recommendedSupplier.name}</span>
                <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>· {rfq.recommendedSupplier.city}</span>
              </div>
              <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "var(--text-secondary)" }}>
                {rfq.agentRationale}
              </div>
            </div>

            {/* 3-up MiniStat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 18 }}>
              <MiniStat
                label="Within budget"
                value={rfq.withinBudget ? "Yes" : "No"}
                meta={rfq.withinBudget ? `${fmtINR(rfq.budgetRemaining)} remaining after` : `Over by ${fmtINR(Math.abs(rfq.budgetRemaining ?? 0))}`}
                tone={rfq.withinBudget ? "success" : "danger"}
              />
              <MiniStat
                label="Needed by"
                value={rfq.needByDate}
                meta={`in ${rfq.daysUntilDelivery} days`}
                tone={rfq.daysUntilDelivery <= 7 ? "warn" : "neutral"}
              />
              <MiniStat
                label="Runner-up"
                value={`+${fmtINR(rfq.runnerUpDelta)}`}
                meta={rfq.runnerUpSupplier}
                tone="neutral"
              />
            </div>

            {/* Action zone */}
            <div style={{ marginTop: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Icon name="bolt" size={13} color="var(--text-tertiary)" />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                  One-tap actions · no login required
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {/* Approve */}
                <button
                  onClick={() => onAction("approve")}
                  style={{
                    height: 44, borderRadius: 8, border: "none",
                    background: "#15803d", color: "#fff", fontFamily: "inherit",
                    fontSize: 14, fontWeight: 500, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    transition: "opacity .12s",
                  }}
                  onMouseOver={e => (e.currentTarget.style.opacity = "0.9")}
                  onMouseOut={e => (e.currentTarget.style.opacity = "1")}
                >
                  <Icon name="check" size={15} color="#fff" /> Approve
                </button>
                {/* Send back */}
                <button
                  onClick={() => onAction("sendback")}
                  style={{
                    height: 44, borderRadius: 8,
                    border: "1px solid var(--border-strong)", background: "var(--bg-app)",
                    color: "var(--text-primary)", fontFamily: "inherit",
                    fontSize: 14, fontWeight: 500, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    transition: "background .12s, border-color .12s",
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = "var(--bg-subtle)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "var(--bg-app)"; }}
                >
                  <Icon name="arrowLeft" size={15} /> Send back
                </button>
                {/* Reject */}
                <button
                  onClick={() => onAction("reject")}
                  style={{
                    height: 44, borderRadius: 8,
                    border: "1px solid var(--border-strong)", background: "var(--bg-app)",
                    color: "var(--danger)", fontFamily: "inherit",
                    fontSize: 14, fontWeight: 500, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    transition: "background .12s",
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = "var(--danger-soft)"; }}
                  onMouseOut={e => { e.currentTarget.style.background = "var(--bg-app)"; }}
                >
                  <Icon name="x" size={15} color="var(--danger)" /> Reject
                </button>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--text-tertiary)", display: "flex", alignItems: "flex-start", gap: 5 }}>
                <Icon name="info" size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                Clicking an action records your decision instantly. Links expire in 72 hours.
              </div>
            </div>
          </div>

          {/* Email footer */}
          <div style={{
            marginTop: 22, padding: "10px 18px", borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", display: "flex", gap: 12 }}>
              <span>Need more detail?</span>
              <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>Compare 3 quotes →</a>
              <a href="#" style={{ color: "var(--accent)", textDecoration: "none" }}>View full PO →</a>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              Auto-escalates to Anita Rao at 3 PM if no action.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
