import { ArrowRight, CheckCircle2, IndianRupee, MessageCircle, MousePointerClick } from "lucide-react";

import { ComparisonTable } from "../../components/marketing/ComparisonTable";
import { CTASection } from "../../components/marketing/CTASection";
import { FAQBlock } from "../../components/marketing/FAQBlock";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { StepList } from "../../components/marketing/StepList";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { marketingFaqs } from "../faq/faqContent";

const buyerFlow = [
  {
    icon: <MousePointerClick size={18} aria-hidden="true" />,
    title: "Opens link",
    copy: "Buyer opens the seller's store or product link from Instagram or WhatsApp.",
  },
  {
    icon: <IndianRupee size={18} aria-hidden="true" />,
    title: "Pays Rs. 20",
    copy: "Buyer pays the fixed booking via PayPerTap to reserve the item.",
  },
  {
    icon: <MessageCircle size={18} aria-hidden="true" />,
    title: "Sends details",
    copy: "The WhatsApp message carries product and buyer context for the seller.",
  },
  {
    icon: <CheckCircle2 size={18} aria-hidden="true" />,
    title: "Pays seller directly",
    copy: "The remaining amount is paid directly to the seller on WhatsApp, UPI, COD, or the seller's process.",
  },
];

const howItWorksFaqs = marketingFaqs.filter((item) =>
  [
    "What happens after a buyer books?",
    "Can I use PayPerTap with WhatsApp Business?",
    "Can sellers use UPI, Google Pay, PhonePe, or COD for the remaining amount?",
    "What does PayPerTap not handle in Phase 1?",
  ].includes(item.question),
);

export function HowItWorksPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/how-it-works"
        title="How PayPerTap Works for Instagram and WhatsApp Sellers"
        description="Learn the PayPerTap seller and buyer flow: create a store, share links, buyer pays Rs. 20 booking, then continues to WhatsApp."
        jsonLd={[
          breadcrumbListSchema([
            { name: "Home", path: "/" },
            { name: "How it works", path: "/how-it-works" },
          ]),
        ]}
      />
      <SectionHeader
        eyebrow="How it works"
        h1="How PayPerTap works."
        subtitle="PayPerTap helps sellers create a store, add products, share links, collect a Rs. 20 booking signal from buyers, and continue the remaining confirmation directly on WhatsApp."
      />
      <MarketingSection
        className="ppt-core-page-section"
        title="Seller flow"
        intro="A clean sequence for sellers who already run their business through Instagram, WhatsApp, UPI, and COD: create store, add products, share links, receive booking, hand off to WhatsApp, and collect the remaining amount directly."
      >
        <StepList />
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Buyer flow"
        intro="The buyer gets a clear reservation path before the WhatsApp conversation starts."
      >
        <div className="ppt-buyer-flow-grid grid gap-4 md:grid-cols-4">
          {buyerFlow.map((step, index) => (
            <MarketingCard className="ppt-core-step-card" key={step.title}>
              <div className="ppt-core-step-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="ppt-core-icon-tile mb-5">{step.icon}</div>
              <h2 className="text-lg font-bold tracking-[-0.02em] text-neutral-950">
                {step.title}
              </h2>
              <p className="ppt-home-copy mt-3 text-sm leading-6 text-neutral-600">
                {step.copy}
              </p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="PayPerTap does not replace your seller workflow"
        intro="It adds a verified booking layer before WhatsApp, while the seller remains responsible for the product, delivery, and remaining payment."
      >
        <ComparisonTable />
      </MarketingSection>
      <MarketingSection className="ppt-core-page-section" title="How it works FAQ">
        <FAQBlock items={howItWorksFaqs} />
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
