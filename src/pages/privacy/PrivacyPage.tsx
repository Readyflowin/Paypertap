import { LegalPage } from "../../components/marketing/LegalPage";

export function PrivacyPage() {
  return (
    <LegalPage
      canonicalPath="/privacy"
      title="PayPerTap Privacy Policy | Buyer and Seller Data"
      h1="Privacy Policy"
      description="PayPerTap privacy policy for sellers and buyers using verified booking storefronts, fixed ₹20 booking, and WhatsApp handoff."
      directAnswer="This Privacy Policy explains how PayPerTap handles seller, buyer, product, booking, and contact information when sellers create storefronts and buyers place ₹20 bookings. PayPerTap uses this information to operate the booking flow, support WhatsApp handoff, and help sellers manage orders."
      sections={[
        {
          title: "What information is collected from sellers?",
          body: "PayPerTap may collect seller account and contact details, store identity, product listings, prices, inventory state, order status, policy information, and details a seller submits to set up or manage a storefront.",
        },
        {
          title: "What information is collected from buyers?",
          body: "When a buyer places a booking, PayPerTap may collect the buyer's name, phone or contact details, selected product, booking information, and any details supplied to support the WhatsApp handoff and order record.",
        },
        {
          title: "How is booking and payment information used?",
          body: "PayPerTap processes and records the fixed ₹20 booking as a platform verified-booking fee. In Phase 1, the seller does not receive that fee. PayPerTap does not process the remaining product amount that a buyer pays directly to a seller.",
        },
        {
          title: "How does WhatsApp handoff use data?",
          body: "After a booking, product, price, booking, remaining amount, and buyer contact context may be prepared so the buyer can continue with the seller on WhatsApp. The seller then handles the direct conversation, delivery, and remaining-payment discussion.",
        },
        {
          title: "Who sees product and order data?",
          body: "PayPerTap uses storefront, product, reservation, and order data to operate seller and buyer workflows. Relevant buyer booking information is shared with the relevant seller so that seller can confirm and fulfil that buyer's order.",
        },
        {
          title: "Does PayPerTap sell data to advertisers?",
          body: "PayPerTap does not sell seller or buyer personal data to advertisers. Information may be used to operate the service, provide support, maintain booking records, and meet applicable operational or legal requirements.",
        },
        {
          title: "How can I ask a privacy question?",
          body: "Sellers and buyers can contact PayPerTap support for a privacy, booking-data, or storefront-data question. Include enough booking or account context for the support request to be identified without sending unnecessary sensitive information.",
        },
        {
          title: "When was this policy updated?",
          body: "This Privacy Policy was last updated in May 2026. PayPerTap may update this policy as its booking storefront service or applicable requirements change.",
        },
      ]}
    />
  );
}
