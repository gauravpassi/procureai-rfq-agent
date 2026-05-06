import { notFound } from "next/navigation";
import { verifyActionToken, TokenError } from "@/lib/action-token";
import { prisma } from "@/lib/prisma";
import { generateApproverRationale } from "@/lib/agent/approver-rationale";
import { ApproverFlow } from "./approver-flow";
import type { ApproverRFQData } from "@/types/approver-data";

// Always render at request time — token validation + DB reads are per-request
export const dynamic = "force-dynamic";

interface Props {
  params: { token: string };
}

export default async function ApprovePage({ params }: Props) {
  // 1. Validate HMAC token (server-side, no client involvement)
  let payload;
  try {
    payload = verifyActionToken(params.token);
  } catch (e) {
    if (e instanceof TokenError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-8">
          <div className="max-w-md text-center">
            <div className="text-xl font-semibold text-text-primary mb-2">
              {e.code === "expired" ? "Link expired" : "Invalid link"}
            </div>
            <div className="text-sm text-text-secondary">
              {e.code === "expired"
                ? "This approval link has expired. Check your email for a fresh link or contact the buyer."
                : "This approval link is invalid or has already been used."}
            </div>
          </div>
        </div>
      );
    }
    return notFound();
  }

  // 2. Fetch user + RFQ from DB
  const [user, rfq] = await Promise.all([
    prisma.user.findUnique({ where: { id: payload.userId } }),
    prisma.rFQ.findUnique({
      where: { rfqNumber: payload.rfqId },
      include: { quotes: { include: { supplier: true } } },
    }),
  ]);

  if (!user || !rfq) return notFound();

  // 3. Extract agent metadata from the JSON blob
  const meta = rfq.agentMeta as Record<string, unknown> | null;

  // 4. Generate Claude rationale (cached via prompt cache on the static system prompt)
  const rationale = await generateApproverRationale({
    recommendedSupplier: (meta?.recommendedSupplierName as string) ?? "Hindalco Forgings Pvt Ltd",
    amount: Number(rfq.amount),
    runnerUpDelta: (meta?.runnerUpDelta as number) ?? 18400,
    runnerUpSupplier: (meta?.runnerUpSupplierName as string) ?? "Bharat Steel Industries",
    itemDescription: rfq.title,
    otdPercent: (meta?.otdPercent as number) ?? 96,
  });

  // 5. Compute delivery days
  const needBy = rfq.needBy ?? new Date(Date.now() + 10 * 86400000);
  const daysUntilDelivery = Math.max(0, Math.ceil((needBy.getTime() - Date.now()) / 86400000));
  const needByDate = needBy.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  // 6. Build the typed RFQ data shape for client components
  const rfqData: ApproverRFQData = {
    rfqId: rfq.rfqNumber,
    title: rfq.title,
    itemDescription: (rfq.title.split("(")[0] ?? rfq.title).trim(),
    qty: 500,
    uom: "kg",
    spec: "80mm slip-on",
    amount: Number(rfq.amount),
    needByDate,
    daysUntilDelivery,
    withinBudget: (meta?.withinBudget as boolean) ?? true,
    budgetRemaining: (meta?.budgetRemaining as number) ?? null,
    runnerUpDelta: (meta?.runnerUpDelta as number) ?? 18400,
    runnerUpSupplier: (meta?.runnerUpSupplierName as string) ?? "Bharat Steel Industries",
    recommendedSupplier: {
      name: (meta?.recommendedSupplierName as string) ?? "Hindalco Forgings Pvt Ltd",
      city: (meta?.recommendedSupplierCity as string) ?? "Pune",
    },
    agentRationale: rationale,
    approver: { name: user.name, email: user.email },
  };

  return <ApproverFlow rfq={rfqData} initialAction={payload.action} />;
}
