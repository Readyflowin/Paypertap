import { Link } from "react-router-dom";

import { CTASection } from "../../components/marketing/CTASection";
import { FAQBlock } from "../../components/marketing/FAQBlock";
import { MarketingCard } from "../../components/marketing/MarketingCard";
import { MarketingSection } from "../../components/marketing/MarketingSection";
import { PageTrustMeta } from "../../components/marketing/PageTrustMeta";
import { SectionHeader } from "../../components/marketing/SectionHeader";
import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { marketingFaqs } from "./faqContent";

const faqCategoryTitles = [
  "PayPerTap basics",
  "₹20 booking model",
  "Seller payments and Phase 1 limits",
  "WhatsApp handoff",
  "Storefronts, products, links, collections",
  "Inventory, reserved, sold, and availability",
  "Buyer details, privacy, and leads",
  "Returns, cancellations, and refunds",
  "Alternatives and comparisons",
  "Best use cases",
  "Setup and onboarding",
];

const faqCategories = faqCategoryTitles.map((title) => ({
  title,
  items: marketingFaqs.filter((item) => item.group === title),
}));

const hubLinks = [
  { label: "Pricing", path: "/pricing" },
  { label: "How it works", path: "/how-it-works" },
  { label: "Verified booking", path: "/features/verified-booking" },
  { label: "WhatsApp handoff", path: "/features/whatsapp-handoff" },
  { label: "Storefront feature", path: "/features/link-in-bio-storefront" },
  { label: "Customer leads", path: "/features/customer-leads" },
  { label: "Compare tools", path: "/compare" },
  { label: "Refund policy", path: "/refund-cancellation" },
];

export function FAQPage() {
  return (
    <MarketingLayout>
      <Seo
        canonicalPath="/faq"
        title="PayPerTap FAQ | ₹20 Booking and WhatsApp Seller Flow"
        description="Clear answers about PayPerTap, ₹20 verified booking, seller payments, WhatsApp handoff, KYC, cancellations, and platform limits."
        jsonLd={[breadcrumbListSchema([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }])]}
      />
      <SectionHeader
        eyebrow="FAQ"
        h1="PayPerTap FAQ for Instagram and WhatsApp sellers."
        path="/faq"
        subtitle="PayPerTap is a verified booking storefront for Indian Instagram and WhatsApp sellers. Buyers pay a fixed ₹20 booking through PayPerTap to reserve a product, then continue to WhatsApp so the seller can collect the remaining amount directly and confirm delivery."
      />
      <PageTrustMeta path="/faq" />

      <MarketingSection
        className="ppt-core-page-section"
        title="Start with the short version"
        intro="These answers define the Phase 1 boundary before the detailed questions below."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MarketingCard>
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
              What PayPerTap handles
            </h2>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap handles storefront links, product booking context, the fixed
              ₹20 verified-booking fee, product reservation in the booking flow,
              buyer details needed for handoff, and the prepared WhatsApp message.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
              What sellers handle
            </h2>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Sellers handle the remaining product amount, UPI, COD, delivery,
              pickup, returns, exchanges, final availability, and the direct buyer
              conversation after WhatsApp handoff.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
              What PayPerTap is not
            </h2>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap is not a full payment gateway in Phase 1. It does not
              provide seller payouts, split payments, custom seller advances,
              automated WhatsApp replies, or full product-payment settlement.
            </p>
          </MarketingCard>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          {hubLinks.map((link) => (
            <Link key={link.path} to={link.path} className="ppt-secondary-link">
              {link.label}
            </Link>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section">
        <div className="ppt-faq-category-grid grid gap-4">
          {faqCategories.map((category) => (
            <MarketingCard className="ppt-faq-category-card" key={category.title}>
              <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                {category.title}
              </h2>
              <div className="mt-5">
                <FAQBlock items={category.items} showLink={false} />
              </div>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="Who handles each part of a booking?"
        intro="This quick reference separates PayPerTap's Phase 1 role from the seller's direct product transaction."
      >
        <div className="ppt-core-comparison overflow-hidden rounded-[24px] border backdrop-blur-xl">
          <table className="w-full text-left">
            <thead className="ppt-core-comparison-head text-xs font-bold uppercase tracking-[0.12em]">
              <tr>
                <th className="p-4">Question</th>
                <th className="p-4">Answer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="ppt-core-comparison-row border-t">
                <th className="p-4 text-sm font-bold text-neutral-950">₹20 booking fee</th>
                <td className="p-4 text-sm leading-7 text-neutral-700">
                  Paid by the buyer and kept by PayPerTap as its platform verified-booking fee in Phase 1.
                </td>
              </tr>
              <tr className="ppt-core-comparison-row border-t">
                <th className="p-4 text-sm font-bold text-neutral-950">Remaining product amount</th>
                <td className="p-4 text-sm leading-7 text-neutral-700">
                  Collected directly by the seller using their offered payment and delivery process.
                </td>
              </tr>
              <tr className="ppt-core-comparison-row border-t">
                <th className="p-4 text-sm font-bold text-neutral-950">WhatsApp messages</th>
                <td className="p-4 text-sm leading-7 text-neutral-700">
                  Initiated and handled by buyer and seller after PayPerTap prepares the handoff context.
                </td>
              </tr>
              <tr className="ppt-core-comparison-row border-t">
                <th className="p-4 text-sm font-bold text-neutral-950">Delivery and returns</th>
                <td className="p-4 text-sm leading-7 text-neutral-700">
                  Handled by the seller according to the product terms and seller policy presented to the buyer.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">What should a buyer check before booking?</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              A buyer should review the product, displayed price, seller information,
              applicable seller policies, and the meaning of the ₹20 booking fee before
              proceeding. After handoff, the buyer should confirm remaining payment and
              delivery details with the seller before paying that seller directly.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-xl font-bold text-neutral-950">Where can I read the policies?</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              PayPerTap policies explain platform handling of the fixed booking,
              privacy, terms, and cancellation boundaries. Sellers remain responsible
              for product terms and the direct buyer transaction after handoff.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/terms" className="ppt-secondary-link">Terms</Link>
              <Link to="/privacy" className="ppt-secondary-link">Privacy</Link>
              <Link to="/refund-cancellation" className="ppt-secondary-link">Refunds</Link>
            </div>
          </MarketingCard>
        </div>
      </MarketingSection>
      <CTASection />
    </MarketingLayout>
  );
}
