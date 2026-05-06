import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("text-[11px] font-medium text-text-tertiary uppercase tracking-[0.06em]", className)}>
      {children}
    </div>
  );
}
