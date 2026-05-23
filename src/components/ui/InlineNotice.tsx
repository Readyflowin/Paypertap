import { type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import clsx from "clsx";

type InlineNoticeVariant = "success" | "error" | "warning" | "info";

export type InlineNoticeProps = {
  variant?: InlineNoticeVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

const variantClasses: Record<InlineNoticeVariant, string> = {
  success: "border-[#b9eadf] bg-[#ecfdf8] text-[#08745f]",
  error: "border-[#fecaca] bg-[#fff1f2] text-[var(--ppt-danger)]",
  warning: "border-[#f7d58a] bg-[#fff8e6] text-[#8a5a00]",
  info: "border-[#c7d2fe] bg-[#eef2ff] text-[#3730a3]",
};

const defaultIcons: Record<InlineNoticeVariant, ReactNode> = {
  success: <CheckCircle2 size={19} aria-hidden="true" />,
  error: <AlertCircle size={19} aria-hidden="true" />,
  warning: <TriangleAlert size={19} aria-hidden="true" />,
  info: <Info size={19} aria-hidden="true" />,
};

export function InlineNotice({
  variant = "info",
  title,
  children,
  icon,
  className,
}: InlineNoticeProps) {
  return (
    <div
      className={clsx(
        "flex gap-3 rounded-[var(--ppt-radius-lg)] border px-4 py-3 shadow-[var(--ppt-shadow-soft)]",
        variantClasses[variant],
        className
      )}
    >
      <span className="mt-0.5 shrink-0">{icon ?? defaultIcons[variant]}</span>
      <div className="min-w-0">
        {title ? <p className="font-black leading-5">{title}</p> : null}
        <div className={clsx("text-sm leading-6", title && "mt-1")}>{children}</div>
      </div>
    </div>
  );
}
