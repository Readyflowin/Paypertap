import { ArrowRight, Mail, Quote, UserRoundCheck } from "lucide-react";
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
import { personSchema } from "../../seo/schema";
import { marketingFaqs } from "../faq/faqContent";

const founderFaqs = marketingFaqs.filter((item) =>
  [
    "What is PayPerTap?",
    "How does the ₹20 booking work?",
    "Does the seller receive the ₹20?",
    "Is PayPerTap made for Instagram sellers?",
    "Is PayPerTap useful for WhatsApp sellers?",
    "Can sellers share direct product links?",
    "Is PayPerTap a payment gateway?",
  ].includes(item.question),
);

function FounderPortrait() {
  return (
    <div
      role="img"
      aria-label="Aditya, founder of PayPerTap"
      className="ppt-founder-portrait grid aspect-[4/5] min-w-0 place-items-center overflow-hidden rounded-[1.5rem] p-6 text-center"
    >
      <div>
        <div className="ppt-founder-initial mx-auto grid h-20 w-20 place-items-center rounded-full text-2xl font-bold">
          A
        </div>
        <p className="mt-5 text-sm font-bold text-neutral-800">
          Aditya, founder of PayPerTap
        </p>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Verified booking storefront founder
        </p>
      </div>
    </div>
  );
}

export function FounderPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/founder"
        title="Founder of PayPerTap | Aditya, PayPerTap Founder"
        description="Meet Aditya, founder of PayPerTap, and learn why PayPerTap was started for Indian Instagram and WhatsApp sellers."
        jsonLd={[
          personSchema(),
          breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Founder", path: "/founder" }]),
        ]}
      />
      <SectionHeader
        eyebrow="Founder"
        h1="Founder of PayPerTap"
        path="/founder"
        subtitle="Aditya is the founder of PayPerTap, a verified booking storefront for Indian Instagram and WhatsApp sellers. PayPerTap was created to help small sellers collect a fixed ₹20 booking and move booked buyers to WhatsApp with order details ready."
      />
      <PageTrustMeta path="/founder" />

      <MarketingSection className="ppt-core-page-section">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div className="ppt-founder-photo-shell min-w-0 overflow-hidden rounded-[2rem] p-4">
            <FounderPortrait />
          </div>
          <div className="grid gap-4">
            <MarketingCard className="ppt-core-card-row">
              <div className="ppt-core-icon-tile">
                <UserRoundCheck size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                  Who is the founder of PayPerTap?
                </h2>
                <p className="ppt-home-copy mt-4 text-sm leading-7 text-neutral-600">
                  Aditya is the founder of PayPerTap. The PayPerTap founder is focused
                  on Indian Instagram and WhatsApp sellers who need a practical way to
                  organize product discovery and record buyer booking intent before handoff.
                </p>
              </div>
            </MarketingCard>
            <MarketingCard>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                Why PayPerTap was started
              </h2>
              <p className="ppt-home-copy mt-4 text-sm leading-7 text-neutral-600">
                Sellers should not need to chase every DM, repeat every price, or hold
                products without booking context. PayPerTap adds a booking-first
                storefront and a fixed ₹20 verified booking before the WhatsApp
                conversation continues.
              </p>
            </MarketingCard>
            <MarketingCard className="ppt-founder-quote-card">
              <Quote className="text-neutral-950" size={28} aria-hidden="true" />
              <p className="mt-4 text-2xl font-extrabold leading-9 tracking-[-0.04em] text-neutral-950">
                "Make selling from Instagram and WhatsApp feel less chaotic, while
                keeping the seller's own relationship with the buyer intact."
              </p>
              <p className="mt-5 text-sm font-semibold text-neutral-500">
                Aditya, founder of PayPerTap
              </p>
            </MarketingCard>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="Mission">
        <MarketingCard className="ppt-founder-mission-card">
          <p className="text-xl leading-8 tracking-[-0.02em] text-neutral-800">
            Help social sellers in India convert attention into organized, verified,
            WhatsApp-ready buyer conversations without pretending to be a full payment
            gateway.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/" className="ppt-secondary-link">
              Home
            </Link>
            <Link to="/about" className="ppt-secondary-link">
              About
            </Link>
            <Link to="/contact" className="ppt-secondary-link">
              Contact
            </Link>
            <Link to="/features/verified-booking" className="ppt-secondary-link">
              Verified booking
            </Link>
          </div>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="What problem is the founder of PayPerTap working on?"
        intro="PayPerTap focuses on social sellers who need more structure between product discovery and direct confirmation."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">A social selling context</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The wider{" "}
              <a
                href="https://www.mordorintelligence.com/industry-reports/india-social-commerce-market"
                target="_blank"
                rel="noopener noreferrer"
              >
                social commerce market
              </a>{" "}
              in India includes growing mobile-first discovery. PayPerTap is Aditya&apos;s
              booking-first storefront approach for Indian Instagram and WhatsApp
              sellers working within that everyday buying pattern.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">A limited Phase 1 promise</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The product records a fixed ₹20 verified booking and prepares a
              WhatsApp handoff. It does not promise full ecommerce settlement:
              sellers receive no payout from that fee and continue remaining payment,
              delivery, and product support directly. This narrow scope is the
              booking-first storefront mission behind PayPerTap.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Founder page booking questions"
        intro="These are the model details PayPerTap aims to communicate plainly."
      >
        <FAQBlock items={founderFaqs} />
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="Contact and press">
        <MarketingCard className="ppt-core-card-row">
          <div className="ppt-core-icon-tile">
            <Mail size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="max-w-2xl text-sm leading-7 text-neutral-600">
              For press, partnerships, or founder profile requests, contact PayPerTap.
            </p>
            <Link
              to="/contact"
              className="ppt-primary-link mt-5 inline-flex w-fit items-center gap-2"
            >
              Contact PayPerTap <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </MarketingCard>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
