import { type HTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

type BadgeVariant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "dark"
  | "outline"
  | "hot"
  | "lowStock"
  | "live"
  | "reserved"
  | "sold";
type BadgeSize = "xs" | "sm" | "md";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
  leftIcon?: ReactNode;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--ppt-surface-soft)] text-[var(--ppt-text)]",
  primary: "bg-[var(--ppt-primary-soft)] text-[var(--ppt-primary-dark)]",
  success: "bg-[var(--ppt-success-soft)] text-[#08745f]",
  warning: "bg-[var(--ppt-warning-soft)] text-[var(--ppt-warning)]",
  danger: "bg-[var(--ppt-danger-soft)] text-[var(--ppt-danger)]",
  info: "bg-[#dbeafe] text-[var(--ppt-blue)]",
  neutral: "bg-[#eef0f4] text-[var(--ppt-text-muted)]",
  dark: "bg-[var(--ppt-text)] text-white",
  outline: "border border-[var(--ppt-border)] bg-white/70 text-[var(--ppt-text)]",
  hot: "bg-[#ffe4ef] text-[#be185d]",
  lowStock: "bg-[#fff3d6] text-[#a15c00]",
  live: "bg-[#dcfce7] text-[#08745f] shadow-[0_0_0_3px_rgba(15,159,128,0.08)]",
  reserved: "bg-[#e0f2fe] text-[#0369a1]",
  sold: "bg-[#ede9fe] text-[#4c1d95]",
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: "min-h-5 px-2 text-[11px]",
  sm: "min-h-6 px-2.5 text-xs",
  md: "min-h-7 px-3 text-sm",
};

export function Badge({
  variant = "default",
  size = "md",
  leftIcon,
  children,
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex max-w-full items-center gap-1.5 rounded-full font-bold leading-none",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {leftIcon ? <span className="inline-flex shrink-0 items-center">{leftIcon}</span> : null}
      {children ? <span className="truncate">{children}</span> : null}
    </span>
  );
}
