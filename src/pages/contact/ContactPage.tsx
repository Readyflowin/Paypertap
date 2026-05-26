import { ArrowRight, HelpCircle, Mail, MessageCircle, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";

import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { PageTrustMeta } from "../../components/marketing/PageTrustMeta";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { FAQBlock } from "../../components/marketing/FAQBlock";
import { marketingFaqs } from "../faq/faqContent";

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
    copy: "Ask how the ₹20 booking model, storefront, and platform limits work.",
  },
];

const supportFaqs = marketingFaqs.filter((item) =>
  [
    "How does the ₹20 booking work?",
    "Does the seller receive the ₹20?",
    "How does WhatsApp handoff work?",
    "Does the product become reserved after booking?",
    "Do sellers need payout KYC in Phase 1?",
    "Can sellers share direct product links?",
    "Who handles returns and exchanges?",
    "Is PayPerTap a payment gateway?",
  ].includes(item.question),
);

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
        path="/contact"
        subtitle="Use the PayPerTap contact page to ask about seller onboarding, verified booking storefronts, WhatsApp handoff, product setup, or founder and media queries. PayPerTap currently helps Instagram and WhatsApp sellers collect a fixed ₹20 booking before moving booked buyers to WhatsApp."
      />
      <PageTrustMeta path="/contact" />
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

      <MarketingSection
        className="ppt-core-page-section"
        title="What support questions can PayPerTap answer?"
        intro="Start with the self-serve pages for the most common questions, or email when your question needs context."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">How does booking work?</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Learn how a seller shares links, a buyer books with ₹20, an item is
              reserved, and remaining payment stays direct.
            </p>
            <Link to="/how-it-works" className="ppt-secondary-link mt-5">How it works</Link>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Who receives payment?</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Review why PayPerTap keeps the fixed booking fee in Phase 1 and why
              sellers collect the remaining amount themselves.
            </p>
            <Link to="/pricing" className="ppt-secondary-link mt-5">Pricing</Link>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Can I use WhatsApp Business?</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Yes. Official{" "}
              <a
                href="https://whatsappbusiness.com/products/business-platform/"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp Business use cases
              </a>{" "}
              include business messaging such as order confirmations. PayPerTap
              prepares handoff details rather than sending replies automatically.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Common support questions"
        intro="Many seller and buyer questions are answered immediately here; email remains available when more context is needed."
      >
        <FAQBlock items={supportFaqs} />
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
              <Link to="/how-it-works" className="ppt-secondary-link">
                How it works
              </Link>
            </div>
          </div>
        </MarketingCard>
      </MarketingSection>
    </MarketingLayout>
  );
}
