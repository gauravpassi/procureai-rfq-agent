/**
 * The RFQ data shape surfaced to the Approver flow.
 * In production, populated from the DB + agent service.
 * For Phase 1 dev, seeded as a fixture.
 */
export interface ApproverRFQData {
  rfqId: string;
  title: string;
  itemDescription: string;
  qty: number;
  uom: string;
  spec: string;
  amount: number; // paise-precise rupees
  needByDate: string; // e.g. "May 14"
  daysUntilDelivery: number;
  withinBudget: boolean;
  budgetRemaining: number | null;
  runnerUpDelta: number;
  runnerUpSupplier: string;
  recommendedSupplier: { name: string; city: string };
  agentRationale: string; // Claude-generated
  approver: { name: string; email: string };
}
