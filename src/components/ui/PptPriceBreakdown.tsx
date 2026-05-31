export type PptPriceBreakdownProps = {
  productPrice: number;
  advanceAmount?: number;
  currency?: string;
  note?: string;
  rows?: Array<{
    label: string;
    amount: number;
    featured?: boolean;
  }>;
};

function formatAmount(amount: number, currency: string) {
  const safeAmount = Math.max(Number(amount) || 0, 0).toLocaleString("en-IN");

  if (currency === "₹" || currency === "â‚¹" || currency === "INR" || currency === "Rs") {
    return `₹${safeAmount}`;
  }

  return `${currency}${safeAmount}`;
}

export function PptPriceBreakdown({
  productPrice,
  advanceAmount = 20,
  currency = "₹",
  note = "Pay the remaining amount directly to the seller.",
  rows,
}: PptPriceBreakdownProps) {
  const safePrice = Math.max(Number(productPrice) || 0, 0);
  const safeAdvance = Math.max(Number(advanceAmount) || 0, 0);
  const remainingAmount = Math.max(safePrice - safeAdvance, 0);
  const displayRows =
    rows && rows.length
      ? rows
      : [
          { label: "Product price", amount: safePrice },
          { label: "Pay now", amount: safeAdvance },
          { label: "Final balance", amount: remainingAmount, featured: true },
        ];

  return (
    <div className="pds-price-card">
      {displayRows.map((row, index) => (
        <div
          key={`${row.label}-${index}`}
          className={`pds-price-row ${row.featured ? "is-main" : ""}`}
        >
          <span>{row.label}</span>
          <strong>{formatAmount(row.amount, currency)}</strong>
        </div>
      ))}
      <p>{note}</p>
    </div>
  );
}
