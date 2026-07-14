import clsx from "clsx";

import { Badge, type BadgeProps } from "@/components/ui";

type StatusType = "product" | "order" | "store" | "payment" | "generic";

export type StatusBadgeProps = {
  type?: StatusType;
  status: string;
  className?: string;
};

type StatusMeta = {
  label: string;
  variant: BadgeProps["variant"];
};

const productStatuses: Record<string, StatusMeta> = {
  open: { label: "Open", variant: "success" },
  reserved: { label: "Reserved", variant: "info" },
  hold: { label: "Reserved", variant: "info" },
  sold: { label: "Sold", variant: "dark" },
  hidden: { label: "Hidden", variant: "neutral" },
  unpublished: { label: "Hidden", variant: "neutral" },
  draft: { label: "Draft", variant: "warning" },
};

const orderStatuses: Record<string, StatusMeta> = {
  pending_payment: { label: "Pending payment", variant: "warning" },
  awaiting_payment: { label: "Pending payment", variant: "warning" },
  payment_returned: { label: "Payment returned", variant: "warning" },
  pending_confirmation: { label: "Pending confirmation", variant: "info" },
  confirmed: { label: "Confirmed", variant: "info" },
  processing: { label: "Processing", variant: "success" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
};

const storeStatuses: Record<string, StatusMeta> = {
  published: { label: "Live", variant: "success" },
  live: { label: "Live", variant: "success" },
  unpublished: { label: "Unpublished", variant: "neutral" },
  draft: { label: "Draft", variant: "warning" },
};

const paymentStatuses: Record<string, StatusMeta> = {
  pending: { label: "Pending", variant: "warning" },
  paid: { label: "Paid", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  refunded: { label: "Refunded", variant: "info" },
};

const statusMaps: Record<StatusType, Record<string, StatusMeta>> = {
  product: productStatuses,
  order: orderStatuses,
  store: storeStatuses,
  payment: paymentStatuses,
  generic: {},
};

function humanizeStatus(status: string) {
  return status
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function StatusBadge({ type = "generic", status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().trim();
  const meta = statusMaps[type][normalizedStatus] ?? {
    label: humanizeStatus(status),
    variant: "neutral" as const,
  };

  return <Badge variant={meta.variant} className={clsx(className)}>{meta.label}</Badge>;
}
