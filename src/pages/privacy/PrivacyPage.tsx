import { LegalPage } from "../../components/marketing/LegalPage";

export function PrivacyPage() {
  return (
    <LegalPage
      canonicalPath="/privacy"
      title="Privacy Policy"
      h1="Privacy Policy"
      description="PayPerTap privacy policy foundation for sellers and buyers using verified booking storefronts."
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
      ]}
    />
  );
}
