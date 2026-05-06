"use client";

import { useReducer } from "react";
import { approverReducer, INITIAL_STATE } from "@/types/approver";
import type { Action } from "@/types/approver";
import { EmailView } from "@/components/approver/email-view";
import { ReasonSheet } from "@/components/approver/reason-sheet";
import { ResultView } from "@/components/approver/result-view";
import type { ApproverRFQData } from "@/types/approver-data";

interface Props {
  rfq: ApproverRFQData;
  /**
   * When the page is opened via an email action button link, the action is
   * pre-set from the PO token.  We skip straight to the result (approve) or
   * to the reason sheet (sendback / reject).
   */
  initialAction?: Action;
  /** PO number shown in the result screen */
  poNumber?: string;
  /** Vendor name shown in the result screen */
  vendorName?: string;
}

export function ApproverFlow({ rfq, initialAction, poNumber, vendorName }: Props) {
  const [state, dispatch] = useReducer(approverReducer, {
    ...INITIAL_STATE,
    ...(initialAction && {
      action: initialAction,
      // approve  → skip to result immediately
      // send back / reject → show reason sheet first
      stage:  initialAction === "approve" ? "result" : "reason",
      result: initialAction === "approve" ? "approved" : null,
    }),
  });

  const handleAction   = (action: Action) => dispatch({ type: "CLICK_ACTION", action });
  const handleContinue = ()               => dispatch({ type: "START_AUTH" });
  const handleCancel   = ()               => dispatch({ type: "RESET" });

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
      {state.stage === "result" && state.result && (
        <ResultView
          result={state.result}
          rfqId={rfq.rfqId}
          actorName={rfq.approver.name}
          poNumber={poNumber ?? rfq.rfqId}
          vendorName={vendorName ?? rfq.recommendedSupplier.name}
          onReplay={() => dispatch({ type: "RESET" })}
        />
      )}
    </>
  );
}
