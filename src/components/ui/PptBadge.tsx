import { type ReactNode } from "react";
import clsx from "clsx";

export type PptTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "dark"
  | "whatsapp"
  | "instagram"
  | "hot"
  | "reserved"
  | "sold";

export type PptBadgeProps = {
  tone?: PptTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PptBadge({ children, tone = "neutral", icon, className }: PptBadgeProps) {
  return (
    <span className={clsx("pds-badge", `pds-badge-${tone}`, className)}>
      {icon ? <span className="pds-badge-icon">{icon}</span> : null}
      <span className="pds-badge-text">{children}</span>
    </span>
  );
}
