import { CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";

import { MarketingCard } from "./MarketingCard";

export function StepList() {
  const steps = [
    {
      icon: <MessageCircle size={18} aria-hidden="true" />,
      title: "Seller shares storefront",
      copy: "Add products once and share your PayPerTap link on Instagram bio, stories, and WhatsApp.",
    },
    {
      icon: <ShieldCheck size={18} aria-hidden="true" />,
      title: "Buyer books with Rs. 20",
      copy: "The buyer pays a fixed platform booking fee to show genuine intent and reserve the item.",
    },
    {
      icon: <CheckCircle2 size={18} aria-hidden="true" />,
      title: "WhatsApp conversation continues",
      copy: "Buyer details and product context are carried into WhatsApp so seller can confirm next steps.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {steps.map((step) => (
        <MarketingCard key={step.title}>
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-[0_12px_28px_rgba(124,58,237,0.22)]">
            {step.icon}
          </div>
          <h3 className="text-lg font-bold tracking-[-0.02em] text-neutral-950">
            {step.title}
          </h3>
          <p className="ppt-home-copy mt-3 text-sm leading-6">{step.copy}</p>
        </MarketingCard>
      ))}
    </div>
  );
}
