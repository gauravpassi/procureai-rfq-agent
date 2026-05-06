import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";

const RP_ID = process.env.WEBAUTHN_RP_ID ?? "localhost";

export async function POST(req: NextRequest) {
  const { rfqId, action, userEmail } = await req.json();

  // Find user by email (passed from client after token validation)
  const user = userEmail
    ? await prisma.user.findUnique({
        where: { email: userEmail },
        include: { passkeys: true },
      })
    : null;

  const allowCredentials = user?.passkeys.map((pk) => ({
    id: Buffer.from(pk.credentialID).toString("base64url"),
    transports: pk.transports as ("ble" | "cable" | "hybrid" | "internal" | "nfc" | "smart-card" | "usb")[],
  })) ?? [];

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials,
    userVerification: "required",
    timeout: 60000,
  });

  // Store challenge in session (simplified: return it and client sends back)
  // In production, store in server-side session / Redis bound to user+rfqId
  return NextResponse.json(options);
}
