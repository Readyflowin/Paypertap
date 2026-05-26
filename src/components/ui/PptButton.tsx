import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";

import { PayPerTapInlineLoader } from "../loaders";

export type PptButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "dark"
  | "danger"
  | "success"
  | "whatsapp"
  | "instagram"
  | "soft";

export type PptButtonProps = {
  variant?: PptButtonVariant;
  size?: "sm" | "md" | "lg" | "xl";
  rounded?: "md" | "lg" | "pill";
  icon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  success?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  className?: string;
};

export function PptButton({
  variant = "primary",
  size = "md",
  rounded = "lg",
  children,
  icon,
  rightIcon,
  disabled,
  loading,
  success,
  fullWidth,
  type = "button",
  onClick,
  className,
}: PptButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        "pds-button",
        `pds-button-${variant}`,
        `pds-button-${size}`,
        `pds-button-rounded-${rounded}`,
        fullWidth && "is-full",
        loading && "is-loading",
        success && "is-success",
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <PayPerTapInlineLoader tone={variant === "secondary" || variant === "ghost" || variant === "soft" ? "brand" : "light"} />
      ) : success ? (
        <Check size={17} />
      ) : (
        icon
      )}
      <span>{children}</span>
      {rightIcon ? <i className="pds-button-right">{rightIcon}</i> : null}
    </button>
  );
}
