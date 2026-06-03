import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { formatINR } from "@/lib/money";
import { Theme1Preview } from "./themes/theme1/Theme1Preview";
import { Theme2Preview } from "./themes/theme2/Theme2Preview";
import { Theme3Preview } from "./themes/theme3/Theme3Preview";
import type { PreviewDevice } from "./ThemePreviewControls";
import type {
  PreviewProduct,
  PreviewStorefrontData,
  PreviewThemeId,
} from "./types";

const themeComponents = {
  editorial: Theme1Preview,
  boutique: Theme2Preview,
  instagram: Theme3Preview,
};

export function ThemePreviewShell({
  data,
  device,
  themeId,
}: {
  data: PreviewStorefrontData;
  device: PreviewDevice;
  themeId: PreviewThemeId;
}) {
  const [selectedProduct, setSelectedProduct] = useState<PreviewProduct | null>(null);
  const PreviewTheme = themeComponents[themeId];
  const viewportClass = useMemo(
    () =>
      device === "mobile"
        ? "mx-auto h-[760px] w-full max-w-[390px] overflow-hidden rounded-[34px] border-[6px] border-neutral-950 bg-neutral-950 shadow-[0_28px_90px_rgba(17,24,39,0.28)]"
        : "min-h-[760px] overflow-hidden rounded-[30px] border border-neutral-200 bg-white shadow-[0_24px_70px_rgba(17,24,39,0.12)]",
    [device]
  );
  const innerClass =
    device === "mobile"
      ? "relative h-full transform-gpu overflow-y-auto rounded-[26px] bg-white"
      : "min-h-[760px] overflow-hidden bg-white";

  return (
    <section
      className={`min-w-0 overflow-hidden rounded-[30px] border border-neutral-200 bg-neutral-100/80 shadow-inner ${
        device === "mobile" ? "p-2 sm:p-3" : "p-3 sm:p-4"
      }`}
    >
      <div className={viewportClass}>
        <div className={innerClass}>
          <PreviewTheme
            {...data}
            onProductSelect={setSelectedProduct}
            previewDevice={device}
          />
        </div>
      </div>

      {selectedProduct ? (
        <MockProductPanel
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </section>
  );
}

function MockProductPanel({
  onClose,
  product,
}: {
  onClose: () => void;
  product: PreviewProduct;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-950/60 px-4 py-6 backdrop-blur-sm">
      <section
        aria-label={`${product.title} preview details`}
        aria-modal="true"
        role="dialog"
        className="grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.3)] md:grid-cols-[0.9fr_1fr]"
      >
        <div className="relative min-h-[260px] bg-neutral-100">
          <img
            src={product.imageUrl}
            alt={product.title}
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="overflow-y-auto p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
                Mock product preview
              </p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.045em] text-neutral-950">
                {product.title}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close product preview"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-500 hover:text-neutral-950"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <strong className="text-2xl tracking-[-0.04em] text-neutral-950">
              {formatINR(product.price)}
            </strong>
            {product.compareAtPrice ? (
              <span className="text-sm text-neutral-400 line-through">
                {formatINR(product.compareAtPrice)}
              </span>
            ) : null}
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {product.scarcity}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-neutral-600">{product.description}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PreviewOptionGroup label="Sizes" values={product.sizes} />
            <PreviewOptionGroup label="Colors" values={product.colors} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 min-h-12 w-full rounded-2xl bg-neutral-950 px-5 text-sm font-semibold text-white"
          >
            Preview CTA only - no checkout
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-neutral-500">
            This panel is local demo UI. It does not call checkout, Razorpay, or Firestore.
          </p>
        </div>
      </section>
    </div>
  );
}

function PreviewOptionGroup({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
