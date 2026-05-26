import { IndianRupee, Link2, MessageCircle, PackageCheck, UserRoundCheck } from "lucide-react";

import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";

const mechanismSteps = [
  {
    icon: <Link2 size={21} strokeWidth={2.1} />,
    label: "Product link",
    copy: "Seller shares one clean PayPerTap link.",
  },
  {
    icon: <IndianRupee size={21} strokeWidth={2.1} />,
    label: "₹20 booking",
    copy: "Buyer pays ₹20 via PayPerTap to reserve the item.",
  },
  {
    icon: <UserRoundCheck size={21} strokeWidth={2.1} />,
    label: "Buyer details",
    copy: "Name, phone, product, and notes are captured.",
  },
  {
    icon: <MessageCircle size={21} strokeWidth={2.1} />,
    label: "WhatsApp handoff",
    copy: "Buyer continues with a prefilled message.",
  },
  {
    icon: <PackageCheck size={21} strokeWidth={2.1} />,
    label: "Remaining payment to seller",
    copy: "Seller collects the remaining amount directly.",
  },
];

export function HomeHowItWorks() {
  return (
    <MarketingSection
      eyebrow="The mechanism"
      title="How does the ₹20 booking work?"
      intro="The fixed booking records buyer intent and product context, reserves the item in the PayPerTap flow, and hands the buyer back to WhatsApp."
    >
      <MarketingCard className="ppt-mechanism-panel">
        <div className="ppt-mechanism-flow" aria-label="PayPerTap booking mechanism">
          {mechanismSteps.map((step, index) => (
            <div className="ppt-mechanism-step-wrap" key={step.label}>
              <div className="ppt-mechanism-step">
                <div className="ppt-mechanism-index">{String(index + 1).padStart(2, "0")}</div>
                <div className="ppt-mechanism-icon">{step.icon}</div>
                <p>{step.label}</p>
                <span>{step.copy}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="ppt-mechanism-note">
          <strong>Payment clarity:</strong>
          <span>
            PayPerTap keeps the ₹20 as the platform verified-booking fee. The seller
            collects the remaining product amount directly on WhatsApp, UPI, COD, or
            their preferred process.
          </span>
        </div>
      </MarketingCard>
    </MarketingSection>
  );
}
