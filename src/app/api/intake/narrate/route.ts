/**
 * GET /api/intake/narrate?signal=<key>
 *
 * Streams a Claude Haiku narrative for the given pipeline step.
 * Keys can be:
 *   s1, s2, … s6          (legacy — full-signal narrative)
 *   s1-capture, s1-parse, s1-shortlist, s1-monitor, s1-compare, s1-po
 *   s2-capture, s2-validate, s2-shortlist, s2-monitor, s2-compare, s2-po
 *   s3-trigger, s3-enrich
 *   s4-capture, s4-parse, s4-stockcheck
 *   s5-detect, s5-extract
 *
 * Response: text/event-stream
 *   data: {"token":"word"}\n\n
 *   data: {"done":true}\n\n
 */

import { NextRequest } from "next/server";
import { getAnthropicClient, HAIKU_MODEL } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

const SYSTEM = `You are ProcureAI, an AI procurement agent. In 2–3 short sentences, explain what you have just done for this specific step. Be specific: name sources cross-referenced, confidence levels on uncertain fields, what was found. Use **bold** for key terms (material name, quantities, vendor names, confidence figures). Never use bullet points. Be direct and factual. Keep it under 65 words.`;

const STEP_CONTEXTS: Record<string, string> = {
  // ── s1 — Outlook email: SS 316 flanges ─────────────────────────────────────
  "s1":
    `Outlook email from Priya Menon (Plant 2 Maintenance Head): "need 500 kg SS 316 flanges (80mm slip-on, IS 6392) for boiler retrofit, mid-May". Cross-referenced SAP MM for cost centre PLT2-MAINT-Q2 and vendor master. Found 4 IS 6392-certified suppliers with ≥85% OTD. "mid-May" mapped to May 14 using the SAP plant maintenance schedule — confidence 88%, flag for buyer review.`,
  "s1-capture":
    `Inbound Outlook email from priya.menon@acmemfg.in detected at 09:42. Sender authenticated as **Plant 2 Maintenance Head** with active procurement authority and PO history. Subject tagged 'Urgent' — routing to priority intake queue.`,
  "s1-parse":
    `Extracted **500 kg SS 316 flanges** (80mm slip-on, IS 6392) from email body and attachment. SAP HCM confirms cost centre **PLT2-MAINT-Q2**, budget ₹18.2L remaining, estimated PO ₹3.4L — within budget. Delivery 'mid-May' mapped to **May 14** using SAP plant maintenance schedule — **88% confidence**, flagging for buyer confirmation.`,
  "s1-shortlist":
    `Filtered vendor master for IS 6392-certified SS flange suppliers with **≥85% on-time delivery** in the last 12 months. **4 vendors shortlisted**: Hindalco Forgings (96% OTD), Bharat Steel (91%), Steelmark (89%), MTI Forge (87%). All hold active framework agreements with Plant 2 delivery history.`,
  "s1-monitor":
    `**RFQ-2026-0421** dispatched to 4 suppliers via email and Coupa portal. Monitoring inboxes for responses — typical window 4–8 hours. Will auto-parse quotes and extract pricing, lead time, and IS 6392 certification status on arrival.`,
  "s1-compare":
    `**3 of 4 quotes received**. Bharat Steel at **₹2.9L** is the lowest — 14.7% below budget. MTI Forge missed the delivery window. Hindalco and Steelmark within budget but priced 8–11% higher. Recommending **Bharat Steel** on price, 91% OTD, and IS 6392 certification.`,
  "s1-po":
    `Generating PO for **Bharat Steel** — ₹2.9L · 500 kg SS 316 flanges · Plant 2, Pune · May 13 delivery. PO number **PO-2026-0884** assigned. Routing for finance countersign and release to supplier.`,

  // ── s2 — SAP PR: CNC inserts ────────────────────────────────────────────────
  "s2":
    `SAP MM IDoc: PR 4500001234, 200 EA CNC turning inserts CNMG 120408 TiAlN, Plant 2000, cost centre PLT2-PROD-Q2, delivery 14.05.2026, created by RAJESH.K. All fields mapped 1:1 from the material master — no parsing ambiguity. Looking up vendor master for ISO 9001-certified tooling suppliers.`,
  "s2-capture":
    `SAP MM IDoc received: Purchase Requisition **PR 4500001234** created by RAJESH.K in Plant 2000. Structured PR — auto-routing to intake without manual field extraction.`,
  "s2-validate":
    `PR mapped 1:1 against material master: **CNMG 120408 TiAlN coated inserts**, code 700-CNC-INS-CNMG. Cost centre **PLT2-PROD-Q2** confirmed, budget ₹4.6L remaining. Delivery 14.05.2026 is within standard lead-time window — **100% confidence** on all fields.`,
  "s2-shortlist":
    `Querying vendor master for ISO 9001-certified CNMG 120408 suppliers with Plant 2000 delivery history. **3 vendors shortlisted**: Mitsubishi Materials (preferred, fastest lead time), Sandvik Coromant, Kennametal. All have active framework agreements.`,
  "s2-monitor":
    `**RFQ-2026-0422** sent to 3 tooling suppliers via Coupa and email. Mitsubishi Materials typically replies within 2 hours. Monitoring for responses — currently **0 of 3 received**. Will surface comparison matrix when ≥2 quotes arrive.`,
  "s2-compare":
    `**3 of 3 quotes received**. Mitsubishi Materials at **₹1.87L** is the lowest with 14-day delivery. Sandvik at ₹1.94L offers extended warranty. Recommending **Mitsubishi Materials** on price and delivery alignment.`,
  "s2-po":
    `Generating PO for **Mitsubishi Materials** — 200 EA CNMG 120408 TiAlN · ₹1.87L · Plant 2000 · delivery 14.05.2026. PO **PO-2026-0882** assigned.`,

  // ── s3 — Salesforce BOM ─────────────────────────────────────────────────────
  "s3":
    `Salesforce opportunity 'Project Aurora' — Vivek Rao uploaded Aurora-BOM-v3.xlsx with 32 line items totalling ₹4.8 Cr across 6 commodity categories. Splitting into 4 RFQ packages by commodity and matching each to qualified vendors from the vendor master and 12-month price index. About 40 seconds remaining.`,
  "s3-trigger":
    `Salesforce 'Project Aurora' BOM upload detected — **Aurora-BOM-v3.xlsx** uploaded by Vivek Rao. Routed to intake: **32 line items** across 6 commodity categories, estimated total **₹4.8 Cr**. Initiating commodity classification and vendor matching.`,
  "s3-enrich":
    `Splitting BOM into procurement packages by commodity. Matching each line against SAP material master and 12-month price index. Identified **4 RFQ packages**: mechanical (14 items), electrical (8), hydraulic (6), instrumentation (4). Cross-referencing SAP CO budget allocations — **processing 65% complete**.`,

  // ── s4 — Slack: bearings ────────────────────────────────────────────────────
  "s4":
    `Slack message from Anand Iyer in #plant2-maint: "bearings 6205 again, conveyor 3 noisy. need 4 ish?" Identified SKF 6205-2RS bearings (used 3× on this conveyor in 6 months) and likely quantity of 4. However, a stock check shows **42 units already in Plant 1 Stores** — a 2-day stock transfer would fulfil this without a new RFQ.`,
  "s4-capture":
    `Slack message from **Anand Iyer** in #plant2-maint detected and classified as an informal procurement request — '@procureai' mention triggered intake routing.`,
  "s4-parse":
    `NLP extraction: item = **SKF 6205-2RS deep-groove ball bearings** (matched from 3-month maintenance history on conveyor 3), quantity = **~4 units** (85% confidence on 'ish'). Urgency assessed as high — 'noisy conveyor' signals imminent failure risk.`,
  "s4-stockcheck":
    `Inventory query across all plant stores: **42 units of SKF 6205-2RS confirmed in Plant 1 Stores**. 2-day internal stock transfer is viable — eliminates external procurement entirely at zero cost. Flagging to buyer: STO preferred over RFQ for this request.`,

  // ── s5 — Drive PDF: hydraulic hose ─────────────────────────────────────────
  "s5":
    `Drive PDF "Hydraulic-hose-spec-v2.pdf" uploaded by Ravi (Engineering). Parsed the 4-page spec: **1-inch braided hydraulic hose, 280 bar working pressure**, 6 quantity variants, 21-day target lead time. No linked SAP purchase request exists yet — RFQ creation is on hold until a PR is attached.`,
  "s5-detect":
    `New file detected in Drive **/specs/inbox**: **Hydraulic-hose-spec-v2.pdf** uploaded by Ravi (Engineering). Classified as procurement spec — routing to intake for field extraction.`,
  "s5-extract":
    `PDF parsed (4 pages): item = **1-inch braided hydraulic hose, SAE 100R2AT, 280 bar WP**, 6 quantity variants (2m, 5m, 10m + custom). Target lead time **21 days**. No SAP PR linked — spec is valid but RFQ creation requires a PR attachment and buyer confirmation.`,

  // ── s6 — Coupa: welding electrodes (fully complete) ────────────────────────
  "s6":
    `Coupa Req-9921 approved by D. Mehta: 50 boxes ESAB E7018 welding electrodes 3.15mm, Plant 2 fab shop, need by May 15. Requisition is category-coded and fully structured — **RFQ is ready to send to 3 ESAB-authorised dealers**. Auto-sending in 30 seconds unless paused.`,
};

export async function GET(req: NextRequest) {
  const signalKey = req.nextUrl.searchParams.get("signal") ?? "s1";
  const context = STEP_CONTEXTS[signalKey] ?? STEP_CONTEXTS["s1"];

  const client = getAnthropicClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: HAIKU_MODEL,
          max_tokens: 120,
          system: SYSTEM,
          messages: [{ role: "user", content: `Step context:\n${context}\n\nNarrate what you did in this step.` }],
        });

        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            const chunk = JSON.stringify({ token: event.delta.text });
            controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch (err) {
        console.error("[narrate]", err);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: true })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
