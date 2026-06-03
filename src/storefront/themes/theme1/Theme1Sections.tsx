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
import { BOOKING_ADVANCE_AMOUNT, formatINR } from "@/lib/money";
import type { StorefrontProduct, StorefrontThemeProps } from "../types";
import { Theme1ProductCard, getTheme1ProductCardKey } from "./Theme1ProductCard";
import { ALL_COLLECTIONS } from "../../collectionFilters";
import {
  adaptTheme1Store,
  getTheme1Collections,
} from "./theme1Utils";
import { getStorefrontConfirmationPolicyText } from "../../StorefrontPaymentBreakdown";

const LIVE_FAQS = [
  {
    question: "Does booking place the order?",
    answer: `Booking reserves the item for ${formatINR(BOOKING_ADVANCE_AMOUNT)}. The seller confirms remaining payment and delivery details with you on WhatsApp.`,
  },
  {
    question: "Why are pieces limited?",
    answer: "Most thrift and drop items are one-off or low stock, so availability can change quickly.",
  },
  {
    question: "Where does checkout happen?",
    answer: "PayPerTap handles the reservation payment. After booking, your details go to the seller for confirmation.",
  },
];

export function Theme1Sections({
  collections: managedCollections = [],
  getProductFallbackIndex,
  isProductSaved,
  isPreviewMobile = false,
  onCollectionChange,
  onProductSelect,
  onToggleProductSaved,
  products,
  selectedCollection,
  store,
  totalProductCount,
}: {
  collections?: StorefrontThemeProps["collections"];
  getProductFallbackIndex: (product: StorefrontProduct) => number;
  isProductSaved: (product: StorefrontProduct, fallbackIndex?: number) => boolean;
  isPreviewMobile?: boolean;
  onCollectionChange: (collection: string) => void;
  onProductSelect: (product: StorefrontProduct) => void;
  onToggleProductSaved: (product: StorefrontProduct, fallbackIndex?: number) => void;
  products: StorefrontProduct[];
  selectedCollection: string;
  store: StorefrontThemeProps["store"];
  totalProductCount: number;
}) {
  const [visibleProductCount, setVisibleProductCount] = useState(4);
  const visibleProducts = useMemo(
    () => products.slice(0, visibleProductCount),
    [products, visibleProductCount]
  );
  const canLoadMoreProducts = visibleProductCount < products.length;
  const displayStore = adaptTheme1Store({
    collections: managedCollections,
    products,
    store,
  });
  const collectionOptions = [
    ALL_COLLECTIONS,
    ...getTheme1Collections(products, managedCollections),
  ];
  const trustItems = [
    { icon: ShieldCheck, label: "Verified booking" },
    { icon: Timer, label: "Limited stock" },
    { brand: "whatsapp" as const, label: "WhatsApp confirmation" },
    { icon: Star, label: "Seller confirmation" },
    { icon: CreditCard, label: "Secure checkout" },
    { logo: upiLogo, logoAlt: "UPI", label: "UPI accepted" },
  ];
  const bookingSteps = [
    {
      title: "Choose your piece",
      copy: "Pick your size/color if available.",
    },
    {
      title: `Reserve for ${formatINR(BOOKING_ADVANCE_AMOUNT)}`,
      copy: "Pay PayPerTap to hold the item.",
    },
    {
      title: "Confirm on WhatsApp",
      copy: getStorefrontConfirmationPolicyText(store),
    },
  ];

  useEffect(() => {
    setVisibleProductCount(4);
  }, [products, selectedCollection]);

  return (
    <>
      {collectionOptions.length ? (
        <section className="mx-auto max-w-7xl px-2 py-3 sm:px-4" aria-label="Collections">
          <div className="flex snap-x gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {collectionOptions.map((collection) => {
              const isSelected = collection === selectedCollection;

              return (
                <button
                  key={collection}
                  type="button"
                  onClick={() => onCollectionChange(collection)}
                  className={`inline-flex min-h-11 max-w-[190px] shrink-0 snap-start items-center truncate rounded-full border px-4 text-sm font-semibold ${
                    isSelected
                      ? "border-[#111111] bg-[#111111] text-[#F6F1E8]"
                      : "border-[#DDD4C7] bg-[#F4EFE6] text-[#111111] hover:border-[#7A2E2E] hover:bg-[#EFE3C8] hover:text-[#7A2E2E]"
                  }`}
                >
                  {collection}
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

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
            Every piece is one-off or low stock. Tap a card to open the product page.
          </p>
        </div>

        {totalProductCount === 0 ? (
          <section className="border border-[#DDD4C7] bg-[#F9F5ED] p-8 text-center shadow-[0_12px_32px_rgba(25,20,15,0.05)]">
            <h2
              className="text-3xl font-semibold leading-tight text-[#111111]"
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              No pieces live right now.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#6F6A60]">
              Check back for the next drop.
            </p>
          </section>
        ) : products.length === 0 ? (
          <section className="border border-[#DDD4C7] bg-[#F9F5ED] p-8 text-center shadow-[0_12px_32px_rgba(25,20,15,0.05)]">
            <h2 className="text-xl font-semibold text-[#111111]">No products found</h2>
            <p className="mt-2 text-sm leading-6 text-[#6F6A60]">
              Try another collection from this drop.
            </p>
          </section>
        ) : (
          <>
            <div
              className={`grid grid-cols-2 gap-2.5 ${
                isPreviewMobile ? "" : "md:grid-cols-3 md:gap-3 lg:grid-cols-4"
              }`}
            >
              {visibleProducts.map((product) => {
                const fallbackIndex = getProductFallbackIndex(product);

                return (
                  <Theme1ProductCard
                    key={getTheme1ProductCardKey(product)}
                    fallbackIndex={fallbackIndex}
                    isSaved={isProductSaved(product, fallbackIndex)}
                    product={product}
                    onSelect={onProductSelect}
                    onToggleSaved={onToggleProductSaved}
                  />
                );
              })}
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
                    <span aria-hidden="true">-&gt;</span>
                  </button>
                ) : (
                  <p className="text-xs font-semibold text-[#8f8679]">End of this drop</p>
                )}
              </div>
            ) : null}
          </>
        )}
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
            The {formatINR(BOOKING_ADVANCE_AMOUNT)} reserve flow sits here, after the buyer has seen the drop and picked a piece.
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
          <p className="mt-4 text-sm leading-7 text-[#6F6A60]">{displayStore.story}</p>
        </div>
        <div className={`grid gap-3 ${isPreviewMobile ? "" : "sm:grid-cols-2 lg:grid-cols-1"}`}>
          {displayStore.trustBadges.slice(0, 6).map((badge) => (
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
          {LIVE_FAQS.map((faq) => (
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
