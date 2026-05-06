import { NextRequest, NextResponse } from "next/server";
import { verifyActionToken, TokenError } from "@/lib/action-token";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  try {
    const payload = verifyActionToken(params.token);

    // Confirm the user + RFQ exist
    const [user, rfq] = await Promise.all([
      prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, name: true, email: true, role: true } }),
      prisma.rFQ.findUnique({ where: { rfqNumber: payload.rfqId }, select: { id: true, rfqNumber: true, title: true, amount: true, agentMeta: true } }),
    ]);

    if (!user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    if (!rfq) return NextResponse.json({ error: "rfq_not_found" }, { status: 404 });

    return NextResponse.json({ ok: true, userId: user.id, action: payload.action, rfqId: payload.rfqId });
  } catch (e) {
    if (e instanceof TokenError) {
      return NextResponse.json({ error: e.code }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
