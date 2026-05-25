import { CheckCircle2, IndianRupee, Landmark, ShieldCheck, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";

const pricingFacts = [
  {
    icon: <IndianRupee size={20} strokeWidth={2.2} />,
    title: "Buyer pays fixed ₹20 booking through PayPerTap.",
  },
  {
    icon: <UserCheck size={20} strokeWidth={2.2} />,
    title: "Seller collects remaining amount directly from the buyer.",
  },
  {
    icon: <Landmark size={20} strokeWidth={2.2} />,
    title: "No seller payout setup needed in Phase 1.",
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={2.2} />,
    title: "No split payment complexity or seller payout KYC in Phase 1.",
  },
];

export function HomePricingPreview() {
  return (
    <MarketingSection
      eyebrow="Pricing clarity"
      title="Simple because Phase 1 is a verified booking flow, not a full payment gateway."
      intro="The booking fee is fixed. The remaining product amount stays between buyer and seller."
    >
      <MarketingCard className="ppt-pricing-panel">
        <div className="ppt-pricing-amount">
          <span>Fixed buyer booking</span>
          <strong>₹20</strong>
          <p>PayPerTap keeps this as the platform verified-booking fee.</p>
        </div>

        <div className="ppt-pricing-route" aria-label="Phase 1 payment route">
          <div>
            <span>Buyer</span>
            <strong>Books through PayPerTap</strong>
          </div>
          <div>
            <span>PayPerTap</span>
            <strong>Keeps ₹20 booking fee</strong>
          </div>
          <div>
            <span>Seller</span>
            <strong>Collects remaining directly</strong>
          </div>
        </div>

        <div className="ppt-pricing-facts">
          {pricingFacts.map((fact) => (
            <div className="ppt-pricing-fact" key={fact.title}>
              {fact.icon}
              <span>{fact.title}</span>
            </div>
          ))}
        </div>

        <div className="ppt-pricing-bottom">
          <div>
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>Remaining amount paid directly to seller.</span>
          </div>
          <Link to="/pricing" className="ppt-link-pill">
            View pricing details
          </Link>
        </div>
      </MarketingCard>
    </MarketingSection>
  );
}
