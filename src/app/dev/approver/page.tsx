/**
 * Dev-only page — shows the full Approver email-first flow
 * starting from the email view, without requiring a real HMAC token.
 * Uses the seeded RFQ-2026-0418 fixture.
 */
import { prisma } from "@/lib/prisma";
import { generateApproverRationale } from "@/lib/agent/approver-rationale";
import { ApproverFlow } from "@/app/approve/[token]/approver-flow";
import type { ApproverRFQData } from "@/types/approver-data";

// Dev-only fixture page — always dynamic, never cached
export const dynamic = "force-dynamic";

export default async function DevApproverPage() {
  const rfq = await prisma.rFQ.findUnique({ where: { rfqNumber: "RFQ-2026-0418" } });
  const approver = await prisma.user.findUnique({ where: { email: "gaurav@upcoretechnologies.com" } });

  if (!rfq || !approver) {
    return <div className="p-8 text-text-secondary">Run <code>npx tsx prisma/seed.ts</code> first.</div>;
  }

  const meta = rfq.agentMeta as Record<string, unknown>;
  const rationale = await generateApproverRationale({
    recommendedSupplier: meta.recommendedSupplierName as string,
    amount: Number(rfq.amount),
    runnerUpDelta: meta.runnerUpDelta as number,
    runnerUpSupplier: meta.runnerUpSupplierName as string,
    itemDescription: rfq.title,
    otdPercent: meta.otdPercent as number,
  });

  const needBy = rfq.needBy ?? new Date(Date.now() + 10 * 86400000);
  const daysUntilDelivery = Math.max(0, Math.ceil((needBy.getTime() - Date.now()) / 86400000));

  const rfqData: ApproverRFQData = {
    rfqId: rfq.rfqNumber,
    title: rfq.title,
    itemDescription: "SS 316 flanges, 80mm slip-on",
    qty: 500,
    uom: "kg",
    spec: "80mm slip-on",
    amount: Number(rfq.amount),
    needByDate: needBy.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    daysUntilDelivery,
    withinBudget: meta.withinBudget as boolean,
    budgetRemaining: meta.budgetRemaining as number,
    runnerUpDelta: meta.runnerUpDelta as number,
    runnerUpSupplier: meta.runnerUpSupplierName as string,
    recommendedSupplier: { name: meta.recommendedSupplierName as string, city: meta.recommendedSupplierCity as string },
    agentRationale: rationale,
    approver: { name: approver.name, email: approver.email },
  };

  // No initialAction → starts at email view
  return <ApproverFlow rfq={rfqData} />;
}
