import { type ReactNode } from "react";
import { CalendarCheck, Package, Store, Users } from "lucide-react";
import clsx from "clsx";

import { Card } from "./Card";

type EmptyStateTone = "neutral" | "product" | "booking" | "customer" | "store";

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  tone?: EmptyStateTone;
  className?: string;
};

const toneIcon: Record<EmptyStateTone, ReactNode> = {
  neutral: null,
  product: <Package size={22} aria-hidden="true" />,
  booking: <CalendarCheck size={22} aria-hidden="true" />,
  customer: <Users size={22} aria-hidden="true" />,
  store: <Store size={22} aria-hidden="true" />,
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  compact = false,
  tone = "neutral",
  className,
}: EmptyStateProps) {
  const displayIcon = icon ?? toneIcon[tone];

  return (
    <Card
      variant="glass"
      padding={compact ? "md" : "xl"}
      className={clsx("mx-auto flex max-w-xl flex-col items-center text-center", className)}
    >
      {displayIcon ? (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ppt-primary-soft)] text-[var(--ppt-primary-dark)] shadow-[0_12px_28px_rgba(113,71,245,0.14)]">
          {displayIcon}
        </div>
      ) : null}
      <h3 className="text-xl font-black tracking-normal text-[var(--ppt-text)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--ppt-text-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
