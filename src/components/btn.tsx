import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon, type IconName } from "@/components/icon";

type Kind = "primary" | "secondary" | "ghost" | "danger" | "success" | "dark";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: Kind;
  size?: Size;
  icon?: IconName;
  iconRight?: IconName;
  full?: boolean;
  children?: ReactNode;
}

const sizeClass: Record<Size, string> = {
  sm: "h-[26px] px-2.5 text-[12.5px] rounded-sm",
  md: "h-8 px-3 text-[13.5px] rounded-md",
  lg: "h-10 px-[18px] text-[14.5px] rounded-[7px]",
};

const kindClass: Record<Kind, string> = {
  primary:
    "bg-accent text-white border border-accent hover:bg-accent-hover hover:border-accent-hover",
  secondary:
    "bg-app text-text-primary border border-border-DEFAULT hover:border-border-strong hover:bg-subtle",
  ghost:
    "bg-transparent text-text-secondary border border-transparent hover:bg-subtle",
  danger:
    "bg-app text-danger border border-border-DEFAULT hover:border-border-strong hover:bg-danger-soft",
  success:
    "bg-success text-white border border-success hover:opacity-95",
  dark:
    "bg-text-primary text-text-inverse border border-text-primary hover:opacity-95",
};

export const Btn = forwardRef<HTMLButtonElement, Props>(function Btn(
  { kind = "secondary", size = "md", icon, iconRight, full, disabled, className, children, ...rest },
  ref,
) {
  const iconSize = size === "sm" ? 13 : 14;
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium select-none",
        "transition-[background,border-color,color] duration-100",
        sizeClass[size],
        kindClass[kind],
        full && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconRight && <Icon name={iconRight} size={iconSize} />}
    </button>
  );
});
