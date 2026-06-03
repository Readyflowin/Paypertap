import { Heart } from "lucide-react";

import { formatINR } from "@/lib/money";
import type { PreviewProduct } from "../../types";

export function Theme3ProductCard({
  onSelect,
  product,
}: {
  onSelect: (product: PreviewProduct) => void;
  product: PreviewProduct;
}) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-white/10 bg-white/8 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
      <button type="button" onClick={() => onSelect(product)} className="block h-full w-full text-left">
        <div className="relative aspect-square overflow-hidden bg-neutral-800">
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span className="absolute left-2 top-2 rounded-full bg-lime-300 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-neutral-950">
            {product.badge}
          </span>
          <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-neutral-950/78 text-white">
            <Heart size={15} />
          </span>
        </div>
        <div className="p-3 text-white">
          <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-5 tracking-[-0.02em]">
            {product.title}
          </h3>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/38">
            {product.collection}
          </p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <strong className="text-lg tracking-[-0.04em]">{formatINR(product.price)}</strong>
            <span className="rounded-full border border-white/12 px-2 py-1 text-[10px] font-black uppercase text-white/56">
              {product.scarcity}
            </span>
          </div>
          <span className="mt-3 flex min-h-10 items-center justify-center rounded-2xl bg-white text-xs font-black uppercase tracking-[0.08em] text-neutral-950">
            Book Rs. 20
          </span>
        </div>
      </button>
    </article>
  );
}
