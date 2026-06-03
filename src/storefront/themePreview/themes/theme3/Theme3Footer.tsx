import type { PreviewStore } from "../../types";

export function Theme3Footer({ store }: { store: PreviewStore }) {
  return (
    <footer className="mt-8 border-t border-white/10 bg-[#050506] px-4 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <div className="grid h-12 w-12 place-items-center rounded-[18px] bg-white text-sm font-black text-neutral-950">
            {store.logoText}
          </div>
          <h2 className="mt-4 text-4xl font-black tracking-[-0.07em]">{store.name}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/48">
            Internal Instagram-store preview. Product clicks never go to checkout.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {store.collections.slice(0, 4).map((collection) => (
            <a
              key={collection}
              href="#products"
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-white/48"
            >
              {collection}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
