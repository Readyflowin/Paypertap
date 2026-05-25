import { FAQBlock } from "../../components/marketing/FAQBlock";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { marketingFaqs } from "./faqContent";

export function FAQPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/faq"
        title="PayPerTap FAQ"
        description="Answers about PayPerTap, Rs. 20 booking, WhatsApp selling, seller payment collection, and Phase 1 limitations."
        jsonLd={[breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])]}
      />
      <SectionHeader
        eyebrow="FAQ"
        h1="Questions sellers ask before using PayPerTap"
        subtitle="Clear answers about verified booking, the fixed Rs. 20 fee, WhatsApp flow, and what PayPerTap does not do in Phase 1."
      />
      <MarketingSection>
        <FAQBlock items={marketingFaqs} showLink={false} />
      </MarketingSection>
    </MarketingLayout>
  );
}
