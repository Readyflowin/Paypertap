import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helpId = `${inputId}-help`;
    const hasDescription = Boolean(error || helperText);

    return (
      <div className={clsx("flex flex-col gap-2", fullWidth ? "w-full" : "w-auto")}>
        {label ? (
          <label className="text-sm font-bold text-[var(--ppt-text)]" htmlFor={inputId}>
            {label}
          </label>
        ) : null}

        <div
          className={clsx(
            "group flex min-h-12 items-center gap-2 rounded-[var(--ppt-radius-md)] border bg-white/82 px-3 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,var(--ppt-shadow-soft)] transition-[box-shadow,border-color,background,opacity] duration-200",
            error
              ? "border-[var(--ppt-danger)] bg-[#fff7f7]"
              : "border-[var(--ppt-border)] focus-within:border-[rgba(113,71,245,0.62)] focus-within:bg-white",
            "focus-within:shadow-[0_0_0_4px_var(--ppt-primary-soft),var(--ppt-shadow-soft)]",
            disabled && "cursor-not-allowed opacity-60"
          )}
        >
          {leftIcon ? (
            <span className="inline-flex shrink-0 text-[var(--ppt-text-muted)] transition group-focus-within:text-[var(--ppt-primary-dark)]">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={hasDescription ? helpId : undefined}
            className={clsx(
              "min-w-0 flex-1 bg-transparent py-3 text-base font-medium text-[var(--ppt-text)] outline-none placeholder:font-normal placeholder:text-[color:rgba(112,105,129,0.7)] disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="inline-flex shrink-0 text-[var(--ppt-text-muted)]">{rightIcon}</span>
          ) : null}
        </div>

        {hasDescription ? (
          <p
            id={helpId}
            className={clsx(
              "text-sm leading-5",
              error ? "font-semibold text-[var(--ppt-danger)]" : "text-[var(--ppt-text-muted)]"
            )}
          >
            {error || helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
