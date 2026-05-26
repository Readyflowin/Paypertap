import { ArrowRight, Link2, MessageCircle, ShieldCheck, Store } from "lucide-react";
import { Link } from "react-router-dom";

import { CTASection } from "../../components/marketing/CTASection";
import { FAQBlock } from "../../components/marketing/FAQBlock";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { PageTrustMeta } from "../../components/marketing/PageTrustMeta";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { marketingFaqs } from "../faq/faqContent";

const audience = [
  "Instagram sellers",
  "WhatsApp sellers",
  "Thrift stores",
  "Boutiques and handmade brands",
];

const aboutFaqs = marketingFaqs.filter((item) =>
  [
    "What is PayPerTap?",
    "Who is PayPerTap for?",
    "How does the ₹20 booking work?",
    "Does the seller receive the ₹20?",
    "Is PayPerTap made for Instagram sellers?",
    "Is PayPerTap useful for WhatsApp sellers?",
    "Is PayPerTap useful for thrift sellers?",
    "Can sellers share direct product links?",
    "Who handles returns and exchanges?",
    "Is PayPerTap a payment gateway?",
  ].includes(item.question),
);

export function AboutPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/about"
        title="About PayPerTap | Verified Booking Storefront for Social Sellers"
        description="PayPerTap is an India-first verified booking storefront for Instagram and WhatsApp sellers who want product links, ₹20 booking, and WhatsApp handoff."
        jsonLd={[breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])]}
      />
      <SectionHeader
        eyebrow="About"
        h1="Built for India's Instagram and WhatsApp sellers."
        path="/about"
        subtitle="PayPerTap is built for small sellers who already find buyers through Instagram, WhatsApp, and social DMs. Instead of forcing a full ecommerce setup, PayPerTap adds a simple booking layer that captures buyer intent before the conversation moves back to WhatsApp."
      />
      <PageTrustMeta path="/about" />
      <MarketingSection className="ppt-core-page-section">
        <div className="ppt-about-story-grid grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <MarketingCard className="ppt-about-lead-card">
            <div className="ppt-core-icon-tile">
              <Store size={22} aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.05em] text-neutral-950">
              What is PayPerTap?
            </h2>
            <p className="ppt-home-copy mt-4 text-sm leading-7 text-neutral-600">
              PayPerTap is a verified booking storefront for Indian Instagram and
              WhatsApp sellers. It gives sellers a clean product link and gives buyers
              a simple ₹20 booking step before the conversation continues.
            </p>
          </MarketingCard>
          <div className="grid gap-4">
            <MarketingCard>
              <ShieldCheck className="text-neutral-950" size={22} aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                Why was PayPerTap built?
              </h2>
              <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                Sellers can spend time repeating product details and discussing holds
                in scattered DMs. A booking-first storefront captures a clear buyer
                action and product context before follow-up begins.
              </p>
            </MarketingCard>
            <MarketingCard>
              <MessageCircle className="text-neutral-950" size={22} aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                Why does PayPerTap keep WhatsApp in the flow?
              </h2>
              <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                Indian sellers already close details on WhatsApp, UPI, COD, or their
                own process. PayPerTap adds structure without forcing a full ecommerce migration.
              </p>
            </MarketingCard>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Who is PayPerTap for?"
        intro="The product is shaped around sellers who want a cleaner store link without giving up their direct buyer relationship."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {audience.map((item) => (
            <MarketingCard className="ppt-core-mini-card" key={item}>
              <Link2 size={18} aria-hidden="true" />
              <strong>{item}</strong>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Why does a lightweight commerce layer matter?"
        intro="Social discovery can stay social while booking information becomes easier to follow."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Built in an India-first context</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Research on{" "}
              <a
                href="https://www.mordorintelligence.com/industry-reports/india-social-commerce-market"
                target="_blank"
                rel="noopener noreferrer"
              >
                India&apos;s social commerce market
              </a>{" "}
              describes growing social-first and mobile-first discovery. PayPerTap is
              designed for sellers already working in that pattern, without claiming
              market performance for the platform itself.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">What is PayPerTap not trying to be?</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              In Phase 1, PayPerTap is not a full payment gateway. The buyer pays a
              fixed ₹20 platform verified-booking fee; the seller receives no payout
              from that fee and collects the remaining product amount directly.
            </p>
          </MarketingCard>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/how-it-works" className="ppt-secondary-link">How it works</Link>
          <Link to="/pricing" className="ppt-secondary-link">Pricing</Link>
          <Link to="/faq" className="ppt-secondary-link">FAQ</Link>
        </div>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section">
        <MarketingCard className="ppt-founder-link-card">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Founder story
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-neutral-950">
              Meet the founder of PayPerTap
            </h2>
            <p className="ppt-home-copy mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
              Learn why Aditya started PayPerTap for Indian Instagram and WhatsApp sellers.
            </p>
          </div>
          <Link
            to="/founder"
            className="ppt-secondary-link inline-flex w-fit items-center gap-2"
          >
            Founder of PayPerTap <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </MarketingCard>
      </MarketingSection>
      <MarketingSection
        className="ppt-core-page-section"
        title="Questions about the booking-first model"
        intro="The short version: PayPerTap adds reservation context and hands completion back to the seller."
      >
        <FAQBlock items={aboutFaqs} />
      </MarketingSection>
      <MarketingSection
        className="ppt-core-page-section"
        title="Why does Phase 1 stay focused?"
        intro="PayPerTap is deliberately narrow about payments so the storefront promise remains easy to understand."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">One booking fee</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Every buyer booking uses the fixed ₹20 PayPerTap platform fee. It is
              not configured by each seller and is not remitted as a seller advance.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">One direct handoff</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The buyer continues to WhatsApp with product and booking context ready,
              keeping the seller&apos;s existing conversation at the centre of fulfilment.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Clear responsibility</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Sellers control remaining payment methods, delivery, and product
              policies. Buyers can see that PayPerTap did not take the full purchase price.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
