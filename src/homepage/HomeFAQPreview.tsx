import { FAQBlock } from "../components/marketing/FAQBlock";
import { MarketingSection } from "../components/marketing/MarketingSection";
import { marketingFaqs } from "../pages/faq/faqContent";
import { Link } from "react-router-dom";

export function HomeFAQPreview() {
  return (
    <MarketingSection
      eyebrow="FAQ"
      title="Clear answers before sellers share the link."
      intro="The most important booking questions are answered plainly: what PayPerTap does, what the ₹20 means, and who collects the remaining payment."
    >
      <FAQBlock items={marketingFaqs.slice(0, 6)} />
      <Link to="/compare" className="ppt-link-pill mt-5">
        Compare selling tools
      </Link>
    </MarketingSection>
  );
}
