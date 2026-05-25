import { type ComparisonPageContent } from "../../seo-pages/seoPageTypes";
import { ArrowRight, CheckCircle2, Columns3, IndianRupee, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { CTASection } from "./CTASection";
import { FAQBlock } from "./FAQBlock";
import { MarketingCard } from "./MarketingCard";
import { MarketingSection } from "./MarketingSection";
import { RelatedLinks } from "./RelatedLinks";

function PageHero({
  h1,
  summary,
}: {
  h1: string;
  summary: string;
}) {
  return (
    <section className="ppt-seo-hero ppt-comparison-hero relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="relative mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-center">
        <div className="min-w-0">
          <p className="ppt-marketing-pill mb-4 inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-bold uppercase">
            Comparison
          </p>
          <h1 className="ppt-page-title max-w-5xl text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-neutral-950 sm:text-6xl lg:text-7xl">
            {h1}
          </h1>
          <div className="ppt-seo-summary-card mt-6 max-w-3xl rounded-[24px] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-500">
              Balanced take
            </p>
            <p className="ppt-home-copy mt-2 text-lg leading-8 text-neutral-700">
              {summary}
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/auth" className="ppt-primary-link">
              Create your store <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/compare" className="ppt-secondary-link">
              View all comparisons
            </Link>
          </div>
        </div>
        <div className="ppt-comparison-visual-card min-w-0">
          <div className="ppt-core-icon-tile">
            <Columns3 size={22} aria-hidden="true" />
          </div>
          <h2>Booking-first storefront comparison</h2>
          <div className="ppt-comparison-visual-row">
            <span>Other tool</span>
            <strong>May fit links, catalogs, forms, or full ecommerce.</strong>
          </div>
          <div className="ppt-comparison-visual-row is-paypertap">
            <span>PayPerTap</span>
            <strong>Built for Rs. 20 booking and WhatsApp handoff.</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonRows({ page }: { page: ComparisonPageContent }) {
  return (
    <div className="ppt-seo-comparison-table overflow-hidden rounded-[24px] border backdrop-blur-xl">
      <div className="ppt-seo-comparison-head grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-b text-xs font-bold uppercase tracking-[0.12em]">
        <div className="min-w-0 p-4">Criteria</div>
        <div className="min-w-0 p-4">Other tool</div>
        <div className="min-w-0 p-4">PayPerTap</div>
      </div>
      {page.rows.map((row) => (
        <div
          key={row.label}
          className="ppt-seo-comparison-row grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)] border-b last:border-b-0"
        >
          <div className="min-w-0 break-words p-4 text-sm font-bold text-neutral-950">
            {row.label}
          </div>
          <div className="min-w-0 break-words p-4 text-sm leading-6 text-neutral-500">
            {row.other}
          </div>
          <div className="min-w-0 break-words p-4 text-sm font-semibold leading-6 text-neutral-700">
            {row.paypertap}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ComparisonPageTemplate({ page }: { page: ComparisonPageContent }) {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath={page.path}
        title={page.title}
        description={page.description}
        jsonLd={[
          breadcrumbListSchema([
            { name: "Home", path: "/" },
            { name: page.h1, path: page.path },
          ]),
        ]}
      />
      <PageHero h1={page.h1} summary={page.summary} />

      <MarketingSection className="ppt-core-page-section" title="What it is">
        <MarketingCard className="ppt-seo-lead-copy">
          <p className="text-lg leading-8 text-neutral-700">{page.whatItIs}</p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Best for"
        intro="A fair split helps sellers choose based on the job they need the tool to do."
      >
        <div className="ppt-comparison-best-grid grid gap-4 md:grid-cols-3">
          {page.bestFor.map((item, index) => (
            <MarketingCard className="ppt-seo-benefit-card" key={item}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <p className="text-sm leading-6 text-neutral-700">
                {index === 0 ? item : item}
              </p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="How PayPerTap works">
        <div className="ppt-seo-step-grid grid gap-4 md:grid-cols-4">
          {[
            "Seller shares a store or product link.",
            "Buyer books with the fixed Rs. 20 fee.",
            "Buyer continues to WhatsApp with context.",
            "Seller collects the remaining amount directly.",
          ].map((step, index) => (
            <MarketingCard className="ppt-core-step-card" key={step}>
              <div className="ppt-core-step-index">Step {index + 1}</div>
              <div className="ppt-core-icon-tile mb-5">
                {index === 1 ? <IndianRupee size={18} aria-hidden="true" /> : null}
                {index === 2 ? <MessageCircle size={18} aria-hidden="true" /> : null}
                {index !== 1 && index !== 2 ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{step}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="Comparison table">
        <ComparisonRows page={page} />
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="Where PayPerTap fits">
        <MarketingCard className="ppt-seo-example-card">
          <p className="text-lg leading-8 text-neutral-700">{page.honestNote}</p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="Practical example">
        <MarketingCard className="ppt-seo-example-card">
          <p className="text-lg leading-8 text-neutral-700">
            If a buyer asks about one product from Instagram or WhatsApp, PayPerTap lets
            the seller share a product link first. The buyer sees details, books with
            Rs. 20, and then continues to WhatsApp for direct confirmation.
          </p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="FAQ">
        <FAQBlock items={page.faqs} showLink />
      </MarketingSection>

      <RelatedLinks links={page.related} />
      <CTASection title="Compare tools, then choose the flow that fits your sellers" />
    </MarketingLayout>
  );
}
