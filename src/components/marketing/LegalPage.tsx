import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { MarketingCard } from "./MarketingCard";
import { MarketingSection } from "./MarketingSection";
import { SectionHeader } from "./SectionHeader";

export function LegalPage({
  canonicalPath,
  description,
  h1,
  sections,
  title,
}: {
  canonicalPath: string;
  description: string;
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
      <SectionHeader eyebrow="Legal" h1={h1} subtitle={description} />
      <MarketingSection>
        <div className="grid gap-4">
          {sections.map((section) => (
            <MarketingCard key={section.title}>
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-neutral-600">{section.body}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>
    </MarketingLayout>
  );
}
