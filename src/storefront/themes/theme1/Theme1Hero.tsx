import { ArrowRight } from "lucide-react";

import { getDisplayImageUrl } from "@/lib/imageUrls";

type Theme1HeroStore = {
  storeName?: string;
  name?: string;
  heroImageUrl?: string;
  heroTitle?: string;
  heroHeading?: string;
  heroSubtitle?: string;
  heroPrimaryCtaText?: string;
  tagline?: string;
  bio?: string;
};

type Theme1HeroProduct = {
  title?: string;
  imageUrl?: string;
};

function getStoreName(store: Theme1HeroStore) {
  return store.storeName || store.name || "PayPerTap Store";
}

function getHeroTitle(store: Theme1HeroStore) {
  return store.heroTitle || store.heroHeading || getStoreName(store);
}

function getHeroSubtitle(store: Theme1HeroStore) {
  return store.heroSubtitle || store.tagline || store.bio || "New arrivals are live now.";
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

  if (!heroImageUrl) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-5">
        <div className="rounded-[30px] bg-[#111111] px-5 py-12 text-center text-white sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
            New drop
          </p>
          <h1
            className="mx-auto mt-3 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
            style={{ fontFamily: "Georgia, ui-serif, serif" }}
          >
            {getHeroTitle(store)}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/70">
            {getHeroSubtitle(store)}
          </p>
          <a
            href="#products"
            className="mx-auto mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold !text-[#111111]"
          >
            Shop all
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-4">
      <div
        className={`relative overflow-hidden rounded-[30px] bg-[#111111] ${
          isPreviewMobile ? "min-h-[470px]" : "min-h-[470px] sm:min-h-[620px]"
        }`}
      >
        <img
          src={heroImageUrl}
          alt={`${getStoreName(store)} hero`}
          decoding="async"
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#111111]/82 via-[#111111]/18 to-transparent px-5 pb-7 pt-24 text-center text-white sm:px-8 sm:pb-10">
          <h1
            className="mx-auto max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl"
            style={{ fontFamily: "Georgia, ui-serif, serif" }}
          >
            {getHeroTitle(store)}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/78">
            {getHeroSubtitle(store)}
          </p>
          <a
            href="#products"
            className="mx-auto mt-5 inline-flex min-h-12 items-center justify-center rounded-full border border-white/70 bg-white/8 px-7 text-sm font-semibold !text-white backdrop-blur transition hover:bg-white hover:!text-[#111111]"
          >
            {store.heroPrimaryCtaText || "Shop all"}
          </a>
        </div>
      </div>
    </section>
  );
}
