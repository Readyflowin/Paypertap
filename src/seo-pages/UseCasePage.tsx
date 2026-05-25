import { SeoClusterPageTemplate } from "../components/marketing/SeoClusterPageTemplate";
import { type UseCaseSlug } from "./seoPageTypes";
import { useCaseContent } from "./useCaseContent";

export function UseCasePage({ slug }: { slug: UseCaseSlug }) {
  return <SeoClusterPageTemplate eyebrow="Use case" page={useCaseContent[slug]} />;
}
