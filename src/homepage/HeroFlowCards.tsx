import { Check, ReceiptText, ShieldCheck, UserRoundCheck } from "lucide-react";

import { WhatsAppIcon } from "./HeroBadge";

const flowCards = [
  {
    className: "ppt-hero-float-card--booking",
    icon: <ShieldCheck size={18} strokeWidth={2.2} />,
    title: "₹20 booking via PayPerTap",
    text: "A small step before WhatsApp.",
  },
  {
    className: "ppt-hero-float-card--buyer",
    icon: <UserRoundCheck size={18} strokeWidth={2.2} />,
    title: "Buyer context captured",
    text: "Name, product, notes, and phone stay together.",
  },
  {
    className: "ppt-hero-float-card--whatsapp",
    icon: <WhatsAppIcon size={18} />,
    title: "WhatsApp message ready",
    text: "The handoff carries product context.",
  },
  {
    className: "ppt-hero-float-card--remaining",
    icon: <ReceiptText size={18} strokeWidth={2.2} />,
    title: "Remaining paid directly",
    text: "Seller collects on WhatsApp, UPI, or COD.",
  },
];

export function HeroFlowCards() {
  return (
    <div className="ppt-hero-float-cards" aria-label="PayPerTap booking flow highlights">
      {flowCards.map((card) => (
        <div className={`ppt-hero-float-card ${card.className}`} key={card.title}>
          <div className="ppt-hero-float-icon">{card.icon}</div>
          <div className="min-w-0">
            <p>{card.title}</p>
            <span>{card.text}</span>
          </div>
          <Check className="ppt-hero-float-check" size={14} strokeWidth={3} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
