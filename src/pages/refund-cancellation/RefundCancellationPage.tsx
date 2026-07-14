import { LegalPage } from "../../components/marketing/LegalPage";

export function RefundCancellationPage() {
  return (
    <LegalPage
      canonicalPath="/refund-cancellation"
      title="PayPerTap Refund and Cancellation Policy | order"
      h1="Refund & Cancellation Policy"
      description="Refund and cancellation policy for PayPerTap verified order flows, the seller wallet charge, and seller-managed remaining payments."
      directAnswer="PayPerTap uses a seller wallet verified-order model. In the current model, the order is the PayPerTap seller wallet charge, while the seller handles the remaining product amount, delivery, returns, exchanges, and any refund related to the product purchase."
      sections={[
        {
          title: "What is the seller wallet charge?",
          body: "The order is a PayPerTap platform per-order charge for the order workflow and reservation context. In the current model, it is separate from the seller's remaining product amount, and the seller does not receive it as a payout.",
        },
        {
          title: "Does PayPerTap handle full product payment?",
          body: "No. PayPerTap does not handle the full product payment, seller payout, or split payment. A buyer covers any agreed remaining product amount directly to the seller after the Order and WhatsApp handoff.",
        },
        {
          title: "Who handles product refunds or exchanges?",
          body: "The seller handles delivery, product-level cancellation, returns, exchanges, and any refund of an amount the buyer paid directly to that seller, according to the seller's stated policy. PayPerTap does not hold the full product purchase amount.",
        },
        {
          title: "What should a buyer do after requesting cancellation?",
          body: "The buyer should contact the seller on WhatsApp about a product-level cancellation, remaining-payment refund, exchange, or delivery issue and refer to the seller's policy. The order record and seller conversation provide the context for that discussion.",
        },
        {
          title: "What can PayPerTap support help with?",
          body: "Buyers and sellers can contact PayPerTap support for issues relating to the order experience, storefront access, or order record. PayPerTap support does not replace the seller's responsibility for product fulfilment or direct-payment refunds.",
        },
        {
          title: "What if a buyer does not complete remaining payment?",
          body: "Where the buyer does not complete a remaining payment to the seller, the seller should apply their own availability, holding, or cancellation policy. PayPerTap does not guarantee completion after an order.",
        },
        {
          title: "When was this policy updated?",
          body: "This Refund & Cancellation Policy was last updated in May 2026.",
        },
      ]}
    />
  );
}
