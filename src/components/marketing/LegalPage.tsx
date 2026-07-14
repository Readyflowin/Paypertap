import { Link } from "react-router-dom";

import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { MarketingCard } from "./MarketingCard";
import { MarketingSection } from "./MarketingSection";
import { PageTrustMeta } from "./PageTrustMeta";
import { SectionHeader } from "./SectionHeader";

export function LegalPage({
  canonicalPath,
  description,
  directAnswer,
  h1,
  sections,
  title,
}: {
  canonicalPath: string;
  description: string;
  directAnswer: string;
  h1: string;
  sections: Array<{ body: string; title: string }>;
  title: string;
}) {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath={canonicalPath}
        title={title}
        description={description}
        jsonLd={[
          breadcrumbListSchema([{ name: "Home", path: "/" }, { name: h1, path: canonicalPath }]),
        ]}
      />
      <SectionHeader eyebrow="Legal" h1={h1} path={canonicalPath} subtitle={directAnswer} />
      <PageTrustMeta path={canonicalPath} />
      <MarketingSection className="ppt-core-page-section">
        <div className="ppt-legal-article mx-auto grid max-w-4xl gap-4">
          {sections.map((section) => (
            <MarketingCard className="ppt-legal-card" key={section.title}>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                {section.title}
              </h2>
              <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                {section.body}
              </p>
            </MarketingCard>
          ))}
          <MarketingCard className="ppt-legal-card">
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              Where can I read more or get help?
            </h2>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Review common order questions or contact PayPerTap when a storefront
              or Order-flow question needs support.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/faq" className="ppt-secondary-link">FAQ</Link>
              <Link to="/pricing" className="ppt-secondary-link">Pricing</Link>
              <Link to="/contact" className="ppt-secondary-link">Contact</Link>
            </div>
          </MarketingCard>
        </div>
      </MarketingSection>
    </MarketingLayout>
  );
}
