import { CTASection } from "../../components/marketing/CTASection";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";

export function PricingPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/pricing"
        title="Pricing"
        description="PayPerTap pricing foundation for verified booking storefronts. Phase 1 uses a fixed Rs. 20 buyer booking fee."
        jsonLd={[
          breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]),
        ]}
      />
      <SectionHeader
        eyebrow="Pricing"
        h1="Simple verified booking for social sellers"
        subtitle="In Phase 1, buyers pay a fixed Rs. 20 booking fee on PayPerTap. Sellers collect the remaining amount directly from buyers."
      />
      <MarketingSection>
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Buyer booking
            </p>
            <p className="mt-3 text-5xl font-medium tracking-[-0.06em] text-neutral-950">
              ₹20
            </p>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Fixed platform verified-booking fee. This does not go to the seller in
              Phase 1.
            </p>
          </MarketingCard>
          <MarketingCard>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Remaining amount
            </p>
            <p className="mt-3 text-3xl font-medium tracking-[-0.04em] text-neutral-950">
              Paid directly to seller
            </p>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Seller can collect via WhatsApp, UPI, COD, or their existing process.
              PayPerTap is not a payment gateway in Phase 1.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
