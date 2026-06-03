import { BadgeCheck, Zap } from "lucide-react";

import type { PreviewProduct, PreviewStore } from "../../types";

export function Theme3Hero({
  product,
  store,
}: {
  product: PreviewProduct;
  store: PreviewStore;
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[1fr_0.82fr] lg:items-stretch lg:py-8">
      <div className="rounded-[34px] border border-white/10 bg-white/8 p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,0.32)] sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-neutral-950">
          <Zap size={14} />
          Live drop
        </div>
        <h1 className="mt-6 text-5xl font-black leading-[0.88] tracking-[-0.08em] sm:text-7xl lg:text-8xl">
          Fast drops for social-first stores.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-white/62">
          {store.heroSubtitle}
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {store.socialProof.map((item) => (
            <span key={item} className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs font-bold text-white/72">
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="relative min-h-[470px] overflow-hidden rounded-[34px] bg-neutral-900">
        <img
          src={product.imageUrl}
          alt={product.title}
          decoding="async"
          fetchPriority="high"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-4 bottom-4 rounded-[28px] border border-white/12 bg-neutral-950/82 p-4 text-white backdrop-blur">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-lime-200">
            <BadgeCheck size={14} />
            Verified hold
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.05em]">{product.title}</h2>
          <p className="mt-1 text-sm font-bold text-white/58">Book for Rs. 20 in preview style</p>
        </div>
      </div>
    </section>
  );
}
