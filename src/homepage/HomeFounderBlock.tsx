import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";

export function HomeFounderBlock() {
  return (
    <MarketingSection eyebrow="Founder trust" className="pt-8">
      <MarketingCard className="ppt-founder-card">
        <div className="ppt-founder-avatar">A</div>
        <div className="min-w-0">
          <h2>Built by Aditya for India&apos;s Instagram and WhatsApp sellers.</h2>
          <p className="ppt-home-copy">
            PayPerTap is shaped around the practical flow sellers already use:
            storefront discovery, a small verified booking step, and direct WhatsApp follow-up.
          </p>
        </div>
        <Link to="/founder" className="ppt-link-pill">
          Founder of PayPerTap <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </MarketingCard>
    </MarketingSection>
  );
}
