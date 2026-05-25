import { Mail, MessageCircle, Sparkles } from "lucide-react";

import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";

export function ContactPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/contact"
        title="Contact PayPerTap"
        description="Contact PayPerTap for seller support, partnerships, and press requests."
        jsonLd={[breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]}
      />
      <SectionHeader
        eyebrow="Contact"
        h1="Talk to PayPerTap"
        subtitle="Reach out for seller support, partnerships, press requests, or questions about verified booking storefronts."
      />
      <MarketingSection>
        <div className="grid gap-4 md:grid-cols-3">
          <MarketingCard>
            <Mail size={22} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              Email
            </h2>
            <p className="mt-2 text-sm text-neutral-600">support@paypertap.in</p>
          </MarketingCard>
          <MarketingCard>
            <Sparkles size={22} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              Instagram
            </h2>
            <p className="mt-2 text-sm text-neutral-600">@paypertap</p>
          </MarketingCard>
          <MarketingCard>
            <MessageCircle size={22} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-neutral-950">
              WhatsApp sellers
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Create your store and continue setup from the dashboard.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>
    </MarketingLayout>
  );
}
