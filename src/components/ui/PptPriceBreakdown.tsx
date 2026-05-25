export type PptPriceBreakdownProps = {
  productPrice: number;
  advanceAmount?: number;
  currency?: string;
  note?: string;
};

function formatAmount(amount: number, currency: string) {
  if (currency === "₹" || currency.toUpperCase() === "INR") {
    return `₹${Math.max(Number(amount) || 0, 0).toLocaleString("en-IN")}`;
  }

  return `${currency}${Math.max(Number(amount) || 0, 0).toLocaleString("en-IN")}`;
}

export function PptPriceBreakdown({
  productPrice,
  advanceAmount = 20,
  currency = "₹",
  note = "PayPerTap keeps the ₹20 booking fee. The remaining amount is paid directly to the seller.",
}: PptPriceBreakdownProps) {
  const safePrice = Math.max(Number(productPrice) || 0, 0);
  const safeAdvance = Math.max(Number(advanceAmount) || 0, 0);
  const remainingAmount = Math.max(safePrice - safeAdvance, 0);

  return (
    <div className="pds-price-card">
      <div className="pds-price-row">
        <span>Product price</span>
        <strong>{formatAmount(safePrice, currency)}</strong>
      </div>
      <div className="pds-price-row">
        <span>Booking fee via PayPerTap</span>
        <strong>{formatAmount(safeAdvance, currency)}</strong>
      </div>
      <div className="pds-price-row is-main">
        <span>Pay seller directly</span>
        <strong>{formatAmount(remainingAmount, currency)}</strong>
      </div>
      <p>{note}</p>
    </div>
  );
}
