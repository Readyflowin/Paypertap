import { ArrowRight, CheckCircle2, Columns3 } from "lucide-react";
import { Link } from "react-router-dom";

import { ComparisonTable } from "../components/marketing/ComparisonTable";
import { CTASection } from "../components/marketing/CTASection";
import { FAQBlock } from "../components/marketing/FAQBlock";
import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";
import { PageTrustMeta } from "../components/marketing/PageTrustMeta";
import { SectionHeader } from "../components/marketing/SectionHeader";
import { TopCreateStoreCTA } from "../components/marketing/TopCreateStoreCTA";
import { MarketingLayout } from "../layout/MarketingLayout";
import { breadcrumbListSchema } from "../seo/breadcrumbs";
import { Seo } from "../seo/Seo";
import { comparisonContent } from "./comparisonContent";
import { compareHubFaqs } from "./deepContent";

const comparisonPages = Object.values(comparisonContent);

export function CompareHubPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/compare"
        title="Compare PayPerTap With Linktree, WhatsApp Catalog, Google Forms and Shopify Starter"
        description="Compare PayPerTap with popular selling tools and choose the right storefront, Order, and WhatsApp handoff flow for Indian social sellers."
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
        path="/compare"
        subtitle="PayPerTap is a verified order storefront for sellers who need product links, order, and WhatsApp handoff. Use this hub to compare PayPerTap with link-in-bio tools, WhatsApp Catalog, forms, and Shopify Starter without pretending one tool is right for every seller."
      />
      <PageTrustMeta path="/compare" />
      <TopCreateStoreCTA />
      <MarketingSection
        className="ppt-core-page-section"
        title="Who should compare these tools?"
        intro="The right choice depends on whether a seller needs traffic routing, product display, information collection, full ecommerce, or order before direct chat."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Sellers with product-specific DMs</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              If buyers ask about individual products, prices, and availability,
              compare whether a generic link list or form gives enough context.
              PayPerTap focuses on product pages, order, and WhatsApp handoff.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Sellers choosing between setup models</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Official guidance for{" "}
              <a
                href="https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan"
                target="_blank"
                rel="noopener noreferrer"
              >
                Shopify Starter plan
              </a>{" "}
              describes social and messaging sales through product links. PayPerTap is
              narrower: an order-first layer before direct WhatsApp completion.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Sellers who still close on WhatsApp</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap fits sellers who want to keep final buyer communication,
              delivery, remaining payment, and seller policy in their own WhatsApp
              process after the buyer places an order.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>
      <MarketingSection
        className="ppt-core-page-section"
        title="Which comparison should you read first?"
        intro="Each tool has a place. These comparisons explain when PayPerTap fits a social seller workflow without pretending every competitor solves the same job."
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
      <MarketingSection
        className="ppt-core-page-section"
        title="How should sellers read these comparisons?"
        intro="Start with the seller's real operating problem, then open the comparison that matches that problem."
      >
        <MarketingCard>
          <p className="ppt-home-copy text-sm leading-7 text-neutral-600">
            A seller comparing tools should separate product discovery, Order
            intent, buyer data, payment responsibility, and final communication. A
            tool can be excellent for one layer and not enough for another. PayPerTap
            is strongest when the seller wants product order before WhatsApp, while
            other tools may fit better for broad links, native catalogs, forms, or
            full ecommerce infrastructure. Read the detail pages when the decision
            depends on a specific workflow, such as Linktree for many destinations,
            Google Forms for responses, WhatsApp Catalog for WhatsApp-native product
            display, or Shopify Starter for a broader commerce setup.
          </p>
        </MarketingCard>
      </MarketingSection>
      <MarketingSection
        className="ppt-core-page-section"
        title="When does PayPerTap fit, and when does it not?"
        intro="Use this as the short decision layer before opening the detailed comparison pages."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">PayPerTap fits when</h3>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-neutral-700">
              <li>Buyers need product pages before they message.</li>
              <li>The seller wants an order before WhatsApp follow-up.</li>
              <li>The seller collects the remaining amount directly through UPI, COD, or chat.</li>
              <li>Reservation context matters more than a generic link list.</li>
            </ul>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Another tool may fit when</h3>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-neutral-700">
              <li>The seller mainly needs to share several unrelated links.</li>
              <li>The business wants WhatsApp-native catalog display only.</li>
              <li>The task is collecting survey-style responses, not product Order.</li>
              <li>The merchant needs full ecommerce checkout, payout, or fulfilment infrastructure.</li>
            </ul>
          </MarketingCard>
        </div>
      </MarketingSection>
      <MarketingSection className="ppt-core-page-section" title="Comparison hub FAQ">
        <FAQBlock items={compareHubFaqs} />
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
