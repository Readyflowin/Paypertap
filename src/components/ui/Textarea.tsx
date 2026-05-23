import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, helperText, error, fullWidth = false, className, id, disabled, rows = 4, ...props },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const helpId = `${textareaId}-help`;
    const hasDescription = Boolean(error || helperText);

    return (
      <div className={clsx("flex flex-col gap-2", fullWidth ? "w-full" : "w-auto")}>
        {label ? (
          <label className="text-sm font-bold text-[var(--ppt-text)]" htmlFor={textareaId}>
            {label}
          </label>
        ) : null}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasDescription ? helpId : undefined}
          className={clsx(
            "min-h-[7.5rem] resize-y rounded-[var(--ppt-radius-md)] border bg-white/82 px-4 py-3 text-base font-medium text-[var(--ppt-text)] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,var(--ppt-shadow-soft)] outline-none transition-[box-shadow,border-color,background,opacity] duration-200 placeholder:font-normal placeholder:text-[color:rgba(112,105,129,0.7)] disabled:cursor-not-allowed disabled:opacity-60",
            "focus:bg-white focus:shadow-[0_0_0_4px_var(--ppt-primary-soft),var(--ppt-shadow-soft)]",
            error
              ? "border-[var(--ppt-danger)] bg-[#fff7f7]"
              : "border-[var(--ppt-border)] focus:border-[rgba(113,71,245,0.62)]",
            className
          )}
          {...props}
        />

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

Textarea.displayName = "Textarea";
