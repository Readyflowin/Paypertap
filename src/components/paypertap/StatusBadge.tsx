import clsx from "clsx";

import { Badge, type BadgeProps } from "@/components/ui";

type StatusType = "product" | "booking" | "store" | "payment" | "generic";

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

const bookingStatuses: Record<string, StatusMeta> = {
  booking_paid: { label: "₹20 paid", variant: "success" },
  payment_pending: { label: "Payment pending", variant: "warning" },
  whatsapp_opened: { label: "WhatsApp opened", variant: "info" },
  sold: { label: "Sold", variant: "success" },
  cancelled: { label: "Cancelled", variant: "danger" },
  cancelled_buyer_no_response: { label: "Buyer no response", variant: "warning" },
  cancelled_seller_unavailable: { label: "Unavailable", variant: "danger" },
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
  booking: bookingStatuses,
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
