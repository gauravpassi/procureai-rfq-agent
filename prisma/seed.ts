/**
 * Dev seed — creates one Approver user, one Supplier, one RFQ
 * so the /approve/[token] page has real data to render.
 * Run: npx tsx prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import { createActionToken } from "../src/lib/action-token";

const prisma = new PrismaClient();

async function main() {
  // Approver user
  const approver = await prisma.user.upsert({
    where: { email: "gaurav@upcoretechnologies.com" },
    update: {},
    create: {
      email: "gaurav@upcoretechnologies.com",
      name: "Vikram Shah",
      role: "APPROVER",
    },
  });
  console.log("✓ Approver:", approver.email);

  // Supplier
  const supplier = await prisma.supplier.upsert({
    where: { id: "supp-hindalco-001" },
    update: {},
    create: {
      id: "supp-hindalco-001",
      name: "Hindalco Forgings Pvt Ltd",
      city: "Pune",
      email: "orders@hindalco-forgings.example.com",
    },
  });
  console.log("✓ Supplier:", supplier.name);

  // Runner-up supplier
  await prisma.supplier.upsert({
    where: { id: "supp-bharat-001" },
    update: {},
    create: {
      id: "supp-bharat-001",
      name: "Bharat Steel Industries",
      city: "Mumbai",
      email: "rfq@bharatsteel.example.com",
    },
  });

  // Purchase Request
  const pr = await prisma.purchaseRequest.upsert({
    where: { prNumber: "PR-2026-0412" },
    update: {},
    create: {
      prNumber: "PR-2026-0412",
      requesterId: approver.id,
      itemDescription: "SS 316 flanges, 80mm slip-on",
      qty: 500,
      uom: "kg",
      requiredBy: new Date("2026-05-14"),
      costCenter: "PLT2-MAINT-Q2",
    },
  });

  // RFQ with agent metadata
  const rfq = await prisma.rFQ.upsert({
    where: { rfqNumber: "RFQ-2026-0418" },
    update: {},
    create: {
      rfqNumber: "RFQ-2026-0418",
      title: "500 kg SS 316 flanges (80mm slip-on) for Plant 2 maintenance shutdown",
      amount: 342500,
      currency: "INR",
      prId: pr.id,
      status: "pending_approval",
      needBy: new Date("2026-05-14"),
      agentMeta: {
        recommendedSupplierId: "supp-hindalco-001",
        recommendedSupplierName: "Hindalco Forgings Pvt Ltd",
        recommendedSupplierCity: "Pune",
        runnerUpSupplierId: "supp-bharat-001",
        runnerUpSupplierName: "Bharat Steel Industries",
        runnerUpDelta: 18400,
        otdPercent: 96,
        withinBudget: true,
        budgetRemaining: 1477500,
        confidence: 0.96,
      },
    },
  });
  console.log("✓ RFQ:", rfq.rfqNumber);

  // Print action tokens for dev testing
  const approveToken = createActionToken({ userId: approver.id, action: "approve", rfqId: rfq.rfqNumber });
  const sendbackToken = createActionToken({ userId: approver.id, action: "sendback", rfqId: rfq.rfqNumber });
  const rejectToken = createActionToken({ userId: approver.id, action: "reject", rfqId: rfq.rfqNumber });

  console.log("\n── Dev tokens (valid 24h) ──");
  console.log(`Approve:   http://localhost:3000/approve/${approveToken}`);
  console.log(`Send back: http://localhost:3000/approve/${sendbackToken}`);
  console.log(`Reject:    http://localhost:3000/approve/${rejectToken}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
