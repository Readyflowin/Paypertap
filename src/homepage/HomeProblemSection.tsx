import { Camera, Clock3, MessageSquareText, SearchX, Shuffle, UserRoundX } from "lucide-react";

import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";

const pains = [
  {
    icon: <MessageSquareText size={20} strokeWidth={2.2} />,
    title: "\"Is this available?\" spam",
    copy: "The same question repeats across DMs, comments, and replies.",
  },
  {
    icon: <UserRoundX size={20} strokeWidth={2.2} />,
    title: "Buyers disappear after asking price",
    copy: "Interest looks real until confirmation starts.",
  },
  {
    icon: <Clock3 size={20} strokeWidth={2.2} />,
    title: "Details repeated again and again",
    copy: "Size, price, delivery, and payment become manual typing.",
  },
  {
    icon: <Camera size={20} strokeWidth={2.2} />,
    title: "Screenshots everywhere",
    copy: "Product context gets scattered between gallery and chat.",
  },
  {
    icon: <Shuffle size={20} strokeWidth={2.2} />,
    title: "No clean order list",
    copy: "It is hard to see what is reserved and who followed through.",
  },
  {
    icon: <SearchX size={20} strokeWidth={2.2} />,
    title: "Serious and timepass buyers look the same",
    copy: "Without commitment, every chat asks for the same attention.",
  },
];

export function HomeProblemSection() {
  return (
    <MarketingSection
      eyebrow="The category"
      title="What is PayPerTap?"
      intro="PayPerTap adds an order-first storefront before the seller continues their existing WhatsApp sales conversation."
    >
      <MarketingCard className="mb-5 p-6 sm:p-7">
        <p className="ppt-home-copy max-w-4xl text-sm leading-7 text-neutral-600 sm:text-base">
          India&apos;s{" "}
          <a
            href="https://www.mordorintelligence.com/industry-reports/india-social-commerce-market"
            target="_blank"
            rel="noopener noreferrer"
          >
            social commerce market
          </a>{" "}
          is growing alongside mobile-first product discovery. PayPerTap is designed
          for Instagram and WhatsApp sellers within that context: a buyer sees a
          product link, places a verified order, and returns to the seller&apos;s
          direct conversation for the rest of the purchase.
        </p>
      </MarketingCard>
      <div className="ppt-problem-layout">
        <div className="ppt-problem-grid">
          {pains.map((pain) => (
            <MarketingCard className="ppt-problem-card" key={pain.title}>
              <div className="ppt-problem-icon">{pain.icon}</div>
              <p>{pain.title}</p>
              <span>{pain.copy}</span>
            </MarketingCard>
          ))}
        </div>

        <div className="ppt-dm-stack" aria-label="Messy DM conversation preview">
          <div className="ppt-dm-phone">
            <div className="ppt-dm-top">
              <span />
              <span className="ppt-faux-strong">DMs</span>
              <span />
            </div>
            <div className="ppt-dm-bubble is-left">Available?</div>
            <div className="ppt-dm-bubble is-right">Yes, size M. Rs 1,499.</div>
            <div className="ppt-dm-bubble is-left">COD possible?</div>
            <div className="ppt-dm-bubble is-left">Can you hold till evening?</div>
            <div className="ppt-dm-bubble is-right muted">Screenshot saved again...</div>
            <div className="ppt-dm-note">No order context. No clean list.</div>
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
