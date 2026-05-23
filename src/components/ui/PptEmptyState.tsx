import { type ReactNode } from "react";
import clsx from "clsx";

export type PptEmptyStateProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function PptEmptyState({
  title,
  description,
  icon,
  action,
  className,
}: PptEmptyStateProps) {
  return (
    <div className={clsx("pds-empty-card", className)}>
      {icon ? <div className="pds-empty-icon">{icon}</div> : null}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
