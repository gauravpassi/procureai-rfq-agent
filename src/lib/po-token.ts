/**
 * Self-contained PO approval tokens.
 *
 * Unlike action-token.ts (which requires userId + rfqId mapped to DB records),
 * these tokens embed the full POData + metadata directly in the signed payload
 * so the /approve page needs zero DB lookups.
 *
 * Format: base64url(json) + "." + hmac-sha256-base64url(json)
 * TTL: 72 hours (PO approvals need more time than 1-tap auth)
 */

import { createHmac, timingSafeEqual } from "crypto";
import type { POData } from "@/types/intake";

export type POApprovalAction = "approve" | "sendback" | "reject";

export interface POTokenPayload {
  /** Which button was clicked in the email */
  action: POApprovalAction;
  /** Full PO document — rendered in the approval page */
  po: POData;
  /** Short label shown in the approval email subject / header */
  rfqId: string;
  /** Human-readable item summary e.g. "500 kg SS 316 flanges" */
  itemDescription: string;
  /** Total amount in rupees (number) for the mini-stat display */
  amountTotal: string;
  /** Approver info shown in result + audit line */
  approverName: string;
  approverEmail: string;
  /** Unix ms expiry */
  expiresAt: number;
}

const TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

function getSecret(): string {
  const s = process.env.ACTION_TOKEN_SECRET;
  if (!s) throw new Error("ACTION_TOKEN_SECRET is not set");
  return s;
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url");
}

/**
 * Create a signed PO approval token.
 * Call three times (approve / sendback / reject) to get the three email links.
 */
export function createPOToken(
  payload: Omit<POTokenPayload, "expiresAt">,
): string {
  const full: POTokenPayload = { ...payload, expiresAt: Date.now() + TTL_MS };
  const data = Buffer.from(JSON.stringify(full)).toString("base64url");
  const sig = sign(data);
  return `${data}.${sig}`;
}

/**
 * Verify and decode a PO approval token.
 * Throws POTokenError on invalid / expired / malformed tokens.
 */
export function verifyPOToken(token: string): POTokenPayload {
  const dot = token.lastIndexOf(".");
  if (dot === -1) throw new POTokenError("malformed");

  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // Verify signature
  const expected = sign(data);
  const sigBuf = Buffer.from(sig, "base64url");
  const expBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new POTokenError("invalid");
  }

  // Decode payload
  let payload: POTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    throw new POTokenError("malformed");
  }

  // Check expiry
  if (Date.now() > payload.expiresAt) throw new POTokenError("expired");

  return payload;
}

export class POTokenError extends Error {
  constructor(public readonly code: "malformed" | "invalid" | "expired") {
    super(`PO token ${code}`);
  }
}
