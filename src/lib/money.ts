export const BOOKING_ADVANCE_AMOUNT = 20;

export function getSellerCollectAmount(price: number): number {
  return Math.max(Math.trunc(Number(price)) - BOOKING_ADVANCE_AMOUNT, 0);
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}
