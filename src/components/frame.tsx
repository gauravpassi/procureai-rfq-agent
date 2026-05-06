import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Props {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Per-artboard chrome wrapper — provides the canvas-bg + scrolling middle area
 * used by every hero surface (matches `Frame` in shared.jsx).
 */
export function Frame({ header, footer, children, className }: Props) {
  return (
    <div className={cn("flex flex-col w-full h-full bg-canvas", className)}>
      {header}
      <div className="flex-1 overflow-auto min-h-0">{children}</div>
      {footer}
    </div>
  );
}
