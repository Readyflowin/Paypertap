import type { Product } from "../types/firestore";

export function getAvailableQuantity(product: Product): number {
  return Math.max(
    0,
    Number(product.inventoryQuantity || 0) -
      Number(product.reservedQuantity || 0) -
      Number(product.soldQuantity || 0)
  );
}

export function isProductBookable(product: Product): boolean {
  return product.status === "open" && getAvailableQuantity(product) > 0;
}

export function getProductUnavailableLabel(product: Product): string {
  const availableQuantity = getAvailableQuantity(product);

  if (product.status === "sold") return "Sold out";
  if (product.status === "hold" || Number(product.reservedQuantity || 0) > 0) {
    return "Reserved";
  }
  if (availableQuantity <= 0) return "Unavailable";

  return "Unavailable";
}
