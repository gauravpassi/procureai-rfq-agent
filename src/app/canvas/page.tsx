"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Btn } from "@/components/btn";
import { Card } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { Pill } from "@/components/pill";

interface Artboard {
  id: string;
  title: string;
  persona: string;
  description: string;
  status: "phase-1" | "phase-2" | "phase-3" | "phase-4" | "phase-5";
}

const ARTBOARDS: Artboard[] = [
  {
    id: "intake",
    title: "Intake",
    persona: "Buyer",
    description: "Multi-source signal feed; agent drafts RFQs with field-level provenance from email, SAP, Salesforce, Slack, Drive, Coupa.",
    status: "phase-3",
  },
  {
    id: "approver",
    title: "Approver",
    persona: "CFO / Purchase Manager / MD",
    description: "Email-first approval. Approve/Send back/Reject buttons live inside the email; clicking opens an inline passkey/OTP challenge.",
    status: "phase-1",
  },
  {
    id: "buyer",
    title: "Buyer Dashboard",
    persona: "Buyer",
    description: "Three-layer exception-first view (Needs action / Watch / Running smoothly) with comparison drawer + override-with-reason flow.",
    status: "phase-2",
  },
  {
    id: "requester",
    title: "Requester",
    persona: "Plant engineer",
    description: "Five-step PR submission with non-blocking stock check + budget warnings.",
    status: "phase-4",
  },
  {
    id: "supplier",
    title: "Supplier",
    persona: "External supplier",
    description: "RFQ email + portal quote response + PO acknowledgement with delivery-date mismatch path.",
    status: "phase-5",
  },
];

export default function CanvasPage() {
  const [focused, setFocused] = useState<string | null>(null);

  if (focused) {
    const ab = ARTBOARDS.find((a) => a.id === focused)!;
    return (
      <div className="min-h-screen bg-canvas">
        <header className="h-14 border-b border-border-subtle bg-app flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <BrandMark size={22} />
            <span className="text-text-tertiary">/</span>
            <span className="font-medium">{ab.title}</span>
            <Pill tone="neutral" size="sm">{ab.persona}</Pill>
          </div>
          <Btn kind="ghost" icon="x" onClick={() => setFocused(null)}>Exit focus</Btn>
        </header>
        <Placeholder ab={ab} fullBleed />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 h-14 border-b border-border-subtle bg-app flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <BrandMark size={22} />
          <span className="text-text-tertiary">/</span>
          <span className="font-medium">Design canvas</span>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-text-tertiary">
          <span>5 hero surfaces · 4 personas</span>
          <Link href="/" className="text-accent hover:text-accent-hover">Home</Link>
        </div>
      </header>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {ARTBOARDS.map((ab) => (
          <Placeholder key={ab.id} ab={ab} onFocus={() => setFocused(ab.id)} />
        ))}
      </div>
    </div>
  );
}

function Placeholder({
  ab,
  onFocus,
  fullBleed,
}: {
  ab: Artboard;
  onFocus?: () => void;
  fullBleed?: boolean;
}) {
  return (
    <Card padded={false} className={fullBleed ? "rounded-none border-0 h-[calc(100vh-56px)]" : "overflow-hidden"}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-border-subtle bg-subtle">
        <div className="flex items-center gap-2">
          <Eyebrow>{ab.persona}</Eyebrow>
        </div>
        <Pill tone={ab.status === "phase-1" ? "agent" : "neutral"} size="sm">
          {ab.status.replace("-", " ")}
        </Pill>
      </div>
      <div className="p-5 flex flex-col gap-3">
        <div className="font-semibold text-[17px] tracking-[-0.01em]">{ab.title}</div>
        <p className="text-[13.5px] text-text-secondary leading-[1.55]">{ab.description}</p>
        <div className={fullBleed ? "flex-1 flex items-center justify-center" : "h-32 flex items-center justify-center"}>
          <div className="text-[12px] text-text-tertiary">Implementation arrives in {ab.status.replace("-", " ")}</div>
        </div>
        {onFocus && (
          <div className="flex gap-2">
            <Btn kind="dark" size="sm" iconRight="arrowRight" onClick={onFocus}>
              Open focused
            </Btn>
          </div>
        )}
      </div>
    </Card>
  );
}
