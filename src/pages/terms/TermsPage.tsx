import { LegalPage } from "../../components/marketing/LegalPage";

export function TermsPage() {
  return (
    <LegalPage
      canonicalPath="/terms"
      title="PayPerTap Terms of Use | Verified Booking Storefront"
      h1="Terms of Service"
      description="Terms for using PayPerTap verified booking storefronts, including the fixed ₹20 booking model and direct seller-buyer confirmation."
      directAnswer="These Terms explain how PayPerTap provides verified booking storefront tools for sellers and buyers. Buyers pay a fixed ₹20 booking through PayPerTap, while sellers remain responsible for product accuracy, delivery, remaining payment collection, returns, and buyer communication."
      sections={[
        {
          title: "What does PayPerTap provide?",
          body: "PayPerTap provides storefront and verified booking tools that let sellers display products, share product or store links, receive a fixed booking record, reserve an item in the flow, and continue buyer communication on WhatsApp.",
        },
        {
          title: "What are sellers responsible for?",
          body: "Sellers are responsible for accurate product descriptions, images, availability, pricing, applicable policies, communication with buyers, delivery or fulfilment, remaining payment collection, and handling returns or exchanges under the seller's stated policy.",
        },
        {
          title: "What are buyers responsible for?",
          body: "Buyers are responsible for reviewing product information and seller policies, providing accurate booking and contact details, communicating with the seller after handoff, and making any agreed remaining product payment directly to the seller.",
        },
        {
          title: "How does the fixed ₹20 booking work?",
          body: "Buyers pay a fixed ₹20 booking through PayPerTap to reserve an item in the booking flow. In Phase 1, PayPerTap keeps the ₹20 as the platform verified-booking fee; the seller does not receive it as a payout or advance.",
        },
        {
          title: "Who handles the remaining product amount?",
          body: "The seller collects the remaining product amount directly from the buyer through the payment method the seller offers, such as UPI or COD. PayPerTap does not collect or settle that remaining amount.",
        },
        {
          title: "Is PayPerTap a full payment gateway?",
          body: "No. In Phase 1 PayPerTap is not a full payment gateway, has no seller payout or split-payment flow, and does not support custom seller advance amounts. Its payment role is the fixed ₹20 verified-booking fee.",
        },
        {
          title: "How are returns and exchanges handled?",
          body: "A seller's product policy governs delivery, returns, exchanges, and product-level refunds for amounts paid directly to that seller. Buyers should review seller policies and discuss product issues with the seller through their direct conversation.",
        },
        {
          title: "What misuse can affect access?",
          body: "PayPerTap may restrict or remove access where accounts, listings, booking activity, or communications misuse the service, provide misleading product information, interfere with platform operation, or violate applicable requirements.",
        },
        {
          title: "When were these terms updated?",
          body: "These Terms of Service were last updated in May 2026. Continued use of the service after updated terms are published is subject to the then-current terms.",
        },
      ]}
    />
  );
}
