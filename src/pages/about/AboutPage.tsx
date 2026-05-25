import { ArrowRight, Link2, MessageCircle, ShieldCheck, Store } from "lucide-react";
import { Link } from "react-router-dom";

import { CTASection } from "../../components/marketing/CTASection";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";

const audience = [
  "Instagram sellers",
  "WhatsApp sellers",
  "Thrift stores",
  "Boutiques and handmade brands",
];

export function AboutPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/about"
        title="About PayPerTap | Verified Booking Storefront for Social Sellers"
        description="PayPerTap is an India-first verified booking storefront for Instagram and WhatsApp sellers who want product links, Rs. 20 booking, and WhatsApp handoff."
        jsonLd={[breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])]}
      />
      <SectionHeader
        eyebrow="About"
        h1="Built for India's Instagram and WhatsApp sellers."
        subtitle="PayPerTap is a verified booking storefront for Indian social sellers. It turns scattered attention into organized product discovery, Rs. 20 booking, and WhatsApp-ready buyer conversations."
      />
      <MarketingSection className="ppt-core-page-section">
        <div className="ppt-about-story-grid grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <MarketingCard className="ppt-about-lead-card">
            <div className="ppt-core-icon-tile">
              <Store size={22} aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.05em] text-neutral-950">
              What PayPerTap is
            </h2>
            <p className="ppt-home-copy mt-4 text-sm leading-7 text-neutral-600">
              PayPerTap is a verified booking storefront for Indian Instagram and
              WhatsApp sellers. It gives sellers a clean product link and gives buyers
              a simple Rs. 20 booking step before the conversation continues.
            </p>
          </MarketingCard>
          <div className="grid gap-4">
            <MarketingCard>
              <ShieldCheck className="text-neutral-950" size={22} aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                Why verified booking exists
              </h2>
              <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                Sellers lose time when buyers ask for holds and disappear. A small
                verified booking step helps separate serious buyers from casual DMs.
              </p>
            </MarketingCard>
            <MarketingCard>
              <MessageCircle className="text-neutral-950" size={22} aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                Why WhatsApp handoff matters
              </h2>
              <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                Indian sellers already close details on WhatsApp, UPI, COD, or their
                own process. PayPerTap adds structure without forcing a full ecommerce migration.
              </p>
            </MarketingCard>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Who PayPerTap is for"
        intro="The product is shaped around sellers who want a cleaner store link without giving up their direct buyer relationship."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {audience.map((item) => (
            <MarketingCard className="ppt-core-mini-card" key={item}>
              <Link2 size={18} aria-hidden="true" />
              <strong>{item}</strong>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section">
        <MarketingCard className="ppt-founder-link-card">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Founder story
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-neutral-950">
              Meet the founder of PayPerTap
            </h2>
            <p className="ppt-home-copy mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
              Learn why Aditya started PayPerTap for Indian Instagram and WhatsApp sellers.
            </p>
          </div>
          <Link
            to="/founder"
            className="ppt-secondary-link inline-flex w-fit items-center gap-2"
          >
            Founder of PayPerTap <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </MarketingCard>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
