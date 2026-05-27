import { ArrowRight, IndianRupee, MessageCircle, ReceiptText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { CTASection } from "../../components/marketing/CTASection";
import { FAQBlock } from "../../components/marketing/FAQBlock";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { PageTrustMeta } from "../../components/marketing/PageTrustMeta";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { TopCreateStoreCTA } from "../../components/marketing/TopCreateStoreCTA";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { marketingFaqs } from "../faq/faqContent";

const responsibilityRows = [
  ["Payment", "Fixed ₹20 platform verified-booking fee", "Product price or remaining amount"],
  ["Record", "Booking record and buyer details", "Final payment method and confirmation"],
  ["Conversation", "WhatsApp handoff context", "Direct buyer conversation and delivery confirmation"],
  ["After purchase", "Support for booking-flow issues", "Returns and exchanges according to seller policy"],
];

const pricingFaqs = marketingFaqs.filter((item) =>
  [
    "How does the ₹20 booking work?",
    "Does the seller receive the ₹20?",
    "Who collects the remaining product amount?",
    "Is PayPerTap a payment gateway?",
    "Does PayPerTap provide seller payouts?",
    "Do sellers need payout KYC in Phase 1?",
    "Can sellers use UPI, Google Pay, PhonePe, or COD?",
    "Can sellers change the booking amount in Phase 1?",
    "Can buyers cancel a booking?",
  ].includes(item.question),
);

export function PricingPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/pricing"
        title="PayPerTap Pricing | ₹20 Booking for Instagram & WhatsApp Sellers"
        description="PayPerTap pricing is simple: buyers pay a fixed ₹20 booking fee, sellers collect the remaining amount directly, and no seller payout setup is needed."
        jsonLd={[
          breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]),
        ]}
      />
      <SectionHeader
        eyebrow="Pricing"
        h1="Simple pricing for verified bookings."
        path="/pricing"
        subtitle="PayPerTap uses a booking-first model. Buyers pay a fixed ₹20 booking via PayPerTap to reserve a product, and PayPerTap keeps it as the platform verified-booking fee in Phase 1. The seller does not receive the ₹20 and collects the remaining amount directly."
      />
      <PageTrustMeta path="/pricing" />
      <TopCreateStoreCTA />
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
              ₹20
            </p>
            <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
              Who pays the ₹20 booking?
            </h2>
            <p className="ppt-home-copy mt-4 text-sm leading-7 text-neutral-600">
              The buyer pays the fixed PayPerTap platform verified-booking fee to
              reserve the item. The seller does not receive this ₹20 in Phase 1.
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
                  Who collects the remaining amount?
                </h2>
                <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                  The seller collects it directly through WhatsApp, UPI, COD, or
                  their preferred process. PayPerTap is not a full payment gateway.
                </p>
              </div>
            </MarketingCard>

            <div className="grid gap-4 md:grid-cols-2">
              <MarketingCard>
                <ShieldCheck className="text-neutral-950" size={22} aria-hidden="true" />
                <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-neutral-950">
                  Is payout setup required?
                </h2>
                <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                  No seller payout setup is needed in Phase 1 because PayPerTap does
                  not pay the ₹20 to sellers or settle their remaining payment.
                </p>
              </MarketingCard>
              <MarketingCard>
                <ReceiptText className="text-neutral-950" size={22} aria-hidden="true" />
                <h2 className="mt-4 text-xl font-extrabold tracking-[-0.03em] text-neutral-950">
                  What is recorded?
                </h2>
                <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                  PayPerTap records booking and buyer context before the seller
                  continues payment and delivery confirmation directly.
                </p>
              </MarketingCard>
            </div>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="What does PayPerTap handle, and what does the seller handle?"
        intro="The booking layer is intentionally limited, so sellers can keep their existing WhatsApp workflow while buyers understand where each payment goes."
      >
        <div className="ppt-core-comparison overflow-hidden rounded-[24px] border backdrop-blur-xl">
          <table className="w-full text-left">
            <thead className="ppt-core-comparison-head text-xs font-bold uppercase tracking-[0.12em]">
              <tr>
                <th className="p-4">Part of order</th>
                <th className="p-4">PayPerTap handles</th>
                <th className="p-4">Seller handles</th>
              </tr>
            </thead>
            <tbody>
              {responsibilityRows.map(([part, paypertap, seller]) => (
                <tr className="ppt-core-comparison-row border-t" key={part}>
                  <th className="min-w-0 p-4 text-sm font-bold text-neutral-950">{part}</th>
                  <td className="min-w-0 p-4 text-sm leading-6 text-neutral-700">{paypertap}</td>
                  <td className="min-w-0 p-4 text-sm leading-6 text-neutral-700">{seller}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Is PayPerTap a full payment gateway?"
        intro="No. Phase 1 is built around one fixed verified-booking fee and a direct seller-buyer completion flow."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">No seller payout or split payment</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap keeps the fixed ₹20 fee. It does not remit that fee to the
              seller, split a larger payment, or configure a custom seller advance.
              Final product payment remains the seller&apos;s direct process.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Compare setup models carefully</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Other products serve different needs: official guidance describes the{" "}
              <a
                href="https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan"
                target="_blank"
                rel="noopener noreferrer"
              >
                Shopify Starter plan
              </a>{" "}
              as a way to sell through social media or messaging apps using product
              links. PayPerTap remains a booking-first storefront, not a full replacement.
            </p>
          </MarketingCard>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/how-it-works" className="ppt-secondary-link">How it works</Link>
          <Link to="/faq" className="ppt-secondary-link">Read FAQ</Link>
          <Link to="/refund-cancellation" className="ppt-secondary-link">Refund policy</Link>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Pricing FAQ"
        intro="The booking model is intentionally clear: PayPerTap handles the ₹20 booking fee, not full seller payments."
      >
        <FAQBlock items={pricingFaqs} />
      </MarketingSection>
      <MarketingSection
        className="ppt-core-page-section"
        title="How should a seller explain the ₹20 booking?"
        intro="Clear wording at the link-sharing stage helps buyers understand that booking and final product payment are separate."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Before a buyer books</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              A seller can describe PayPerTap as a fixed ₹20 verified-booking step
              that reserves the selected item. The buyer should also be able to see
              the product price and understand that the balance will be agreed and
              paid directly to the seller after WhatsApp handoff.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">After a buyer books</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The seller receives booking context for follow-up, not a PayPerTap
              payout. The seller confirms delivery and remaining payment with the
              buyer, and communicates their own return, exchange, cancellation, and
              COD or UPI terms before completing the order.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
