import { PptBadge } from "../ui";
import type { CheckoutSession } from "../../types/firestore";
import { getOrderStatusLabel, getOrderStatusTone } from "./orderUtils";

export function OrderStatusBadge({ status }: { status: CheckoutSession["status"] }) {
  return (
    <PptBadge tone={getOrderStatusTone(status)}>
      {getOrderStatusLabel(status)}
    </PptBadge>
  );
}
