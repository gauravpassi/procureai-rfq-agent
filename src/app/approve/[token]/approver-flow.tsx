"use client";

import { useReducer, useEffect } from "react";
import { approverReducer, INITIAL_STATE } from "@/types/approver";
import type { Action } from "@/types/approver";
import { EmailView } from "@/components/approver/email-view";
import { ReasonSheet } from "@/components/approver/reason-sheet";
import { AuthChallenge } from "@/components/approver/auth-challenge";
import { ResultView } from "@/components/approver/result-view";
import type { ApproverRFQData } from "@/types/approver-data";

interface Props {
  rfq: ApproverRFQData;
  /** When the page is opened from an email button link, pre-set the action */
  initialAction?: Action;
}

export function ApproverFlow({ rfq, initialAction }: Props) {
  const [state, dispatch] = useReducer(approverReducer, {
    ...INITIAL_STATE,
    // If opened via a direct email button link, fast-forward to that action's stage
    ...(initialAction && {
      action: initialAction,
      stage: initialAction === "approve" ? "auth" : "reason",
    }),
  });

  // Enforce transitions per the state machine
  const handleAction = (action: Action) => dispatch({ type: "CLICK_ACTION", action });
  const handleContinue = () => dispatch({ type: "START_AUTH" });
  const handleCancel = () => dispatch({ type: "RESET" });
  const handleVerified = (result: Parameters<typeof dispatch>[0] extends { type: "AUTH_VERIFIED" } ? never : never) => {};

  return (
    <>
      {state.stage === "email" && (
        <EmailView rfq={rfq} onAction={handleAction} />
      )}
      {state.stage === "reason" && (
        <ReasonSheet
          state={state}
          dispatch={dispatch}
          onContinue={handleContinue}
          onCancel={handleCancel}
        />
      )}
      {state.stage === "auth" && (
        <AuthChallenge
          state={state}
          dispatch={dispatch}
          rfq={rfq}
          onVerified={(result) => dispatch({ type: "AUTH_VERIFIED", result })}
        />
      )}
      {state.stage === "result" && state.result && (
        <ResultView
          result={state.result}
          authMethod={state.authMethod}
          rfqId={rfq.rfqId}
          actorName={rfq.approver.name}
          onReplay={() => dispatch({ type: "RESET" })}
        />
      )}
    </>
  );
}
