import { ComparisonTable } from "../../components/marketing/ComparisonTable";
import { CTASection } from "../../components/marketing/CTASection";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { StepList } from "../../components/marketing/StepList";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";

export function HowItWorksPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/how-it-works"
        title="How PayPerTap Works"
        description="Learn how PayPerTap helps Instagram and WhatsApp sellers use a fixed Rs. 20 verified booking flow."
        jsonLd={[
          breadcrumbListSchema([
            { name: "Home", path: "/" },
            { name: "How it works", path: "/how-it-works" },
          ]),
        ]}
      />
      <SectionHeader
        eyebrow="How it works"
        h1="From product link to WhatsApp confirmation"
        subtitle="PayPerTap keeps the buyer journey clear: browse, book with Rs. 20, then continue with the seller on WhatsApp."
      />
      <MarketingSection>
        <StepList />
      </MarketingSection>
      <MarketingSection
        title="Seller flow and buyer flow"
        intro="The seller stays in control of products and fulfillment, while the buyer gets a clearer booking path before WhatsApp."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h2 className="text-2xl font-medium tracking-[-0.04em] text-neutral-950">
              Seller flow
            </h2>
            <ol className="mt-4 grid gap-3 text-sm leading-6 text-neutral-600">
              <li>1. Create a storefront and add products.</li>
              <li>2. Share the store link on Instagram or WhatsApp.</li>
              <li>3. Receive buyer context after the fixed Rs. 20 booking.</li>
              <li>4. Confirm delivery and collect remaining payment directly.</li>
            </ol>
          </MarketingCard>
          <MarketingCard>
            <h2 className="text-2xl font-medium tracking-[-0.04em] text-neutral-950">
              Buyer flow
            </h2>
            <ol className="mt-4 grid gap-3 text-sm leading-6 text-neutral-600">
              <li>1. Open the seller's PayPerTap storefront.</li>
              <li>2. Choose a product and pay the fixed Rs. 20 booking fee.</li>
              <li>3. Continue to WhatsApp with order details prefilled.</li>
              <li>4. Pay the remaining amount directly to the seller.</li>
            </ol>
          </MarketingCard>
        </div>
      </MarketingSection>
      <MarketingSection title="PayPerTap does not replace your seller workflow">
        <ComparisonTable />
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
