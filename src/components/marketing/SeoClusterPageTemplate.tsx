import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { CTASection } from "./CTASection";
import { FAQBlock } from "./FAQBlock";
import { MarketingCard } from "./MarketingCard";
import { MarketingSection } from "./MarketingSection";
import { RelatedLinks } from "./RelatedLinks";
import { type SeoPageContent } from "../../seo-pages/seoPageTypes";

function PageHero({
  eyebrow,
  h1,
  summary,
}: {
  eyebrow: string;
  h1: string;
  summary: string;
}) {
  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="relative mx-auto w-full max-w-7xl">
        <p className="mb-4 inline-flex rounded-full border border-violet-100 bg-white/64 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-600 shadow-[0_12px_30px_rgba(124,58,237,0.08)] backdrop-blur-xl">
          {eyebrow}
        </p>
        <h1 className="max-w-5xl text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-neutral-950 sm:text-6xl lg:text-7xl">
          {h1}
        </h1>
        <div className="mt-6 max-w-3xl rounded-[24px] border border-violet-100 bg-white/72 p-5 shadow-[0_18px_48px_rgba(124,58,237,0.08)] backdrop-blur-xl">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-violet-500">
            Short answer
          </p>
          <p className="ppt-home-copy mt-2 text-lg leading-8">{summary}</p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/auth"
            className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-bold text-white shadow-[0_14px_30px_rgba(13,13,20,0.16)] transition hover:-translate-y-0.5 hover:bg-[#1a1a40]"
          >
            Create Your Store <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to="/how-it-works"
            className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full border border-violet-100 bg-white/70 px-6 text-sm font-bold text-neutral-950 shadow-[0_12px_28px_rgba(124,58,237,0.08)]"
          >
            See How Booking Works
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SeoClusterPageTemplate({
  eyebrow,
  page,
}: {
  eyebrow: string;
  page: SeoPageContent;
}) {
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
      <PageHero eyebrow={eyebrow} h1={page.h1} summary={page.summary} />

      <MarketingSection title="What it is">
        <MarketingCard>
          <p className="text-lg leading-8 text-neutral-700">{page.whatItIs}</p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection title="How it works">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {page.howItWorks.map((step, index) => (
            <MarketingCard key={step}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                Step {index + 1}
              </p>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{step}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection title="Benefits">
        <div className="grid gap-4 md:grid-cols-2">
          {page.benefits.map((benefit) => (
            <MarketingCard key={benefit}>
              <p className="text-sm leading-6 text-neutral-700">{benefit}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection title="Practical example">
        <MarketingCard>
          <p className="text-lg leading-8 text-neutral-700">{page.example}</p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection title="FAQ">
        <FAQBlock items={page.faqs} showLink />
      </MarketingSection>

      <RelatedLinks links={page.related} />
      <CTASection title="Create a PayPerTap store link for serious buyers" />
    </MarketingLayout>
  );
}
