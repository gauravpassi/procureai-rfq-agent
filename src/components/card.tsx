import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface Props extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ padded = true, interactive = false, className, children, ...rest }: Props) {
  return (
    <div
      className={cn(
        "bg-app border border-border-DEFAULT rounded-[10px]",
        "transition-[border-color,box-shadow] duration-100",
        padded && "p-4",
        interactive && "cursor-pointer hover:border-border-strong hover:shadow-1",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
