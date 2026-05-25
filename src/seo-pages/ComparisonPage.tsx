import { ComparisonPageTemplate } from "../components/marketing/ComparisonPageTemplate";
import { comparisonContent } from "./comparisonContent";
import { type ComparisonSlug } from "./seoPageTypes";

export function ComparisonPage({ slug }: { slug: ComparisonSlug }) {
  return <ComparisonPageTemplate page={comparisonContent[slug]} />;
}
