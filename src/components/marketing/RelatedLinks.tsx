import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingSection } from "./MarketingSection";
import { type RelatedLink } from "../../seo-pages/seoPageTypes";

export const howItWorksLink: RelatedLink = {
  label: "See how booking works",
  path: "/how-it-works",
};

export const createStoreLink: RelatedLink = {
  label: "Create Your Store",
  path: "/auth",
};

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  const allLinks = [...links, howItWorksLink];

  return (
    <MarketingSection title="Related pages" intro="Keep exploring the PayPerTap selling flow.">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {allLinks.map((link) => (
          <Link
            key={`${link.path}-${link.label}`}
            to={link.path}
            className="min-w-0 rounded-2xl border border-violet-100 bg-white/72 p-4 text-sm font-bold text-neutral-950 shadow-[0_12px_32px_rgba(124,58,237,0.06)] backdrop-blur-xl"
          >
            <span className="break-words">{link.label}</span>
            <ArrowRight className="mt-4 text-violet-400" size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </MarketingSection>
  );
}
