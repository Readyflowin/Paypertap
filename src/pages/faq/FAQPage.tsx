import { CTASection } from "../../components/marketing/CTASection";
import { FAQBlock } from "../../components/marketing/FAQBlock";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { marketingFaqs } from "./faqContent";

const faqCategories = [
  {
    title: "Booking model",
    items: marketingFaqs.filter((item) =>
      ["What is PayPerTap?", "How does the Rs. 20 booking work?", "What happens after a buyer books?", "How does PayPerTap reduce fake buyers?"].includes(
        item.question,
      ),
    ),
  },
  {
    title: "Seller payments",
    items: marketingFaqs.filter((item) =>
      [
        "Does the seller receive the Rs. 20?",
        "Is PayPerTap a payment gateway?",
        "How does the seller collect the remaining payment?",
        "Can sellers use UPI, Google Pay, PhonePe, or COD for the remaining amount?",
        "Do sellers need KYC in Phase 1?",
      ].includes(item.question),
    ),
  },
  {
    title: "WhatsApp handoff",
    items: marketingFaqs.filter((item) =>
      ["Can I use PayPerTap with WhatsApp Business?", "Does PayPerTap replace WhatsApp?", "Is PayPerTap useful for WhatsApp sellers?"].includes(item.question),
    ),
  },
  {
    title: "Storefront and products",
    items: marketingFaqs.filter((item) =>
      [
        "Is PayPerTap useful for Instagram sellers?",
        "Is PayPerTap useful for thrift sellers?",
        "Is PayPerTap useful for boutiques and handmade sellers?",
        "Can sellers share direct product links?",
        "Is PayPerTap a Shopify replacement?",
      ].includes(item.question),
    ),
  },
  {
    title: "Phase 1 limitations",
    items: marketingFaqs.filter((item) =>
      [
        "Can buyers cancel a booking?",
        "Who handles product delivery and returns?",
        "What does PayPerTap not handle in Phase 1?",
      ].includes(item.question),
    ),
  },
];

export function FAQPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/faq"
        title="PayPerTap FAQ | Rs. 20 Booking and WhatsApp Seller Flow"
        description="Clear answers about PayPerTap, Rs. 20 verified booking, seller payments, WhatsApp handoff, KYC, cancellations, and Phase 1 limits."
        jsonLd={[breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])]}
      />
      <SectionHeader
        eyebrow="FAQ"
        h1="PayPerTap FAQ for Instagram and WhatsApp sellers."
        subtitle="PayPerTap is a verified booking storefront for Indian social sellers. These answers explain Rs. 20 booking, WhatsApp handoff, direct seller payment, and Phase 1 limits."
      />
      <MarketingSection className="ppt-core-page-section">
        <div className="ppt-faq-category-grid grid gap-4">
          {faqCategories.map((category) => (
            <MarketingCard className="ppt-faq-category-card" key={category.title}>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                {category.title}
              </h2>
              <div className="mt-5">
                <FAQBlock items={category.items} showLink={false} />
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
