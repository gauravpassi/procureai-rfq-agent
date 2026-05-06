/**
 * /approve/[token]
 *
 * Self-contained PO approval page — no database required.
 * All context is embedded in the signed PO token:
 *   action · POData · rfqId · itemDescription · approver info · expiry
 *
 * Flow:
 *   approve  → shows confirmation immediately
 *   sendback · reject → shows reason sheet, then confirmation
 */

import { verifyPOToken, POTokenError } from "@/lib/po-token";
import { ApproverFlow } from "./approver-flow";
import type { ApproverRFQData } from "@/types/approver-data";

// Always render at request time — token verification is per-request
export const dynamic = "force-dynamic";

interface Props {
  params: { token: string };
}

export default async function ApprovePage({ params }: Props) {
  // 1. Verify the signed PO token — all data is self-contained
  let payload;
  try {
    payload = verifyPOToken(params.token);
  } catch (e) {
    const code = e instanceof POTokenError ? e.code : "invalid";
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-canvas)",
        padding: "40px 16px",
      }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--danger-soft)",
            border: "2px solid var(--danger-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 22,
          }}>
            {code === "expired" ? "⏱" : "✕"}
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
            {code === "expired" ? "Link expired" : "Invalid link"}
          </div>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            {code === "expired"
              ? "This approval link has expired (72-hour window). Check your email for a refreshed link or contact the buyer."
              : "This approval link is invalid or has already been used. Contact the buyer for a new link."}
          </div>
        </div>
      </div>
    );
  }

  // 2. Map token payload → ApproverRFQData (for the existing email-view UI)
  const rfqData: ApproverRFQData = {
    rfqId: payload.rfqId,
    title: `${payload.po.poNumber} · ${payload.po.vendorName}`,
    itemDescription: payload.itemDescription,
    qty: 1,
    uom: "",
    spec: "",
    amount: parseAmount(payload.amountTotal),
    needByDate: payload.po.requiredBy,
    daysUntilDelivery: daysUntil(payload.po.requiredBy),
    withinBudget: true,
    budgetRemaining: null,
    runnerUpDelta: 0,
    runnerUpSupplier: "",
    recommendedSupplier: {
      name: payload.po.vendorName,
      city: vendorCity(payload.po.vendorAddress),
    },
    agentRationale: `Lowest qualifying bid for ${payload.itemDescription}. Vendor holds active framework agreement with delivery history.`,
    approver: {
      name: payload.approverName,
      email: payload.approverEmail,
    },
  };

  return (
    <ApproverFlow
      rfq={rfqData}
      initialAction={payload.action}
      poNumber={payload.po.poNumber}
      vendorName={payload.po.vendorName}
    />
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Best-effort: extract first city name from a vendor address string */
function vendorCity(address: string): string {
  // e.g. "Plot 42, MIDC Phase II, Pune 411 018" → "Pune"
  const parts = address.split(",").map((p) => p.trim());
  for (const part of parts.reverse()) {
    const city = part.replace(/\d{3}\s?\d{3}/, "").trim();
    if (city.length > 2 && city.length < 30) return city;
  }
  return address.split(",")[0] ?? address;
}

/**
 * Parse a human-formatted INR string to a number.
 * e.g. "₹3,42,200" → 342200
 */
function parseAmount(s: string): number {
  const clean = s.replace(/[₹,\s]/g, "");
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

/** Days from today until a date string like "May 13, 2026" */
function daysUntil(dateStr: string): number {
  try {
    const target = new Date(dateStr);
    const diff = target.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 86400000));
  } catch {
    return 7;
  }
}
