import { CheckCircle2, IndianRupee, Link2, MessageCircle, PackageCheck, PackagePlus, Store } from "lucide-react";

import { MarketingCard } from "./MarketingCard";

export function StepList() {
  const steps = [
    {
      icon: <Store size={18} aria-hidden="true" />,
      title: "Create store",
      copy: "Set up a PayPerTap storefront for Instagram and WhatsApp buyers.",
    },
    {
      icon: <PackagePlus size={18} aria-hidden="true" />,
      title: "Add products",
      copy: "Upload product details once instead of repeating them in every DM.",
    },
    {
      icon: <Link2 size={18} aria-hidden="true" />,
      title: "Share link",
      copy: "Put the store or product link in bio, stories, chats, and broadcasts.",
    },
    {
      icon: <IndianRupee size={18} aria-hidden="true" />,
      title: "Buyer books with ₹20",
      copy: "The buyer pays the fixed PayPerTap booking fee to reserve the item.",
    },
    {
      icon: <PackageCheck size={18} aria-hidden="true" />,
      title: "Product is reserved",
      copy: "The booking supplies a reserved item and buyer record for follow-up.",
    },
    {
      icon: <MessageCircle size={18} aria-hidden="true" />,
      title: "WhatsApp handoff",
      copy: "Buyer details move into WhatsApp so the seller can confirm the rest.",
    },
    {
      icon: <CheckCircle2 size={18} aria-hidden="true" />,
      title: "Seller collects directly",
      copy: "The seller collects the remaining amount through UPI, COD, or their usual process.",
    },
    {
      icon: <PackageCheck size={18} aria-hidden="true" />,
      title: "Mark complete",
      copy: "After direct fulfilment, the seller can mark the order sold or complete.",
    },
  ];

  return (
    <div className="ppt-core-stepper grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => (
        <MarketingCard className="ppt-core-step-card" key={step.title}>
          <div className="ppt-core-step-index">{String(index + 1).padStart(2, "0")}</div>
          <div className="ppt-core-icon-tile mb-5 flex h-11 w-11 items-center justify-center rounded-2xl">
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
