import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  tone?: "neutral" | "success" | "warn" | "danger" | "info";
  className?: string;
}

const toneRing: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "border-border-subtle bg-app",
  success: "border-success-border bg-success-soft",
  warn: "border-warn-border bg-warn-soft",
  danger: "border-danger-border bg-danger-soft",
  info: "border-info-border bg-info-soft",
};

const toneText: Record<NonNullable<Props["tone"]>, string> = {
  neutral: "text-text-primary",
  success: "text-success",
  warn: "text-warn",
  danger: "text-danger",
  info: "text-info",
};

/**
 * Used in the Approver email's "Within budget · Yes · ..." 3-up grid
 * and elsewhere where compact metric cards are needed.
 */
export function MiniStat({ label, value, meta, tone = "neutral", className }: Props) {
  return (
    <div className={cn("border rounded-md px-3 py-2", toneRing[tone], className)}>
      <div className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-tertiary">{label}</div>
      <div className={cn("mt-1 text-sm font-semibold leading-tight", toneText[tone])}>{value}</div>
      {meta && <div className="mt-0.5 text-[11.5px] text-text-tertiary">{meta}</div>}
    </div>
  );
}
