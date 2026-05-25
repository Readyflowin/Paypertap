import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { CTASection } from "../../components/marketing/CTASection";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";

export function AboutPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/about"
        title="About PayPerTap"
        description="PayPerTap is an India-first verified booking storefront built for Instagram and WhatsApp sellers."
        jsonLd={[breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])]}
      />
      <SectionHeader
        eyebrow="About"
        h1="India-first verified booking storefronts"
        subtitle="PayPerTap helps Instagram and WhatsApp sellers reduce fake buyers, organize product discovery, and move serious buyers into WhatsApp."
      />
      <MarketingSection>
        <div className="grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h2 className="text-2xl font-medium tracking-[-0.04em] text-neutral-950">
              Built for social commerce
            </h2>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              Many Indian sellers already sell through Instagram posts, WhatsApp chats,
              UPI, and COD. PayPerTap adds a clean storefront and verified booking layer
              without forcing a full ecommerce migration.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h2 className="text-2xl font-medium tracking-[-0.04em] text-neutral-950">
              Not a payment gateway in Phase 1
            </h2>
            <p className="mt-4 text-sm leading-7 text-neutral-600">
              The buyer pays a fixed Rs. 20 booking fee on PayPerTap. The seller does
              not receive that fee in Phase 1 and collects the remaining product amount
              directly from the buyer.
            </p>
          </MarketingCard>
        </div>
        <div className="mt-4">
          <MarketingCard>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-medium tracking-[-0.04em] text-neutral-950">
                  Founder of PayPerTap
                </h2>
                <p className="mt-3 text-sm leading-7 text-neutral-600">
                  Learn why Aditya started PayPerTap for Indian Instagram and
                  WhatsApp sellers.
                </p>
              </div>
              <Link
                to="/founder"
                className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-950"
              >
                Founder of PayPerTap <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </MarketingCard>
        </div>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
