import type { Product, ProductStatus } from "../types/firestore";

export type ProductAvailabilityFields = {
  status?: ProductStatus | string;
  inventoryQuantity?: number | null;
  reservedQuantity?: number | null;
  soldQuantity?: number | null;
};

export function getAvailableQuantity(product: ProductAvailabilityFields): number {
  return Math.max(
    0,
    Number(product.inventoryQuantity || 0) -
      Number(product.reservedQuantity || 0) -
      Number(product.soldQuantity || 0)
  );
}

export function isProductBookable(product: ProductAvailabilityFields): boolean {
  return product.status === "open" && getAvailableQuantity(product) > 0;
}

export function getNextProductStatus(
  product: ProductAvailabilityFields
): ProductStatus {
  const inventoryQuantity = Number(product.inventoryQuantity || 0);
  const reservedQuantity = Number(product.reservedQuantity || 0);
  const soldQuantity = Number(product.soldQuantity || 0);
  const availableQuantity = getAvailableQuantity(product);

  if (inventoryQuantity > 0 && soldQuantity >= inventoryQuantity) return "sold";
  if (availableQuantity > 0) return "open";
  if (reservedQuantity > 0) return "hold";
  return "open";
}

export function getProductUnavailableLabel(
  product: ProductAvailabilityFields
): string {
  const availableQuantity = getAvailableQuantity(product);
  const inventoryQuantity = Number(product.inventoryQuantity || 0);
  const reservedQuantity = Number(product.reservedQuantity || 0);
  const soldQuantity = Number(product.soldQuantity || 0);

  if (product.status === "sold") return "Sold out";
  if (product.status === "hold" || (availableQuantity <= 0 && reservedQuantity > 0)) {
    return "Reserved";
  }
  if (inventoryQuantity > 0 && soldQuantity >= inventoryQuantity) return "Sold out";
  if (availableQuantity <= 0) return "Unavailable";

  return "Unavailable";
}

export function getProductAvailabilityLabel(product: Product): string {
  if (isProductBookable(product)) return "Available";
  return getProductUnavailableLabel(product);
}
