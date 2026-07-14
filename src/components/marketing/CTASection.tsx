import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingPill } from "./MarketingPill";

export function CTASection({
  secondaryTo = "/how-it-works",
  title = "Ready to make your Instagram store feel easier to trust?",
}: {
  secondaryTo?: string;
  title?: string;
}) {
  return (
    <section className="ppt-core-cta-section px-4 py-16 sm:px-6 lg:px-8">
      <div className="ppt-cta-panel relative mx-auto grid w-full max-w-7xl gap-6 overflow-hidden rounded-[32px] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="relative min-w-0">
          <MarketingPill>Start with verified order</MarketingPill>
          <h2 className="mt-4 max-w-2xl text-3xl font-extrabold leading-tight text-neutral-950 sm:text-4xl">
            {title}
          </h2>
          <p className="ppt-home-copy mt-4 max-w-2xl text-sm leading-6 text-[#070707]/50">
            Create a clean storefront, share one link, and let buyers reserve with a fixed
            order via PayPerTap before moving to WhatsApp.
          </p>
        </div>
        <div className="relative flex min-w-0 flex-col gap-3 sm:flex-row lg:flex-col">
          <Link
            to="/auth"
            className="ppt-primary-link inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-5 text-sm font-bold"
          >
            Create your store <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to={secondaryTo}
            className="ppt-secondary-link inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-bold"
          >
            See how order works
          </Link>
        </div>
      </div>
    </section>
  );
}

export const MarketingCtaSection = CTASection;
export const MarketingCTA = CTASection;
