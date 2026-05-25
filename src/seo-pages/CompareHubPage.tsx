import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { ComparisonTable } from "../components/marketing/ComparisonTable";
import { CTASection } from "../components/marketing/CTASection";
import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";
import { SectionHeader } from "../components/marketing/SectionHeader";
import { MarketingLayout } from "../layout/MarketingLayout";
import { breadcrumbListSchema } from "../seo/breadcrumbs";
import { Seo } from "../seo/Seo";
import { comparisonContent } from "./comparisonContent";

const comparisonPages = Object.values(comparisonContent);

export function CompareHubPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/compare"
        title="Compare PayPerTap With Other Selling Tools"
        description="Compare PayPerTap with Linktree, WhatsApp Catalog, Google Forms, and Shopify Starter for Instagram and WhatsApp sellers."
        jsonLd={[
          breadcrumbListSchema([
            { name: "Home", path: "/" },
            { name: "Compare PayPerTap With Other Selling Tools", path: "/compare" },
          ]),
        ]}
      />
      <SectionHeader
        eyebrow="Compare"
        h1="Compare PayPerTap With Other Selling Tools"
        subtitle="PayPerTap is a verified booking storefront for sellers who need product links, Rs. 20 booking, and WhatsApp handoff instead of only generic links or forms."
      />
      <MarketingSection
        title="Choose the right selling tool"
        intro="Each tool has a place. These comparisons explain when PayPerTap fits better for social sellers."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {comparisonPages.map((page) => (
            <MarketingCard key={page.path}>
              <p className="text-xl font-bold tracking-[-0.03em] text-neutral-950">
                {page.h1}
              </p>
              <p className="ppt-home-copy mt-3 text-sm leading-6">{page.summary}</p>
              <Link
                to={page.path}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-violet-100 bg-white/70 px-4 py-2 text-sm font-bold text-neutral-950 shadow-[0_12px_28px_rgba(124,58,237,0.08)]"
              >
                Read comparison <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </MarketingCard>
          ))}
          <MarketingCard>
            <p className="text-xl font-bold tracking-[-0.03em] text-neutral-950">
              Future comparisons
            </p>
            <p className="ppt-home-copy mt-3 text-sm leading-6">
              Instamojo, Dukaan, Gumroad, PDF catalogs, and native Instagram bio links
              can be added later when those pages have enough unique content.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>
      <MarketingSection title="Quick comparison">
        <ComparisonTable />
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
