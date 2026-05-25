import { LegalPage } from "../../components/marketing/LegalPage";

export function TermsPage() {
  return (
    <LegalPage
      canonicalPath="/terms"
      title="PayPerTap Terms of Use | Verified Booking Storefront"
      h1="Terms of Service"
      description="Terms for using PayPerTap verified booking storefronts, including the Rs. 20 booking model and direct seller-buyer confirmation."
      sections={[
        {
          title: "Use of PayPerTap",
          body: "PayPerTap provides storefront and verified booking tools for sellers. Sellers remain responsible for product accuracy, fulfillment, delivery, buyer communication, and remaining payment collection.",
        },
        {
          title: "Fixed booking fee",
          body: "In Phase 1, buyers pay a fixed Rs. 20 booking via PayPerTap to reserve an item. PayPerTap keeps this as the platform verified-booking fee.",
        },
        {
          title: "Not a payment gateway",
          body: "In Phase 1, PayPerTap is not a payment gateway for full product payments and does not provide seller fund settlement or complex payment-routing flows.",
        },
        {
          title: "Buyer and seller responsibility",
          body: "After booking, buyers and sellers continue directly on WhatsApp or other agreed channels to confirm availability, delivery, and remaining payment.",
        },
      ]}
    />
  );
}
