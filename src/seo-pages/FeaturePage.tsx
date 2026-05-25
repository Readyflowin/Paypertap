import { SeoClusterPageTemplate } from "../components/marketing/SeoClusterPageTemplate";
import { featureContent } from "./featureContent";
import { type FeatureSlug } from "./seoPageTypes";

export function FeaturePage({ slug }: { slug: FeatureSlug }) {
  return <SeoClusterPageTemplate eyebrow="Feature" page={featureContent[slug]} />;
}
