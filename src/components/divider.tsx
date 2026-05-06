import { cn } from "@/lib/cn";

interface Props {
  vertical?: boolean;
  className?: string;
}

export function Divider({ vertical, className }: Props) {
  if (vertical) return <div className={cn("self-stretch w-px bg-border-subtle", className)} />;
  return <div className={cn("h-px bg-border-subtle w-full", className)} />;
}
