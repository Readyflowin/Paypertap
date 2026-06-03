import { CheckCircle2 } from "lucide-react";

import type { PreviewProduct, PreviewStore } from "../../types";

export function Theme2Hero({
  featureProducts,
  store,
}: {
  featureProducts: PreviewProduct[];
  store: PreviewStore;
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-10">
      <div className="rounded-[34px] bg-[#fff8f0] p-6 shadow-[0_20px_60px_rgba(82,58,41,0.08)] sm:p-8">
        <p className="w-fit rounded-full border border-[#decbb9] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#7d6654]">
          Clean D2C boutique
        </p>
        <h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-[#231812] sm:text-7xl">
          Polished products, easy verified booking.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#715d4c]">
          {store.heroSubtitle}
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {store.trustBadges.slice(0, 4).map((badge) => (
            <div key={badge} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 text-sm font-semibold text-[#4d3a2f]">
              <CheckCircle2 size={17} aria-hidden="true" />
              {badge}
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {featureProducts.slice(0, 4).map((product, index) => (
          <div
            key={product.id}
            className={`overflow-hidden rounded-[26px] bg-[#eadfd4] ${
              index === 0 ? "row-span-2 min-h-[430px]" : "min-h-[210px]"
            }`}
          >
            <img
              src={product.imageUrl}
              alt={product.title}
              decoding="async"
              loading={index === 0 ? "eager" : "lazy"}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
