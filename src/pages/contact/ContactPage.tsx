import { ArrowRight, HelpCircle, Mail, MessageCircle, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";

const contactCards = [
  {
    icon: <MessageCircle size={20} aria-hidden="true" />,
    title: "Seller support",
    copy: "Questions about setting up a store, adding products, or using the WhatsApp handoff.",
  },
  {
    icon: <Newspaper size={20} aria-hidden="true" />,
    title: "Press or founder contact",
    copy: "For founder profile, product context, partnerships, or media requests.",
  },
  {
    icon: <HelpCircle size={20} aria-hidden="true" />,
    title: "Product questions",
    copy: "Ask how the Rs. 20 booking model, storefront, and Phase 1 limitations work.",
  },
];

export function ContactPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/contact"
        title="Contact PayPerTap | Seller Support, Partnerships and Founder Requests"
        description="Contact PayPerTap for seller support, product questions, partnerships, press, and founder profile requests."
        jsonLd={[breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]}
      />
      <SectionHeader
        eyebrow="Contact"
        h1="Need help with PayPerTap?"
        subtitle="Reach out for seller support, founder or press requests, partnerships, and questions about verified booking storefronts for Instagram and WhatsApp sellers."
      />
      <MarketingSection className="ppt-core-page-section">
        <div className="grid gap-4 md:grid-cols-3">
          {contactCards.map((card) => (
            <MarketingCard className="ppt-contact-card" key={card.title}>
              <div className="ppt-core-icon-tile">{card.icon}</div>
              <h2 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-neutral-950">
                {card.title}
              </h2>
              <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                {card.copy}
              </p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section">
        <MarketingCard className="ppt-contact-mail-card">
          <div className="ppt-core-icon-tile">
            <Mail size={20} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
              Email
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-neutral-950">
              support@paypertap.in
            </h2>
            <p className="ppt-home-copy mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
              Use email for support or product questions. The in-page contact form is not
              connected to a sending backend yet, so email is the current contact path.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="mailto:support@paypertap.in"
                className="ppt-primary-link inline-flex w-fit items-center gap-2"
              >
                Email PayPerTap <ArrowRight size={15} aria-hidden="true" />
              </a>
              <Link to="/faq" className="ppt-secondary-link">
                Read FAQ
              </Link>
              <Link to="/founder" className="ppt-secondary-link">
                Founder
              </Link>
            </div>
          </div>
        </MarketingCard>
      </MarketingSection>
    </MarketingLayout>
  );
}
