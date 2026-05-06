/**
 * POST /api/intake/send-po
 *
 * Sends an HTML approval email via Resend with three one-click action links:
 *   Approve · Send Back · Reject
 *
 * Each link is a self-contained signed PO token — no DB lookup on the
 * approval page. Receiver clicks → /approve/<token> → sees result instantly.
 *
 * Body (JSON):
 *   {
 *     poData:          POData,
 *     rfqId:           string,         e.g. "RFQ-2026-0421"
 *     itemDescription: string,         e.g. "500 kg SS 316 flanges"
 *     signalSubject:   string,         e.g. "Urgent: flanges for Plant 2"
 *     approverName:    string,         e.g. "Asha Krishnan"
 *     approverEmail:   string,         override; defaults to er.gauravpassi@gmail.com
 *   }
 *
 * Response:
 *   { success: true, emailId: string }
 *   { success: false, error: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createPOToken } from "@/lib/po-token";
import type { POData } from "@/types/intake";

const resend = new Resend(process.env.RESEND_API_KEY);

const DEMO_APPROVER_EMAIL = "er.gauravpassi@gmail.com";
const DEMO_APPROVER_NAME  = "Gaurav Passi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      poData: POData;
      rfqId: string;
      itemDescription: string;
      signalSubject?: string;
      approverName?: string;
      approverEmail?: string;
    };

    const { poData, rfqId, itemDescription } = body;
    const approverEmail = body.approverEmail ?? DEMO_APPROVER_EMAIL;
    const approverName  = body.approverName  ?? DEMO_APPROVER_NAME;

    // Derive base URL from the incoming request (works on Vercel + localhost)
    const proto    = req.headers.get("x-forwarded-proto") ?? "https";
    const host     = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "localhost:3000";
    const BASE_URL = `${proto}://${host}`;

    // Build one token per action
    const commonPayload = {
      po: poData,
      rfqId,
      itemDescription,
      amountTotal: poData.total,
      approverName,
      approverEmail,
    };

    const approveLink  = `${BASE_URL}/approve/${createPOToken({ ...commonPayload, action: "approve" })}`;
    const sendbackLink = `${BASE_URL}/approve/${createPOToken({ ...commonPayload, action: "sendback" })}`;
    const rejectLink   = `${BASE_URL}/approve/${createPOToken({ ...commonPayload, action: "reject" })}`;

    const html = buildEmailHTML({
      poData,
      rfqId,
      itemDescription,
      approverName,
      approveLink,
      sendbackLink,
      rejectLink,
    });

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "ProcureAI <noreply@resend.dev>",
      to:   approverEmail,
      subject: `Approval needed: ${poData.poNumber} · ${poData.vendorName} · ${poData.total}`,
      html,
    });

    if (error) {
      console.error("[send-po] Resend error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (err) {
    console.error("[send-po] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// ── Email HTML builder ──────────────────────────────────────────────────────

function buildEmailHTML(opts: {
  poData: POData;
  rfqId: string;
  itemDescription: string;
  approverName: string;
  approveLink: string;
  sendbackLink: string;
  rejectLink: string;
}): string {
  const { poData: po, rfqId, itemDescription, approverName, approveLink, sendbackLink, rejectLink } = opts;

  const lineItemRows = po.lineItems.map((item) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#374151;line-height:1.4;">${item.description}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;text-align:right;white-space:nowrap;">${item.quantity} ${item.unit}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${item.unitPrice}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;color:#111827;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">${item.amount}</td>
    </tr>
  `).join("");

  const gstRow = po.gst ? `
    <tr>
      <td colspan="3" style="padding:6px 16px;font-size:12px;color:#6b7280;text-align:right;">GST (18%)</td>
      <td style="padding:6px 16px;font-size:12px;color:#6b7280;text-align:right;font-variant-numeric:tabular-nums;">${po.gst}</td>
    </tr>
  ` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Approval needed: ${po.poNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
  <tr><td align="center">

    <!-- Card -->
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

      <!-- Top bar -->
      <tr>
        <td style="background:#0f172a;padding:12px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="font-size:14px;font-weight:600;color:#ffffff;letter-spacing:0.02em;">ProcureAI</span>
              <span style="font-size:12px;color:#94a3b8;margin-left:8px;">Procurement Agent</span>
            </td>
            <td align="right">
              <span style="font-size:11px;color:#94a3b8;background:#1e293b;padding:3px 8px;border-radius:12px;">${rfqId}</span>
            </td>
          </tr>
          </table>
        </td>
      </tr>

      <!-- Header -->
      <tr>
        <td style="padding:24px 24px 18px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;">Action required · Purchase Order approval</p>
          <h1 style="margin:0 0 8px;font-size:20px;font-weight:700;color:#111827;line-height:1.3;">
            ${po.poNumber} — ${po.vendorName}
          </h1>
          <p style="margin:0;font-size:14px;color:#6b7280;">${itemDescription}</p>

          <!-- Amount pill -->
          <table cellpadding="0" cellspacing="0" style="margin-top:14px;">
          <tr>
            <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px 14px;">
              <span style="font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.02em;">${po.total}</span>
              <span style="font-size:13px;color:#6b7280;margin-left:8px;">incl. GST · required by ${po.requiredBy}</span>
            </td>
          </tr>
          </table>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

      <!-- Vendor + Delivery grid -->
      <tr>
        <td style="padding:16px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="vertical-align:top;padding-right:12px;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Vendor</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${po.vendorName}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#6b7280;line-height:1.5;">${po.vendorAddress}</p>
              ${po.vendorGST ? `<p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">GSTIN: <span style="font-family:monospace;">${po.vendorGST}</span></p>` : ""}
            </td>
            <td width="50%" style="vertical-align:top;padding-left:12px;border-left:1px solid #f3f4f6;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Deliver to</p>
              <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;">${po.deliverTo}</p>
              <p style="margin:10px 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;">Required by</p>
              <p style="margin:0;font-size:14px;font-weight:700;color:#b45309;">${po.requiredBy}</p>
              <p style="margin:6px 0 0;font-size:11px;color:#9ca3af;">Terms: ${po.terms}</p>
            </td>
          </tr>
          </table>
        </td>
      </tr>

      <!-- PO line items table -->
      <tr>
        <td style="padding:0 24px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
            <!-- Header -->
            <tr style="background:#f9fafb;">
              <th style="padding:8px 16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;text-align:left;border-bottom:1px solid #e5e7eb;">Item / Description</th>
              <th style="padding:8px 16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;text-align:right;border-bottom:1px solid #e5e7eb;">Qty</th>
              <th style="padding:8px 16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;text-align:right;border-bottom:1px solid #e5e7eb;">Unit Price</th>
              <th style="padding:8px 16px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6b7280;text-align:right;border-bottom:1px solid #e5e7eb;">Amount</th>
            </tr>
            ${lineItemRows}
            <!-- Subtotal + GST -->
            ${po.subtotal && po.gst ? `
            <tr>
              <td colspan="3" style="padding:6px 16px;font-size:12px;color:#6b7280;text-align:right;border-top:1px solid #f3f4f6;">Sub-total</td>
              <td style="padding:6px 16px;font-size:12px;color:#6b7280;text-align:right;font-variant-numeric:tabular-nums;">${po.subtotal}</td>
            </tr>
            ${gstRow}
            ` : ""}
            <!-- Total -->
            <tr style="background:#f9fafb;border-top:2px solid #e5e7eb;">
              <td colspan="3" style="padding:10px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#374151;text-align:right;">Total</td>
              <td style="padding:10px 16px;font-size:15px;font-weight:700;color:#111827;text-align:right;font-variant-numeric:tabular-nums;">${po.total}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Divider -->
      <tr><td style="padding:0 24px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>

      <!-- Action buttons -->
      <tr>
        <td style="padding:20px 24px;">
          <p style="margin:0 0 14px;font-size:12px;color:#6b7280;">Hi ${approverName}, one-click action — no login required:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <!-- Approve -->
            <td width="32%" style="padding-right:6px;">
              <a href="${approveLink}" style="display:block;text-align:center;padding:12px 8px;background:#15803d;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                ✓ Approve
              </a>
            </td>
            <!-- Send Back -->
            <td width="32%" style="padding:0 3px;">
              <a href="${sendbackLink}" style="display:block;text-align:center;padding:12px 8px;background:#ffffff;color:#374151;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;border:1px solid #d1d5db;">
                ← Send back
              </a>
            </td>
            <!-- Reject -->
            <td width="32%" style="padding-left:6px;">
              <a href="${rejectLink}" style="display:block;text-align:center;padding:12px 8px;background:#ffffff;color:#dc2626;font-size:14px;font-weight:500;text-decoration:none;border-radius:8px;border:1px solid #d1d5db;">
                ✕ Reject
              </a>
            </td>
          </tr>
          </table>
          <p style="margin:12px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
            These links expire in 72 hours. Auto-escalates if no action.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:14px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;">
          <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:11px;color:#9ca3af;">
              Generated by <strong>ProcureAI</strong> · ${po.date}
            </td>
            <td align="right" style="font-size:11px;color:#9ca3af;">
              ${po.poNumber} · ${rfqId}
            </td>
          </tr>
          </table>
        </td>
      </tr>

    </table>
    <!-- /Card -->

  </td></tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`;
}
