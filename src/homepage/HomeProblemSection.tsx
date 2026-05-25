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
      eyebrow="The DM problem"
      title="Selling through DMs gets messy fast."
      intro="Discovery happens in chats. Confirmation needs a cleaner surface."
    >
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
              <strong>DMs</strong>
              <span />
            </div>
            <div className="ppt-dm-bubble is-left">Available?</div>
            <div className="ppt-dm-bubble is-right">Yes, size M. ₹1,499.</div>
            <div className="ppt-dm-bubble is-left">COD possible?</div>
            <div className="ppt-dm-bubble is-left">Can you hold till evening?</div>
            <div className="ppt-dm-bubble is-right muted">Screenshot saved again...</div>
            <div className="ppt-dm-note">No booking context. No clean list.</div>
          </div>
        </div>
      </div>
    </MarketingSection>
  );
}
