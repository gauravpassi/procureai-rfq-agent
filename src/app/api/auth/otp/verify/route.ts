import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";

const MAX_ATTEMPTS = 3;

export async function POST(req: NextRequest) {
  const { otp, rfqId, action, userEmail } = await req.json();

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  const actionToken = `${rfqId}:${action}:${user.id}`;
  const challenge = await prisma.otpChallenge.findUnique({ where: { actionToken } });

  if (!challenge) return NextResponse.json({ error: "no_challenge" }, { status: 404 });
  if (challenge.consumedAt) return NextResponse.json({ error: "already_used" }, { status: 400 });
  if (new Date() > challenge.expiresAt) return NextResponse.json({ error: "expired" }, { status: 400 });
  if (challenge.attempts >= MAX_ATTEMPTS) return NextResponse.json({ error: "too_many_attempts" }, { status: 429 });

  const inputHash = Buffer.from(createHash("sha256").update(String(otp)).digest("hex"));
  const storedHash = Buffer.from(challenge.codeHash);

  const valid = inputHash.length === storedHash.length && timingSafeEqual(inputHash, storedHash);

  if (!valid) {
    await prisma.otpChallenge.update({
      where: { actionToken },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json({ error: "invalid_code" }, { status: 401 });
  }

  // Mark consumed + write audit log
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const device = req.headers.get("user-agent")?.slice(0, 200) ?? "unknown";

  await prisma.$transaction([
    prisma.otpChallenge.update({
      where: { actionToken },
      data: { consumedAt: new Date() },
    }),
    prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: action.toUpperCase() as "APPROVE" | "SEND_BACK" | "REJECT",
        target: rfqId,
        method: "OTP",
        ip,
        device,
      },
    }),
  ]);

  return NextResponse.json({ verified: true });
}
