"use client";

/**
 * PipelineView — the right-hand panel of the Intake surface.
 *
 * Shows the full procurement pipeline for the selected signal as a vertical
 * step timeline.  Each step renders according to its status:
 *
 *  done / human-done  → collapsed one-liner with summary
 *  running            → expanded with streaming AgentNarrative
 *  awaiting-human     → expanded human gate card (amber) with action buttons
 *  locked             → greyed-out future step
 *
 * A "▶ Run Live Demo" button resets the pipeline to step 0 and animates
 * through all agent steps, pausing at human gates.
 */

import { useState } from "react";
import type { PipelineStep, Signal, BidRow, POData } from "@/types/intake";
import { AgentNarrative } from "./agent-narrative";
import { ConnectorIcon } from "./connector-icon";
import { Pill } from "@/components/pill";
import { Btn } from "@/components/btn";
import { Icon } from "@/components/icon";

interface Props {
  signal: Signal;
  steps: PipelineStep[];
  onAction: (stepId: string, which: "primary" | "alt1" | "alt2") => void;
  onRunDemo: () => void;
  demoRunning: boolean;
}

export function PipelineView({ signal, steps, onAction, onRunDemo, demoRunning }: Props) {
  const hasHumanGate = steps.some((s) => s.status === "awaiting-human");
  const allDone = steps.every((s) => s.status === "done" || s.status === "human-done");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* ── Panel header ───────────────────────────────────────────────────── */}
      <div style={{
        padding: "10px 20px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-app)",
        flexShrink: 0,
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <ConnectorIcon kind={signal.source} size={14} />
          <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {signal.from}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)", flexShrink: 0 }}>· {signal.when}</span>
          {hasHumanGate && (
            <Pill tone="warn" icon="info" size="sm">Action Required</Pill>
          )}
          {allDone && (
            <Pill tone="success" icon="check" size="sm">Complete</Pill>
          )}
        </div>
        <Btn
          kind={demoRunning ? "secondary" : "dark"}
          size="sm"
          icon="spark"
          onClick={onRunDemo}
          disabled={demoRunning}
        >
          {demoRunning ? "Agent running…" : "▶  Run Live Demo"}
        </Btn>
      </div>

      {/* ── Pipeline timeline ──────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 40px" }}>
        <div style={{ maxWidth: 680 }}>
          {steps.map((step, idx) => (
            <StepRow
              key={step.id}
              step={step}
              isLast={idx === steps.length - 1}
              onAction={(which) => onAction(step.id, which)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Single pipeline row ──────────────────────────────────────────────────────

function StepRow({
  step,
  isLast,
  onAction,
}: {
  step: PipelineStep;
  isLast: boolean;
  onAction: (which: "primary" | "alt1" | "alt2") => void;
}) {
  const isLocked = step.status === "locked";
  const isDone = step.status === "done" || step.status === "human-done";
  const isRunning = step.status === "running";
  const isHumanGate = step.status === "awaiting-human";

  // Timeline dot appearance
  const dotStyle: React.CSSProperties = isLocked
    ? { background: "var(--bg-muted)", border: "1.5px solid var(--border-default)" }
    : isDone
    ? { background: "var(--success-soft)", border: "1.5px solid var(--success-border)" }
    : isRunning
    ? { background: "var(--agent-soft)", border: "1.5px solid var(--agent-border)" }
    : { background: "var(--warn-soft)", border: "1.5px solid var(--warn-border)" }; // awaiting-human

  // Label color
  const labelColor = isLocked
    ? "var(--text-disabled)"
    : isHumanGate
    ? "var(--warn)"
    : isRunning
    ? "var(--agent)"
    : "var(--text-primary)";

  const labelWeight = isRunning || isHumanGate ? 600 : isDone ? 500 : 400;

  // Connecting line color
  const lineColor = isDone ? "var(--success-border)" : "var(--border-subtle)";

  return (
    <div style={{ display: "flex", gap: 14 }}>
      {/* ── Timeline track (dot + vertical line) ── */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: 22,
        flexShrink: 0,
      }}>
        {/* Dot */}
        <div style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ...dotStyle,
        }}>
          {isDone && <Icon name="check" size={11} style={{ color: "var(--success)" }} />}
          {isRunning && (
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--agent)",
              display: "block",
              animation: "pulse 1.2s ease-in-out infinite",
            }} />
          )}
          {isHumanGate && <Icon name="info" size={11} style={{ color: "var(--warn)" }} />}
        </div>

        {/* Vertical connector line */}
        {!isLast && (
          <div style={{
            width: 2,
            flex: 1,
            minHeight: 18,
            marginTop: 3,
            background: lineColor,
          }} />
        )}
      </div>

      {/* ── Step content ── */}
      <div style={{ flex: 1, paddingBottom: isLast ? 0 : 22 }}>
        {/* Label row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minHeight: 22,
          marginBottom: 3,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 13.5, fontWeight: labelWeight, color: labelColor, lineHeight: 1.3 }}>
            {step.kind === "human-gate" && !isLocked
              ? `👤 ${step.label}`
              : step.label}
          </span>

          {isRunning && <Pill tone="agent" icon="spark" size="sm">Agent working</Pill>}
          {isHumanGate && <Pill tone="warn" icon="info" size="sm">Action required</Pill>}

          {/* Human-done: show inline done text */}
          {step.status === "human-done" && step.humanDoneText && (
            <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontStyle: "italic" }}>
              · {step.humanDoneText}
            </span>
          )}
        </div>

        {/* Agent done: one-line summary */}
        {step.status === "done" && step.agentSummary && (
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5, margin: 0 }}>
            {step.agentSummary}
          </p>
        )}

        {/* Agent running: streaming narrative */}
        {isRunning && step.narrativeKey && (
          <div style={{ marginTop: 8 }}>
            <AgentNarrative signalId={step.narrativeKey} />
          </div>
        )}

        {/* Human gate: expanded action card */}
        {isHumanGate && (
          <HumanGateCard step={step} onAction={onAction} />
        )}
      </div>
    </div>
  );
}

// ── Human gate expanded card ─────────────────────────────────────────────────

function HumanGateCard({
  step,
  onAction,
}: {
  step: PipelineStep;
  onAction: (which: "primary" | "alt1" | "alt2") => void;
}) {
  const [showBidTable, setShowBidTable] = useState(false);
  const hasPO = !!step.poData;
  const hasBidTable = !!step.bidTable?.length;
  const hasRfqFields = !!step.rfqFields?.length;
  const hasAnyDetail = hasRfqFields || hasBidTable || hasPO;

  return (
    <div style={{
      marginTop: 10,
      background: "var(--warn-soft)",
      border: "1px solid var(--warn-border)",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      {/* Gate header */}
      {(step.humanTitle || step.humanSubtitle) && (
        <div style={{
          padding: "12px 14px",
          borderBottom: hasAnyDetail ? "1px solid var(--warn-border)" : "none",
        }}>
          {step.humanTitle && (
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)", marginBottom: step.humanSubtitle ? 4 : 0 }}>
              {step.humanTitle}
            </div>
          )}
          {step.humanSubtitle && (
            <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
              {step.humanSubtitle}
            </div>
          )}
        </div>
      )}

      {/* RFQ field mini-table (for non-PO gates) */}
      {hasRfqFields && (
        <div style={{ borderBottom: "1px solid var(--warn-border)" }}>
          {step.rfqFields!.map((f, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "baseline",
              padding: "7px 14px",
              borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              background: f.flag ? "rgba(180,83,9,0.04)" : "transparent",
            }}>
              <span style={{ fontSize: 11.5, color: "var(--text-tertiary)", width: 110, flexShrink: 0, lineHeight: 1.5 }}>
                {f.label}
              </span>
              <span style={{
                fontSize: 13,
                color: f.flag ? "var(--warn)" : "var(--text-primary)",
                fontWeight: f.flag ? 500 : 400,
                flex: 1,
                lineHeight: 1.5,
              }}>
                {f.value}{f.flag && " ⚠"}
              </span>
              {f.confidence !== undefined && (
                <span style={{
                  fontSize: 11.5,
                  color: f.confidence === 0 ? "var(--danger)" : f.confidence < 90 ? "var(--warn)" : "var(--text-tertiary)",
                  fontWeight: 500,
                  flexShrink: 0,
                  marginLeft: 8,
                }}>
                  {f.confidence > 0 ? `${f.confidence}%` : "—"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PO gate: bid table (toggled) + PO card */}
      {hasPO && (
        <div>
          {/* Bid toggle row */}
          {hasBidTable && (
            <div style={{ borderBottom: showBidTable ? "none" : "1px solid var(--warn-border)" }}>
              <button
                onClick={() => setShowBidTable((v) => !v)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(180,83,9,0.03)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 11, color: "var(--warn)" }}>{showBidTable ? "▾" : "▸"}</span>
                {showBidTable ? "Hide bid comparison" : "View bid comparison (3 quotes received)"}
              </button>
              {showBidTable && <BidComparisonTable bids={step.bidTable!} />}
            </div>
          )}

          {/* PO document */}
          <div style={{ padding: "14px", borderBottom: "1px solid var(--warn-border)" }}>
            <POCard po={step.poData!} />
          </div>
        </div>
      )}

      {/* Non-PO gate: bid table toggle (existing behaviour) */}
      {!hasPO && hasBidTable && showBidTable && (
        <BidComparisonTable bids={step.bidTable!} />
      )}

      {/* Action buttons */}
      <div style={{ padding: "12px 14px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {step.humanCTA && (
          <Btn kind="dark" size="md" onClick={() => onAction("primary")}>
            {step.humanCTA}
          </Btn>
        )}
        {step.humanAltCTAs?.[0] && (
          <Btn
            kind="secondary"
            size="md"
            onClick={() => {
              if (hasBidTable) {
                setShowBidTable((v) => !v);
              } else {
                onAction("alt1");
              }
            }}
          >
            {hasBidTable
              ? showBidTable ? "Hide bids" : step.humanAltCTAs[0]
              : step.humanAltCTAs[0]}
          </Btn>
        )}
        {step.humanAltCTAs?.[1] && (
          <Btn kind="ghost" size="md" onClick={() => onAction("alt2")}>
            {step.humanAltCTAs[1]}
          </Btn>
        )}
      </div>
    </div>
  );
}

// ── Purchase Order card ───────────────────────────────────────────────────────

function POCard({ po }: { po: POData }) {
  return (
    <div style={{
      background: "white",
      border: "1.5px solid var(--border-default)",
      borderRadius: 8,
      overflow: "hidden",
      fontSize: 12.5,
    }}>
      {/* PO header */}
      <div style={{
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--bg-subtle)",
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-primary)", textTransform: "uppercase" }}>
            Purchase Order
          </div>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 3 }}>
            Date: {po.date} · Terms: {po.terms}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)", fontFamily: "monospace", letterSpacing: "0.02em" }}>
            {po.poNumber}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", marginTop: 2 }}>
            Auto-generated · ProcureAI
          </div>
        </div>
      </div>

      {/* Addresses row */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border-subtle)" }}>
        {/* Vendor */}
        <div style={{ flex: 1, padding: "10px 16px", borderRight: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-tertiary)", marginBottom: 5 }}>
            Vendor
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 2 }}>{po.vendorName}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>{po.vendorAddress}</div>
          {po.vendorGST && (
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4 }}>
              GSTIN: <span style={{ fontFamily: "monospace", letterSpacing: "0.02em" }}>{po.vendorGST}</span>
            </div>
          )}
        </div>
        {/* Delivery */}
        <div style={{ flex: 1, padding: "10px 16px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-tertiary)", marginBottom: 5 }}>
            Deliver to
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 6 }}>{po.deliverTo}</div>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-tertiary)", marginBottom: 3 }}>
            Required by
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--warn-dark, #92400e)" }}>{po.requiredBy}</div>
        </div>
      </div>

      {/* Line items table */}
      <div>
        {/* Header */}
        <div style={{
          display: "flex",
          padding: "6px 16px",
          background: "var(--bg-subtle)",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          {(["Item / Description", "Qty", "Unit Price", "Amount"] as const).map((h, i) => (
            <span key={h} style={{
              flex: i === 0 ? 3 : 1,
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-tertiary)",
              textAlign: i === 0 ? "left" : "right",
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {po.lineItems.map((item, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "baseline",
            padding: "10px 16px",
            borderBottom: "1px solid var(--border-subtle)",
          }}>
            <div style={{ flex: 3, fontSize: 12.5, color: "var(--text-primary)", lineHeight: 1.4 }}>
              {item.description}
            </div>
            <div style={{ flex: 1, textAlign: "right", fontSize: 12.5, color: "var(--text-secondary)" }}>
              {item.quantity} {item.unit}
            </div>
            <div style={{ flex: 1, textAlign: "right", fontSize: 12.5, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
              {item.unitPrice}
            </div>
            <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 600, color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}>
              {item.amount}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
        {po.subtotal && po.gst && (
          <div style={{ display: "flex", gap: 24, fontSize: 12, color: "var(--text-secondary)" }}>
            <span>Sub-total</span>
            <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 90, textAlign: "right" }}>{po.subtotal}</span>
          </div>
        )}
        {po.gst && (
          <div style={{ display: "flex", gap: 24, fontSize: 12, color: "var(--text-secondary)" }}>
            <span>GST (18%)</span>
            <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 90, textAlign: "right" }}>{po.gst}</span>
          </div>
        )}
        <div style={{
          display: "flex",
          gap: 24,
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text-primary)",
          paddingTop: 6,
          borderTop: "1.5px solid var(--border-default)",
          marginTop: 2,
        }}>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 11 }}>Total</span>
          <span style={{ fontVariantNumeric: "tabular-nums", minWidth: 90, textAlign: "right" }}>{po.total}</span>
        </div>
      </div>
    </div>
  );
}

// ── Bid comparison table ────────────────────────────────────────────────────

function BidComparisonTable({ bids }: { bids: BidRow[] }) {
  const colStyle = (flex: number, align?: string): React.CSSProperties => ({
    flex,
    fontSize: 12.5,
    textAlign: (align as React.CSSProperties["textAlign"]) ?? "left",
    padding: "0 8px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ borderTop: "1px solid var(--warn-border)", borderBottom: "1px solid var(--warn-border)" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "7px 14px",
        background: "rgba(180,83,9,0.06)",
        borderBottom: "1px solid var(--warn-border)",
      }}>
        <span style={{ ...colStyle(3), fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vendor</span>
        <span style={{ ...colStyle(2), fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Price</span>
        <span style={{ ...colStyle(2), fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Delivery</span>
        <span style={{ ...colStyle(1.5), fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>OTD</span>
        <span style={{ ...colStyle(1.5), fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Cert</span>
      </div>

      {/* Rows */}
      {bids.map((bid, i) => {
        const isNoResponse = bid.status === "no-response";
        const rowBg = bid.recommended ? "rgba(21,128,61,0.05)" : "transparent";

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "9px 14px",
              borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              background: rowBg,
              opacity: isNoResponse ? 0.5 : 1,
            }}
          >
            {/* Vendor */}
            <div style={{ flex: 3, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
              {bid.recommended && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--success)",
                  background: "var(--success-soft)",
                  border: "1px solid var(--success-border)",
                  borderRadius: 4,
                  padding: "1px 5px",
                  flexShrink: 0,
                }}>
                  ★ REC
                </span>
              )}
              <span style={{
                fontSize: 13,
                fontWeight: bid.recommended ? 600 : 400,
                color: bid.recommended ? "var(--success)" : isNoResponse ? "var(--text-disabled)" : "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {bid.vendor}
              </span>
            </div>

            {/* Price */}
            <div style={{ flex: 2, textAlign: "right", paddingRight: 8 }}>
              <span style={{
                fontSize: 13,
                fontWeight: bid.recommended ? 600 : 400,
                color: isNoResponse ? "var(--text-disabled)" : bid.recommended ? "var(--success)" : "var(--text-primary)",
                fontVariantNumeric: "tabular-nums",
              }}>
                {bid.price}
              </span>
            </div>

            {/* Delivery */}
            <div style={{ flex: 2, textAlign: "center" }}>
              <span style={{ fontSize: 12.5, color: isNoResponse ? "var(--text-disabled)" : "var(--text-secondary)" }}>
                {bid.delivery}
              </span>
            </div>

            {/* OTD */}
            <div style={{ flex: 1.5, textAlign: "center" }}>
              <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>{bid.otd}</span>
            </div>

            {/* Cert */}
            <div style={{ flex: 1.5, textAlign: "center" }}>
              {bid.certified
                ? <span style={{ fontSize: 12, color: "var(--success)" }}>✓</span>
                : <span style={{ fontSize: 12, color: "var(--text-disabled)" }}>—</span>
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}
