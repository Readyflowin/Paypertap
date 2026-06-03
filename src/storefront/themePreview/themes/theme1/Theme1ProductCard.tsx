import { Heart } from "lucide-react";

import { formatINR } from "@/lib/money";
import type { PreviewProduct } from "../../types";

export function Theme1ProductCard({
  onSelect,
  product,
}: {
  onSelect: (product: PreviewProduct) => void;
  product: PreviewProduct;
}) {
  return (
    <article className="group min-w-0 overflow-hidden border border-[#DDD4C7] bg-[#F9F5ED] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(25,20,15,0.12)]">
      <button
        type="button"
        aria-label={`View ${product.title}`}
        onClick={() => onSelect(product)}
        className="block w-full text-left"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[#EFE3C8]">
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="absolute left-2 top-2 bg-[#EFE3C8]/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7A2E2E] sm:left-3 sm:top-3 sm:px-3">
            {product.badge}
          </span>
          <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-[#111111]/90 text-[#F6F1E8] backdrop-blur sm:right-3 sm:top-3">
            <Heart size={16} aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 p-2.5 sm:p-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 min-h-10 break-words text-sm font-semibold leading-5 text-[#111111] sm:text-base">
              {product.title}
            </h3>
          </div>
          <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6F6A60]">
            {product.collection}
          </p>
          <div className="mt-3 grid min-w-0 gap-2">
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#111111] sm:text-lg">
                {formatINR(product.price)}
              </p>
              {product.compareAtPrice ? (
                <p className="text-xs text-[#8f8679] line-through">
                  {formatINR(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
            <span className="inline-flex min-h-9 w-full items-center justify-center bg-[#111111] px-2.5 text-[11px] font-semibold text-[#F6F1E8] sm:px-3">
              View piece
            </span>
          </div>
          <p className="mt-3 text-[11px] font-semibold text-[#7A2E2E]">{product.scarcity}</p>
        </div>
      </button>
    </article>
  );
}
