import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icon";

type Tone = "neutral" | "success" | "warn" | "danger" | "info" | "accent" | "agent";
type Size = "sm" | "md" | "lg";

interface Props {
  tone?: Tone;
  icon?: IconName;
  size?: Size;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const toneClass: Record<Tone, string> = {
  neutral: "bg-muted text-text-secondary border-border-subtle",
  success: "bg-success-soft text-success border-success-border",
  warn: "bg-warn-soft text-warn border-warn-border",
  danger: "bg-danger-soft text-danger border-danger-border",
  info: "bg-info-soft text-info border-info-border",
  accent: "bg-accent-soft text-accent border-accent-border",
  agent: "bg-agent-soft text-agent border-agent-border",
};

const sizeClass: Record<Size, { wrap: string; iconShrink: number }> = {
  sm: { wrap: "h-[18px] px-1.5 text-[11px] gap-[3px] rounded-[4px]", iconShrink: 1 },
  md: { wrap: "h-5 px-[7px] text-[11.5px] gap-1 rounded-[4px]", iconShrink: 1 },
  lg: { wrap: "h-6 px-[9px] text-[12.5px] gap-[5px] rounded-[5px]", iconShrink: 0 },
};

export function Pill({ tone = "neutral", icon, size = "md", children, className, style }: Props) {
  const s = sizeClass[size];
  const baseFontSize = size === "sm" ? 11 : size === "md" ? 11.5 : 12.5;
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium leading-none border tracking-[0.005em]",
        toneClass[tone],
        s.wrap,
        className,
      )}
      style={style}
    >
      {icon && <Icon name={icon} size={baseFontSize - s.iconShrink} />}
      {children}
    </span>
  );
}
