import { CTASection } from "../components/marketing/CTASection";
import { MarketingLayout } from "../layout/MarketingLayout";
import { breadcrumbListSchema } from "../seo/breadcrumbs";
import { Seo } from "../seo/Seo";
import { organizationSchema, websiteSchema } from "../seo/schema";
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
        title="Turn Followers Into Customers With a Rs. 20 Booking Advance"
        description="Create a branded storefront for Instagram and WhatsApp. Buyers pay a fixed Rs. 20 booking, then continue to WhatsApp with order details prefilled."
        jsonLd={[
          organizationSchema(),
          websiteSchema(),
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
