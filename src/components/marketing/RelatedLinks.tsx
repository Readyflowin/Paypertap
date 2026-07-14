import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingSection } from "./MarketingSection";
import { type RelatedLink } from "../../seo-pages/seoPageTypes";

export const howItWorksLink: RelatedLink = {
  label: "See how order works",
  path: "/how-it-works",
};

const defaultRelatedLinks: RelatedLink[] = [
  { label: "Pricing and order", path: "/pricing" },
  howItWorksLink,
  { label: "Verified order", path: "/features/verified-order" },
  { label: "Link-in-bio storefront", path: "/features/link-in-bio-storefront" },
  { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
  { label: "Compare selling tools", path: "/compare" },
  { label: "FAQ answer hub", path: "/faq" },
];

export const createStoreLink: RelatedLink = {
  label: "Create Your Store",
  path: "/auth",
};

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  const allLinks = [...links, ...defaultRelatedLinks].filter(
    (link, index, all) => all.findIndex((item) => item.path === link.path) === index,
  );

  return (
    <MarketingSection
      className="ppt-core-page-section"
      title="Related pages"
      intro="Keep exploring the PayPerTap selling flow."
    >
      <div className="ppt-related-link-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {allLinks.map((link) => (
          <Link
            key={`${link.path}-${link.label}`}
            to={link.path}
            className="ppt-related-link min-w-0 rounded-2xl p-4 text-sm font-bold text-neutral-950"
          >
            <span className="break-words">{link.label}</span>
            <ArrowRight className="mt-4" size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </MarketingSection>
  );
}
