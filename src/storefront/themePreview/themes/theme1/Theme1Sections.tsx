import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  Star,
  Timer,
} from "lucide-react";

import upiLogo from "@/assets/payment/upi-logo.svg";
import { PptBrandIcon } from "@/components/ui";
import type {
  PreviewFaq,
  PreviewProduct,
  PreviewStore,
  PreviewTestimonial,
} from "../../types";
import { Theme1ProductCard } from "./Theme1ProductCard";

export function Theme1Sections({
  faqs,
  isPreviewMobile = false,
  onLeaveReview,
  onProductSelect,
  products,
  store,
  testimonials,
}: {
  faqs: PreviewFaq[];
  isPreviewMobile?: boolean;
  onLeaveReview: () => void;
  onProductSelect: (product: PreviewProduct) => void;
  products: PreviewProduct[];
  store: PreviewStore;
  testimonials: PreviewTestimonial[];
}) {
  const [visibleProductCount, setVisibleProductCount] = useState(4);
  const visibleProducts = useMemo(
    () => products.slice(0, visibleProductCount),
    [products, visibleProductCount]
  );
  const canLoadMoreProducts = visibleProductCount < products.length;

  useEffect(() => {
    setVisibleProductCount(4);
  }, [products]);

  const trustItems = [
    { icon: ShieldCheck, label: "Verified booking" },
    { icon: Timer, label: "Limited stock" },
    { brand: "whatsapp" as const, label: "WhatsApp confirmation" },
    { icon: Star, label: "Seller reviews" },
    { icon: CreditCard, label: "Secure checkout" },
    { logo: upiLogo, logoAlt: "UPI", label: "UPI accepted" },
  ];
  const bookingSteps = [
    {
      title: "Choose your piece",
      copy: "Pick your size/color if available.",
    },
    {
      title: "Reserve for Rs. 20",
      copy: "Pay PayPerTap to hold the item.",
    },
    {
      title: "Confirm on WhatsApp",
      copy: "Your details go to the seller to complete payment and delivery.",
    },
  ];

  return (
    <>
      <section className="mx-auto max-w-7xl px-2 py-3 sm:px-4" aria-label="Collections">
        <div className="flex snap-x gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {store.collections.map((collection) => (
            <a
              key={collection}
              href="#products"
              className="inline-flex min-h-11 shrink-0 snap-start items-center rounded-full border border-[#DDD4C7] bg-[#F4EFE6] px-4 text-sm font-semibold !text-[#111111] hover:border-[#7A2E2E] hover:bg-[#EFE3C8] hover:!text-[#7A2E2E]"
            >
              {collection}
            </a>
          ))}
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-2 py-7 sm:px-4">
        <div
          className={`mb-5 grid gap-3 ${
            isPreviewMobile ? "" : "sm:grid-cols-[1fr_auto] sm:items-end"
          }`}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A2E2E]">
              New drop
            </p>
            <h2
              className={`mt-2 max-w-2xl text-4xl font-semibold leading-tight text-[#111111] ${
                isPreviewMobile ? "" : "sm:text-5xl"
              }`}
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              Rare finds, ready to reserve
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[#6F6A60]">
            Every piece is one-off or low stock. Tap a card to preview the product page.
          </p>
        </div>
        <div
          className={`grid grid-cols-2 gap-2.5 ${
            isPreviewMobile ? "" : "md:grid-cols-3 md:gap-3 lg:grid-cols-4"
          }`}
        >
          {visibleProducts.map((product) => (
            <Theme1ProductCard
              key={product.id}
              product={product}
              onSelect={onProductSelect}
            />
          ))}
        </div>
        {products.length > 4 ? (
          <div className="mt-5 flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-semibold text-[#6F6A60]">
              Showing {Math.min(visibleProductCount, products.length)} of {products.length} one-off pieces
            </p>
            {canLoadMoreProducts ? (
              <button
                type="button"
                onClick={() =>
                  setVisibleProductCount((current) =>
                    Math.min(current + 4, products.length)
                  )
                }
                className={`inline-flex min-h-12 items-center justify-center gap-2 border border-[#DDD4C7] bg-[#F9F5ED] px-6 text-sm font-bold text-[#111111] shadow-[0_14px_34px_rgba(25,20,15,0.1)] transition hover:-translate-y-0.5 hover:border-[#7A2E2E] hover:bg-[#111111] hover:text-[#F6F1E8] active:translate-y-0 ${
                  isPreviewMobile ? "w-full" : "w-fit"
                }`}
              >
                <span>Load more pieces</span>
                <span aria-hidden="true">→</span>
              </button>
            ) : (
              <p className="text-xs font-semibold text-[#8f8679]">End of this drop</p>
            )}
          </div>
        ) : null}
      </section>

      <section id="seller-reviews" className="mx-auto max-w-7xl px-3 py-8 sm:px-4">
        <div
          className={`grid gap-5 ${
            isPreviewMobile ? "" : "lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
          }`}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A2E2E]">
              Seller reviews
            </p>
            <h2
              className="mt-2 text-4xl font-semibold leading-tight text-[#111111] sm:text-5xl"
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              What buyers say about this seller
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#6F6A60]">
              Thrift pieces are one-off, so reviews belong to the seller experience:
              accuracy, confirmation, packaging, and delivery.
            </p>
          </div>
          <button
            type="button"
            onClick={onLeaveReview}
            className={`min-h-12 w-full bg-[#111111] px-5 text-sm font-bold text-[#F6F1E8] ${
              isPreviewMobile ? "" : "sm:w-fit lg:justify-self-end"
            }`}
          >
            Leave a review
          </button>
        </div>
        <div className="mt-5 border border-[#DDD4C7] bg-[#F4EFE6] p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <strong
                className="block text-3xl font-semibold leading-none text-[#111111]"
                style={{ fontFamily: "Georgia, ui-serif, serif" }}
              >
                4.8 seller rating
              </strong>
              <span className="mt-2 block text-sm text-[#6F6A60]">
                Based on buyer feedback from past drops.
              </span>
            </div>
            <div className="flex gap-1 text-[#7A2E2E]" aria-label="4.8 out of 5 stars">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={17} aria-hidden="true" className="fill-current" />
              ))}
            </div>
          </div>
        </div>
        <div className={`mt-3 grid gap-3 ${isPreviewMobile ? "" : "md:grid-cols-3"}`}>
          {testimonials.map((testimonial) => (
            <ReviewCard key={`${testimonial.name}-${testimonial.quote}`} review={testimonial} />
          ))}
        </div>
      </section>

      <section
        id="booking"
        className={`mx-auto grid max-w-7xl gap-4 px-3 py-8 sm:px-4 ${
          isPreviewMobile ? "" : "lg:grid-cols-[0.78fr_1.22fr]"
        }`}
      >
        <div className="bg-[#111111] p-5 text-[#F6F1E8] sm:p-7">
          <ShoppingBag size={24} aria-hidden="true" />
          <h2
            className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl"
            style={{ fontFamily: "Georgia, ui-serif, serif" }}
          >
            How booking works
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#F6F1E8]/70">
            The Rs. 20 reserve flow sits here, after the buyer has seen the drop and picked a piece.
          </p>
        </div>
        <div className={`grid gap-3 ${isPreviewMobile ? "" : "md:grid-cols-3"}`}>
          {bookingSteps.map((step, index) => (
            <article key={step.title} className="border border-[#DDD4C7] bg-[#F9F5ED] p-5">
              <span className="text-sm font-semibold text-[#7A2E2E]">0{index + 1}</span>
              <h3 className="mt-4 text-lg font-semibold text-[#111111]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[#6F6A60]">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4" aria-label="Store trust">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A2E2E]">
              Buyer confidence
            </p>
            <h2
              className="mt-2 text-3xl font-semibold leading-tight text-[#111111]"
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              Reserve with the seller, not a random DM.
            </h2>
          </div>
        </div>
        <div className={`grid grid-cols-2 gap-2 ${isPreviewMobile ? "" : "md:grid-cols-3 lg:grid-cols-6"}`}>
          {trustItems.map((item) => (
            <div key={item.label} className="min-w-0 border border-[#DDD4C7] bg-[#F4EFE6] p-4">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#EFE3C8] text-[#5F6448]">
                {"brand" in item ? (
                  <span className="text-[#25D366]">
                    <PptBrandIcon type={item.brand} size={19} />
                  </span>
                ) : "logo" in item ? (
                  <img
                    src={item.logo}
                    alt={item.logoAlt}
                    loading="lazy"
                    decoding="async"
                    className="max-h-4 max-w-7 object-contain"
                  />
                ) : (
                  <item.icon size={18} aria-hidden="true" />
                )}
              </span>
              <p className="mt-3 text-sm font-semibold leading-5 text-[#111111]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        className={`mx-auto grid max-w-7xl gap-4 px-3 py-8 sm:px-4 ${
          isPreviewMobile ? "" : "lg:grid-cols-[1.1fr_0.9fr]"
        }`}
      >
        <div className="border border-[#DDD4C7] bg-[#F9F5ED] p-5 sm:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A2E2E]">
            Store story
          </p>
          <h2
            className="mt-4 text-4xl font-semibold leading-tight text-[#111111]"
            style={{ fontFamily: "Georgia, ui-serif, serif" }}
          >
            Archive-first pieces, photographed for serious buyers.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#6F6A60]">{store.story}</p>
        </div>
        <div className={`grid gap-3 ${isPreviewMobile ? "" : "sm:grid-cols-2 lg:grid-cols-1"}`}>
          {store.trustBadges.map((badge) => (
            <div key={badge} className="border border-[#DDD4C7] bg-[#F6F1E8] p-5">
              <ShieldCheck size={21} aria-hidden="true" className="text-[#5F6448]" />
              <p className="mt-4 text-base font-semibold text-[#111111]">{badge}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-3 py-8 sm:px-4">
        <h2
          className="text-3xl font-semibold leading-tight text-[#111111]"
          style={{ fontFamily: "Georgia, ui-serif, serif" }}
        >
          FAQ
        </h2>
        <div className={`mt-4 grid gap-3 ${isPreviewMobile ? "" : "md:grid-cols-3"}`}>
          {faqs.map((faq) => (
            <details key={faq.question} className="border border-[#DDD4C7] bg-[#F9F5ED] p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#111111]">
                {faq.question}
              </summary>
              <p className="mt-3 text-sm leading-6 text-[#6F6A60]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function ReviewCard({ review }: { review: PreviewTestimonial }) {
  const rating = Math.max(1, Math.min(5, review.rating ?? 5));

  return (
    <blockquote className="border border-[#DDD4C7] bg-[#F9F5ED] p-5">
      <div className="flex gap-1 text-[#7A2E2E]" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={16}
            aria-hidden="true"
            className={index < rating ? "fill-current" : "text-[#DDD4C7]"}
          />
        ))}
      </div>
      <p className="mt-4 text-sm leading-7 text-[#3a342d]">"{review.quote}"</p>
      <footer className="mt-5 text-sm font-semibold text-[#111111]">
        {review.name}
        <span className="block text-xs font-medium text-[#6F6A60]">
          {review.dateTag ?? review.meta}
        </span>
      </footer>
    </blockquote>
  );
}
