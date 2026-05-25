import { LegalPage } from "../../components/marketing/LegalPage";

export function PrivacyPage() {
  return (
    <LegalPage
      canonicalPath="/privacy"
      title="PayPerTap Privacy Policy | Buyer and Seller Data"
      h1="Privacy Policy"
      description="PayPerTap privacy policy for sellers and buyers using verified booking storefronts, Rs. 20 booking, and WhatsApp handoff."
      sections={[
        {
          title: "Information we collect",
          body: "PayPerTap may collect seller account details, store details, product information, buyer booking details, and usage data needed to operate storefront and booking workflows.",
        },
        {
          title: "How information is used",
          body: "Information is used to run PayPerTap storefronts, support verified booking, help sellers manage buyer conversations, improve reliability, and provide support.",
        },
        {
          title: "Phase 1 payment meaning",
          body: "PayPerTap collects the fixed Rs. 20 booking fee as a platform verified-booking fee. Sellers collect remaining product payment directly from buyers.",
        },
        {
          title: "WhatsApp seller contact",
          body: "After a booking, buyer and product context may be used to help the buyer continue with the seller on WhatsApp. The seller then handles direct communication, delivery, and remaining payment discussion.",
        },
        {
          title: "Buyer data",
          body: "PayPerTap uses buyer booking details to operate the storefront and booking workflow. PayPerTap does not sell buyer data to advertisers.",
        },
      ]}
    />
  );
}
