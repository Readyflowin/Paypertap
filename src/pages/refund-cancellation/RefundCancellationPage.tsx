import { LegalPage } from "../../components/marketing/LegalPage";

export function RefundCancellationPage() {
  return (
    <LegalPage
      canonicalPath="/refund-cancellation"
      title="Refund and Cancellation Policy"
      h1="Refund and Cancellation Policy"
      description="Refund and cancellation policy foundation for PayPerTap verified booking flows."
      sections={[
        {
          title: "Fixed booking fee",
          body: "The Rs. 20 booking fee is a PayPerTap platform verified-booking fee in Phase 1 and is separate from the seller's remaining product amount.",
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
