/**
 * Every value the agent contributes to the UI is wrapped in this primitive.
 * The provenance row component renders source + confidence inline.
 *
 * Per the design handoff (README §Implementation Recommendations #2):
 *   "wrap it in { value, source, confidence, citations[] } and render a
 *    consistent provenance line component. Don't sprinkle agent-derived
 *    values into raw strings."
 */
export type AgentSource =
  | "outlook"
  | "sap"
  | "salesforce"
  | "coupa"
  | "slack"
  | "drive"
  | "teams"
  | "agent"
  | "user";

export interface AgentCitation {
  source: AgentSource;
  /** Free-text reference, e.g. "Email line 3" or "PR-1234 line 6" */
  ref: string;
  /** Optional URL to open the source */
  url?: string;
}

export interface AgentField<T> {
  value: T;
  source: AgentSource;
  /** 0–1 inclusive */
  confidence: number;
  /** Plain-English reason for the value (1–2 sentences max) */
  reasoning?: string;
  citations?: AgentCitation[];
}

export const af = <T>(
  value: T,
  source: AgentSource,
  confidence: number,
  extras?: Partial<Pick<AgentField<T>, "reasoning" | "citations">>,
): AgentField<T> => ({ value, source, confidence, ...extras });

export const isLowConfidence = (f: AgentField<unknown>) => f.confidence < 0.8;
