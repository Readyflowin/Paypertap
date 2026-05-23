import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

type IconButtonVariant = "default" | "ghost" | "primary" | "instagram" | "whatsapp" | "dark";
type IconButtonSize = "sm" | "md" | "lg";
type IconButtonShape = "circle" | "square";

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  icon?: ReactNode;
};

const variantClasses: Record<IconButtonVariant, string> = {
  default:
    "border border-[var(--ppt-border)] bg-white/90 text-[var(--ppt-text)] shadow-[var(--ppt-shadow-soft)] hover:border-[rgba(113,71,245,0.34)] hover:bg-[var(--ppt-primary-soft)]",
  ghost:
    "bg-transparent text-[var(--ppt-text-muted)] hover:bg-[rgba(113,71,245,0.09)] hover:text-[var(--ppt-primary-dark)]",
  primary:
    "[background:var(--ppt-primary-gradient)] text-white shadow-[var(--ppt-shadow-button)] hover:shadow-[var(--ppt-shadow-purple-glow)]",
  instagram:
    "border border-transparent bg-[linear-gradient(var(--ppt-surface),var(--ppt-surface))_padding-box,var(--ppt-instagram-gradient)_border-box] text-[var(--ppt-text)] shadow-[var(--ppt-shadow-soft)] hover:bg-[linear-gradient(#fff7fb,#fff7fb)_padding-box,var(--ppt-instagram-gradient)_border-box]",
  whatsapp:
    "bg-[rgba(37,211,102,0.16)] text-[#0b6f3b] shadow-[0_12px_28px_rgba(37,211,102,0.16)] hover:bg-[var(--ppt-whatsapp)] hover:text-[#062d17] hover:shadow-[var(--ppt-shadow-whatsapp-glow)]",
  dark:
    "[background:var(--ppt-dark-gradient)] text-white shadow-[0_16px_38px_rgba(17,16,24,0.22)] hover:shadow-[0_22px_50px_rgba(17,16,24,0.3)]",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

const shapeClasses: Record<IconButtonShape, string> = {
  circle: "rounded-full",
  square: "rounded-[var(--ppt-radius-md)]",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = "default",
      size = "md",
      shape = "square",
      icon,
      children,
      className,
      type = "button",
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      className={clsx(
        "ppt-focus-ring inline-flex shrink-0 items-center justify-center transition-[transform,box-shadow,background,border-color,color,opacity] duration-200 ease-out active:scale-[0.96]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        "hover:-translate-y-0.5",
        sizeClasses[size],
        shapeClasses[shape],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon ?? children}
    </button>
  )
);

IconButton.displayName = "IconButton";
