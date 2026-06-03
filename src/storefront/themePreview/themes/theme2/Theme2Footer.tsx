import type { PreviewStore } from "../../types";

export function Theme2Footer({ store }: { store: PreviewStore }) {
  return (
    <footer className="mt-8 border-t border-[#eadfd4] bg-[#fffdf9] px-4 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#3b2b22] text-sm font-semibold text-white">
            {store.logoText}
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-[#231812]">
            {store.name}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#715d4c]">
            Boutique storefront preview. No checkout or data writes happen here.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {store.collections.slice(0, 4).map((collection) => (
            <a
              key={collection}
              href="#products"
              className="rounded-full border border-[#eadfd4] px-3 py-1 text-xs font-semibold text-[#715d4c]"
            >
              {collection}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
