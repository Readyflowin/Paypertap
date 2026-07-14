import { LegalPage } from "../../components/marketing/LegalPage";

export function TermsPage() {
  return (
    <LegalPage
      canonicalPath="/terms"
      title="PayPerTap Terms of Use | Verified order Storefront"
      h1="Terms of Service"
      description="Terms for using PayPerTap verified order storefronts, including the order model and direct seller-buyer confirmation."
      directAnswer="These Terms explain how PayPerTap provides verified order storefront tools for sellers and buyers. buyers place orders through PayPerTap, while sellers remain responsible for product accuracy, delivery, remaining payment collection, returns, and buyer communication."
      sections={[
        {
          title: "What does PayPerTap provide?",
          body: "PayPerTap provides storefront and verified order tools that let sellers display products, share product or store links, receive an order record, reserve an item in the flow, and continue buyer communication on WhatsApp.",
        },
        {
          title: "What are sellers responsible for?",
          body: "Sellers are responsible for accurate product descriptions, images, availability, pricing, applicable policies, communication with buyers, delivery or fulfilment, remaining payment collection, and handling returns or exchanges under the seller's stated policy.",
        },
        {
          title: "What are buyers responsible for?",
          body: "Buyers are responsible for reviewing product information and seller policies, providing accurate Order and contact details, communicating with the seller after handoff, and making any agreed remaining product payment directly to the seller.",
        },
        {
          title: "How does the order work?",
          body: "buyers place orders through PayPerTap to reserve an item in the order flow. In the current model, PayPerTap charges the seller wallet for the order as the platform per-order charge; the seller does not receive it as a payout or advance.",
        },
        {
          title: "Who handles the remaining product amount?",
          body: "The seller collects the remaining product amount directly from the buyer through the payment method the seller offers, such as UPI or COD. PayPerTap does not collect or settle that remaining amount.",
        },
        {
          title: "Is PayPerTap a full payment gateway?",
          body: "No. In the current model, PayPerTap is not a full payment gateway, has no seller payout or split-payment flow, and does not support custom seller advance amounts. Its payment role is the seller wallet per-order charge.",
        },
        {
          title: "How are returns and exchanges handled?",
          body: "A seller's product policy governs delivery, returns, exchanges, and product-level refunds for amounts paid directly to that seller. Buyers should review seller policies and discuss product issues with the seller through their direct conversation.",
        },
        {
          title: "What misuse can affect access?",
          body: "PayPerTap may restrict or remove access where accounts, listings, Order activity, or communications misuse the service, provide misleading product information, interfere with platform operation, or violate applicable requirements.",
        },
        {
          title: "When were these terms updated?",
          body: "These Terms of Service were last updated in May 2026. Continued use of the service after updated terms are published is subject to the then-current terms.",
        },
      ]}
    />
  );
}
