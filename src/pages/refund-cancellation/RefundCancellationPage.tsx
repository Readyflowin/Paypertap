import { LegalPage } from "../../components/marketing/LegalPage";

export function RefundCancellationPage() {
  return (
    <LegalPage
      canonicalPath="/refund-cancellation"
      title="PayPerTap Refund and Cancellation Policy | ₹20 Booking"
      h1="Refund & Cancellation Policy"
      description="Refund and cancellation policy for PayPerTap verified booking flows, the fixed ₹20 booking fee, and seller-managed remaining payments."
      directAnswer="PayPerTap uses a fixed ₹20 verified-booking model. In Phase 1, the ₹20 booking is the PayPerTap platform fee, while the seller handles the remaining product amount, delivery, returns, exchanges, and any refund related to the product purchase."
      sections={[
        {
          title: "What is the fixed ₹20 booking fee?",
          body: "The fixed ₹20 booking is a PayPerTap platform verified-booking fee for the booking workflow and reservation context. In Phase 1 it is separate from the seller's remaining product amount, and the seller does not receive it as a payout.",
        },
        {
          title: "Does PayPerTap handle full product payment?",
          body: "No. PayPerTap does not handle the full product payment, seller payout, or split payment. A buyer pays any agreed remaining product amount directly to the seller after the booking and WhatsApp handoff.",
        },
        {
          title: "Who handles product refunds or exchanges?",
          body: "The seller handles delivery, product-level cancellation, returns, exchanges, and any refund of an amount the buyer paid directly to that seller, according to the seller's stated policy. PayPerTap does not hold the full product purchase amount.",
        },
        {
          title: "What should a buyer do after requesting cancellation?",
          body: "The buyer should contact the seller on WhatsApp about a product-level cancellation, remaining-payment refund, exchange, or delivery issue and refer to the seller's policy. The booking record and seller conversation provide the context for that discussion.",
        },
        {
          title: "What can PayPerTap support help with?",
          body: "Buyers and sellers can contact PayPerTap support for issues relating to the fixed booking experience, storefront access, or booking record. PayPerTap support does not replace the seller's responsibility for product fulfilment or direct-payment refunds.",
        },
        {
          title: "What if a buyer does not complete remaining payment?",
          body: "Where the buyer does not complete a remaining payment to the seller, the seller should apply their own availability, holding, or cancellation policy. PayPerTap does not guarantee completion after a booking.",
        },
        {
          title: "When was this policy updated?",
          body: "This Refund & Cancellation Policy was last updated in May 2026.",
        },
      ]}
    />
  );
}
