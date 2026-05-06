import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import type { AuthenticationResponseJSON } from "@simplewebauthn/types";

const RP_ID = process.env.WEBAUTHN_RP_ID ?? "localhost";
const ORIGIN = process.env.WEBAUTHN_ORIGIN ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const { assertion, rfqId, action, userEmail, challenge } = await req.json() as {
    assertion: AuthenticationResponseJSON;
    rfqId: string;
    action: string;
    userEmail: string;
    challenge: string;
  };

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: { passkeys: true },
  });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const credIdBuf = Buffer.from(assertion.id, "base64url");
  const passkey = user.passkeys.find((p) =>
    Buffer.compare(p.credentialID, credIdBuf) === 0,
  );
  if (!passkey) return NextResponse.json({ error: "credential_not_found" }, { status: 404 });

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: assertion,
      expectedChallenge: challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: Buffer.from(passkey.credentialID).toString("base64url"),
        publicKey: passkey.publicKey,
        counter: Number(passkey.counter),
      },
    });
  } catch (e) {
    console.error("WebAuthn verify error:", e);
    return NextResponse.json({ error: "verification_failed" }, { status: 401 });
  }

  if (!verification.verified) {
    return NextResponse.json({ error: "not_verified" }, { status: 401 });
  }

  // Update counter to prevent replay
  await prisma.passkeyCredential.update({
    where: { id: passkey.id },
    data: {
      counter: BigInt(verification.authenticationInfo.newCounter),
      lastUsedAt: new Date(),
    },
  });

  // Write audit log
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const device = req.headers.get("user-agent")?.slice(0, 200) ?? "unknown";
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: action.toUpperCase() as "APPROVE" | "SEND_BACK" | "REJECT",
      target: rfqId,
      method: "PASSKEY",
      ip,
      device,
    },
  });

  return NextResponse.json({ verified: true });
}
