import { createHmac, timingSafeEqual } from "crypto";

/**
 * HMAC-signed action tokens for approval email buttons.
 * Token payload: userId · action · rfqId · expiresAt (ms)
 * Signed with ACTION_TOKEN_SECRET using SHA-256.
 *
 * Per design handoff §Authentication:
 *   "Sign each link with an HMAC token bound to (user, action, RFQ-ID, expiry).
 *    Forwarded emails do not let a different identity act."
 */

export type ApprovalAction = "approve" | "sendback" | "reject";

export interface ActionTokenPayload {
  userId: string;
  action: ApprovalAction;
  rfqId: string;
  expiresAt: number; // Unix ms
}

const SECRET = process.env.ACTION_TOKEN_SECRET!;
const SEP = "|";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret(): string {
  if (!SECRET) throw new Error("ACTION_TOKEN_SECRET is not set");
  return SECRET;
}

function buildMessage(p: ActionTokenPayload): string {
  return [p.userId, p.action, p.rfqId, p.expiresAt].join(SEP);
}

function sign(message: string): string {
  return createHmac("sha256", getSecret()).update(message).digest("base64url");
}

export function createActionToken(payload: Omit<ActionTokenPayload, "expiresAt">): string {
  const full: ActionTokenPayload = { ...payload, expiresAt: Date.now() + TTL_MS };
  const msg = buildMessage(full);
  const sig = sign(msg);
  // Encode: base64url(json) + "." + sig
  const data = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${data}.${sig}`;
}

export function verifyActionToken(token: string): ActionTokenPayload {
  const [data, sig] = token.split(".");
  if (!data || !sig) throw new TokenError("malformed");

  let payload: ActionTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    throw new TokenError("malformed");
  }

  const expected = sign(buildMessage(payload));
  const sigBuf = Buffer.from(sig, "base64url");
  const expBuf = Buffer.from(expected, "base64url");
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    throw new TokenError("invalid");
  }
  if (Date.now() > payload.expiresAt) throw new TokenError("expired");

  return payload;
}

export class TokenError extends Error {
  constructor(public readonly code: "malformed" | "invalid" | "expired") {
    super(`Action token ${code}`);
  }
}
