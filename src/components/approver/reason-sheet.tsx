"use client";

import { Btn } from "@/components/btn";
import { Icon } from "@/components/icon";
import { SEND_BACK_QUICK_OPTIONS, hasReason } from "@/types/approver";
import type { ApproverState, ApproverAction } from "@/types/approver";

interface Props {
  state: ApproverState;
  dispatch: React.Dispatch<ApproverAction>;
  onContinue: () => void;
  onCancel: () => void;
}

export function ReasonSheet({ state, dispatch, onContinue, onCancel }: Props) {
  const isSendBack = state.action === "sendback";
  const isReject = state.action === "reject";
  const canContinue = hasReason(state);

  return (
    <div style={{ background: "var(--bg-canvas)", minHeight: "100vh", paddingBottom: 40 }}>
      {/* Mock email chrome */}
      <div style={{
        height: 40, background: "var(--bg-app)", borderBottom: "1px solid var(--border-subtle)",
        display: "flex", alignItems: "center", padding: "0 18px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 20, background: "#0078d4", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="mail" size={12} color="#fff" />
          </div>
          <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>
            Inbox › <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>Approval needed · ProcureAI</span>
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "24px auto", padding: "0 16px" }}>
        <div style={{
          background: "var(--bg-app)", border: "1px solid var(--border-default)",
          borderRadius: 10, padding: 22, boxShadow: "var(--shadow-1)",
        }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {isSendBack ? "What needs to be revised?" : "Reason for rejection"}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 4 }}>
            {isSendBack
              ? "Asha will revise and resubmit. Select a reason or write your own."
              : "This will restart sourcing. Provide a reason for the audit log."}
          </div>

          {/* Reject warning banner */}
          {isReject && (
            <div style={{
              marginTop: 14, padding: 12, borderRadius: 8,
              background: "var(--warn-soft)", border: "1px solid var(--warn-border)",
              display: "flex", gap: 8, alignItems: "flex-start",
            }}>
              <Icon name="warn" size={15} color="var(--warn)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13.5, color: "var(--warn)", lineHeight: 1.5 }}>
                This will restart sourcing. Delivery may be delayed by 9–14 days.
              </span>
            </div>
          )}

          {/* Send back: quick-pick options */}
          {isSendBack && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {SEND_BACK_QUICK_OPTIONS.map((opt) => {
                const selected = state.sendBackQuick === opt;
                return (
                  <button
                    key={opt}
                    onClick={() =>
                      dispatch({ type: "SET_SEND_BACK_QUICK", option: selected ? null : opt })
                    }
                    style={{
                      width: "100%", textAlign: "left", padding: "10px 14px",
                      borderRadius: 8, fontFamily: "inherit", cursor: "pointer",
                      fontSize: 13.5, fontWeight: selected ? 500 : 400,
                      border: selected ? "1.5px solid var(--text-primary)" : "1px solid var(--border-default)",
                      background: selected ? "var(--bg-subtle)" : "var(--bg-app)",
                      color: "var(--text-primary)",
                      transition: "border-color .12s, background .12s",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* Textarea */}
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 6 }}>
              {isSendBack ? "Or write your own note" : "Reason (required)"}
            </label>
            <textarea
              rows={4}
              placeholder={isSendBack ? "Add specific instructions for the buyer…" : "Explain why this RFQ is being rejected…"}
              value={isSendBack ? state.sendBackText : state.rejectReason}
              onChange={(e) =>
                isSendBack
                  ? dispatch({ type: "SET_SEND_BACK_TEXT", text: e.target.value })
                  : dispatch({ type: "SET_REJECT_REASON", reason: e.target.value })
              }
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                border: "1px solid var(--border-default)", background: "var(--bg-app)",
                fontSize: 13.5, lineHeight: 1.55, resize: "vertical", fontFamily: "inherit",
                color: "var(--text-primary)", outline: "none",
                transition: "border-color .12s",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--border-focus)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
            />
          </div>

          {/* Actions */}
          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Btn kind="ghost" onClick={onCancel}>Cancel</Btn>
            <Btn
              kind={isReject ? "danger" : "dark"}
              iconRight="arrowRight"
              disabled={!canContinue}
              onClick={onContinue}
            >
              Continue to authenticate
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
