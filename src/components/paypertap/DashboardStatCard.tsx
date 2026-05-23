import { type ReactNode } from "react";
import clsx from "clsx";

import { Badge, Card } from "@/components/ui";

type TrendTone = "up" | "down" | "neutral";

export type DashboardStatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  trend?: string;
  trendTone?: TrendTone;
  icon?: ReactNode;
  className?: string;
};

const trendVariant: Record<TrendTone, "success" | "danger" | "neutral"> = {
  up: "success",
  down: "danger",
  neutral: "neutral",
};

export function DashboardStatCard({
  label,
  value,
  description,
  trend,
  trendTone = "neutral",
  icon,
  className,
}: DashboardStatCardProps) {
  return (
    <Card padding="md" hoverable className={clsx("min-h-36", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--ppt-text-muted)]">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-normal text-[var(--ppt-text)]">
            {value}
          </p>
        </div>
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--ppt-radius-md)] bg-[var(--ppt-primary-soft)] text-[var(--ppt-primary-dark)]">
            {icon}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {trend ? <Badge variant={trendVariant[trendTone]}>{trend}</Badge> : null}
        {description ? (
          <p className="text-sm leading-5 text-[var(--ppt-text-muted)]">{description}</p>
        ) : null}
      </div>
    </Card>
  );
}
