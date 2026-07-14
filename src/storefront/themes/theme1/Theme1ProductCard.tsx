import { Heart, ImageIcon } from "lucide-react";

import { formatINR } from "@/lib/money";
import type { StorefrontProduct } from "../types";
import {
  adaptTheme1Product,
  getTheme1ProductId,
  getTheme1ProductTitle,
} from "./theme1Utils";

export function Theme1ProductCard({
  fallbackIndex,
  isSaved,
  onSelect,
  onToggleSaved,
  product,
}: {
  fallbackIndex: number;
  isSaved: boolean;
  onSelect: (product: StorefrontProduct) => void;
  onToggleSaved: (product: StorefrontProduct, fallbackIndex: number) => void;
  product: StorefrontProduct;
}) {
  const displayProduct = adaptTheme1Product(product);
  const showBadge = displayProduct.badge && displayProduct.badge !== "Available";

  return (
    <article className="group min-w-0 bg-[#ffffff]">
      <div className="relative">
        <button
          type="button"
          aria-label={`View ${getTheme1ProductTitle(product)}`}
          onClick={() => onSelect(product)}
          className="block w-full text-left"
        >
          <div className="relative aspect-[4/5] overflow-hidden bg-[#f3f1ed]">
            {displayProduct.imageUrl ? (
              <img
                src={displayProduct.imageUrl}
                alt={displayProduct.title}
                loading="lazy"
                decoding="async"
                fetchPriority="auto"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#6f6b64]">
                <ImageIcon size={24} aria-hidden="true" />
                <span className="text-xs font-medium">Product image</span>
              </span>
            )}
            {showBadge ? (
              <span className="absolute left-2 top-2 bg-[#ff1f1f] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-white sm:left-3 sm:top-3">
                {displayProduct.badge}
              </span>
            ) : null}
          </div>
          <div className="min-w-0 pt-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 min-h-10 break-words text-sm font-medium uppercase leading-5 tracking-[0.01em] text-[#22201d] sm:text-base">
                {displayProduct.title}
              </h3>
            </div>
            <div className="mt-1 min-w-0">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
                <p className="text-base font-semibold text-[#111111] sm:text-lg">
                  {formatINR(displayProduct.price)}
                </p>
                {displayProduct.compareAtPrice ? (
                  <p className="text-xs text-[#8b9099] line-through">
                    {formatINR(displayProduct.compareAtPrice)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          aria-label={isSaved ? "Remove saved item" : "Save item"}
          onClick={() => onToggleSaved(product, fallbackIndex)}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#111111] shadow-sm backdrop-blur sm:right-3 sm:top-3"
        >
          <Heart
            size={16}
            aria-hidden="true"
            fill={isSaved ? "currentColor" : "none"}
          />
        </button>
      </div>
    </article>
  );
}

export function getTheme1ProductCardKey(product: StorefrontProduct) {
  return getTheme1ProductId(product) || getTheme1ProductTitle(product);
}
