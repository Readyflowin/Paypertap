import { type ComparisonPageContent } from "../../seo-pages/seoPageTypes";
import { ArrowRight, CheckCircle2, Columns3, IndianRupee, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema, MarketingBreadcrumbs } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { comparisonDeepContent } from "../../seo-pages/deepContent";
import { CTASection } from "./CTASection";
import { FAQBlock } from "./FAQBlock";
import { MarketingCard } from "./MarketingCard";
import { MarketingSection } from "./MarketingSection";
import { PageTrustMeta } from "./PageTrustMeta";
import { RelatedLinks } from "./RelatedLinks";

function PageHero({
  h1,
  path,
  summary,
}: {
  h1: string;
  path: string;
  summary: string;
}) {
  return (
    <section className="ppt-seo-hero ppt-comparison-hero relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="relative mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-center">
        <div className="min-w-0">
          <MarketingBreadcrumbs path={path} />
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
          <h2>order-first storefront comparison</h2>
          <div className="ppt-comparison-visual-row">
            <span>Other tool</span>
            <strong>May fit links, catalogs, forms, or full ecommerce.</strong>
          </div>
          <div className="ppt-comparison-visual-row is-paypertap">
            <span>PayPerTap</span>
            <strong>Built for order and WhatsApp handoff.</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComparisonRows({ page }: { page: ComparisonPageContent }) {
  const rows = [...page.rows, ...(comparisonDeepContent[page.path]?.additionalRows ?? [])];

  return (
    <div className="ppt-seo-comparison-table overflow-x-auto rounded-[24px] border backdrop-blur-xl">
      <table className="w-full min-w-[720px] text-left">
        <thead className="ppt-seo-comparison-head text-xs font-bold uppercase tracking-[0.12em]">
          <tr>
            <th className="p-4">Criteria</th>
            <th className="p-4">Other tool</th>
            <th className="p-4">PayPerTap</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="ppt-seo-comparison-row border-t">
              <th className="p-4 text-sm font-bold text-neutral-950">{row.label}</th>
              <td className="p-4 text-sm leading-6 text-neutral-600">{row.other}</td>
              <td className="p-4 text-sm font-semibold leading-6 text-neutral-700">
                {row.paypertap}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ComparisonPageTemplate({ page }: { page: ComparisonPageContent }) {
  const deepContent = comparisonDeepContent[page.path];
  const faqs = deepContent ? [...page.faqs, ...deepContent.extraFaqs] : page.faqs;

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
      <PageHero h1={page.h1} path={page.path} summary={deepContent?.directAnswer ?? page.summary} />
      <PageTrustMeta path={page.path} />

      <MarketingSection className="ppt-core-page-section" title={`What is the honest difference in ${page.h1}?`}>
        <MarketingCard className="ppt-seo-lead-copy">
          <p className="text-lg leading-8 text-neutral-700">{page.whatItIs}</p>
          {deepContent ? (
            <p className="ppt-home-copy mt-5 text-sm leading-7 text-neutral-600">
              {deepContent.source.before}
              <a
                href={deepContent.source.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {deepContent.source.anchor}
              </a>
              {deepContent.source.after}
            </p>
          ) : null}
        </MarketingCard>
      </MarketingSection>

      {deepContent ? (
        <MarketingSection
          className="ppt-core-page-section"
          title="What should sellers compare before choosing?"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {deepContent.answers.map((item) => (
              <MarketingCard key={item.question}>
                <h3 className="text-xl font-bold text-neutral-950">{item.question}</h3>
                <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                  {item.answer}
                </p>
              </MarketingCard>
            ))}
          </div>
        </MarketingSection>
      ) : null}

      {deepContent ? (
        <MarketingSection className="ppt-core-page-section" title={deepContent.enoughTitle}>
          <MarketingCard className="ppt-seo-lead-copy">
            <p className="text-lg leading-8 text-neutral-700">{deepContent.enoughBody}</p>
          </MarketingCard>
        </MarketingSection>
      ) : null}

      <MarketingSection
        className="ppt-core-page-section"
        title="What is each tool best for?"
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

      <MarketingSection className="ppt-core-page-section" title="How does PayPerTap work in this comparison?">
        <div className="ppt-seo-step-grid grid gap-4 md:grid-cols-4">
          {[
            "Seller shares a store or product link.",
            "Buyer books with the wallet charge.",
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

      <MarketingSection
        className="ppt-core-page-section"
        title="How should a seller choose between these workflows?"
        intro="The right answer depends on the job the seller needs the page or tool to perform."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Choose the other tool when its core job matches</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The comparison is not about declaring one product universally superior.
              If the seller mainly needs the other tool&apos;s core job, such as link
              routing, native catalog display, response collection, or broader
              ecommerce setup, that tool may remain the practical choice.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Choose PayPerTap for order-first selling</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap fits when the seller needs product pages, buyer details,
              an order, reserved product context, and a WhatsApp handoff
              before collecting the remaining amount directly from the buyer.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Check the current model payment boundary</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap charges the seller wallet for the order platform per-order charge. It does not
              provide seller payout, split payments, custom seller advances, or full
              checkout settlement. Sellers handle remaining payment and fulfilment.
            </p>
          </MarketingCard>
        </div>
        <MarketingCard className="mt-4">
          <h3 className="text-xl font-bold text-neutral-950">Recommended decision path</h3>
          <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
            Start by naming the seller&apos;s primary problem. If it is visibility
            across several destinations, a link tool can be enough. If it is general
            data collection, a form can be enough. If it is fuller ecommerce
            infrastructure, a commerce platform may fit. If the problem is product
            order before WhatsApp, PayPerTap is the focused option to evaluate.
          </p>
          <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
            Also check how much process the seller is ready to own. PayPerTap leaves
            remaining payment, delivery, returns, exchanges, and buyer communication
            with the seller. That is useful for sellers who already close directly,
            but it is not enough for merchants expecting the software to manage the
            whole purchase lifecycle. The comparison is most useful when sellers map
            each tool to a real buyer journey instead of choosing based on category
            labels alone, especially for small teams where every manual follow-up
            step matters for a small seller.
          </p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="What does this comparison not claim?"
        intro="Fair comparisons are most useful when they also name the limits."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">No universal replacement claim</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap is not presented as a replacement for every use of the other
              tool. If that tool&apos;s primary job is the seller&apos;s primary need, the
              seller should keep it in consideration.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">No full checkout claim</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap does not process the full product price, settle seller funds,
              manage shipping, or provide ecommerce infrastructure. The comparison is
              about order before WhatsApp, not full-stack commerce.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">No guaranteed outcome claim</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              An order can organize buyer intent, but it does not guarantee
              final payment, delivery acceptance, repeat purchase, or sales growth.
              Sellers still need clear product and fulfilment communication.
            </p>
          </MarketingCard>
        </div>
        <MarketingCard className="mt-4">
          <h3 className="text-xl font-bold text-neutral-950">Use the comparison with a real seller scenario</h3>
          <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
            A good comparison starts with a concrete selling moment: a buyer asks
            about one item, the seller needs to show product details, the buyer may
            need to reserve the item, and the remaining amount must be confirmed
            somewhere. PayPerTap should be evaluated for that Order-before-chat
            scenario, while the other tool should be evaluated for the job it was
            designed to handle.
          </p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="Where does PayPerTap fit, and where does it not?">
        <MarketingCard className="ppt-seo-example-card">
          <p className="text-lg leading-8 text-neutral-700">{page.honestNote}</p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="What does this look like in practice?">
        <MarketingCard className="ppt-seo-example-card">
          <p className="text-lg leading-8 text-neutral-700">
            {deepContent?.example ??
              "If a buyer asks about one product from Instagram or WhatsApp, PayPerTap lets the seller share a product link first. The buyer sees details, places an order, and then continues to WhatsApp for direct confirmation."}
          </p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="Frequently asked questions">
        <FAQBlock items={faqs} showLink />
      </MarketingSection>

      <RelatedLinks links={page.related} />
      <CTASection title="Compare tools, then choose the flow that fits your sellers" />
    </MarketingLayout>
  );
}
