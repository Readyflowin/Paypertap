import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingCard } from "./MarketingCard";
import { MarketingSection } from "./MarketingSection";

type TopCreateStoreCTAProps = {
  title?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
};

export function TopCreateStoreCTA({
  title = "Ready to create your booking store?",
  secondaryLabel = "See how it works",
  secondaryTo = "/how-it-works",
}: TopCreateStoreCTAProps) {
  return (
    <MarketingSection className="ppt-core-page-section">
      <MarketingCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-extrabold tracking-[-0.03em] text-neutral-950">
          {title}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link to="/auth" className="ppt-primary-link inline-flex w-fit items-center gap-2">
            Create your store <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <Link to={secondaryTo} className="ppt-secondary-link">
            {secondaryLabel}
          </Link>
        </div>
      </MarketingCard>
    </MarketingSection>
  );
}
