"use client";

/**
 * IntakeShell — full Intake surface with live pipeline view.
 *
 * Each "▶ Run Live Demo" click:
 *  1. Picks a fresh scenario (rotates through 5 pre-baked materials/sources)
 *  2. Prepends a NEW signal card to the left panel
 *  3. Selects it and animates the full pipeline from step 0
 *  4. Pauses at human gates for buyer approval
 *  5. Final gate shows a fully formatted Purchase Order for review
 */

import { useState, useRef, useCallback } from "react";
import type { Signal, PipelineStep, SignalSource } from "@/types/intake";
import { ConnectorStrip } from "./connector-strip";
import { SignalCard } from "./signal-card";
import { PipelineView } from "./pipeline-view";
import { BrandMark } from "@/components/brand-mark";
import { Pill } from "@/components/pill";
import { Btn } from "@/components/btn";

// ── Static signal metadata (pre-seeded, always visible) ──────────────────────

const STATIC_SIGNALS: Signal[] = [
  { id: "s1", source: "outlook",    from: "priya.menon@acmemfg.in",   subject: "Urgent: 500 kg SS 316 flanges for Plant 2 retrofit",     when: "9 min ago",  confidence: 96 },
  { id: "s2", source: "sap",        from: "SAP MM · PR 4500001234",    subject: "PR 4500001234 · 200 nos · CNC inserts",                  when: "24 min ago", confidence: 99 },
  { id: "s3", source: "salesforce", from: "Salesforce · Opp 0061a000", subject: "Project Aurora · BOM upload triggered",                  when: "38 min ago", confidence: 78 },
  { id: "s4", source: "slack",      from: "#plant2-maint",             subject: "Anand: bearings 6205 again, conveyor 3 noisy",           when: "1 h ago",    confidence: 64 },
  { id: "s5", source: "drive",      from: "Drive · /specs/inbox",      subject: "Hydraulic-hose-spec-v2.pdf",                             when: "2 h ago",    confidence: 91 },
  { id: "s6", source: "coupa",      from: "Coupa · Req-9921",          subject: "Req-9921 · Welding electrodes · 50 boxes",              when: "3 h ago",    confidence: 97 },
];

// ── Static pipeline definitions ──────────────────────────────────────────────

const STATIC_PIPELINE_DEFS: Record<string, PipelineStep[]> = {

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
    { id: "s1-6", kind: "human-gate", label: "Review & Approve PO",
      status: "locked",
      humanTitle: "Review Purchase Order — Bharat Steel",
      humanSubtitle: "Agent recommendation: Bharat Steel · ₹2.9L · IS 6392 certified · 91% OTD · 14.7% below budget",
      humanCTA: "Send PO to Vendor",
      humanAltCTAs: ["Review all bids", "Request revision"],
      humanDoneText: "PO-2026-0884 sent to Bharat Steel · delivery confirmed May 13",
      bidTable: [
        { vendor: "Bharat Steel",      price: "₹2.9L",  delivery: "May 13", otd: "91%", certified: true,  status: "received", recommended: true },
        { vendor: "Hindalco Forgings", price: "₹3.2L",  delivery: "May 15", otd: "96%", certified: true,  status: "received" },
        { vendor: "Steelmark",         price: "₹3.35L", delivery: "May 16", otd: "89%", certified: true,  status: "received" },
        { vendor: "MTI Forge",         price: "—",       delivery: "—",      otd: "87%", certified: true,  status: "no-response" },
      ],
      poData: {
        poNumber: "PO-2026-0884",
        date: "May 6, 2026",
        terms: "Net 30",
        vendorName: "Bharat Steel Pvt. Ltd.",
        vendorAddress: "Plot 42, MIDC Phase II, Pune 411 018",
        vendorGST: "27AABCB1234A1Z5",
        deliverTo: "Plant 2, Godrej Complex, Pune 411 026",
        requiredBy: "May 13, 2026",
        lineItems: [
          { description: "SS 316 Flanges 80mm Slip-On IS 6392", quantity: "500", unit: "kg", unitPrice: "₹580/kg", amount: "₹2,90,000" },
        ],
        subtotal: "₹2,90,000",
        gst: "₹52,200",
        total: "₹3,42,200",
      } },
    { id: "s1-7", kind: "agent", label: "PO Delivered to Supplier",
      status: "locked", narrativeKey: "s1-po",
      agentSummary: "PO-2026-0884 released · Bharat Steel acknowledged · delivery May 13" },
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
    { id: "s2-6", kind: "human-gate", label: "Review & Approve PO",
      status: "locked",
      humanTitle: "Review Purchase Order — Mitsubishi Materials",
      humanSubtitle: "Agent recommendation: Mitsubishi Materials · ₹1.87L · ISO 9001 · 14-day delivery",
      humanCTA: "Send PO to Vendor",
      humanAltCTAs: ["Review all bids", "Request revision"],
      humanDoneText: "PO-2026-0882 sent to Mitsubishi Materials",
      bidTable: [
        { vendor: "Mitsubishi Materials", price: "₹1.87L", delivery: "May 14", otd: "94%", certified: true, status: "received", recommended: true },
        { vendor: "Sandvik Coromant",     price: "₹1.94L", delivery: "May 15", otd: "92%", certified: true, status: "received" },
        { vendor: "Kennametal",           price: "₹2.05L", delivery: "May 16", otd: "89%", certified: true, status: "received" },
      ],
      poData: {
        poNumber: "PO-2026-0882",
        date: "May 6, 2026",
        terms: "Net 30",
        vendorName: "Mitsubishi Materials India Pvt. Ltd.",
        vendorAddress: "Tower A, DLF Cyber City, Gurgaon 122 002",
        vendorGST: "06AAECM1234M1ZK",
        deliverTo: "Plant 2000, Tool Crib, Pune 411 026",
        requiredBy: "May 14, 2026",
        lineItems: [
          { description: "CNMG 120408 TiAlN Coated Carbide Insert", quantity: "200", unit: "EA", unitPrice: "₹935/EA", amount: "₹1,87,000" },
        ],
        subtotal: "₹1,87,000",
        gst: "₹33,660",
        total: "₹2,20,660",
      } },
    { id: "s2-7", kind: "agent", label: "PO Delivered to Supplier",
      status: "locked", narrativeKey: "s2-po",
      agentSummary: "PO-2026-0882 released · Mitsubishi acknowledged · delivery May 14" },
  ],

  // s3 — Salesforce BOM: agent currently enriching
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
        { label: "Transfer ETA",    value: "2 days (May 8)",                        confidence: 95 },
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
      humanSubtitle: "No SAP PR linked — agent cannot create an RFQ without a PR number.",
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
    { id: "s5-6", kind: "human-gate", label: "Review & Approve PO",
      status: "locked",
      humanTitle: "Review Purchase Order",
      humanCTA: "Send PO to Vendor",
      humanDoneText: "PO sent to approved vendor" },
  ],

  // s6 — Coupa: fully complete
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
    { id: "s6-4", kind: "human-gate", label: "PO Approved & Sent",
      status: "human-done",
      humanDoneText: "PO-2026-0881 sent to Bharat Welding Supplies" },
    { id: "s6-5", kind: "agent", label: "PO Delivered to Supplier",
      status: "done",
      agentSummary: "PO-2026-0881 released · Bharat Welding acknowledged · delivery confirmed May 6" },
  ],
};

// ── Demo scenarios — 5 fresh procurement flows with unique data ───────────────

interface DemoScenario {
  source: SignalSource;
  from: string;
  subject: string;
  confidence: number;
  makeSteps: (id: string) => PipelineStep[];
}

const DEMO_SCENARIOS: DemoScenario[] = [
  // ── Scenario 0: Copper bus bars (SAP PR) ────────────────────────────────────
  {
    source: "sap",
    from: "SAP MM · PR 4500001289",
    subject: "PR 4500001289 · 80m · Copper bus bars 40×5mm",
    confidence: 99,
    makeSteps: (id) => [
      { id: `${id}-0`, kind: "agent", label: "PR Synced from SAP",
        status: "locked", narrativeKey: "demo-capture",
        agentSummary: "PR 4500001289 auto-captured · ETP Copper bus bar 40×5mm · PLT3-CAP-Q2 · SURESH.P" },
      { id: `${id}-1`, kind: "agent", label: "Parsed & Enriched",
        status: "locked", narrativeKey: "demo-parse",
        agentSummary: "80 metres ETP Copper bus bar IS 613 · est. ₹1.8L · Switchgear Panel Shop, Nashik" },
      { id: `${id}-2`, kind: "agent", label: "Suppliers Shortlisted",
        status: "locked", narrativeKey: "demo-shortlist",
        agentSummary: "3 IS 613-certified vendors · Hindalco Copper, Sterlite, Rajasthan Metals" },
      { id: `${id}-3`, kind: "human-gate", label: "Review & Send RFQ",
        status: "locked",
        humanTitle: "Agent-drafted RFQ ready — review before sending to 3 suppliers",
        humanSubtitle: "RFQ-2026-0425 · quote deadline May 9 · est. ₹1.8L within budget",
        humanCTA: "Send RFQ to 3 suppliers",
        humanAltCTAs: ["Edit fields"],
        humanDoneText: "RFQ-2026-0425 sent · 3 suppliers notified",
        rfqFields: [
          { label: "Material",    value: "ETP Copper bus bar 40×5×3000mm IS 613", confidence: 99 },
          { label: "Quantity",    value: "80 metres (~122 kg)",                    confidence: 99 },
          { label: "Required by", value: "May 12, 2026",                           confidence: 96 },
          { label: "Deliver to",  value: "Switchgear Panel Shop, Nashik 422 007",  confidence: 100 },
          { label: "Budget",      value: "₹2.2L est. · ₹8.4L remaining",          confidence: 100 },
          { label: "Suppliers",   value: "Hindalco Copper · Sterlite · Rajasthan Metals", confidence: 95 },
        ] },
      { id: `${id}-4`, kind: "agent", label: "Monitor for Quotes",
        status: "locked", narrativeKey: "demo-monitor",
        agentSummary: "RFQ-2026-0425 dispatched · monitoring 3 inboxes" },
      { id: `${id}-5`, kind: "agent", label: "Compare Bids",
        status: "locked", narrativeKey: "demo-compare",
        agentSummary: "Hindalco Copper recommended · ₹1.61L · 10.5% below budget" },
      { id: `${id}-6`, kind: "human-gate", label: "Review & Approve PO",
        status: "locked",
        humanTitle: "Review Purchase Order — Hindalco Copper",
        humanSubtitle: "Hindalco Copper · ₹1.61L · IS 613 certified · 94% OTD · 10.5% below budget",
        humanCTA: "Send PO to Vendor",
        humanAltCTAs: ["Review all bids", "Request revision"],
        humanDoneText: "PO-2026-0885 sent to Hindalco Copper · delivery confirmed May 11",
        bidTable: [
          { vendor: "Hindalco Copper",   price: "₹1.61L", delivery: "May 11", otd: "94%", certified: true, status: "received", recommended: true },
          { vendor: "Sterlite Copper",   price: "₹1.72L", delivery: "May 13", otd: "91%", certified: true, status: "received" },
          { vendor: "Rajasthan Metals",  price: "₹1.80L", delivery: "May 15", otd: "88%", certified: true, status: "received" },
        ],
        poData: {
          poNumber: "PO-2026-0885",
          date: "May 6, 2026",
          terms: "Net 30",
          vendorName: "Hindalco Copper Pvt. Ltd.",
          vendorAddress: "Plot 7, MIDC Industrial Area, Nashik 422 007",
          vendorGST: "27AACHH2468C1ZK",
          deliverTo: "Switchgear Panel Shop, Nashik 422 007",
          requiredBy: "May 12, 2026",
          lineItems: [
            { description: "ETP Copper bus bar 40×5mm IS 613", quantity: "80", unit: "m", unitPrice: "₹2,012/m", amount: "₹1,60,960" },
          ],
          subtotal: "₹1,60,960",
          gst: "₹28,972",
          total: "₹1,89,932",
        } },
      { id: `${id}-7`, kind: "agent", label: "PO Delivered to Supplier",
        status: "locked", narrativeKey: "demo-po",
        agentSummary: "PO-2026-0885 released · Hindalco Copper acknowledged · delivery May 11" },
    ],
  },

  // ── Scenario 1: Hydraulic seal kit (Teams) ──────────────────────────────────
  {
    source: "teams",
    from: "Teams · #maintenance-cell2",
    subject: "Ravi K: Hydraulic seal kit for Godrej 100T press — urgent",
    confidence: 83,
    makeSteps: (id) => [
      { id: `${id}-0`, kind: "agent", label: "Signal Captured",
        status: "locked", narrativeKey: "demo-capture",
        agentSummary: "Teams message from Ravi K · #maintenance-cell2 · @ProcureAI mention routed to intake" },
      { id: `${id}-1`, kind: "agent", label: "Parsed & Enriched",
        status: "locked", narrativeKey: "demo-parse",
        agentSummary: "Godrej 100T press seal rebuild kit · qty 2 kits + 50 O-rings · est. ₹65,000 · URGENT" },
      { id: `${id}-2`, kind: "agent", label: "Suppliers Shortlisted",
        status: "locked", narrativeKey: "demo-shortlist",
        agentSummary: "3 OEM-compatible seal suppliers · Parker Hannifin, Trelleborg, Freudenberg" },
      { id: `${id}-3`, kind: "human-gate", label: "Review & Send RFQ",
        status: "locked",
        humanTitle: "Agent-drafted RFQ ready — urgent hydraulic seal kit",
        humanSubtitle: "RFQ-2026-0426 · quote deadline May 8 (urgent) · est. ₹65,000",
        humanCTA: "Send RFQ to 3 suppliers",
        humanAltCTAs: ["Edit fields"],
        humanDoneText: "RFQ-2026-0426 sent · 3 suppliers notified · urgent flag set",
        rfqFields: [
          { label: "Item",        value: "Godrej 100T press hydraulic seal rebuild kit", confidence: 89 },
          { label: "Quantity",    value: "2 kits + 50 O-ring assorted",                  confidence: 91 },
          { label: "Required by", value: "May 9, 2026 (URGENT)",                         confidence: 94, flag: true },
          { label: "Deliver to",  value: "Maintenance Store, Plant 2, Pune",              confidence: 100 },
          { label: "Budget",      value: "₹75,000 est. · ₹3.2L remaining",               confidence: 100 },
          { label: "Suppliers",   value: "Parker Hannifin · Trelleborg · Freudenberg",    confidence: 95 },
        ] },
      { id: `${id}-4`, kind: "agent", label: "Monitor for Quotes",
        status: "locked", narrativeKey: "demo-monitor",
        agentSummary: "RFQ-2026-0426 dispatched · urgent flag · 3 inboxes monitored" },
      { id: `${id}-5`, kind: "agent", label: "Compare Bids",
        status: "locked", narrativeKey: "demo-compare",
        agentSummary: "Parker Hannifin India recommended · ₹64,500 · OEM compatibility confirmed" },
      { id: `${id}-6`, kind: "human-gate", label: "Review & Approve PO",
        status: "locked",
        humanTitle: "Review Purchase Order — Parker Hannifin India",
        humanSubtitle: "Parker Hannifin India · ₹64,500 · OEM-compatible · delivery May 8 (within urgent window)",
        humanCTA: "Send PO to Vendor",
        humanAltCTAs: ["Review all bids", "Request revision"],
        humanDoneText: "PO-2026-0886 sent to Parker Hannifin · delivery confirmed May 8",
        bidTable: [
          { vendor: "Parker Hannifin India", price: "₹64,500", delivery: "May 8",  otd: "93%", certified: true, status: "received", recommended: true },
          { vendor: "Trelleborg Sealing",    price: "₹68,200", delivery: "May 9",  otd: "90%", certified: true, status: "received" },
          { vendor: "Freudenberg India",     price: "₹71,000", delivery: "May 10", otd: "88%", certified: true, status: "received" },
        ],
        poData: {
          poNumber: "PO-2026-0886",
          date: "May 6, 2026",
          terms: "Net 15 (urgent)",
          vendorName: "Parker Hannifin India Pvt. Ltd.",
          vendorAddress: "Unit 4, Bhosari MIDC, Pune 411 026",
          vendorGST: "27AABCP9876B1ZP",
          deliverTo: "Maintenance Store, Plant 2, Pune 411 026",
          requiredBy: "May 9, 2026 (URGENT)",
          lineItems: [
            { description: "Godrej 100T Press Hydraulic Seal Rebuild Kit", quantity: "2", unit: "kits", unitPrice: "₹28,000/kit", amount: "₹56,000" },
            { description: "O-ring Assorted Set (50 pcs)",                 quantity: "1", unit: "lot",  unitPrice: "₹8,500",       amount: "₹8,500" },
          ],
          subtotal: "₹64,500",
          gst: "₹11,610",
          total: "₹76,110",
        } },
      { id: `${id}-7`, kind: "agent", label: "PO Delivered to Supplier",
        status: "locked", narrativeKey: "demo-po",
        agentSummary: "PO-2026-0886 released · Parker Hannifin acknowledged · delivery May 8" },
    ],
  },

  // ── Scenario 2: MIG welding wire (Coupa) ───────────────────────────────────
  {
    source: "coupa",
    from: "Coupa · Req-9934",
    subject: "Req-9934 · MIG welding wire ER70S-6 · 14 spools",
    confidence: 97,
    makeSteps: (id) => [
      { id: `${id}-0`, kind: "agent", label: "Requisition Received",
        status: "locked", narrativeKey: "demo-capture",
        agentSummary: "Coupa Req-9934 · D. Mehta approved · 14 × 15kg ER70S-6 MIG wire spools" },
      { id: `${id}-1`, kind: "agent", label: "Parsed & Enriched",
        status: "locked", narrativeKey: "demo-parse",
        agentSummary: "ESAB ER70S-6 0.8mm MIG wire · 14 spools (210 kg) · PLT1-FAB-Q2 · est. ₹82,320" },
      { id: `${id}-2`, kind: "agent", label: "Suppliers Shortlisted",
        status: "locked", narrativeKey: "demo-shortlist",
        agentSummary: "3 authorised ESAB dealers · ESAB India, Ador Welding, Lincoln Electric" },
      { id: `${id}-3`, kind: "human-gate", label: "Review & Send RFQ",
        status: "locked",
        humanTitle: "Agent-drafted RFQ ready — review before sending to 3 suppliers",
        humanSubtitle: "RFQ-2026-0427 · quote deadline May 8 · est. ₹82,320 within budget",
        humanCTA: "Send RFQ to 3 suppliers",
        humanAltCTAs: ["Edit fields"],
        humanDoneText: "RFQ-2026-0427 sent · 3 welding wire dealers notified",
        rfqFields: [
          { label: "Material",    value: "ER70S-6 MIG welding wire 0.8mm dia 15kg spool", confidence: 99 },
          { label: "Quantity",    value: "14 spools (210 kg)",                              confidence: 99 },
          { label: "Required by", value: "May 10, 2026",                                    confidence: 98 },
          { label: "Deliver to",  value: "Fabrication Bay, Plant 1, Pune 411 019",          confidence: 100 },
          { label: "Budget",      value: "₹95,000 est. · ₹2.1L remaining",                 confidence: 100 },
          { label: "Suppliers",   value: "ESAB India · Ador Welding · Lincoln Electric",    confidence: 97 },
        ] },
      { id: `${id}-4`, kind: "agent", label: "Monitor for Quotes",
        status: "locked", narrativeKey: "demo-monitor",
        agentSummary: "RFQ-2026-0427 dispatched · monitoring 3 dealer inboxes" },
      { id: `${id}-5`, kind: "agent", label: "Compare Bids",
        status: "locked", narrativeKey: "demo-compare",
        agentSummary: "ESAB India recommended · ₹82,320 · genuine product · fastest delivery" },
      { id: `${id}-6`, kind: "human-gate", label: "Review & Approve PO",
        status: "locked",
        humanTitle: "Review Purchase Order — ESAB India",
        humanSubtitle: "ESAB India · ₹82,320 · genuine ER70S-6 · delivery May 9 · 13.3% below budget",
        humanCTA: "Send PO to Vendor",
        humanAltCTAs: ["Review all bids", "Request revision"],
        humanDoneText: "PO-2026-0887 sent to ESAB India · delivery confirmed May 9",
        bidTable: [
          { vendor: "ESAB India",     price: "₹82,320", delivery: "May 9",  otd: "97%", certified: true, status: "received", recommended: true },
          { vendor: "Ador Welding",   price: "₹87,500", delivery: "May 9",  otd: "94%", certified: true, status: "received" },
          { vendor: "Lincoln Electric", price: "₹91,000", delivery: "May 11", otd: "89%", certified: true, status: "received" },
        ],
        poData: {
          poNumber: "PO-2026-0887",
          date: "May 6, 2026",
          terms: "Net 30",
          vendorName: "ESAB India Ltd.",
          vendorAddress: "13, SIPCOT Industrial Park, Chennai 602 105",
          vendorGST: "33AAACE1234F1ZD",
          deliverTo: "Fabrication Bay, Plant 1, Pune 411 019",
          requiredBy: "May 10, 2026",
          lineItems: [
            { description: "ESAB ER70S-6 MIG wire 0.8mm 15kg spool", quantity: "14", unit: "nos", unitPrice: "₹5,880/spool", amount: "₹82,320" },
          ],
          subtotal: "₹82,320",
          gst: "₹14,817",
          total: "₹97,137",
        } },
      { id: `${id}-7`, kind: "agent", label: "PO Delivered to Supplier",
        status: "locked", narrativeKey: "demo-po",
        agentSummary: "PO-2026-0887 released · ESAB India acknowledged · delivery May 9" },
    ],
  },

  // ── Scenario 3: Gearbox replacement (Outlook — plant failure) ───────────────
  {
    source: "outlook",
    from: "vivek.sharma@plant3ops.in",
    subject: "Gearbox failure: Conveyor 7 offline — need 5.5kW replacement",
    confidence: 88,
    makeSteps: (id) => [
      { id: `${id}-0`, kind: "agent", label: "Signal Captured",
        status: "locked", narrativeKey: "demo-capture",
        agentSummary: "Outlook email · vivek.sharma@plant3ops.in · critical equipment failure · priority intake" },
      { id: `${id}-1`, kind: "agent", label: "Parsed & Enriched",
        status: "locked", narrativeKey: "demo-parse",
        agentSummary: "Helical gearbox 5.5kW i=40:1 B3 IEC 132 · qty 2 (1+spare) · est. ₹1.89L · Plant 3" },
      { id: `${id}-2`, kind: "agent", label: "Suppliers Shortlisted",
        status: "locked", narrativeKey: "demo-shortlist",
        agentSummary: "3 OEM-grade vendors · Elecon Engineering, Bonfiglioli India, SEW India" },
      { id: `${id}-3`, kind: "human-gate", label: "Review & Send RFQ",
        status: "locked",
        humanTitle: "Agent-drafted RFQ ready — gearbox replacement (critical)",
        humanSubtitle: "RFQ-2026-0428 · quote deadline May 9 · est. ₹1.89L · Conveyor 7 offline",
        humanCTA: "Send RFQ to 3 suppliers",
        humanAltCTAs: ["Edit fields"],
        humanDoneText: "RFQ-2026-0428 sent · 3 gearbox suppliers notified · critical flag set",
        rfqFields: [
          { label: "Item",        value: "Helical gearbox 5.5kW i=40:1 B3 IEC 132 flange", confidence: 90 },
          { label: "Quantity",    value: "2 units (1 replacement + 1 spare)",                confidence: 96 },
          { label: "Required by", value: "May 15, 2026",                                     confidence: 88, flag: true },
          { label: "Deliver to",  value: "Plant 3, Nashik Road, Nashik 422 010",             confidence: 100 },
          { label: "Budget",      value: "₹2.1L est. · ₹5.6L remaining",                    confidence: 100 },
          { label: "Suppliers",   value: "Elecon Engineering · Bonfiglioli · SEW India",     confidence: 95 },
        ] },
      { id: `${id}-4`, kind: "agent", label: "Monitor for Quotes",
        status: "locked", narrativeKey: "demo-monitor",
        agentSummary: "RFQ-2026-0428 dispatched · critical flag · 3 gearbox suppliers" },
      { id: `${id}-5`, kind: "agent", label: "Compare Bids",
        status: "locked", narrativeKey: "demo-compare",
        agentSummary: "Elecon Engineering recommended · ₹1.89L · fastest delivery · India-made stock" },
      { id: `${id}-6`, kind: "human-gate", label: "Review & Approve PO",
        status: "locked",
        humanTitle: "Review Purchase Order — Elecon Engineering",
        humanSubtitle: "Elecon Engineering · ₹1.89L · 91% OTD · delivery May 14 · 10% below budget",
        humanCTA: "Send PO to Vendor",
        humanAltCTAs: ["Review all bids", "Request revision"],
        humanDoneText: "PO-2026-0888 sent to Elecon Engineering · delivery confirmed May 14",
        bidTable: [
          { vendor: "Elecon Engineering", price: "₹1.89L", delivery: "May 14", otd: "91%", certified: true, status: "received", recommended: true },
          { vendor: "Bonfiglioli India",  price: "₹1.97L", delivery: "May 16", otd: "88%", certified: true, status: "received" },
          { vendor: "SEW India",          price: "₹2.08L", delivery: "May 17", otd: "92%", certified: true, status: "received" },
        ],
        poData: {
          poNumber: "PO-2026-0888",
          date: "May 6, 2026",
          terms: "Net 30",
          vendorName: "Elecon Engineering Co. Ltd.",
          vendorAddress: "Anand-Sojitra Road, Anand, Gujarat 388 001",
          vendorGST: "24AAACE5678G1ZE",
          deliverTo: "Plant 3, Nashik Road, Nashik 422 010",
          requiredBy: "May 15, 2026",
          lineItems: [
            { description: "Helical gearbox 5.5kW i=40:1 B3 IEC 132 flange", quantity: "2", unit: "nos", unitPrice: "₹94,500/unit", amount: "₹1,89,000" },
          ],
          subtotal: "₹1,89,000",
          gst: "₹34,020",
          total: "₹2,23,020",
        } },
      { id: `${id}-7`, kind: "agent", label: "PO Delivered to Supplier",
        status: "locked", narrativeKey: "demo-po",
        agentSummary: "PO-2026-0888 released · Elecon Engineering acknowledged · delivery May 14" },
    ],
  },

  // ── Scenario 4: LED flood lights (Drive PDF) ───────────────────────────────
  {
    source: "drive",
    from: "Drive · /capital-procurement/2026-Q2",
    subject: "LED-shopfloor-upgrade-Q2.pdf · 48 × 200W flood lights",
    confidence: 91,
    makeSteps: (id) => [
      { id: `${id}-0`, kind: "agent", label: "PDF Detected in Drive",
        status: "locked", narrativeKey: "demo-capture",
        agentSummary: "LED-shopfloor-upgrade-Q2.pdf · /capital-procurement/2026-Q2 · Arun (Engineering)" },
      { id: `${id}-1`, kind: "agent", label: "Spec Extracted",
        status: "locked", narrativeKey: "demo-parse",
        agentSummary: "LED flood light 200W IP65 5000K 110 lm/W · 48 units · est. ₹3.24L · PLT2-CAP-FY26" },
      { id: `${id}-2`, kind: "agent", label: "Suppliers Shortlisted",
        status: "locked", narrativeKey: "demo-shortlist",
        agentSummary: "3 IS 16102-compliant LED suppliers · Havells, Crompton Greaves, Bajaj Electricals" },
      { id: `${id}-3`, kind: "human-gate", label: "Review & Send RFQ",
        status: "locked",
        humanTitle: "Agent-drafted RFQ ready — shopfloor LED upgrade",
        humanSubtitle: "RFQ-2026-0429 · quote deadline May 10 · est. ₹3.24L within capital budget",
        humanCTA: "Send RFQ to 3 suppliers",
        humanAltCTAs: ["Edit fields"],
        humanDoneText: "RFQ-2026-0429 sent · 3 LED suppliers notified",
        rfqFields: [
          { label: "Item",        value: "LED flood light 200W IP65 5000K 110 lm/W IS 16102", confidence: 93 },
          { label: "Quantity",    value: "48 units",                                             confidence: 99 },
          { label: "Required by", value: "May 20, 2026",                                         confidence: 97 },
          { label: "Deliver to",  value: "Electrical Store, Plant 2, Pune 411 026",              confidence: 100 },
          { label: "Budget",      value: "₹3.6L est. · ₹12.1L cap budget remaining",            confidence: 100 },
          { label: "Suppliers",   value: "Havells India · Crompton Greaves · Bajaj Electricals", confidence: 96 },
        ] },
      { id: `${id}-4`, kind: "agent", label: "Monitor for Quotes",
        status: "locked", narrativeKey: "demo-monitor",
        agentSummary: "RFQ-2026-0429 dispatched · monitoring 3 LED supplier inboxes" },
      { id: `${id}-5`, kind: "agent", label: "Compare Bids",
        status: "locked", narrativeKey: "demo-compare",
        agentSummary: "Havells India recommended · ₹3.24L · highest lumen output · 5-year warranty" },
      { id: `${id}-6`, kind: "human-gate", label: "Review & Approve PO",
        status: "locked",
        humanTitle: "Review Purchase Order — Havells India",
        humanSubtitle: "Havells India · ₹3.24L · 96% OTD · 5-year warranty · delivery May 14 · 10% below budget",
        humanCTA: "Send PO to Vendor",
        humanAltCTAs: ["Review all bids", "Request revision"],
        humanDoneText: "PO-2026-0889 sent to Havells India · delivery confirmed May 14",
        bidTable: [
          { vendor: "Havells India",      price: "₹3.24L", delivery: "May 14", otd: "96%", certified: true, status: "received", recommended: true },
          { vendor: "Crompton Greaves",   price: "₹3.41L", delivery: "May 16", otd: "93%", certified: true, status: "received" },
          { vendor: "Bajaj Electricals",  price: "₹3.55L", delivery: "May 18", otd: "91%", certified: true, status: "received" },
        ],
        poData: {
          poNumber: "PO-2026-0889",
          date: "May 6, 2026",
          terms: "Net 30",
          vendorName: "Havells India Ltd.",
          vendorAddress: "1, Raj Narain Marg, Civil Lines, Delhi 110 092",
          vendorGST: "07AAACH1234P1ZH",
          deliverTo: "Electrical Store, Plant 2, Pune 411 026",
          requiredBy: "May 20, 2026",
          lineItems: [
            { description: "LED Flood Light 200W IP65 5000K 110 lm/W IS 16102", quantity: "48", unit: "nos", unitPrice: "₹6,750/unit", amount: "₹3,24,000" },
          ],
          subtotal: "₹3,24,000",
          gst: "₹58,320",
          total: "₹3,82,320",
        } },
      { id: `${id}-7`, kind: "agent", label: "PO Delivered to Supplier",
        status: "locked", narrativeKey: "demo-po",
        agentSummary: "PO-2026-0889 released · Havells India acknowledged · delivery May 14" },
    ],
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export function IntakeShell() {
  const [signals, setSignals] = useState<Signal[]>(STATIC_SIGNALS);
  const [selectedId, setSelectedId] = useState<string>("s1");
  const [pipelines, setPipelines] = useState<Record<string, PipelineStep[]>>(
    () => JSON.parse(JSON.stringify(STATIC_PIPELINE_DEFS)),
  );
  const [demoSignalId, setDemoSignalId] = useState<string | null>(null);

  // All pipeline definitions — static + dynamic demo ones.
  // advanceToStep reads from this ref to avoid stale closures.
  const pipelineDefsRef = useRef<Record<string, PipelineStep[]>>({ ...STATIC_PIPELINE_DEFS });

  // Tracks last-used scenario index so we rotate rather than repeat.
  const lastScenarioRef = useRef<number>(-1);

  // Signal list container — scrolled to top when a new demo signal is added.
  const listRef = useRef<HTMLDivElement>(null);

  // Demo cancellation token.
  const demoRef = useRef<{ signalId: string; canceled: boolean } | null>(null);

  const selected = signals.find((s) => s.id === selectedId) ?? signals[0];
  const selectedSteps = pipelines[selectedId] ?? [];

  // ── Demo runner ────────────────────────────────────────────────────────────

  const advanceToStep = useCallback((signalId: string, stepIdx: number) => {
    if (demoRef.current?.signalId !== signalId || demoRef.current.canceled) return;

    const stepDef = pipelineDefsRef.current[signalId]?.[stepIdx];
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
      setDemoSignalId(null); // pause — wait for human action
      return;
    }

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
  }, []);

  /** Creates a new signal + pipeline, prepends it to the left panel, and starts animation. */
  const runDemo = useCallback(() => {
    // Rotate through scenarios — avoid repeating the previous one
    let nextIdx = lastScenarioRef.current;
    if (DEMO_SCENARIOS.length > 1) {
      while (nextIdx === lastScenarioRef.current) {
        nextIdx = Math.floor(Math.random() * DEMO_SCENARIOS.length);
      }
    } else {
      nextIdx = 0;
    }
    lastScenarioRef.current = nextIdx;
    const scenario = DEMO_SCENARIOS[nextIdx];

    const newId = `demo-${Date.now()}`;

    const newSignal: Signal = {
      id: newId,
      source: scenario.source,
      from: scenario.from,
      subject: scenario.subject,
      when: "just now",
      confidence: scenario.confidence,
    };

    // makeSteps returns steps with their default statuses — we lock all for demo start
    const newSteps = scenario.makeSteps(newId);
    const lockedSteps = newSteps.map((s) => ({ ...s, status: "locked" as const }));

    // Store full defs in ref so advanceToStep can read without stale closure
    pipelineDefsRef.current[newId] = newSteps;

    // Cancel any running demo
    if (demoRef.current) demoRef.current.canceled = true;
    demoRef.current = { signalId: newId, canceled: false };

    // Prepend signal, add pipeline, auto-select
    setSignals((prev) => [newSignal, ...prev]);
    setPipelines((prev) => ({ ...prev, [newId]: lockedSteps }));
    setSelectedId(newId);
    setDemoSignalId(newId);

    // Scroll signal list to top to reveal the new card
    setTimeout(() => listRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
    // Start animation after a short breath
    setTimeout(() => advanceToStep(newId, 0), 600);
  }, [advanceToStep]);

  // ── Human gate action ──────────────────────────────────────────────────────

  const handleStepAction = useCallback(
    (stepId: string, which: "primary" | "alt1" | "alt2") => {
      // Alt actions are handled locally inside PipelineView/HumanGateCard
      if (which !== "primary") return;

      const signalId = selectedId;
      const stepIdx = pipelines[signalId].findIndex((s) => s.id === stepId);
      if (stepIdx === -1) return;

      // Mark gate as human-done
      setPipelines((prev) => ({
        ...prev,
        [signalId]: prev[signalId].map((s, i) =>
          i === stepIdx ? { ...s, status: "human-done" } : s,
        ),
      }));

      // Continue pipeline automatically after human action
      const totalSteps = pipelineDefsRef.current[signalId]?.length ?? 0;
      if (stepIdx < totalSteps - 1) {
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
          <div ref={listRef} style={{ flex: 1, overflowY: "auto" }}>
            {signals.map((s) => (
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
