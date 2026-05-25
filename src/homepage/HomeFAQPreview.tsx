import { FAQBlock } from "../components/marketing/FAQBlock";
import { MarketingSection } from "../components/marketing/MarketingSection";
import { marketingFaqs } from "../pages/faq/faqContent";

export function HomeFAQPreview() {
  return (
    <MarketingSection
      eyebrow="FAQ"
      title="Clear answers before sellers share the link."
      intro="The most important Phase 1 questions are answered plainly: what PayPerTap does, what the ₹20 means, and who collects the remaining payment."
    >
      <FAQBlock items={marketingFaqs.slice(0, 6)} />
    </MarketingSection>
  );
}
