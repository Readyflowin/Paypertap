import type { CheckoutSession, ProductStatus } from "../types/firestore";

export type InventoryProductFields = {
  inventoryQuantity?: number | null;
  reservedQuantity?: number | null;
  soldQuantity?: number | null;
};

const TERMINAL_RESERVATION_STATUSES = new Set([
  "cancelled",
  "released",
  "completed",
]);

function safeCount(value: unknown): number {
  const count = Number(value || 0);

  return Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
}

function safeTransitionQuantity(value: unknown): number {
  const quantity = Number(value || 1);

  return Number.isFinite(quantity) ? Math.max(1, Math.trunc(quantity)) : 1;
}

export function getAvailableQuantity(product: InventoryProductFields): number {
  return Math.max(
    0,
    safeCount(product.inventoryQuantity) -
      safeCount(product.reservedQuantity) -
      safeCount(product.soldQuantity)
  );
}

export function deriveProductStatus(product: InventoryProductFields): ProductStatus {
  const inventoryQuantity = safeCount(product.inventoryQuantity);
  const reservedQuantity = safeCount(product.reservedQuantity);
  const soldQuantity = safeCount(product.soldQuantity);
  const availableQuantity = getAvailableQuantity(product);

  if (inventoryQuantity > 0 && soldQuantity >= inventoryQuantity) return "sold";
  if (availableQuantity > 0) return "open";
  if (reservedQuantity > 0) return "hold";
  return "open";
}

export function canReleaseReservation(order: Pick<CheckoutSession, "reservationApplied" | "status">) {
  return (
    order.reservationApplied === true &&
    !TERMINAL_RESERVATION_STATUSES.has(order.status)
  );
}

export function canCompleteReservedOrder(order: Pick<CheckoutSession, "reservationApplied" | "status">) {
  return canReleaseReservation(order);
}

export function applyReservationRelease(
  product: InventoryProductFields,
  quantity: unknown = 1
) {
  const inventoryQuantity = safeCount(product.inventoryQuantity);
  const reservedQuantity = safeCount(product.reservedQuantity);
  const soldQuantity = safeCount(product.soldQuantity);
  const releasedQuantity = Math.min(reservedQuantity, safeTransitionQuantity(quantity));
  const nextProduct = {
    inventoryQuantity,
    reservedQuantity: Math.max(0, reservedQuantity - releasedQuantity),
    soldQuantity,
  };

  return {
    ...nextProduct,
    releasedQuantity,
    status: deriveProductStatus(nextProduct),
  };
}

export function applySoldTransition(product: InventoryProductFields, quantity: unknown = 1) {
  const inventoryQuantity = safeCount(product.inventoryQuantity);
  const reservedQuantity = safeCount(product.reservedQuantity);
  const soldQuantity = safeCount(product.soldQuantity);
  const soldTransitionQuantity = Math.min(
    reservedQuantity,
    safeTransitionQuantity(quantity)
  );
  const nextProduct = {
    inventoryQuantity,
    reservedQuantity: Math.max(0, reservedQuantity - soldTransitionQuantity),
    soldQuantity: soldQuantity + soldTransitionQuantity,
  };

  return {
    ...nextProduct,
    soldTransitionQuantity,
    status: deriveProductStatus(nextProduct),
  };
}
