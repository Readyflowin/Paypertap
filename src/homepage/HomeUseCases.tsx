import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingCard } from "../components/marketing/MarketingCard";
import { MarketingSection } from "../components/marketing/MarketingSection";

const useCases = [
  {
    alt: "Thrift clothing rack with neutral pieces",
    benefit: "Reserve pieces before moving the chat to WhatsApp.",
    image:
      "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=900&q=80",
    pain: "Drop comments and DMs arrive faster than the seller can sort.",
    path: "/for/thrift-sellers",
    title: "Instagram thrift sellers",
  },
  {
    alt: "Phone showing social commerce messages",
    benefit: "Share one link instead of forwarding product photos repeatedly.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    pain: "Catalogs and order details live inside long chat threads.",
    path: "/for/whatsapp-sellers",
    title: "WhatsApp resellers",
  },
  {
    alt: "Boutique clothing and accessories on display",
    benefit: "Show collections, product pages, and booking context in one place.",
    image:
      "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=900&q=80",
    pain: "Customers want boutique-level clarity before they commit.",
    path: "/for/boutiques",
    title: "Boutique owners",
  },
  {
    alt: "Handmade products arranged on a work table",
    benefit: "Let serious buyers reserve without building a full website.",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80",
    pain: "Custom pieces need context, notes, and a warm handoff.",
    path: "/for/handmade-sellers",
    title: "Handmade sellers",
  },
  {
    alt: "Student seller packing a small ecommerce order",
    benefit: "Separate real buyers from casual questions with a small booking step.",
    image:
      "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=900&q=80",
    pain: "Time is limited, and every uncertain chat takes energy.",
    path: "/for/student-sellers",
    title: "Student sellers",
  },
  {
    alt: "Fashion flatlay for an online product drop",
    benefit: "Keep launch-day products organized with reserved buyer details.",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    pain: "Drop-based fashion pages need fast clarity on what is held.",
    path: "/for/instagram-sellers",
    title: "Drop-based fashion pages",
  },
];

export function HomeUseCases() {
  return (
    <MarketingSection
      eyebrow="Built for"
      title="Built for sellers who sell through replies, drops, and quick decisions."
      intro="Use the same social selling motion, with cleaner product discovery and booking intent."
    >
      <div className="ppt-use-case-grid">
        {useCases.map((useCase) => (
          <Link key={useCase.title} to={useCase.path} className="block min-w-0">
            <MarketingCard className="ppt-use-case-card">
              <img
                src={useCase.image}
                alt={useCase.alt}
                loading="lazy"
                decoding="async"
              />
              <div className="ppt-use-case-copy">
                <p>{useCase.title}</p>
                <span>{useCase.pain}</span>
                <strong>{useCase.benefit}</strong>
              </div>
              <ArrowRight size={16} aria-hidden="true" />
            </MarketingCard>
          </Link>
        ))}
      </div>
    </MarketingSection>
  );
}
