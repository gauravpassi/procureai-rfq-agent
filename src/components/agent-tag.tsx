"use client";

import type { ReactNode } from "react";
import { Pill } from "@/components/pill";
import { usePreferences } from "@/components/preferences-provider";

interface Props {
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  className?: string;
}

/**
 * Agent attribution chip — visibility-aware via the global agent prominence
 * preference. When prominence = 'invisible' the tag is not rendered at all.
 * Per the design handoff, the purple --agent palette is reserved for these.
 */
export function AgentTag({ size = "md", children, className }: Props) {
  const { agentProminence } = usePreferences();
  if (agentProminence === "invisible") return null;
  return <Pill tone="agent" icon="spark" size={size} className={className}>{children}</Pill>;
}
