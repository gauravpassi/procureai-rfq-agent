import type { Signal, PipelineStep } from "@/types/intake";
import { ConnectorIcon } from "./connector-icon";
import { Pill } from "@/components/pill";
import type { IconName } from "@/components/icon";
import { cn } from "@/lib/cn";

interface Props {
  signal: Signal;
  steps: PipelineStep[];
  active: boolean;
  onClick: () => void;
}

/** Derive a display status from the live pipeline steps */
function getPipelineStatus(steps: PipelineStep[]) {
  if (steps.some((s) => s.status === "awaiting-human")) return "human-required" as const;
  if (steps.some((s) => s.status === "running"))        return "agent-running"  as const;
  if (steps.every((s) => s.status === "done" || s.status === "human-done")) return "complete" as const;
  return "processing" as const;
}

/** The active step label shown below the subject */
function getCurrentStageLabel(steps: PipelineStep[]): string {
  const active = steps.find(
    (s) => s.status === "running" || s.status === "awaiting-human",
  );
  if (active) return active.label;
  // Fall back to last completed step
  const lastDone = [...steps].reverse().find(
    (s) => s.status === "done" || s.status === "human-done",
  );
  return lastDone?.label ?? "Queued";
}

const STATUS_CONFIG: Record<
  ReturnType<typeof getPipelineStatus>,
  { tone: "warn" | "agent" | "success" | "info"; icon: IconName; label: string }
> = {
  "human-required": { tone: "warn",    icon: "info",    label: "Action Required" },
  "agent-running":  { tone: "agent",   icon: "spark",   label: "Agent Working"   },
  "complete":       { tone: "success", icon: "check",   label: "Complete"        },
  "processing":     { tone: "info",    icon: "refresh", label: "Processing"      },
};

export function SignalCard({ signal, steps, active, onClick }: Props) {
  const pipelineStatus = getPipelineStatus(steps);
  const st = STATUS_CONFIG[pipelineStatus];
  const stageLabel = getCurrentStageLabel(steps);
  const isHumanRequired = pipelineStatus === "human-required";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-3.5 py-3 border-b border-border-subtle transition-colors",
        "border-l-[3px]",
        active
          ? isHumanRequired
            ? "bg-warn-soft border-l-warn"
            : "bg-inset border-l-accent"
          : isHumanRequired
          ? "bg-warn-soft/40 border-l-warn/60 hover:bg-warn-soft"
          : "bg-transparent border-l-transparent hover:bg-subtle",
      )}
    >
      {/* Row 1: source icon + from + time */}
      <div className="flex items-center gap-2 mb-1">
        <ConnectorIcon kind={signal.source} size={14} />
        <span className="text-[11.5px] text-text-tertiary flex-1 truncate">{signal.from}</span>
        <span className="text-[11px] text-text-tertiary shrink-0">{signal.when}</span>
      </div>

      {/* Row 2: subject */}
      <div className="text-[13px] text-text-primary leading-[1.4] mb-1.5 line-clamp-2">
        {signal.subject}
      </div>

      {/* Row 3: status pill + stage */}
      <div className="flex items-center justify-between gap-2">
        <Pill tone={st.tone} icon={st.icon} size="sm">{st.label}</Pill>
        <span className="text-[10.5px] text-text-tertiary truncate text-right">
          {stageLabel}
        </span>
      </div>
    </button>
  );
}
