import {
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import { CTASection } from "../../components/marketing/CTASection";
import { FAQBlock } from "../../components/marketing/FAQBlock";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { marketingFaqs } from "../faq/faqContent";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";

const paypertapDoes = [
  "Creates a verified booking storefront",
  "Collects the fixed Rs. 20 PayPerTap booking fee",
  "Captures product and buyer context before WhatsApp",
];

const sellerHandles = [
  "Confirms details with the buyer on WhatsApp",
  "Collects the remaining amount directly",
  "Handles delivery, exchange, and product communication",
];

const pricingFaqs = marketingFaqs.filter((item) =>
  [
    "How does the Rs. 20 booking work?",
    "Does the seller receive the Rs. 20?",
    "How does the seller collect the remaining payment?",
    "Is PayPerTap a payment gateway?",
    "Do sellers need KYC in Phase 1?",
  ].includes(item.question),
);

export function PricingPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/pricing"
        title="PayPerTap Pricing | Rs. 20 Booking for Instagram & WhatsApp Sellers"
        description="PayPerTap pricing is simple: buyers pay a fixed Rs. 20 booking fee, sellers collect the remaining amount directly, and no seller payout setup is needed in Phase 1."
        jsonLd={[
          breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]),
        ]}
      />
      <SectionHeader
        eyebrow="Pricing"
        h1="Simple pricing for verified bookings."
        subtitle="Buyers pay a fixed Rs. 20 booking via PayPerTap to reserve an item. Sellers do not receive the Rs. 20 in Phase 1 and collect the remaining product amount directly from buyers."
      />
      <MarketingSection className="ppt-core-page-section">
        <div className="ppt-pricing-core-grid grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <MarketingCard className="ppt-pricing-hero-card">
            <div className="ppt-core-icon-tile">
              <IndianRupee size={24} aria-hidden="true" />
            </div>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Buyer booking
            </p>
            <p className="mt-3 text-6xl font-extrabold tracking-[-0.06em] text-neutral-950 sm:text-7xl">
              Rs. 20
            </p>
            <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
              Paid by buyer to reserve an item
            </h2>
            <p className="ppt-home-copy mt-4 text-sm leading-7 text-neutral-600">
              This is the fixed PayPerTap platform verified-booking fee in Phase 1.
              The seller does not receive this Rs. 20.
            </p>
            <Link
              to="/auth"
              className="ppt-primary-link mt-6 inline-flex w-fit items-center gap-2"
            >
              Create your store <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </MarketingCard>

          <div className="grid gap-4">
            <MarketingCard className="ppt-core-card-row">
              <div className="ppt-core-icon-tile">
                <MessageCircle size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Remaining amount
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                  Seller collects remaining amount directly
                </h2>
                <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                  Seller collects on WhatsApp, UPI, COD, or their preferred process.
                  PayPerTap is not a full payment gateway in Phase 1.
                </p>
              </div>
            </MarketingCard>

            <div className="grid gap-4 md:grid-cols-2">
              <MarketingCard>
                <ShieldCheck className="text-neutral-950" size={22} aria-hidden="true" />
                <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-neutral-950">
                  No settlement setup
                </h2>
                <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                  Phase 1 does not need seller bank settlement KYC, complex payment
                  routing, or custom booking-fee logic.
                </p>
              </MarketingCard>
              <MarketingCard>
                <ReceiptText className="text-neutral-950" size={22} aria-hidden="true" />
                <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-neutral-950">
                  Booking-first clarity
                </h2>
                <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                  PayPerTap verifies intent and organizes buyer context before the
                  seller continues the conversation.
                </p>
              </MarketingCard>
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="What PayPerTap does and what seller handles"
        intro="The booking layer is intentionally simple, so sellers can keep their existing WhatsApp selling workflow."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard className="ppt-core-list-card">
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
              What PayPerTap does
            </h2>
            <ul className="mt-5 grid gap-3">
              {paypertapDoes.map((item) => (
                <li className="ppt-core-check-row" key={item}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </MarketingCard>
          <MarketingCard className="ppt-core-list-card">
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
              What seller handles
            </h2>
            <ul className="mt-5 grid gap-3">
              {sellerHandles.map((item) => (
                <li className="ppt-core-check-row" key={item}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </MarketingCard>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Pricing FAQ"
        intro="The Phase 1 model is intentionally clear: PayPerTap handles the booking fee, not full seller payments."
      >
        <FAQBlock items={pricingFaqs} />
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
