import {
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  Link2,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  Store,
  UserRoundCheck,
} from "lucide-react";
import { type ReactNode } from "react";
import { Link } from "react-router-dom";

import { MarketingLayout } from "../../layout/MarketingLayout";
import { breadcrumbListSchema, MarketingBreadcrumbs } from "../../seo/breadcrumbs";
import { Seo } from "../../seo/Seo";
import { clusterDeepContent } from "../../seo-pages/deepContent";
import { type SeoPageContent } from "../../seo-pages/seoPageTypes";
import { CTASection } from "./CTASection";
import { FAQBlock } from "./FAQBlock";
import { MarketingCard } from "./MarketingCard";
import { MarketingSection } from "./MarketingSection";
import { PageTrustMeta } from "./PageTrustMeta";
import { RelatedLinks } from "./RelatedLinks";

const useCaseImages: Record<string, { alt: string; src: string }> = {
  "/for/instagram-sellers": {
    alt: "Phone storefront for Instagram social commerce",
    src: "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=720&q=74",
  },
  "/for/whatsapp-sellers": {
    alt: "Seller using phone for WhatsApp commerce",
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=720&q=74",
  },
  "/for/thrift-sellers": {
    alt: "Thrift clothing rack with fashion pieces",
    src: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=720&q=74",
  },
  "/for/boutiques": {
    alt: "Boutique fashion products on display",
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=720&q=74",
  },
  "/for/handmade-sellers": {
    alt: "Handmade jewelry and craft products",
    src: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=720&q=74",
  },
  "/for/student-sellers": {
    alt: "Student seller accessories and books",
    src: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=720&q=74",
  },
};

function FeatureVisual({ path }: { path: string }) {
  if (path === "/features/verified-booking") {
    return (
      <div className="ppt-seo-visual-card ppt-seo-receipt-card">
        <div className="ppt-core-icon-tile">
          <ReceiptText size={22} aria-hidden="true" />
        </div>
        <p className="ppt-seo-visual-label">Booking receipt</p>
        <h2>₹20 booking received</h2>
        <div className="ppt-seo-receipt-rows">
          <span>Booking via PayPerTap</span>
          <strong>Platform verified-booking fee</strong>
          <span>Remaining amount</span>
          <strong>Paid directly to seller</strong>
          <span>Status</span>
          <strong className="ppt-seo-status">Reserved</strong>
        </div>
      </div>
    );
  }

  if (path === "/features/link-in-bio-storefront") {
    return (
      <div className="ppt-seo-visual-card">
        <div className="ppt-seo-store-link">
          <span>paypertap.in/aditya.thrift</span>
          <Link2 size={18} aria-hidden="true" />
        </div>
        <div className="ppt-seo-product-grid">
          {["Denim jacket", "Co-ord set", "Handmade bag", "Drop earrings"].map((item) => (
            <div key={item}>
              <div />
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (path === "/features/whatsapp-handoff") {
    return (
      <div className="ppt-seo-visual-card ppt-seo-chat-card">
        <div className="ppt-core-icon-tile">
          <MessageCircle size={22} aria-hidden="true" />
        </div>
        <h2>WhatsApp message ready</h2>
        <div className="ppt-seo-message-bubble">
          <p>Product: Handmade tote</p>
          <p>Booking paid: ₹20 via PayPerTap</p>
          <p>Remaining amount: paid directly to seller</p>
          <p>Buyer details: included for confirmation</p>
        </div>
      </div>
    );
  }

  if (path === "/features/order-organization") {
    return (
      <div className="ppt-seo-visual-card">
        <p className="ppt-seo-visual-label">Booking list</p>
        {["Reserved", "Contacted", "Sold"].map((status) => (
          <div className="ppt-seo-order-row" key={status}>
            <PackageCheck size={18} aria-hidden="true" />
            <span>Buyer conversation</span>
            <strong>{status}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (path === "/features/customer-leads") {
    return (
      <div className="ppt-seo-visual-card">
        <div className="ppt-core-icon-tile">
          <UserRoundCheck size={22} aria-hidden="true" />
        </div>
        <p className="ppt-seo-visual-label">Buyer context</p>
        <h2>Customer lead card</h2>
        <div className="ppt-seo-lead-card">
          <span>Name</span>
          <strong>Buyer saved with product interest</strong>
          <span>Intent</span>
          <strong>Booked before WhatsApp handoff</strong>
          <span>Privacy</span>
          <strong>Used for booking workflow</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="ppt-seo-visual-card">
      <div className="ppt-core-icon-tile">
        <Link2 size={22} aria-hidden="true" />
      </div>
      <p className="ppt-seo-visual-label">Product link</p>
      <h2>Product page preview</h2>
      <div className="ppt-seo-link-preview">
        <span>paypertap.in/store/product</span>
        <strong>Buyer opens product, books, then continues to WhatsApp.</strong>
      </div>
    </div>
  );
}

function UseCaseVisual({ path }: { path: string }) {
  const image = useCaseImages[path] ?? useCaseImages["/for/instagram-sellers"];

  return (
    <div className="ppt-seo-usecase-visual">
      <img src={image.src} alt={image.alt} width={720} height={480} loading="lazy" decoding="async" />
      <div className="ppt-seo-usecase-proof">
        <div className="ppt-core-icon-tile">
          <Store size={18} aria-hidden="true" />
        </div>
        <div>
          <strong>Verified booking storefront</strong>
          <span>Built around product links and WhatsApp handoff.</span>
        </div>
      </div>
    </div>
  );
}

function PageHero({
  eyebrow,
  h1,
  summary,
  visual,
  path,
}: {
  eyebrow: string;
  h1: string;
  path: string;
  summary: string;
  visual: ReactNode;
}) {
  return (
    <section className="ppt-seo-hero relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="relative mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[1fr_0.82fr] lg:items-center">
        <div className="min-w-0">
          <MarketingBreadcrumbs path={path} />
          <p className="ppt-marketing-pill mb-4 inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-bold uppercase">
            {eyebrow}
          </p>
          <h1 className="ppt-page-title max-w-5xl text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-neutral-950 sm:text-6xl lg:text-7xl">
            {h1}
          </h1>
          <div className="ppt-seo-summary-card mt-6 max-w-3xl rounded-[24px] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-neutral-500">
              Short answer
            </p>
            <p className="ppt-home-copy mt-2 text-lg leading-8 text-neutral-700">
              {summary}
            </p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/auth" className="ppt-primary-link">
              Create your store <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/how-it-works" className="ppt-secondary-link">
              See how it works
            </Link>
          </div>
        </div>
        <div className="min-w-0">{visual}</div>
      </div>
    </section>
  );
}

export function SeoClusterPageTemplate({
  eyebrow,
  page,
}: {
  eyebrow: string;
  page: SeoPageContent;
}) {
  const isUseCase = eyebrow === "Use case";
  const deepContent = clusterDeepContent[page.path];
  const visual = isUseCase ? <UseCaseVisual path={page.path} /> : <FeatureVisual path={page.path} />;
  const faqs = deepContent ? [...page.faqs, ...deepContent.extraFaqs] : page.faqs;

  return (
    <MarketingLayout>
      <Seo
        canonicalPath={page.path}
        title={page.title}
        description={page.description}
        jsonLd={[
          breadcrumbListSchema([
            { name: "Home", path: "/" },
            { name: page.h1, path: page.path },
          ]),
        ]}
      />
      <PageHero
        eyebrow={eyebrow}
        h1={page.h1}
        path={page.path}
        summary={deepContent?.directAnswer ?? page.summary}
        visual={visual}
      />
      <PageTrustMeta path={page.path} />

      <MarketingSection
        className="ppt-core-page-section"
        title={deepContent?.introTitle ?? (isUseCase ? "What problem does this seller face?" : "What does this feature do?")}
      >
        <MarketingCard className="ppt-seo-lead-copy">
          <p className="text-lg leading-8 text-neutral-700">{page.whatItIs}</p>
          {deepContent ? (
            <p className="ppt-home-copy mt-5 text-sm leading-7 text-neutral-600">
              {deepContent.source.before}
              <a
                href={deepContent.source.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {deepContent.source.anchor}
              </a>
              {deepContent.source.after}
            </p>
          ) : null}
        </MarketingCard>
      </MarketingSection>

      {deepContent ? (
        <MarketingSection
          className="ppt-core-page-section"
          title={isUseCase ? "What should this seller know before using PayPerTap?" : "What should sellers know about this feature?"}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {deepContent.answers.map((item) => (
              <MarketingCard key={item.question}>
                <h3 className="text-xl font-bold text-neutral-950">{item.question}</h3>
                <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
                  {item.answer}
                </p>
              </MarketingCard>
            ))}
          </div>
        </MarketingSection>
      ) : null}

      <MarketingSection
        className="ppt-core-page-section"
        title={deepContent?.workflowTitle ?? "How does it work?"}
      >
        <div className="ppt-seo-step-grid grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {page.howItWorks.map((step, index) => (
            <MarketingCard className="ppt-core-step-card" key={step}>
              <div className="ppt-core-step-index">Step {index + 1}</div>
              <div className="ppt-core-icon-tile mb-5">
                {index === 0 ? <Link2 size={18} aria-hidden="true" /> : null}
                {index === 1 ? <IndianRupee size={18} aria-hidden="true" /> : null}
                {index === 2 ? <MessageCircle size={18} aria-hidden="true" /> : null}
                {index > 2 ? <CheckCircle2 size={18} aria-hidden="true" /> : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-neutral-700">{step}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title={deepContent?.benefitsTitle ?? (isUseCase ? "How does PayPerTap help?" : "Why is this useful?")}
      >
        <div className="ppt-seo-benefit-grid grid gap-4 md:grid-cols-2">
          {page.benefits.map((benefit) => (
            <MarketingCard className="ppt-seo-benefit-card" key={benefit}>
              <CheckCircle2 size={18} aria-hidden="true" />
              <p className="text-sm leading-6 text-neutral-700">{benefit}</p>
            </MarketingCard>
          ))}
        </div>
      </MarketingSection>

      {page.bestFor?.length || page.notBestFor?.length ? (
        <MarketingSection
          className="ppt-core-page-section"
          title="Best for / not best for"
          intro="A clear fit check helps sellers choose PayPerTap for the right job."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {page.bestFor?.length ? (
              <MarketingCard className="ppt-core-list-card">
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                  Best for
                </h2>
                <ul className="mt-5 grid gap-3">
                  {page.bestFor.map((item) => (
                    <li className="ppt-core-check-row" key={item}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </MarketingCard>
            ) : null}
            {page.notBestFor?.length ? (
              <MarketingCard className="ppt-core-list-card">
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-neutral-950">
                  Not best for
                </h2>
                <ul className="mt-5 grid gap-3">
                  {page.notBestFor.map((item) => (
                    <li className="ppt-core-check-row" key={item}>
                      <CheckCircle2 size={17} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </MarketingCard>
            ) : null}
          </div>
        </MarketingSection>
      ) : null}

      {deepContent ? (
        <MarketingSection
          className="ppt-core-page-section"
          title="What does PayPerTap handle, and what does the seller handle?"
          intro="The Phase 1 boundary is intentionally explicit: PayPerTap handles booking context, while the seller completes the product transaction directly."
        >
          <div className="ppt-seo-comparison-table overflow-x-auto rounded-[24px] border backdrop-blur-xl">
            <table className="w-full min-w-[660px] text-left">
              <thead className="ppt-seo-comparison-head text-xs font-bold uppercase tracking-[0.12em]">
                <tr>
                  <th className="p-4">Stage</th>
                  <th className="p-4">PayPerTap handles</th>
                  <th className="p-4">Seller handles</th>
                </tr>
              </thead>
              <tbody>
                {deepContent.responsibilities.map((row) => (
                  <tr className="ppt-seo-comparison-row border-t" key={row.stage}>
                    <th className="p-4 text-sm font-bold text-neutral-950">{row.stage}</th>
                    <td className="p-4 text-sm leading-6 text-neutral-700">{row.paypertap}</td>
                    <td className="p-4 text-sm leading-6 text-neutral-700">{row.seller}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MarketingSection>
      ) : null}

      <MarketingSection
        className="ppt-core-page-section"
        title={isUseCase ? "How should this seller evaluate the workflow?" : "How should sellers evaluate this feature?"}
        intro="Use these checks before treating PayPerTap as the right layer for a selling flow."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Before sharing the link</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Confirm that the page, product, or use case fits a physical-product
              seller who wants booking before WhatsApp. Product photos, price,
              availability, and seller policy should be accurate before buyers book.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">During the ₹20 booking</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The buyer pays PayPerTap&apos;s fixed platform verified-booking fee.
              The fee is not a seller payout, custom advance, split payment, or full
              product payment. It creates booking and reservation context.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">After WhatsApp handoff</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              The seller confirms remaining payment, delivery, pickup, COD, UPI, and
              product policy directly. PayPerTap does not automate WhatsApp replies
              or guarantee that the final product transaction will complete.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">When to choose another tool</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              If the seller needs a full payment gateway, seller settlement,
              shipping operations, advanced inventory infrastructure, or broad form
              collection, PayPerTap&apos;s booking-first Phase 1 scope is too narrow.
            </p>
          </MarketingCard>
        </div>
      </MarketingSection>

      <MarketingSection
        className="ppt-core-page-section"
        title="What mistakes should sellers avoid?"
        intro="Clear buyer expectations make the booking flow easier to understand."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Do not call ₹20 a seller advance</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              In Phase 1, the fixed ₹20 belongs to PayPerTap as the platform
              verified-booking fee. Sellers should explain that the remaining product
              amount is still collected directly by them after handoff.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Do not skip product policy clarity</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              Booking context helps organize a buyer conversation, but it does not
              replace seller policies. Delivery timing, cancellation, return,
              exchange, COD, and pickup expectations should be stated clearly.
            </p>
          </MarketingCard>
          <MarketingCard>
            <h3 className="text-lg font-bold text-neutral-950">Do not promise automatic completion</h3>
            <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
              A booking is a useful intent signal and reservation record, not a
              guaranteed final sale. The seller still confirms remaining payment,
              product condition, fulfilment, and any buyer questions directly.
            </p>
          </MarketingCard>
        </div>
        <MarketingCard className="mt-4">
          <h3 className="text-xl font-bold text-neutral-950">Keep the buyer's next step explicit</h3>
          <p className="ppt-home-copy mt-3 text-sm leading-7 text-neutral-600">
            The strongest PayPerTap pages make the next step obvious: review the
            product, place the fixed booking, continue to WhatsApp, and finish the
            remaining product transaction directly with the seller. Clear wording
            prevents buyers from mistaking the booking fee for full checkout.
          </p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="What does this look like in practice?">
        <MarketingCard className="ppt-seo-example-card">
          <p className="text-lg leading-8 text-neutral-700">{page.example}</p>
        </MarketingCard>
      </MarketingSection>

      <MarketingSection className="ppt-core-page-section" title="Frequently asked questions">
        <FAQBlock items={faqs} showLink />
      </MarketingSection>

      <RelatedLinks links={page.related} />
      <CTASection title="Create a PayPerTap store link for serious buyers" />
    </MarketingLayout>
  );
}
