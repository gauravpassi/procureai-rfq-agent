import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "ProcureAI <noreply@procureai.io>";

export async function POST(req: NextRequest) {
  const { rfqId, action, userEmail } = await req.json();

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  // Generate 6-digit OTP
  const code = String(randomInt(100000, 999999));
  const codeHash = createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  // Upsert OTP challenge bound to this action (rfqId + action = unique actionToken key)
  const actionToken = `${rfqId}:${action}:${user.id}`;
  await prisma.otpChallenge.upsert({
    where: { actionToken },
    create: { userId: user.id, codeHash, actionToken, expiresAt },
    update: { codeHash, expiresAt, consumedAt: null, attempts: 0 },
  });

  // Send via Resend
  await resend.emails.send({
    from: FROM,
    to: [userEmail],
    subject: `Your ProcureAI verification code: ${code}`,
    html: `
      <p style="font-family:sans-serif;font-size:15px">Your one-time code for <strong>${action}</strong> on <strong>${rfqId}</strong>:</p>
      <p style="font-family:monospace;font-size:32px;font-weight:700;letter-spacing:6px;color:#1a1a18">${code}</p>
      <p style="font-family:sans-serif;font-size:12px;color:#84847b">Expires in 5 minutes. Do not share this code.</p>
    `,
  });

  return NextResponse.json({ sent: true });
}
