import { LegalPage } from "../../components/marketing/LegalPage";

export function TermsPage() {
  return (
    <LegalPage
      canonicalPath="/terms"
      title="Terms of Use"
      h1="Terms of Use"
      description="Terms foundation for using PayPerTap verified booking storefronts."
      sections={[
        {
          title: "Use of PayPerTap",
          body: "PayPerTap provides storefront and verified booking tools for sellers. Sellers remain responsible for product accuracy, fulfillment, delivery, buyer communication, and remaining payment collection.",
        },
        {
          title: "Not a payment gateway",
          body: "In Phase 1, PayPerTap is not a payment gateway for full product payments and does not provide seller payout or split-settlement flows.",
        },
        {
          title: "Buyer and seller responsibility",
          body: "After booking, buyers and sellers continue directly on WhatsApp or other agreed channels to confirm availability, delivery, and remaining payment.",
        },
      ]}
    />
  );
}
