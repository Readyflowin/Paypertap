import { ArrowRight, BadgeCheck, Store as StoreIcon } from "lucide-react";

import { getDisplayImageUrl } from "@/lib/imageUrls";

type Theme1HeroStore = {
  storeName?: string;
  name?: string;
  heroImageUrl?: string;
  heroTitle?: string;
  heroHeading?: string;
  heroSubtitle?: string;
  bio?: string;
  description?: string;
  tagline?: string;
  socialProof?: string[];
};

type Theme1HeroProduct = {
  title?: string;
  description?: string;
  imageUrl?: string;
  scarcity?: string;
  badge?: string;
};

function getStoreName(store: Theme1HeroStore) {
  return store.storeName || store.name || "PayPerTap Store";
}

function getHeroTitle(store: Theme1HeroStore) {
  return (
    store.heroTitle ||
    store.heroHeading ||
    "Curated drops, one piece at a time."
  );
}

function getHeroSubtitle(store: Theme1HeroStore) {
  return (
    store.heroSubtitle ||
    "Browse available pieces and reserve before the chat moves to WhatsApp."
  );
}

function getTextFallbackTitle(store: Theme1HeroStore) {
  return store.heroTitle || store.heroHeading || "Fresh drops are live";
}

function getTextFallbackSubtitle(store: Theme1HeroStore) {
  return store.heroSubtitle || "Fresh pieces, limited stock, ready to reserve.";
}

function getHeroImageUrl({
  featuredProduct,
  store,
  useFeaturedProductAsHeroImage,
}: {
  featuredProduct?: Theme1HeroProduct | null;
  store: Theme1HeroStore;
  useFeaturedProductAsHeroImage?: boolean;
}) {
  return (
    getDisplayImageUrl(store.heroImageUrl) ||
    (useFeaturedProductAsHeroImage ? getDisplayImageUrl(featuredProduct?.imageUrl) : "")
  );
}

export function Theme1HeroSection({
  featuredProduct,
  isPreviewMobile = false,
  store,
  useFeaturedProductAsHeroImage = false,
}: {
  featuredProduct?: Theme1HeroProduct | null;
  isPreviewMobile?: boolean;
  store: Theme1HeroStore;
  useFeaturedProductAsHeroImage?: boolean;
}) {
  const heroImageUrl = getHeroImageUrl({
    featuredProduct,
    store,
    useFeaturedProductAsHeroImage,
  });
  const storeHeroImageUrl = getDisplayImageUrl(store.heroImageUrl);
  const featuredProductImageUrl = getDisplayImageUrl(featuredProduct?.imageUrl);
  const isUsingFeaturedProductHeroImage =
    !storeHeroImageUrl &&
    useFeaturedProductAsHeroImage &&
    Boolean(featuredProductImageUrl) &&
    heroImageUrl === featuredProductImageUrl;
  const showCoverPiece = Boolean(featuredProduct && !isUsingFeaturedProductHeroImage);
  const coverProduct = showCoverPiece ? featuredProduct : null;
  const socialProof = store.socialProof?.length
    ? store.socialProof
    : ["Verified booking", "Limited stock", "WhatsApp confirmation"];

  if (!heroImageUrl) {
    return (
      <section className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:py-8">
        <div className="grid gap-4 bg-[#111111] p-5 text-[#F6F1E8] sm:p-8 lg:grid-cols-[1fr_0.72fr] lg:items-end">
          <div className="min-w-0">
            <p className="w-fit border border-[#F6F1E8]/35 bg-[#2d1b16] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EFE3C8]">
              New drop
            </p>
            <h1
              className="mt-5 max-w-4xl break-words text-5xl font-semibold leading-[0.96] text-[#F6F1E8] sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              {getTextFallbackTitle(store)}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#F6F1E8]/72 sm:text-base">
              {getTextFallbackSubtitle(store)}
            </p>
            <div className="mt-6 grid gap-2.5 sm:flex sm:flex-wrap sm:gap-3">
              <a
                href="#products"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F6F1E8] px-5 text-sm font-bold !text-[#111111] hover:!text-[#111111]"
              >
                Shop new drop
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a
                href="#booking"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#F6F1E8]/40 px-5 text-sm font-bold !text-[#F6F1E8] hover:!text-[#EFE3C8]"
              >
                How booking works
              </a>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="border border-[#F6F1E8]/16 bg-[#F6F1E8]/8 p-5">
              <StoreIcon size={22} aria-hidden="true" className="text-[#EFE3C8]" />
              <p
                className="mt-4 text-2xl font-semibold leading-tight text-[#F6F1E8]"
                style={{ fontFamily: "Georgia, ui-serif, serif" }}
              >
                {getStoreName(store)}
              </p>
              <p className="mt-3 text-sm leading-6 text-[#F6F1E8]/62">
                Fresh pieces, limited stock, ready to reserve.
              </p>
            </div>
            {socialProof.slice(0, 3).map((item) => (
              <div key={item} className="border border-[#F6F1E8]/16 bg-[#F6F1E8]/6 p-4">
                <BadgeCheck size={18} aria-hidden="true" className="text-[#EFE3C8]" />
                <p className="mt-3 text-sm font-semibold text-[#F6F1E8]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:py-8">
      <div
        className={`grid gap-4 ${
          isPreviewMobile ? "" : "lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch"
        }`}
      >
        <div
          className={`relative min-h-[456px] overflow-hidden rounded-lg bg-[#111111] ${
            isPreviewMobile ? "" : "sm:min-h-[620px]"
          }`}
        >
          <img
            src={heroImageUrl}
            alt={`${getStoreName(store)} drop`}
            decoding="async"
            fetchPriority="high"
            loading="eager"
            className="absolute inset-0 h-full w-full object-cover opacity-[0.82]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/30 to-transparent" />
          <div className={`absolute inset-x-0 bottom-0 p-4 text-[#F6F1E8] ${isPreviewMobile ? "" : "sm:p-8"}`}>
            <p className="w-fit border border-[#F6F1E8]/40 bg-[#111111]/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">
              Premium thrift / archive drop
            </p>
            <h1
              className={`mt-4 max-w-3xl break-words text-[clamp(2.2rem,10vw,2.65rem)] font-semibold leading-[0.98] ${
                isPreviewMobile ? "" : "sm:text-[56px] lg:text-[74px]"
              }`}
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              {getHeroTitle(store)}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#F6F1E8]/80 sm:text-base sm:leading-7">
              {getHeroSubtitle(store)}
            </p>
            <div className={`mt-4 grid gap-2.5 ${isPreviewMobile ? "" : "sm:mt-6 sm:flex sm:flex-wrap sm:gap-3"}`}>
              <a
                href="#products"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#F6F1E8] px-5 text-sm font-bold !text-[#111111] hover:!text-[#111111]"
              >
                Shop new drop
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <a
                href="#booking"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#F6F1E8]/40 px-5 text-sm font-bold !text-[#F6F1E8] hover:!text-[#EFE3C8]"
              >
                How booking works
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          {coverProduct ? (
            <div className="border border-[#DDD4C7] bg-[#F4EFE6] p-4 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A2E2E]">
                Cover piece
              </p>
              <div
                className={`mt-4 grid gap-4 ${
                  isPreviewMobile ? "grid-cols-[84px_1fr]" : "grid-cols-[84px_1fr] sm:grid-cols-[130px_1fr]"
                }`}
              >
                {coverProduct.imageUrl ? (
                  <img
                    src={coverProduct.imageUrl}
                    alt={coverProduct.title || "Cover piece"}
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover"
                  />
                ) : (
                  <span className="grid aspect-[4/5] w-full place-items-center bg-[#EFE3C8] text-[#6F6A60]">
                    <StoreIcon size={18} aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0">
                  <h2
                    className="text-2xl font-semibold leading-tight text-[#111111] sm:text-3xl"
                    style={{ fontFamily: "Georgia, ui-serif, serif" }}
                  >
                    {coverProduct.title || "Featured piece"}
                  </h2>
                  {coverProduct.description ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6F6A60]">
                      {coverProduct.description}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex bg-[#EFE3C8] px-3 py-1 text-xs font-semibold text-[#7A2E2E]">
                    {coverProduct.scarcity || coverProduct.badge || "Limited drop"}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <div className={`grid gap-3 ${isPreviewMobile ? "" : "sm:grid-cols-3 lg:grid-cols-1"}`}>
            {socialProof.slice(0, 3).map((item) => (
              <div key={item} className="border border-[#DDD4C7] bg-[#F6F1E8] p-4">
                <BadgeCheck size={18} aria-hidden="true" className="text-[#5F6448]" />
                <p className="mt-3 text-sm font-semibold text-[#111111]">{item}</p>
              </div>
            ))}
          </div>
          <div className="border border-[#DDD4C7] bg-[#111111] p-5 text-[#F6F1E8]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#EFE3C8]">
              Drop note
            </p>
            <p
              className="mt-3 text-2xl font-semibold leading-tight"
              style={{ fontFamily: "Georgia, ui-serif, serif" }}
            >
              One-off pieces move fast. Reserve first, confirm details on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
