"use client";

import { useEffect, useRef, useCallback } from "react";
import { Icon } from "@/components/icon";
import { Btn } from "@/components/btn";
import { fmtINRFull } from "@/lib/format";
import type { ApproverState, ApproverAction, AuthMethod, Result } from "@/types/approver";
import type { ApproverRFQData } from "@/types/approver-data";

interface Props {
  state: ApproverState;
  dispatch: React.Dispatch<ApproverAction>;
  rfq: ApproverRFQData;
  onVerified: (result: Result) => void;
}

const METHOD_LABEL: Record<AuthMethod, string> = { passkey: "Passkey", otp: "Email OTP" };

export function AuthChallenge({ state, dispatch, rfq, onVerified }: Props) {
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const actionLabel = state.action === "approve" ? "Approve" : state.action === "sendback" ? "Send back" : "Reject";
  const resultMap: Record<NonNullable<typeof state.action>, Result> = {
    approve: "approved",
    sendback: "sentback",
    reject: "rejected",
  };

  // Passkey flow
  const triggerPasskey = useCallback(async () => {
    if (state.authState !== "idle") return;
    dispatch({ type: "SET_AUTH_METHOD", method: "passkey" });
    // Set verifying state
    dispatch({ type: "START_AUTH" });

    try {
      // 1. Get challenge options from server
      const optsRes = await fetch("/api/auth/passkey/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfqId: rfq.rfqId, action: state.action }),
      });
      const opts = await optsRes.json();

      // 2. Browser authenticator prompt
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const assertion = await startAuthentication({ optionsJSON: opts });

      // 3. Verify on server + write audit log
      const verifyRes = await fetch("/api/auth/passkey/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assertion, rfqId: rfq.rfqId, action: state.action }),
      });
      if (!verifyRes.ok) throw new Error("Verification failed");

      // 600ms green-check display then transition
      await new Promise((r) => setTimeout(r, 600));
      onVerified(resultMap[state.action!]);
    } catch (err) {
      console.error("Passkey auth failed:", err);
      dispatch({ type: "SET_AUTH_METHOD", method: "passkey" }); // reset to idle
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.action, state.authState]);

  // OTP verify
  const verifyOtp = useCallback(async () => {
    if (state.otp.length !== 6) return;
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: state.otp, rfqId: rfq.rfqId, action: state.action }),
      });
      if (!res.ok) throw new Error("OTP invalid");
      await new Promise((r) => setTimeout(r, 200));
      onVerified(resultMap[state.action!]);
    } catch {
      // clear OTP on failure
      dispatch({ type: "SET_OTP", otp: "" });
      otpRefs.current[0]?.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.otp, state.action]);

  // Send OTP
  const sendOtp = useCallback(async () => {
    await fetch("/api/auth/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rfqId: rfq.rfqId, action: state.action }),
    });
  }, [rfq.rfqId, state.action]);

  // Auto-send OTP when tab switches to OTP
  const prevMethod = useRef<AuthMethod | null>(null);
  useEffect(() => {
    if (state.authMethod === "otp" && prevMethod.current !== "otp") sendOtp();
    prevMethod.current = state.authMethod;
  }, [state.authMethod, sendOtp]);

  return (
    <div style={{ background: "var(--bg-canvas)", minHeight: "100vh", paddingBottom: 40 }}>
      {/* Mock chrome */}
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
          borderRadius: 10, padding: 24, boxShadow: "var(--shadow-1)",
        }}>
          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: "var(--accent-soft)", border: "1px solid var(--accent-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon name="bolt" size={20} color="var(--accent)" />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)" }}>Confirm with authentication</div>
              <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 4 }}>
                {actionLabel} · {rfq.rfqId} · {fmtINRFull(rfq.amount)} · audit-logged
              </div>
            </div>
          </div>

          {/* Method tabs */}
          <div style={{
            background: "var(--bg-muted)", borderRadius: 7, padding: 3,
            display: "flex", marginBottom: 22,
          }}>
            {(["passkey", "otp"] as AuthMethod[]).map((m) => {
              const active = state.authMethod === m;
              return (
                <button
                  key={m}
                  onClick={() => dispatch({ type: "SET_AUTH_METHOD", method: m })}
                  style={{
                    flex: 1, height: 32, borderRadius: 5, border: "none",
                    fontFamily: "inherit", fontSize: 13.5, fontWeight: active ? 500 : 400, cursor: "pointer",
                    background: active ? "var(--bg-app)" : "transparent",
                    color: active ? "var(--text-primary)" : "var(--text-secondary)",
                    boxShadow: active ? "var(--shadow-1)" : "none",
                    transition: "background .12s, color .12s",
                  }}
                >
                  {METHOD_LABEL[m]}
                </button>
              );
            })}
          </div>

          {/* Passkey body */}
          {state.authMethod === "passkey" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{
                background: "var(--bg-inset)", border: "1px solid var(--border-subtle)",
                borderRadius: 12, padding: "20px 24px", width: "100%", textAlign: "center",
              }}>
                <FingerprintGlyph state={state.authState} />
                <div style={{ marginTop: 12, fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>
                  {state.authState === "idle" && "Touch your security key or use Face ID"}
                  {state.authState === "verifying" && "Verifying…"}
                  {state.authState === "done" && "Verified"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                  Bound to {rfq.approver.email} · MacBook Pro (Touch ID). FIDO2 / WebAuthn — no shared secret.
                </div>
              </div>
              <Btn kind="dark" size="lg" full onClick={triggerPasskey} disabled={state.authState !== "idle"}>
                Use passkey to {actionLabel.toLowerCase()}
              </Btn>
            </div>
          )}

          {/* OTP body */}
          {state.authMethod === "otp" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ fontSize: 13.5, color: "var(--text-secondary)", textAlign: "center" }}>
                We sent a 6-digit code to {rfq.approver.email.replace(/(?<=.{1}).+(?=@)/, "•••")}. Expires in 5 min.
              </div>
              <OtpInput value={state.otp} onChange={(v) => dispatch({ type: "SET_OTP", otp: v })} refs={otpRefs} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button
                  onClick={sendOtp}
                  style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Resend
                </button>
                <Btn kind="dark" disabled={state.otp.length !== 6} onClick={verifyOtp}>
                  Verify &amp; {actionLabel.toLowerCase()}
                </Btn>
              </div>
            </div>
          )}

          {/* Security note */}
          <div style={{
            marginTop: 22, padding: "10px 14px", borderRadius: 8,
            background: "var(--bg-subtle)", border: "1px solid var(--border-subtle)",
            fontSize: 11.5, color: "var(--text-tertiary)", lineHeight: 1.55,
          }}>
            This challenge is signed with the original email&apos;s HMAC token. Even if the email is forwarded, only your authenticated identity can act. Action recorded with timestamp, device, and IP for audit.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FingerprintGlyph({ state }: { state: string }) {
  if (state === "verifying") {
    return (
      <div style={{ width: 56, height: 56, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 28, height: 28, border: "2.5px solid var(--accent)", borderTopColor: "transparent",
          borderRadius: "50%", animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }
  if (state === "done") {
    return (
      <div style={{
        width: 56, height: 56, margin: "0 auto", borderRadius: "50%",
        background: "var(--success-soft)", border: "2px solid var(--success-border)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon name="check" size={22} color="var(--success)" strokeWidth={2} />
      </div>
    );
  }
  // idle — fingerprint SVG
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ margin: "0 auto", display: "block" }}>
      <circle cx="28" cy="28" r="27" stroke="var(--border-default)" strokeWidth="1.5" />
      <g stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M20 28 C20 22 24 18 28 18 C32 18 36 22 36 28" />
        <path d="M22 30 C22 25 25 22 28 22 C31 22 34 25 34 30 C34 34 31 36 28 36" />
        <path d="M24 32 C24 28 26 26 28 26 C30 26 32 28 32 32 C32 35 30 37 28 38" />
        <path d="M26 34 C26 32 27 30 28 30 C29 30 30 31 30 33" />
      </g>
    </svg>
  );
}

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
  refs: React.MutableRefObject<Array<HTMLInputElement | null>>;
}

function OtpInput({ value, onChange, refs }: OtpInputProps) {
  const cells = Array.from({ length: 6 });
  const digits = value.padEnd(6, "").split("");

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      onChange(value.slice(0, i - 1));
    }
  };

  const handleInput = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) return;
    // Support paste: split across cells
    const next = (value + raw).slice(0, 6);
    onChange(next);
    const focusIdx = Math.min(next.length, 5);
    refs.current[focusIdx]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(text);
    refs.current[Math.min(text.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {cells.map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === " " ? "" : digits[i]}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          style={{
            width: 44, height: 50, textAlign: "center",
            fontSize: 20, fontWeight: 600, fontFamily: "var(--font-mono)",
            border: "1px solid var(--border-default)", borderRadius: 8,
            background: "var(--bg-app)", color: "var(--text-primary)",
            outline: "none", transition: "border-color .12s",
          }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = "var(--border-focus)")}
          onBlurCapture={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
        />
      ))}
    </div>
  );
}
