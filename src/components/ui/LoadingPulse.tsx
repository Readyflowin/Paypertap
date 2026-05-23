import { type CSSProperties, type HTMLAttributes } from "react";
import clsx from "clsx";

type LoadingPulseSize = "sm" | "md" | "lg" | "xl";
type LoadingPulseTone = "primary" | "success" | "neutral" | "whatsapp";

export type LoadingPulseProps = HTMLAttributes<HTMLDivElement> & {
  size?: LoadingPulseSize;
  tone?: LoadingPulseTone;
  label?: string;
  inline?: boolean;
};

const sizeTokens: Record<LoadingPulseSize, string> = {
  sm: "0.875rem",
  md: "1.25rem",
  lg: "1.75rem",
  xl: "2.4rem",
};

const toneTokens: Record<LoadingPulseTone, string> = {
  primary: "var(--ppt-primary)",
  success: "var(--ppt-success)",
  neutral: "currentColor",
  whatsapp: "var(--ppt-whatsapp)",
};

export function LoadingPulse({
  size = "md",
  tone = "primary",
  label,
  inline = false,
  className,
  style,
  ...props
}: LoadingPulseProps) {
  const pulseStyle = {
    "--ppt-loader-size": sizeTokens[size],
    "--ppt-loader-color": toneTokens[tone],
    ...style,
  } as CSSProperties;

  return (
    <div
      role="status"
      aria-live={label ? "polite" : undefined}
      aria-label={label ? undefined : "Loading"}
      className={clsx(
        "items-center gap-3 text-sm font-bold text-[var(--ppt-text-muted)]",
        inline ? "inline-flex" : "flex",
        className
      )}
      {...props}
    >
      <span className="ppt-loading-pulse" style={pulseStyle} aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </div>
  );
}
