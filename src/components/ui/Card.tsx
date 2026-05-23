import { forwardRef, type HTMLAttributes } from "react";
import clsx from "clsx";

type CardVariant = "default" | "elevated" | "product" | "soft" | "dark" | "outline" | "glass";
type CardPadding = "none" | "sm" | "md" | "lg" | "xl";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
};

const variantClasses: Record<CardVariant, string> = {
  default:
    "border border-[var(--ppt-border)] bg-[rgba(255,255,255,0.92)] shadow-[var(--ppt-shadow-soft)]",
  elevated:
    "border border-[var(--ppt-border)] bg-[var(--ppt-surface)] shadow-[var(--ppt-shadow-elevated)]",
  product:
    "border border-[rgba(226,220,238,0.9)] bg-[var(--ppt-surface)] shadow-[var(--ppt-shadow-product)]",
  soft: "border border-transparent bg-[var(--ppt-surface-soft)] shadow-none",
  dark: "border border-[#332a4b] [background:var(--ppt-dark-gradient)] text-white shadow-[0_24px_70px_rgba(17,16,24,0.3)]",
  outline: "border border-[var(--ppt-border)] bg-transparent shadow-none",
  glass:
    "border border-white/65 bg-white/62 shadow-[var(--ppt-shadow-soft)] backdrop-blur-xl",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
  xl: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", hoverable = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        "rounded-[var(--ppt-radius-xl)] transition-[transform,box-shadow,border-color,background] duration-200 ease-out",
        variantClasses[variant],
        paddingClasses[padding],
        hoverable &&
          "hover:-translate-y-1 hover:border-[rgba(113,71,245,0.38)] hover:shadow-[var(--ppt-shadow-elevated)]",
        className
      )}
      {...props}
    />
  )
);

Card.displayName = "Card";

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mb-5 flex flex-col gap-1.5", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={clsx("text-lg font-black leading-tight tracking-normal text-[var(--ppt-text)]", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={clsx("text-sm leading-6 text-[var(--ppt-text-muted)]", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("text-[var(--ppt-text)]", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx("mt-6 flex flex-wrap items-center gap-3", className)} {...props} />;
}
