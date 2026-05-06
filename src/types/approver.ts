/**
 * Approver state machine — typed per design handoff §State Management.
 * Every field here maps 1:1 to the handoff spec.
 */

export type Stage = "email" | "reason" | "auth" | "result";
export type Action = "approve" | "sendback" | "reject";
export type AuthMethod = "passkey" | "otp";
export type AuthState = "idle" | "verifying" | "done";
export type Result = "approved" | "sentback" | "rejected";

export interface ApproverState {
  stage: Stage;
  action: Action | null;
  result: Result | null;
  authMethod: AuthMethod;
  otp: string; // 6 chars
  authState: AuthState;
  sendBackText: string;
  sendBackQuick: string | null; // exclusive with sendBackText
  rejectReason: string;
}

export const INITIAL_STATE: ApproverState = {
  stage: "email",
  action: null,
  result: null,
  authMethod: "passkey",
  otp: "",
  authState: "idle",
  sendBackText: "",
  sendBackQuick: null,
  rejectReason: "",
};

export type ApproverAction =
  | { type: "CLICK_ACTION"; action: Action }
  | { type: "SET_SEND_BACK_TEXT"; text: string }
  | { type: "SET_SEND_BACK_QUICK"; option: string | null }
  | { type: "SET_REJECT_REASON"; reason: string }
  | { type: "SET_AUTH_METHOD"; method: AuthMethod }
  | { type: "SET_OTP"; otp: string }
  | { type: "START_AUTH" }
  | { type: "AUTH_VERIFIED"; result: Result }
  | { type: "RESET" };

export function approverReducer(state: ApproverState, action: ApproverAction): ApproverState {
  switch (action.type) {
    case "CLICK_ACTION":
      // Approve goes straight to auth (no reason needed)
      return {
        ...state,
        action: action.action,
        stage: action.action === "approve" ? "auth" : "reason",
      };
    case "SET_SEND_BACK_TEXT":
      // sendBackText and sendBackQuick are exclusive (radio behavior)
      return { ...state, sendBackText: action.text, sendBackQuick: null };
    case "SET_SEND_BACK_QUICK":
      return { ...state, sendBackQuick: action.option, sendBackText: "" };
    case "SET_REJECT_REASON":
      return { ...state, rejectReason: action.reason };
    case "SET_AUTH_METHOD":
      return { ...state, authMethod: action.method, otp: "", authState: "idle" };
    case "SET_OTP":
      return { ...state, otp: action.otp };
    case "START_AUTH":
      return { ...state, stage: "auth" };
    case "AUTH_VERIFIED":
      return { ...state, authState: "done", result: action.result, stage: "result" };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

// Derived helpers
export const hasReason = (s: ApproverState): boolean =>
  s.action === "approve" || !!s.sendBackText.trim() || !!s.sendBackQuick || !!s.rejectReason.trim();

export const SEND_BACK_QUICK_OPTIONS = [
  "Missing technical specifications",
  "Budget needs further review",
  "Alternative suppliers required",
] as const;
