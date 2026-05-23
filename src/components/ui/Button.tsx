import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success"
  | "whatsapp"
  | "instagram"
  | "dark";
type ButtonSize = "sm" | "md" | "lg" | "xl";
type ButtonRounded = "md" | "lg" | "pill";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isSuccess?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  rounded?: ButtonRounded;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "[background:var(--ppt-primary-gradient)] text-white shadow-[var(--ppt-shadow-button)] hover:shadow-[var(--ppt-shadow-purple-glow)]",
  secondary:
    "border border-[var(--ppt-border)] bg-[rgba(255,255,255,0.88)] text-[var(--ppt-text)] shadow-[var(--ppt-shadow-soft)] hover:border-[rgba(113,71,245,0.36)] hover:bg-[var(--ppt-primary-soft)]",
  ghost:
    "bg-transparent text-[var(--ppt-text)] hover:bg-[rgba(113,71,245,0.09)] hover:text-[var(--ppt-primary-dark)]",
  danger:
    "bg-[linear-gradient(135deg,#ef4444,#dc2626)] text-white shadow-[0_14px_30px_rgba(220,38,38,0.2)] hover:shadow-[0_18px_42px_rgba(220,38,38,0.28)]",
  success:
    "bg-[linear-gradient(135deg,#18b795,#0f9f80)] text-white shadow-[0_14px_30px_rgba(15,159,128,0.22)] hover:shadow-[0_18px_42px_rgba(15,159,128,0.3)]",
  whatsapp:
    "[background:var(--ppt-whatsapp-gradient)] text-[#062d17] shadow-[0_14px_30px_rgba(37,211,102,0.24)] hover:shadow-[var(--ppt-shadow-whatsapp-glow)]",
  instagram:
    "[background:var(--ppt-instagram-gradient)] text-white shadow-[0_14px_30px_rgba(221,42,123,0.22)] hover:shadow-[0_18px_44px_rgba(129,52,175,0.28)]",
  dark:
    "[background:var(--ppt-dark-gradient)] text-white shadow-[0_16px_38px_rgba(17,16,24,0.22)] hover:shadow-[0_22px_50px_rgba(17,16,24,0.3)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
  xl: "min-h-14 px-6 text-base",
};

const roundedClasses: Record<ButtonRounded, string> = {
  md: "rounded-[var(--ppt-radius-md)]",
  lg: "rounded-[var(--ppt-radius-lg)]",
  pill: "rounded-full",
};

function LoadingDots() {
  return (
    <span className="ppt-button-dots" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      rounded = "md",
      isLoading = false,
      isSuccess = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      type = "button",
      ...props
    },
    ref
  ) => {
    const activeVariant = isSuccess ? "success" : variant;
    const isDisabled = disabled || isLoading;
    const leadingIcon = isLoading ? (
      <LoadingDots />
    ) : isSuccess && !leftIcon ? (
      <Check size={18} strokeWidth={2.6} aria-hidden="true" />
    ) : (
      leftIcon
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={clsx(
          "ppt-focus-ring relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden font-bold leading-none",
          "transition-[transform,box-shadow,background,border-color,color,opacity] duration-200 ease-out active:scale-[0.98]",
          "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1/2 before:bg-white/20 before:opacity-0 before:transition-opacity hover:before:opacity-100",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
          !isDisabled && "hover:-translate-y-0.5",
          isSuccess && "ppt-success-pop",
          fullWidth && "w-full",
          sizeClasses[size],
          roundedClasses[rounded],
          variantClasses[activeVariant],
          className
        )}
        {...props}
      >
        {leadingIcon ? <span className="relative inline-flex items-center">{leadingIcon}</span> : null}
        {children ? <span className="relative">{children}</span> : null}
        {!isLoading && rightIcon ? (
          <span className="relative inline-flex items-center">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";
