import { CheckCircle2, IndianRupee, MessageCircle, MousePointerClick, PackageCheck, Search } from "lucide-react";
import { Link } from "react-router-dom";

import { ComparisonTable } from "../../components/marketing/ComparisonTable";
import { CTASection } from "../../components/marketing/CTASection";
import { FAQBlock } from "../../components/marketing/FAQBlock";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { PageTrustMeta } from "../../components/marketing/PageTrustMeta";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { StepList } from "../../components/marketing/StepList";
import { TopCreateStoreCTA } from "../../components/marketing/TopCreateStoreCTA";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { marketingFaqs } from "../faq/faqContent";

const buyerFlow = [
  {
    icon: <MousePointerClick size={18} aria-hidden="true" />,
    title: "Open product link",
    copy: "The buyer opens a store or direct product link shared on Instagram or WhatsApp.",
  },
  {
    icon: <Search size={18} aria-hidden="true" />,
    title: "Check details",
    copy: "The buyer reviews the selected product and its displayed price before Order.",
  },
  {
    icon: <IndianRupee size={18} aria-hidden="true" />,
    title: "Pay order",
    copy: "The seller wallet covers the fixed PayPerTap fee, and the item becomes reserved in the flow.",
  },
  {
    icon: <MessageCircle size={18} aria-hidden="true" />,
    title: "Share message",
    copy: "The buyer continues to WhatsApp with product, Order, and contact context ready.",
  },
  {
    icon: <CheckCircle2 size={18} aria-hidden="true" />,
    title: "Pay seller directly",
    copy: "The remaining amount is paid to the seller through their chosen direct process.",
  },
  {
    icon: <PackageCheck size={18} aria-hidden="true" />,
    title: "Confirm delivery",
    copy: "The buyer and seller confirm fulfilment and any seller policy directly.",
  },
];

const howItWorksFaqs = marketingFaqs.filter((item) =>
  [
    "How does the order work?",
    "Does PayPerTap process buyer payments?",
    "What happens after a buyer books?",
    "How does WhatsApp handoff work?",
    "Does the product become reserved after Order?",
    "What is the difference between reserved and sold?",
    "Can sellers use WhatsApp Business?",
    "Can sellers use UPI, Google Pay, PhonePe, or COD?",
    "Who handles returns and exchanges?",
    "Can sellers manually mark a product as sold?",
    "Can sellers share direct product links?",
    "Can buyers cancel an order?",
    "Is PayPerTap available in India?",
    "Is PayPerTap a payment gateway?",
  ].includes(item.question),
);

export function HowItWorksPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/how-it-works"
        title="How PayPerTap Works for Instagram and WhatsApp Sellers"
        description="Learn the PayPerTap flow: share links, buyer places a fixed order, product is reserved, and the remaining amount is handled directly on WhatsApp."
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
        path="/how-it-works"
        subtitle="PayPerTap helps sellers turn social media interest into a verified order. The seller shares a store or product link, the seller wallet covers PayPerTap's per-order charge to reserve the item, and PayPerTap sends the buyer to WhatsApp with product, price, remaining amount, and contact details ready to share."
      />
      <PageTrustMeta path="/how-it-works" />
      <TopCreateStoreCTA />
      <MarketingSection
        className="ppt-core-page-section"
        title="How does PayPerTap work for sellers?"
        intro="The flow fits sellers who already discover buyers socially and want a clear reservation point before direct confirmation."
      >
        <MarketingCard className="mb-5 p-6 sm:p-7">
          <p className="ppt-home-copy max-w-4xl text-sm leading-7 text-neutral-600 sm:text-base">
            Research on{" "}
            <a
              href="https://www.mordorintelligence.com/industry-reports/india-social-commerce-market"
              target="_blank"
              rel="noopener noreferrer"
            >
              India&apos;s social commerce market
            </a>{" "}
            describes expanding mobile-first product discovery. PayPerTap focuses on
            the practical next step for social sellers: share a product, record a
            order, reserve it, and continue the sale directly.
          </p>
        </MarketingCard>
        <StepList />
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="How does PayPerTap work for buyers?"
        intro="Buyers can see what they are Order and which payment responsibility remains with the seller."
      >
        <div className="ppt-buyer-flow-grid grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {buyerFlow.map((step, index) => (
            <MarketingCard className="ppt-core-step-card" key={step.title}>
              <div className="ppt-core-step-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="ppt-core-icon-tile mb-5">{step.icon}</div>
              <h3 className="text-lg font-bold tracking-[-0.02em] text-neutral-950">
                {step.title}
              </h3>
              <p className="ppt-home-copy mt-3 text-sm leading-6 text-neutral-600">
                {step.copy}
              </p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="What happens after the order?"
        intro="Reservation is the handoff point, not full checkout: the seller still owns payment and fulfilment."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">How does WhatsApp handoff work?</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap prepares the buyer&apos;s product, price, Order, remaining
              amount, and contact details to share. Official{" "}
              <a
                href="https://whatsappbusiness.com/products/business-platform/"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Business use cases
              </a>{" "}
              include business conversations such as order confirmations and shipment
              updates. PayPerTap does not send automated replies.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">What does the seller handle directly?</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The seller collects the remaining product amount through UPI, COD, or
              their offered process, confirms delivery, and manages returns or
              exchanges according to their policy. PayPerTap charges the seller wallet for the order platform
              fee and provides no seller payout in current model.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Does PayPerTap replace the seller's workflow?"
        intro="No. It adds a verified order layer before WhatsApp, while the seller remains responsible for the product, delivery, and remaining payment."
      >
        <ComparisonTable />
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/pricing" className="ppt-secondary-link">Pricing</Link>
          <Link to="/faq" className="ppt-secondary-link">FAQ</Link>
          <Link to="/features/whatsapp-handoff" className="ppt-secondary-link">WhatsApp handoff</Link>
        </div>
      </MarketingSection>
      <MarketingSection className="ppt-core-page-section" title="How it works FAQ">
        <FAQBlock items={howItWorksFaqs} />
      </MarketingSection>
      <MarketingSection
        className="ppt-core-page-section"
        title="What should sellers and buyers confirm directly?"
        intro="Order creates an organized starting point; completing the sale still needs a clear conversation."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Product and availability</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Sellers should keep product descriptions and availability accurate.
              Once booked, the reserved item gives both parties a common reference,
              while the seller confirms any sizing, condition, customization, or
              fulfilment details needed for the actual purchase.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Remaining amount and method</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The seller wallet charge does not settle the price of the product. The
              seller tells the buyer the remaining amount and their offered direct
              method, such as UPI or COD, then confirms receipt or delivery terms
              outside PayPerTap&apos;s fee flow.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Delivery and completion</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Delivery address confirmation, shipping arrangements, collection, and
              completion remain between seller and buyer. Once the seller finishes
              the transaction, they can use their workflow to mark the reserved
              product sold or complete.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Changes or cancellations</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              If plans change after Order, the buyer should contact the seller in
              WhatsApp. The seller&apos;s stated return, exchange, or cancellation
              policy applies to the product transaction and any remaining amount the
              seller collected directly.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">order record and support</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The order record helps identify the selected product and buyer
              context if an order-flow question arises. For product quality,
              remaining payment, shipping, delivery, return, or exchange questions,
              buyers should continue directly with the seller because those parts of
              the transaction are seller-managed. This keeps Order and fulfilment
              responsibilities understandable for both sides.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
