import { CTASection } from "../components/marketing/CTASection";
import { MarketingLayout } from "../layout/MarketingLayout";
import { breadcrumbListSchema } from "../seo/breadcrumbs";
import { Seo } from "../seo/Seo";
import { organizationSchema, webApplicationSchema, websiteSchema } from "../seo/schema";
import { HeroSection } from "./HeroSection";
import { HomeBuyerFlow } from "./HomeBuyerFlow";
import { HomeCapabilityRail } from "./HomeCapabilityRail";
import { HomeDashboardPreview } from "./HomeDashboardPreview";
import { HomeFAQPreview } from "./HomeFAQPreview";
import { HomeFeatureGrid } from "./HomeFeatureGrid";
import { HomeFounderBlock } from "./HomeFounderBlock";
import { HomeHowItWorks } from "./HomeHowItWorks";
import { HomePricingPreview } from "./HomePricingPreview";
import { HomeProblemSection } from "./HomeProblemSection";
import { HomeUseCases } from "./HomeUseCases";

export function HomePage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/"
        title="PayPerTap | Verified order Storefront"
        description="PayPerTap helps Indian Instagram and WhatsApp sellers create order storefronts, verify buyer intent, and continue order confirmation on WhatsApp."
        jsonLd={[
          organizationSchema(),
          websiteSchema(),
          webApplicationSchema(),
          breadcrumbListSchema([{ name: "Home", path: "/" }]),
        ]}
      />
      <HeroSection />
      <HomeCapabilityRail />
      <HomeProblemSection />
      <HomeHowItWorks />
      <HomeFeatureGrid />
      <HomeUseCases />
      <HomeBuyerFlow />
      <HomeDashboardPreview />
      <HomePricingPreview />
      <HomeFounderBlock />
      <HomeFAQPreview />
      <CTASection />
    </MarketingLayout>
  );
}

export default HomePage;
