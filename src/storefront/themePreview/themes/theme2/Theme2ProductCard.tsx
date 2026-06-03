import { formatINR } from "@/lib/money";
import type { PreviewProduct } from "../../types";

export function Theme2ProductCard({
  onSelect,
  product,
}: {
  onSelect: (product: PreviewProduct) => void;
  product: PreviewProduct;
}) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-[#eadfd4] bg-white shadow-[0_14px_42px_rgba(82,58,41,0.07)]">
      <button type="button" onClick={() => onSelect(product)} className="block h-full w-full text-left">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f2e8dc]">
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4d3a2f]">
            {product.badge}
          </span>
        </div>
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9a8370]">
            {product.collection}
          </p>
          <h3 className="mt-2 line-clamp-2 min-h-11 text-base font-semibold leading-5 tracking-[-0.025em] text-[#231812]">
            {product.title}
          </h3>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <strong className="text-lg tracking-[-0.04em] text-[#231812]">
                {formatINR(product.price)}
              </strong>
              {product.compareAtPrice ? (
                <span className="ml-2 text-xs text-[#b39d8a] line-through">
                  {formatINR(product.compareAtPrice)}
                </span>
              ) : null}
            </div>
            <span className="rounded-full border border-[#decbb9] bg-[#fff8f0] px-2.5 py-1 text-[11px] font-semibold text-[#7d6654]">
              {product.scarcity}
            </span>
          </div>
          <span className="mt-4 flex min-h-10 items-center justify-center rounded-2xl bg-[#3b2b22] text-sm font-semibold text-white">
            Book for Rs. 20
          </span>
        </div>
      </button>
    </article>
  );
}
