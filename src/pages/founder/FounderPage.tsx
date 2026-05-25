import { useState } from "react";
import { ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";

import { CTASection } from "../../components/marketing/CTASection";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { personSchema } from "../../seo/schema";

function FounderPortrait() {
  const [showImage, setShowImage] = useState(true);

  return (
    <div className="grid aspect-[4/5] min-w-0 place-items-center overflow-hidden rounded-[1.5rem] border border-violet-100 bg-white/64 shadow-[0_18px_48px_rgba(124,58,237,0.08)] backdrop-blur-xl">
      {showImage ? (
        <img
          src="/images/founder/aditya-paypertap-founder.jpg"
          alt="Aditya, founder of PayPerTap"
          onError={() => setShowImage(false)}
          className="h-full w-full max-w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label="Aditya, founder of PayPerTap"
          className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#ffffff,transparent_32%),linear-gradient(135deg,#f5f3ff,#ffffff)] p-6 text-center"
        >
          <div>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-neutral-950 text-2xl font-bold text-white shadow-[0_14px_32px_rgba(13,13,20,0.16)]">
              A
            </div>
            <p className="mt-5 text-sm font-bold text-neutral-800">
              Aditya, founder of PayPerTap
            </p>
            <p className="mt-2 text-xs text-violet-500">Photo coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function FounderPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/founder"
        title="Founder of PayPerTap | Aditya, PayPerTap Founder"
        description="Meet Aditya, founder of PayPerTap, and learn why PayPerTap was started for Indian Instagram and WhatsApp sellers."
        jsonLd={[
          personSchema(),
          breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Founder", path: "/founder" }]),
        ]}
      />
      <SectionHeader
        eyebrow="Founder"
        h1="Founder of PayPerTap"
        subtitle="PayPerTap was started to help Indian social sellers turn serious buyer intent into cleaner WhatsApp conversations."
      >
        <div className="flex flex-wrap gap-3" aria-label="Founder profile links">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-600">
            LinkedIn profile coming soon
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-600">
            Instagram profile coming soon
          </span>
        </div>
      </SectionHeader>

      <MarketingSection>
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="min-w-0 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white p-4 shadow-[0_18px_52px_rgba(15,15,17,0.08)]">
            <FounderPortrait />
          </div>
          <div className="grid gap-4">
            <MarketingCard>
              <h2 className="text-2xl font-medium tracking-[-0.04em] text-neutral-950">
                Who is the founder of PayPerTap?
              </h2>
              <p className="mt-4 text-sm leading-7 text-neutral-600">
                PayPerTap was founded by Aditya with a focus on Indian Instagram and
                WhatsApp sellers who need a practical way to organize product discovery
                and reduce casual fake bookings.
              </p>
            </MarketingCard>
            <MarketingCard>
              <h2 className="text-2xl font-medium tracking-[-0.04em] text-neutral-950">
                Why PayPerTap was started
              </h2>
              <p className="mt-4 text-sm leading-7 text-neutral-600">
                Sellers should not need to chase every DM, repeat every price, or hold
                products for buyers who disappear. PayPerTap adds a small verified
                booking step before the WhatsApp conversation continues.
              </p>
            </MarketingCard>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection title="Mission">
        <MarketingCard>
          <p className="text-xl leading-8 tracking-[-0.02em] text-neutral-800">
            Help social sellers in India convert attention into organized, verified,
            WhatsApp-ready buyer conversations without pretending to be a full payment
            gateway.
          </p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection title="Founder quote">
        <MarketingCard>
          <Quote className="mb-4 text-neutral-300" size={34} aria-hidden="true" />
          <p className="text-2xl font-medium leading-9 tracking-[-0.04em] text-neutral-950">
            “The goal is simple: make selling from Instagram and WhatsApp feel less
            chaotic, while keeping the seller's own relationship with the buyer intact.”
          </p>
          <p className="mt-5 text-sm font-semibold text-neutral-500">Aditya, Founder</p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection title="Contact and press">
        <MarketingCard>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-neutral-600">
              For press, partnerships, or founder profile requests, contact PayPerTap.
            </p>
            <Link
              to="/contact"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Contact PayPerTap <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </MarketingCard>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
