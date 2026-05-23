import { type ReactNode } from "react";
import clsx from "clsx";

export type PptStatCardProps = {
  icon?: ReactNode;
  label: string;
  value: string | number;
  detail?: string;
  tone?: "primary" | "success" | "info";
  className?: string;
};

export function PptStatCard({
  icon,
  label,
  value,
  detail,
  tone = "primary",
  className,
}: PptStatCardProps) {
  return (
    <div className={clsx("pds-stat-card", className)}>
      {icon ? <div className={`pds-stat-icon pds-stat-${tone}`}>{icon}</div> : null}
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </div>
  );
}
