"use client";

/**
 * IntakeShell — full Intake surface with live pipeline view.
 *
 * Manages the pipeline state for all 6 demo signals. Each signal has a
 * step-by-step procurement pipeline that:
 *  - Pre-populates with some done steps to show variety across signals
 *  - Can be reset and replayed via "▶ Run Live Demo"
 *  - Pauses at human gates so the buyer can take action
 *  - Advances automatically after human action
 */

import { useState, useRef, useCallback } from "react";
import type { Signal, PipelineStep } from "@/types/intake";
import { ConnectorStrip } from "./connector-strip";
import { SignalCard } from "./signal-card";
import { PipelineView } from "./pipeline-view";
import { BrandMark } from "@/components/brand-mark";
import { Pill } from "@/components/pill";
import { Btn } from "@/components/btn";

// ── Static signal metadata ───────────────────────────────────────────────────

const SIGNALS: Signal[] = [
  { id: "s1", source: "outlook",    from: "priya.menon@acmemfg.in",   subject: "Urgent: 500 kg SS 316 flanges for Plant 2 retrofit",     when: "9 min ago",  confidence: 96 },
  { id: "s2", source: "sap",        from: "SAP MM · PR 4500001234",    subject: "PR 4500001234 · 200 nos · CNC inserts",                  when: "24 min ago", confidence: 99 },
  { id: "s3", source: "salesforce", from: "Salesforce · Opp 0061a000", subject: "Project Aurora · BOM upload triggered",                  when: "38 min ago", confidence: 78 },
  { id: "s4", source: "slack",      from: "#plant2-maint",             subject: "Anand: bearings 6205 again, conveyor 3 noisy",           when: "1 h ago",    confidence: 64 },
  { id: "s5", source: "drive",      from: "Drive · /specs/inbox",      subject: "Hydraulic-hose-spec-v2.pdf",                             when: "2 h ago",    confidence: 91 },
  { id: "s6", source: "coupa",      from: "Coupa · Req-9921",          subject: "Req-9921 · Welding electrodes · 50 boxes",              when: "3 h ago",    confidence: 97 },
];

// ── Initial pipeline definitions ────────────────────────────────────────────
// Pre-seeded with realistic state: different signals at different stages.

const PIPELINE_DEFS: Record<string, PipelineStep[]> = {

  // s1 — Email: 3 agent steps done, sitting at "Review & Send RFQ" human gate
  s1: [
    { id: "s1-0", kind: "agent", label: "Signal Captured",
      status: "done",
      agentSummary: "Outlook email from Priya Menon · 09:42 AM · routed to priority queue",
      narrativeKey: "s1-capture" },
    { id: "s1-1", kind: "agent", label: "Parsed & Enriched",
      status: "done",
      agentSummary: "500 kg SS 316 flanges · PLT2-MAINT-Q2 · est. ₹3.4L · May 14 (88% conf)",
      narrativeKey: "s1-parse" },
    { id: "s1-2", kind: "agent", label: "Suppliers Shortlisted",
      status: "done",
      agentSummary: "4 vendors · IS 6392 certified · ≥85% OTD · Hindalco, Bharat Steel, Steelmark, MTI Forge",
      narrativeKey: "s1-shortlist" },
    { id: "s1-3", kind: "human-gate", label: "Review & Send RFQ",
      status: "awaiting-human",
      humanTitle: "Agent-drafted RFQ ready — review before sending to 4 suppliers",
      humanSubtitle: "RFQ-2026-0421 · quote deadline May 8, 5 PM IST · est. ₹3.4L within budget",
      humanCTA: "Send RFQ to 4 suppliers",
      humanAltCTAs: ["Edit fields", "Add suppliers"],
      humanDoneText: "RFQ-2026-0421 sent · 4 suppliers notified",
      rfqFields: [
        { label: "Material",     value: "SS 316 flanges 80mm slip-on IS 6392",        confidence: 98 },
        { label: "Quantity",     value: "500 kg",                                      confidence: 99 },
        { label: "Required by",  value: "May 14, 2026",                               confidence: 88, flag: true },
        { label: "Deliver to",   value: "Plant 2, Pune (411 026)",                    confidence: 100 },
        { label: "Budget",       value: "₹3.4L est. · ₹18.2L remaining",             confidence: 100 },
        { label: "Suppliers",    value: "Hindalco · Bharat Steel · Steelmark · MTI",  confidence: 95 },
      ] },
    { id: "s1-4", kind: "agent", label: "Monitor for Quotes",
      status: "locked", narrativeKey: "s1-monitor",
      agentSummary: "RFQ dispatched · monitoring 4 inboxes" },
    { id: "s1-5", kind: "agent", label: "Compare Bids",
      status: "locked", narrativeKey: "s1-compare",
      agentSummary: "Bharat Steel recommended · ₹2.9L · 14.7% below budget" },
    { id: "s1-6", kind: "human-gate", label: "Select Supplier & Approve PO",
      status: "locked",
      humanTitle: "Review bid comparison and approve purchase",
      humanSubtitle: "Agent recommendation: Bharat Steel · ₹2.9L · IS 6392 certified · 91% OTD",
      humanCTA: "Approve Bharat Steel & Generate PO",
      humanAltCTAs: ["Review all bids"],
      humanDoneText: "Bharat Steel approved · PO-2026-0884 generated" },
    { id: "s1-7", kind: "agent", label: "Release PO to Supplier",
      status: "locked", narrativeKey: "s1-po",
      agentSummary: "PO released · Bharat Steel acknowledged · delivery May 13" },
  ],

  // s2 — SAP PR: past first gate, currently monitoring quotes
  s2: [
    { id: "s2-0", kind: "agent", label: "PR Synced from SAP",
      status: "done",
      agentSummary: "PR 4500001234 · CNMG 120408 TiAIN · Plant 2000 · RAJESH.K",
      narrativeKey: "s2-capture" },
    { id: "s2-1", kind: "agent", label: "Material & Cost Validated",
      status: "done",
      agentSummary: "100% match vs material master · PLT2-PROD-Q2 · ₹4.6L budget · delivery 14.05.2026",
      narrativeKey: "s2-validate" },
    { id: "s2-2", kind: "agent", label: "Suppliers Shortlisted",
      status: "done",
      agentSummary: "3 ISO 9001-certified vendors · Mitsubishi Materials, Sandvik, Kennametal",
      narrativeKey: "s2-shortlist" },
    { id: "s2-3", kind: "human-gate", label: "RFQ Reviewed & Sent",
      status: "human-done",
      humanDoneText: "RFQ-2026-0422 sent to 3 vendors · quotes due May 7" },
    { id: "s2-4", kind: "agent", label: "Monitoring for Quotes",
      status: "running", narrativeKey: "s2-monitor",
      agentSummary: "0 of 3 received · Mitsubishi typically replies in 2h" },
    { id: "s2-5", kind: "agent", label: "Compare Bids",
      status: "locked", narrativeKey: "s2-compare",
      agentSummary: "Mitsubishi recommended · ₹1.87L · fastest lead time" },
    { id: "s2-6", kind: "human-gate", label: "Select Supplier & Approve PO",
      status: "locked",
      humanTitle: "Select winning vendor and approve PO",
      humanCTA: "Approve & Generate PO",
      humanDoneText: "Mitsubishi Materials approved · PO-2026-0882 generated" },
    { id: "s2-7", kind: "agent", label: "Release PO",
      status: "locked", narrativeKey: "s2-po",
      agentSummary: "PO released · supplier acknowledged" },
  ],

  // s3 — Salesforce BOM: agent currently enriching (step 1 running)
  s3: [
    { id: "s3-0", kind: "agent", label: "BOM Upload Triggered",
      status: "done",
      agentSummary: "Aurora-BOM-v3.xlsx · 32 line items · est. ₹4.8 Cr · Vivek Rao",
      narrativeKey: "s3-trigger" },
    { id: "s3-1", kind: "agent", label: "Enriching BOM from Salesforce",
      status: "running", narrativeKey: "s3-enrich",
      agentSummary: "4 RFQ packages identified · processing 65%" },
    { id: "s3-2", kind: "agent", label: "Package into RFQ Bundles",
      status: "locked",
      agentSummary: "4 packages · mechanical, electrical, hydraulic, instrumentation" },
    { id: "s3-3", kind: "human-gate", label: "Review & Send RFQ Bundle",
      status: "locked",
      humanTitle: "Review 4 RFQ packages before sending",
      humanSubtitle: "32 items · 4 commodity categories · est. ₹4.8 Cr",
      humanCTA: "Send all 4 RFQs",
      humanAltCTAs: ["Review individually"],
      humanDoneText: "4 RFQs sent to shortlisted vendors" },
    { id: "s3-4", kind: "agent", label: "Monitor Quotes",
      status: "locked",
      agentSummary: "Monitoring across 4 commodity vendor pools" },
    { id: "s3-5", kind: "agent", label: "Compare & Recommend",
      status: "locked",
      agentSummary: "Per-package recommendation with savings analysis" },
    { id: "s3-6", kind: "human-gate", label: "Approve Purchases",
      status: "locked",
      humanTitle: "Approve recommended vendors across 4 packages",
      humanCTA: "Approve all recommended",
      humanAltCTAs: ["Review per package"],
      humanDoneText: "All approved · 4 POs generated" },
  ],

  // s4 — Slack: stock found, human gate to approve STO or draft RFQ
  s4: [
    { id: "s4-0", kind: "agent", label: "Slack Request Captured",
      status: "done",
      agentSummary: "#plant2-maint · Anand Iyer · 'bearings 6205 again, conveyor 3 noisy'",
      narrativeKey: "s4-capture" },
    { id: "s4-1", kind: "agent", label: "Request Parsed",
      status: "done",
      agentSummary: "SKF 6205-2RS · qty ~4 (85% conf) · conveyor 3 · high urgency",
      narrativeKey: "s4-parse" },
    { id: "s4-2", kind: "agent", label: "Inventory Check",
      status: "done",
      agentSummary: "Found 42 units in Plant 1 Stores · 2-day STO transfer viable",
      narrativeKey: "s4-stockcheck" },
    { id: "s4-3", kind: "human-gate", label: "Approve Transfer or Draft RFQ",
      status: "awaiting-human",
      humanTitle: "Stock found in Plant 1 — RFQ may not be needed",
      humanSubtitle: "42 × SKF 6205-2RS in Plant 1 Stores · 2-day STO · zero procurement cost",
      humanCTA: "Raise STO from Plant 1",
      humanAltCTAs: ["Draft RFQ instead", "Reply to Anand"],
      humanDoneText: "STO raised · Anand notified on Slack",
      rfqFields: [
        { label: "Item",            value: "SKF 6205-2RS deep-groove ball bearing", confidence: 97 },
        { label: "Qty needed",      value: "~4 units",                              confidence: 85, flag: true },
        { label: "Stock available", value: "42 units · Plant 1 Stores",            confidence: 100 },
        { label: "Transfer ETA",    value: "2 days (May 7)",                        confidence: 95 },
      ] },
    { id: "s4-4", kind: "agent", label: "Reply to Anand on Slack",
      status: "locked",
      agentSummary: "Agent posts Slack reply confirming resolution" },
  ],

  // s5 — Drive PDF: spec extracted, waiting for PR to be linked
  s5: [
    { id: "s5-0", kind: "agent", label: "PDF Detected in Drive",
      status: "done",
      agentSummary: "Hydraulic-hose-spec-v2.pdf · /specs/inbox · Ravi (Engineering)",
      narrativeKey: "s5-detect" },
    { id: "s5-1", kind: "agent", label: "Spec Extracted",
      status: "done",
      agentSummary: "1-in braided hose · 280 bar WP · 6 variants · 21-day lead time",
      narrativeKey: "s5-extract" },
    { id: "s5-2", kind: "human-gate", label: "Confirm Spec & Link PR",
      status: "awaiting-human",
      humanTitle: "Confirm extracted spec and link a SAP Purchase Request",
      humanSubtitle: "No SAP PR linked — agent cannot create an RFQ without a PR number. Review spec and attach a PR to proceed.",
      humanCTA: "Link PR & Create RFQ",
      humanAltCTAs: ["Edit spec fields", "Reject"],
      humanDoneText: "PR linked · RFQ creation queued",
      rfqFields: [
        { label: "Item",        value: "1-inch SAE 100R2AT braided hydraulic hose", confidence: 93 },
        { label: "Pressure",    value: "280 bar working pressure",                  confidence: 97 },
        { label: "Variants",    value: "6 (2m, 5m, 10m + customs)",               confidence: 95 },
        { label: "Lead time",   value: "21-day target",                             confidence: 91 },
        { label: "SAP PR",      value: "Not linked — required to proceed",          confidence: 0,  flag: true },
      ] },
    { id: "s5-3", kind: "agent", label: "Shortlist Suppliers",
      status: "locked",
      agentSummary: "Hydraulic hose specialists with SAE 100R2AT stock" },
    { id: "s5-4", kind: "human-gate", label: "Review & Send RFQ",
      status: "locked",
      humanTitle: "Review hydraulic hose RFQ",
      humanCTA: "Send RFQ",
      humanDoneText: "RFQ sent to shortlisted vendors" },
    { id: "s5-5", kind: "agent", label: "Monitor & Compare Quotes",
      status: "locked",
      agentSummary: "Await quotes and surface comparison" },
    { id: "s5-6", kind: "human-gate", label: "Approve Supplier",
      status: "locked",
      humanTitle: "Select winning supplier",
      humanCTA: "Approve & Generate PO",
      humanDoneText: "Approved · PO generated" },
  ],

  // s6 — Coupa: fully complete, all steps done
  s6: [
    { id: "s6-0", kind: "agent", label: "Requisition Received",
      status: "done",
      agentSummary: "Coupa Req-9921 · D. Mehta approved · 50 boxes ESAB E7018 welding electrodes" },
    { id: "s6-1", kind: "agent", label: "Validated & Enriched",
      status: "done",
      agentSummary: "PLT2-FAB-Q2 · budget ₹2.1L · est. ₹38,500 · 3 ESAB dealers in vendor master" },
    { id: "s6-2", kind: "human-gate", label: "RFQ Reviewed & Sent",
      status: "human-done",
      humanDoneText: "RFQ-2026-0419 sent to 3 ESAB dealers · deadline May 5" },
    { id: "s6-3", kind: "agent", label: "Quotes Compared",
      status: "done",
      agentSummary: "Bharat Welding at ₹36,200 · 3-day delivery · lowest price · recommended" },
    { id: "s6-4", kind: "human-gate", label: "Supplier Approved",
      status: "human-done",
      humanDoneText: "Bharat Welding Supplies approved · PO-2026-0881 generated" },
    { id: "s6-5", kind: "agent", label: "PO Released",
      status: "done",
      agentSummary: "PO-2026-0881 released · Bharat Welding acknowledged · delivery confirmed May 6" },
  ],
};

// ── Component ────────────────────────────────────────────────────────────────

export function IntakeShell() {
  const [selectedId, setSelectedId] = useState<string>("s1");
  const [pipelines, setPipelines] = useState<Record<string, PipelineStep[]>>(
    () => JSON.parse(JSON.stringify(PIPELINE_DEFS)),
  );
  const [demoSignalId, setDemoSignalId] = useState<string | null>(null);

  const selected = SIGNALS.find((s) => s.id === selectedId)!;
  const selectedSteps = pipelines[selectedId] ?? [];

  // ── Demo runner ────────────────────────────────────────────────────────────

  // Keep a ref for the active demo so we can cancel on re-trigger
  const demoRef = useRef<{ signalId: string; canceled: boolean } | null>(null);

  const advanceToStep = useCallback(
    (signalId: string, stepIdx: number) => {
      if (demoRef.current?.signalId !== signalId || demoRef.current.canceled) return;

      const stepDef = PIPELINE_DEFS[signalId]?.[stepIdx];
      if (!stepDef) {
        setDemoSignalId(null);
        return;
      }

      const nextStatus = stepDef.kind === "human-gate" ? "awaiting-human" : "running";

      setPipelines((prev) => ({
        ...prev,
        [signalId]: prev[signalId].map((s, i) =>
          i === stepIdx ? { ...s, status: nextStatus } : s,
        ),
      }));

      if (stepDef.kind === "human-gate") {
        // Stop the demo — wait for human action
        setDemoSignalId(null);
        return;
      }

      // Auto-advance after 2.8 s (lets Haiku finish streaming)
      setTimeout(() => {
        if (demoRef.current?.signalId !== signalId || demoRef.current.canceled) return;
        setPipelines((prev) => ({
          ...prev,
          [signalId]: prev[signalId].map((s, i) =>
            i === stepIdx ? { ...s, status: "done" } : s,
          ),
        }));
        setTimeout(() => advanceToStep(signalId, stepIdx + 1), 400);
      }, 2800);
    },
    [],
  );

  const runDemo = useCallback(() => {
    const signalId = selectedId;

    // Cancel any running demo
    if (demoRef.current) demoRef.current.canceled = true;
    demoRef.current = { signalId, canceled: false };

    // Reset pipeline to all-locked
    setPipelines((prev) => ({
      ...prev,
      [signalId]: PIPELINE_DEFS[signalId].map((s) => ({ ...s, status: "locked" })),
    }));
    setDemoSignalId(signalId);

    // Start from step 0 after a short breath
    setTimeout(() => advanceToStep(signalId, 0), 600);
  }, [selectedId, advanceToStep]);

  // ── Human gate action ──────────────────────────────────────────────────────

  const handleStepAction = useCallback(
    (stepId: string, which: "primary" | "alt1" | "alt2") => {
      const signalId = selectedId;
      const stepIdx = pipelines[signalId].findIndex((s) => s.id === stepId);
      if (stepIdx === -1) return;

      // Mark gate as done
      setPipelines((prev) => ({
        ...prev,
        [signalId]: prev[signalId].map((s, i) =>
          i === stepIdx ? { ...s, status: "human-done" } : s,
        ),
      }));

      // Continue pipeline automatically after human action
      if (stepIdx < PIPELINE_DEFS[signalId].length - 1) {
        if (demoRef.current) demoRef.current.canceled = true;
        demoRef.current = { signalId, canceled: false };
        setDemoSignalId(signalId);
        setTimeout(() => advanceToStep(signalId, stepIdx + 1), 700);
      }
    },
    [selectedId, pipelines, advanceToStep],
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "var(--bg-canvas)" }}>

      {/* Top bar */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-app)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BrandMark size={20} />
          <div style={{ width: 1, height: 16, background: "var(--border-default)" }} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>RFQ Intake</span>
          <Pill tone="neutral" size="sm">Asha Krishnan · Sr Buyer</Pill>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pill tone="success" icon="check" size="md">All connectors healthy</Pill>
          <Btn kind="secondary" size="sm" icon="sliders">Routing rules</Btn>
        </div>
      </header>

      {/* Connector strip */}
      <ConnectorStrip />

      {/* Two-column body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* Left: signal feed — 320px */}
        <div style={{ width: 320, flexShrink: 0, borderRight: "1px solid var(--border-subtle)", background: "var(--bg-app)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Feed header */}
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)" }}>
              Inbound · today
            </span>
            <Pill tone="agent" icon="spark" size="sm">Agent listening</Pill>
          </div>

          {/* Scrollable signal list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {SIGNALS.map((s) => (
              <SignalCard
                key={s.id}
                signal={s}
                steps={pipelines[s.id] ?? []}
                active={s.id === selectedId}
                onClick={() => setSelectedId(s.id)}
              />
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border-subtle)", fontSize: 11.5, color: "var(--text-tertiary)", flexShrink: 0 }}>
            Routes: Outlook, Gmail, SAP MM, Salesforce, Coupa, Slack, Drive, Teams.
          </div>
        </div>

        {/* Right: pipeline view */}
        <div style={{ flex: 1, overflow: "hidden", background: "var(--bg-canvas)", display: "flex", flexDirection: "column" }}>
          <PipelineView
            key={selectedId}
            signal={selected}
            steps={selectedSteps}
            onAction={handleStepAction}
            onRunDemo={runDemo}
            demoRunning={demoSignalId === selectedId}
          />
        </div>
      </div>
    </div>
  );
}
