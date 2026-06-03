import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Check, Star, X } from "lucide-react";

import { formatINR } from "@/lib/money";
import type { PreviewProduct, PreviewTestimonial, PreviewThemeProps } from "../../types";
import { Theme1Footer } from "./Theme1Footer";
import { Theme1Header } from "./Theme1Header";
import { Theme1Hero } from "./Theme1Hero";
import { Theme1Sections } from "./Theme1Sections";

export function Theme1Preview({
  faqs,
  previewDevice,
  products,
  store,
  testimonials,
}: PreviewThemeProps) {
  const [selectedProduct, setSelectedProduct] = useState<PreviewProduct | null>(null);
  const [reviewDrawerOpen, setReviewDrawerOpen] = useState(false);
  const [sellerReviews, setSellerReviews] = useState<PreviewTestimonial[]>(testimonials);
  const isPreviewMobile = previewDevice === "mobile";

  const handleReviewSubmit = (review: PreviewTestimonial) => {
    // Preview-only store-level reviews. Real reviews later should stay store-level, not product-level, and sellers must not be able to edit review content.
    setSellerReviews((current) => [review, ...current]);
  };

  if (selectedProduct) {
    return (
      <Theme1ProductDetailPreview
        product={selectedProduct}
        products={products}
        isPreviewMobile={isPreviewMobile}
        sellerRating={4.9}
        store={store}
        onBack={() => setSelectedProduct(null)}
        onProductSelect={setSelectedProduct}
      />
    );
  }

  return (
    <main id="top" className="relative min-h-screen overflow-x-hidden bg-[#F6F1E8] text-[#111111]">
      <Theme1Header
        isPreviewMobile={isPreviewMobile}
        onProductSelect={setSelectedProduct}
        products={products}
        store={store}
      />
      <Theme1Hero
        featuredProduct={products[0]}
        isPreviewMobile={isPreviewMobile}
        store={store}
      />
      <Theme1Sections
        faqs={faqs}
        isPreviewMobile={isPreviewMobile}
        onLeaveReview={() => setReviewDrawerOpen(true)}
        onProductSelect={setSelectedProduct}
        products={products}
        store={store}
        testimonials={sellerReviews}
      />
      <Theme1Footer isPreviewMobile={isPreviewMobile} store={store} />
      {reviewDrawerOpen ? (
        <Theme1ReviewDrawer
          onClose={() => setReviewDrawerOpen(false)}
          onSubmit={handleReviewSubmit}
        />
      ) : null}
    </main>
  );
}

function Theme1ProductDetailPreview({
  onBack,
  onProductSelect,
  product,
  products,
  isPreviewMobile,
  sellerRating,
  store,
}: {
  onBack: () => void;
  onProductSelect: (product: PreviewProduct) => void;
  product: PreviewProduct;
  products: PreviewProduct[];
  isPreviewMobile: boolean;
  sellerRating: number;
  store: PreviewThemeProps["store"];
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const gallery = useMemo(
    () => [product.imageUrl, ...(product.galleryUrls ?? [])].filter(Boolean),
    [product]
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const relatedPieces = products
    .filter((relatedProduct) => relatedProduct.id !== product.id)
    .slice(0, 4);
  const productNotes = [
    "One-of-one thrift piece",
    "Photographed by the seller",
    "Fit and condition checked before listing",
  ];

  useEffect(() => {
    setSelectedImage(0);
  }, [product.id]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let scrollParent = rootRef.current?.parentElement;

      while (scrollParent) {
        if (scrollParent.scrollHeight > scrollParent.clientHeight) {
          scrollParent.scrollTo({ top: 0, behavior: "auto" });
        }
        scrollParent = scrollParent.parentElement;
      }

      window.scrollTo({ top: 0, behavior: "auto" });
      backButtonRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [product.id]);

  return (
    <main
      ref={rootRef}
      tabIndex={-1}
      className={`min-h-screen overflow-x-hidden bg-[#F6F1E8] text-[#111111] ${isPreviewMobile ? "pb-24" : "pb-24 md:pb-0"}`}
    >
      <Theme1Header
        isPreviewMobile={isPreviewMobile}
        onProductSelect={onProductSelect}
        products={products}
        store={store}
      />
      <div className="sticky top-0 z-30 border-b border-[#DDD4C7] bg-[#F6F1E8]/95 px-3 py-3 backdrop-blur-xl sm:px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Back to storefront preview"
            ref={backButtonRef}
            onClick={onBack}
            className="inline-flex min-h-10 items-center gap-1.5 px-1 text-sm font-semibold text-[#111111] transition hover:text-[#7A2E2E]"
          >
            <ArrowLeft size={17} aria-hidden="true" />
            Back
          </button>
          <p className="min-w-0 truncate text-sm font-semibold text-[#6F6A60]">
            {store.name} product preview
          </p>
        </div>
        <div className={`mx-auto mt-3 max-w-7xl ${isPreviewMobile ? "" : "md:hidden"}`}>
          <button
            type="button"
            disabled
            className="flex min-h-12 w-full cursor-not-allowed flex-col items-center justify-center bg-[#111111] px-5 text-sm font-bold text-[#F6F1E8] opacity-[0.72]"
          >
            <span>Book for Rs. 20</span>
            <span className="text-[11px] font-semibold text-[#DDD4C7]">Preview only</span>
          </button>
        </div>
      </div>

      <section className={`mx-auto grid max-w-7xl gap-6 px-3 py-5 sm:px-4 ${isPreviewMobile ? "" : "lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-8"}`}>
        <div className={isPreviewMobile ? "" : "lg:sticky lg:top-20 lg:self-start"}>
          <div className="aspect-[4/5] overflow-hidden bg-[#EFE3C8]">
            <img
              src={gallery[selectedImage] ?? product.imageUrl}
              alt={product.title}
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {gallery.slice(0, 4).map((imageUrl, index) => (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                aria-label={`Show product image ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                className={`aspect-[4/5] overflow-hidden border ${
                  selectedImage === index ? "border-[#7A2E2E]" : "border-[#DDD4C7]"
                }`}
              >
                <img
                  src={imageUrl}
                  alt={`${product.title} view ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A2E2E]">
            {product.collection}
          </p>
          <h1
            className={`mt-3 break-words text-4xl font-semibold leading-tight text-[#111111] ${
              isPreviewMobile ? "" : "sm:text-5xl"
            }`}
            style={{ fontFamily: "Georgia, ui-serif, serif" }}
          >
            {product.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <strong className="text-2xl font-semibold text-[#111111]">
              {formatINR(product.price)}
            </strong>
            {product.compareAtPrice ? (
              <span className="text-sm text-[#8f8679] line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            ) : null}
            <span className="bg-[#EFE3C8] px-3 py-1 text-xs font-semibold text-[#7A2E2E]">
              {product.scarcity}
            </span>
          </div>

          <p className="mt-5 text-sm leading-7 text-[#6F6A60]">{product.description}</p>

          <div className="mt-5 grid gap-2">
            {productNotes.map((note) => (
              <div key={note} className="flex items-center gap-2 border border-[#DDD4C7] bg-[#F4EFE6] px-3 py-2 text-xs font-semibold text-[#111111]">
                <Check size={15} aria-hidden="true" className="shrink-0 text-[#5F6448]" />
                <span>{note}</span>
              </div>
            ))}
          </div>

          <PreviewVariantSelectors product={product} />

          <div className="mt-5 grid grid-cols-3 gap-2">
            {["Verified booking", "Limited stock", "WhatsApp confirmation"].map((item) => (
              <div key={item} className="border border-[#DDD4C7] bg-[#F4EFE6] p-3 text-center text-[11px] font-semibold leading-4 text-[#111111]">
                {item}
              </div>
            ))}
          </div>

          <PreviewReserveCard product={product} />
          <SellerReviewCard onBack={onBack} sellerRating={sellerRating} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-3 py-6 sm:px-4">
        <h2
          className="text-3xl font-semibold leading-tight text-[#111111]"
          style={{ fontFamily: "Georgia, ui-serif, serif" }}
        >
          More from this drop
        </h2>
        <div className={`mt-4 grid grid-cols-2 gap-3 ${isPreviewMobile ? "" : "md:grid-cols-4"}`}>
          {relatedPieces.map((relatedProduct) => (
            <button
              key={relatedProduct.id}
              type="button"
              onClick={() => onProductSelect(relatedProduct)}
              className="min-w-0 border border-[#DDD4C7] bg-[#F9F5ED] text-left"
            >
              <img
                src={relatedProduct.imageUrl}
                alt={relatedProduct.title}
                loading="lazy"
                decoding="async"
                className="aspect-[4/5] w-full object-cover"
              />
              <span className="block min-h-12 px-3 py-3 text-sm font-semibold leading-5 text-[#111111]">
                {relatedProduct.title}
              </span>
            </button>
          ))}
        </div>
      </section>

      <Theme1Footer isPreviewMobile={isPreviewMobile} store={store} />
    </main>
  );
}

function PreviewReserveCard({ product }: { product: PreviewProduct }) {
  const payNow = 20;
  const confirmOnWhatsApp = product.price >= 800 ? 130 : 0;
  const remaining = Math.max(product.price - payNow - confirmOnWhatsApp, 0);
  const rows =
    confirmOnWhatsApp > 0
      ? [
          { label: "Pay now", value: payNow, emphasized: true },
          { label: "Confirm on WhatsApp", value: confirmOnWhatsApp },
          { label: "Remaining at COD", value: remaining },
        ]
      : [
          { label: "Pay now", value: payNow, emphasized: true },
          { label: "Remaining to seller", value: Math.max(product.price - payNow, 0) },
        ];

  return (
    <div className="mt-6 border border-[#DDD4C7] bg-[#F9F5ED] p-4 shadow-[0_18px_42px_rgba(25,20,15,0.08)] sm:p-5">
      <h2
        className="text-2xl font-semibold leading-tight text-[#111111]"
        style={{ fontFamily: "Georgia, ui-serif, serif" }}
      >
        Reserve this item
      </h2>
      <p className="mt-2 text-sm leading-6 text-[#6F6A60]">
        Pay Rs. 20 now to hold it. Then confirm with the seller on WhatsApp.
      </p>

      <div className="mt-4 border border-[#DDD4C7] bg-[#F4EFE6] p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A2E2E]">
          Payment breakdown
        </p>
        <div className="mt-3 grid gap-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm"
            >
              <span className="min-w-0 text-[#6F6A60]">{row.label}</span>
              <strong
                className={`text-right font-semibold ${
                  row.emphasized ? "text-[#7A2E2E]" : "text-[#111111]"
                }`}
              >
                {formatINR(row.value)}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled
        className="mt-4 flex min-h-12 w-full cursor-not-allowed flex-col items-center justify-center bg-[#111111] px-5 text-sm font-bold text-[#F6F1E8] opacity-[0.78]"
      >
        <span>Book for Rs. 20</span>
        <span className="text-[11px] font-semibold text-[#DDD4C7]">Preview only</span>
      </button>
      <p className="mt-3 text-xs leading-5 text-[#6F6A60]">
        Details are sent to the seller after booking.
      </p>
    </div>
  );
}

function PreviewVariantSelectors({ product }: { product: PreviewProduct }) {
  const sizes = useMemo(() => (product.sizes ?? []).filter(Boolean), [product.sizes]);
  const colors = useMemo(() => (product.colors ?? []).filter(Boolean), [product.colors]);
  const unavailableSizes = useMemo(
    () => new Set(product.unavailableSizes ?? []),
    [product.unavailableSizes]
  );
  const unavailableColors = useMemo(
    () => new Set(product.unavailableColors ?? []),
    [product.unavailableColors]
  );
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    setSelectedSize(sizes.find((size) => !unavailableSizes.has(size)) ?? "");
    setSelectedColor(colors.find((color) => !unavailableColors.has(color)) ?? "");
  }, [colors, product.id, sizes, unavailableColors, unavailableSizes]);

  if (!sizes.length && !colors.length) {
    return null;
  }

  return (
    <div className="mt-6 grid gap-4">
      {sizes.length ? (
        <PreviewOptionGroup
          label="Size"
          selectedValue={selectedSize}
          unavailableValues={unavailableSizes}
          values={sizes}
          onSelect={setSelectedSize}
        />
      ) : null}
      {colors.length ? (
        <PreviewOptionGroup
          isColor
          label="Color"
          selectedValue={selectedColor}
          unavailableValues={unavailableColors}
          values={colors}
          onSelect={setSelectedColor}
        />
      ) : null}
    </div>
  );
}

function getColorChipStyle(value: string) {
  const key = value.toLowerCase();
  if (key.includes("ivory") || key.includes("cream")) return "#F6F1E8";
  if (key.includes("black") || key.includes("charcoal")) return "#111111";
  if (key.includes("olive")) return "#5F6448";
  if (key.includes("wine")) return "#7A2E2E";
  if (key.includes("silver")) return "#C9C5BA";
  if (key.includes("denim")) return "#536878";
  if (key.includes("brown")) return "#6E4A2F";
  return "#DDD4C7";
}

function PreviewOptionGroup({
  isColor = false,
  label,
  onSelect,
  selectedValue,
  unavailableValues,
  values,
}: {
  isColor?: boolean;
  label: string;
  onSelect: (value: string) => void;
  selectedValue: string;
  unavailableValues: Set<string>;
  values: string[];
}) {
  if (!values.length) return null;

  return (
    <fieldset>
      <legend className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6F6A60]">
        {label}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => {
          const isSelected = selectedValue === value;
          const isUnavailable = unavailableValues.has(value);

          return (
            <button
              key={value}
              type="button"
              disabled={isUnavailable}
              aria-pressed={isSelected}
              onClick={() => onSelect(value)}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 border px-3 text-sm font-semibold transition ${
                isSelected
                  ? "border-[#111111] bg-[#111111] text-[#F6F1E8]"
                  : "border-[#DDD4C7] bg-[#F6F1E8] text-[#111111] hover:border-[#7A2E2E]"
              } ${isUnavailable ? "cursor-not-allowed opacity-45 line-through" : ""}`}
            >
              {isColor ? (
                <span
                  aria-hidden="true"
                  className={`h-3 w-3 rounded-full border ${
                    isSelected ? "border-[#F6F1E8]" : "border-[#DDD4C7]"
                  }`}
                  style={{ backgroundColor: getColorChipStyle(value) }}
                />
              ) : null}
              <span>{value}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SellerReviewCard({
  onBack,
  sellerRating,
}: {
  onBack: () => void;
  sellerRating: number;
}) {
  return (
    <div className="mt-4 border border-[#DDD4C7] bg-[#F4EFE6] p-5">
      <div className="flex items-center gap-2 text-[#7A2E2E]">
        <Star size={17} aria-hidden="true" className="fill-current" />
        <strong className="text-sm text-[#111111]">
          Seller rated {sellerRating} by buyers
        </strong>
      </div>
      <p className="mt-2 text-sm leading-6 text-[#6F6A60]">
        Reviews are seller-level for this preview because each thrift item is one-off.
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-3 text-sm font-semibold text-[#7A2E2E]"
      >
        Back to seller reviews
      </button>
    </div>
  );
}

function Theme1ReviewDrawer({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (review: PreviewTestimonial) => void;
}) {
  const [customerName, setCustomerName] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const titleId = "theme1-review-title";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerName.trim() || !reviewText.trim()) {
      return;
    }

    onSubmit({
      name: customerName.trim(),
      quote: reviewText.trim(),
      rating,
      meta: "Preview review",
      dateTag: "Just now",
    });
    setSubmitted(true);
    setCustomerName("");
    setRating(5);
    setReviewText("");
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-[#111111]/60 px-3 py-4 backdrop-blur-sm sm:px-4">
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto bg-[#F6F1E8] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A2E2E]">
              Preview only
            </p>
            <h2
              id={titleId}
              className="mt-2 text-3xl font-semibold leading-tight text-[#111111]"
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              Leave a seller review
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close review form"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#DDD4C7] bg-[#F4EFE6] text-[#111111]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {submitted ? (
          <div className="mt-5 border border-[#DDD4C7] bg-[#F4EFE6] p-4">
            <div className="flex items-center gap-2 text-[#5F6448]">
              <Check size={18} aria-hidden="true" />
              <strong className="text-sm text-[#111111]">Review added locally</strong>
            </div>
            <p className="mt-2 text-sm leading-6 text-[#6F6A60]">
              This preview did not write to Firestore or any backend.
            </p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-[#111111]">
            Customer name
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="min-h-12 border border-[#DDD4C7] bg-[#F9F5ED] px-3 text-sm outline-none focus:border-[#7A2E2E]"
              placeholder="Aarohi"
            />
          </label>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold text-[#111111]">Rating</legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} star rating`}
                  onClick={() => setRating(value)}
                  className={`grid h-10 w-10 place-items-center border ${
                    value <= rating
                      ? "border-[#7A2E2E] bg-[#EFE3C8] text-[#7A2E2E]"
                      : "border-[#DDD4C7] bg-[#F9F5ED] text-[#6F6A60]"
                  }`}
                >
                  <Star size={17} aria-hidden="true" className={value <= rating ? "fill-current" : ""} />
                </button>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-2 text-sm font-semibold text-[#111111]">
            Review text
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              className="min-h-28 resize-none border border-[#DDD4C7] bg-[#F9F5ED] px-3 py-3 text-sm leading-6 outline-none focus:border-[#7A2E2E]"
              placeholder="Photos were accurate and the seller confirmed quickly."
            />
          </label>

          <button
            type="submit"
            className="min-h-12 bg-[#111111] px-5 text-sm font-bold text-[#F6F1E8]"
          >
            Submit review
          </button>
          <p className="text-xs leading-5 text-[#6F6A60]">
            Preview-only: this form updates local React state and does not call Firestore.
          </p>
        </form>
      </section>
    </div>
  );
}
