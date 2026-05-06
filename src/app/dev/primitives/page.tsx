"use client";

import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Btn } from "@/components/btn";
import { Pill } from "@/components/pill";
import { Card } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { Avatar } from "@/components/avatar";
import { Channel } from "@/components/channel";
import { Divider } from "@/components/divider";
import { Icon, type IconName } from "@/components/icon";
import { MiniStat } from "@/components/mini-stat";
import { AgentTag } from "@/components/agent-tag";
import { AgentFieldRow } from "@/components/agent-field-row";
import { af } from "@/types/agent-field";
import { fmtINR } from "@/lib/format";
import { usePreferences } from "@/components/preferences-provider";

const ALL_ICONS: IconName[] = [
  "check","x","arrowRight","arrowLeft","chevronDown","chevronRight","info","warn","clock",
  "sparkle","package","file","paperclip","user","building","bell","search","plus","sliders",
  "truck","calendar","rupee","spark","moreH","eye","download","refresh","mail","slack","whatsapp","flag","bolt",
];

export default function PrimitivesGallery() {
  const prefs = usePreferences();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 h-14 border-b border-border-subtle bg-app flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <BrandMark size={22} />
          <span className="text-text-tertiary">/</span>
          <span className="font-medium">Primitives</span>
        </div>
        <Link href="/" className="text-accent text-sm">Home</Link>
      </header>

      <div className="p-6 max-w-5xl mx-auto flex flex-col gap-8">
        <Section title="Buttons">
          <div className="flex flex-wrap gap-3 items-center">
            <Btn kind="primary">Primary</Btn>
            <Btn kind="secondary">Secondary</Btn>
            <Btn kind="ghost">Ghost</Btn>
            <Btn kind="danger" icon="x">Reject</Btn>
            <Btn kind="success" icon="check">Approve</Btn>
            <Btn kind="dark" iconRight="arrowRight">Continue</Btn>
            <Btn disabled>Disabled</Btn>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Btn size="sm">Small</Btn>
            <Btn size="md">Medium</Btn>
            <Btn size="lg">Large</Btn>
          </div>
        </Section>

        <Section title="Pills (incl. Agent)">
          <div className="flex flex-wrap gap-2 items-center">
            <Pill tone="neutral">Neutral</Pill>
            <Pill tone="success" icon="check">Approved</Pill>
            <Pill tone="warn" icon="warn">Approve by 3 PM</Pill>
            <Pill tone="danger" icon="x">Rejected</Pill>
            <Pill tone="info" icon="info">Info</Pill>
            <Pill tone="accent" icon="sparkle">Accent</Pill>
            <AgentTag>96% confidence</AgentTag>
          </div>
        </Section>

        <Section title="MiniStat (Approver email 3-up)">
          <div className="grid grid-cols-3 gap-2.5 max-w-2xl">
            <MiniStat label="Within budget" value="Yes" meta="₹14,77,500 remaining after" tone="success" />
            <MiniStat label="Needed by" value="May 14" meta="in 6 days" tone="warn" />
            <MiniStat label="Runner-up" value="+₹18.4K" meta="Bharat Steel Industries" tone="neutral" />
          </div>
        </Section>

        <Section title="AgentFieldRow (provenance)">
          <Card>
            <AgentFieldRow
              label="Material"
              field={af("SS 316 flanges, 80mm slip-on", "outlook", 0.96, {
                citations: [{ source: "outlook", ref: "Email line 3 + SAP cross-check" }],
              })}
            />
            <Divider />
            <AgentFieldRow
              label="Quantity"
              numeric
              field={af(500, "sap", 0.92, {
                citations: [{ source: "sap", ref: "PR-2026-0412 line 1" }],
              })}
              render={(v) => `${v} kg`}
            />
            <Divider />
            <AgentFieldRow
              label="Estimated value"
              numeric
              field={af(342500, "agent", 0.74, {
                citations: [{ source: "agent", ref: "3-supplier blended quote" }],
              })}
              render={(v) => fmtINR(v)}
            />
          </Card>
        </Section>

        <Section title="Avatar / Channel / Divider">
          <div className="flex flex-wrap gap-3 items-center">
            <Avatar name="Asha Krishnan" size={28} />
            <Avatar name="Vikram Shah" size={32} />
            <Avatar name="Anita Rao" size={24} />
            <Channel kind="email" />
            <Channel kind="slack" />
            <Channel kind="whatsapp" />
          </div>
        </Section>

        <Section title="Eyebrow">
          <Eyebrow>You are approving</Eyebrow>
        </Section>

        <Section title="Icons (32)">
          <div className="grid grid-cols-8 gap-3">
            {ALL_ICONS.map((n) => (
              <div key={n} className="flex flex-col items-center gap-1 p-2 border border-border-subtle rounded-md">
                <Icon name={n} size={18} />
                <div className="text-[10.5px] text-text-tertiary">{n}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Preferences (Tweaks panel preview)">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              Density
              <select
                value={prefs.density}
                onChange={(e) => prefs.setDensity(e.target.value as typeof prefs.density)}
                className="border border-border-DEFAULT rounded-md px-2 py-1 bg-app"
              >
                <option value="compact">Compact</option>
                <option value="balanced">Balanced</option>
                <option value="spacious">Spacious</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Agent prominence
              <select
                value={prefs.agentProminence}
                onChange={(e) => prefs.setAgentProminence(e.target.value as typeof prefs.agentProminence)}
                className="border border-border-DEFAULT rounded-md px-2 py-1 bg-app"
              >
                <option value="invisible">Invisible</option>
                <option value="subtle">Subtle</option>
                <option value="prominent">Prominent</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Accent
              <input
                type="color"
                value={prefs.accent}
                onChange={(e) => prefs.setAccent(e.target.value)}
                className="h-8 w-10 rounded-md border border-border-DEFAULT"
              />
            </label>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <Eyebrow>{title}</Eyebrow>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}
