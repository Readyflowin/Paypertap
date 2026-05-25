import { ArrowRight, CheckCircle2, Columns3 } from "lucide-react";
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
        title="Compare PayPerTap With Linktree, WhatsApp Catalog, Google Forms and Shopify Starter"
        description="Compare PayPerTap with popular selling tools and choose the right storefront, booking, and WhatsApp handoff flow for Indian social sellers."
        jsonLd={[
          breadcrumbListSchema([
            { name: "Home", path: "/" },
            { name: "Compare PayPerTap With Other Selling Tools", path: "/compare" },
          ]),
        ]}
      />
      <SectionHeader
        eyebrow="Compare"
        h1="Compare PayPerTap with other selling tools."
        subtitle="PayPerTap is a verified booking storefront for sellers who need product links, Rs. 20 booking, and WhatsApp handoff instead of only generic links, catalogs, forms, or full ecommerce setup."
      />
      <MarketingSection
        className="ppt-core-page-section"
        title="Choose the right selling tool"
        intro="Each tool has a place. These comparisons explain when PayPerTap fits better for social sellers without pretending every competitor solves the same job."
      >
        <div className="ppt-compare-hub-grid grid gap-4 md:grid-cols-2">
          {comparisonPages.map((page) => (
            <MarketingCard className="ppt-compare-hub-card" key={page.path}>
              <div className="ppt-core-icon-tile">
                <Columns3 size={19} aria-hidden="true" />
              </div>
              <p className="mt-5 text-xl font-bold tracking-[-0.03em] text-neutral-950">
                {page.h1}
              </p>
              <p className="ppt-home-copy mt-3 text-sm leading-6 text-neutral-600">
                {page.summary}
              </p>
              <div className="ppt-compare-best-for mt-5">
                <CheckCircle2 size={15} aria-hidden="true" />
                <span>{page.bestFor[0]}</span>
              </div>
              <Link to={page.path} className="ppt-link-pill mt-5">
                Read comparison <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>
      <MarketingSection className="ppt-core-page-section" title="Quick comparison">
        <ComparisonTable />
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
