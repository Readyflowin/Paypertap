import { CheckCircle2, IndianRupee, Landmark, ShieldCheck, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";

const pricingFacts = [
  {
    icon: <IndianRupee size={20} strokeWidth={2.2} />,
    title: "Seller wallet covers PayPerTap's per-order charge.",
  },
  {
    icon: <UserCheck size={20} strokeWidth={2.2} />,
    title: "Seller collects remaining amount directly from the buyer.",
  },
  {
    icon: <Landmark size={20} strokeWidth={2.2} />,
    title: "No seller bank settlement setup needed.",
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={2.2} />,
    title: "No complex payment routing or settlement KYC.",
  },
];

export function HomePricingPreview() {
  return (
    <MarketingSection
      eyebrow="Pricing clarity"
      title="What happens after a buyer orders?"
      intro="The seller wallet charge is fixed. Customer payments still stay between buyer and seller."
    >
      <MarketingCard className="ppt-pricing-panel">
        <div className="ppt-pricing-amount">
          <span>Per successful order</span>
          <span className="ppt-faux-strong">Seller wallet</span>
          <p>PayPerTap charges the seller wallet through the platform per-order charge.</p>
        </div>

        <div className="ppt-pricing-route" aria-label="Seller wallet route">
          <div>
            <span>Buyer</span>
            <span className="ppt-faux-strong">Places order</span>
          </div>
          <div>
            <span>PayPerTap</span>
            <span className="ppt-faux-strong">Charges seller wallet</span>
          </div>
          <div>
            <span>Seller</span>
            <span className="ppt-faux-strong">Collects remaining directly</span>
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
