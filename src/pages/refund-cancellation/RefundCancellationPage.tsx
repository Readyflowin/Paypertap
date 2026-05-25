import { LegalPage } from "../../components/marketing/LegalPage";

export function RefundCancellationPage() {
  return (
    <LegalPage
      canonicalPath="/refund-cancellation"
      title="PayPerTap Refund and Cancellation Policy | Rs. 20 Booking"
      h1="Refund & Cancellation Policy"
      description="Refund and cancellation policy for PayPerTap verified booking flows, the Rs. 20 booking fee, and seller-managed remaining payments."
      sections={[
        {
          title: "Fixed booking fee",
          body: "The Rs. 20 booking fee is a PayPerTap platform verified-booking fee in Phase 1 and is separate from the seller's remaining product amount.",
        },
        {
          title: "PayPerTap role",
          body: "PayPerTap does not handle the full product payment or full product refund in Phase 1. The booking fee is connected to the verified-booking workflow.",
        },
        {
          title: "Remaining product amount",
          body: "The remaining amount is paid directly to the seller. Any cancellation, exchange, delivery, or refund discussion for that amount is handled directly between buyer and seller.",
        },
        {
          title: "Support",
          body: "Buyers and sellers can contact PayPerTap support for issues related to the booking experience or storefront access.",
        },
      ]}
    />
  );
}
