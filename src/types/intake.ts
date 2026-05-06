export type SignalSource = "outlook" | "sap" | "salesforce" | "slack" | "drive" | "coupa" | "teams";

/** Status of a single pipeline step */
export type PipelineStepStatus =
  | "locked"          // Future — not yet started
  | "running"         // Agent actively working (streams narrative)
  | "done"            // Agent step completed
  | "awaiting-human"  // Human gate — waiting for buyer action
  | "human-done";     // Human gate completed

/** One vendor row in a bid comparison table */
export interface BidRow {
  vendor: string;
  price: string;
  delivery: string;
  otd: string;
  certified: boolean;
  status: "received" | "no-response";
  recommended?: boolean;
}

/** A mini key-value row shown inside a human gate panel */
export interface RfqField {
  label: string;
  value: string;
  confidence?: number;
  flag?: boolean; // true = amber highlight (low confidence / needs attention)
}

/** One step in the procurement pipeline */
export interface PipelineStep {
  id: string;
  kind: "agent" | "human-gate";
  label: string;
  status: PipelineStepStatus;

  // ── Agent step ──────────────────────────────────────────────────────────────
  /** One-line summary shown after step completes */
  agentSummary?: string;
  /** Key passed to /api/intake/narrate?signal=<narrativeKey> when running */
  narrativeKey?: string;

  // ── Human gate ──────────────────────────────────────────────────────────────
  humanTitle?: string;
  humanSubtitle?: string;
  humanCTA?: string;           // Primary action button label
  humanAltCTAs?: string[];     // Up to 2 secondary / ghost actions
  humanDoneText?: string;      // Text shown in collapsed state after gate passed
  rfqFields?: RfqField[];      // Mini field table inside the gate card
  bidTable?: BidRow[];         // Vendor comparison table (for approve-supplier gate)
}

/** The procurement signal (email / PR / Slack msg / etc.) */
export interface Signal {
  id: string;
  source: SignalSource;
  from: string;
  subject: string;
  when: string;
  confidence: number;
}

/** A field in the detailed RFQ draft (used by legacy draft components) */
export interface DraftField {
  key: string;
  label: string;
  value: string;
  sub?: string;
  provenance: string;
  confidence: number;
  source: SignalSource;
  enriched?: string;
}

export interface Connector {
  key: SignalSource;
  label: string;
  status: "on" | "degraded" | "off";
  count: string;
}
