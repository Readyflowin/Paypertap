import { useState } from "react";
import { AtSign, Menu, X } from "lucide-react";

import type { PreviewStore } from "../../types";

export function Theme3Header({ store }: { store: PreviewStore }) {
  const [open, setOpen] = useState(false);
  const nav = ["Live", "Drops", "Trust", "FAQ"];

  return (
    <>
      <div className="bg-lime-300 px-4 py-2 text-center text-xs font-black uppercase tracking-[0.16em] text-neutral-950">
        {store.announcement}
      </div>
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08080a]/92 px-4 py-3 text-white backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-[18px] bg-white text-sm font-black text-neutral-950">
              {store.logoText}
            </div>
            <div>
              <p className="text-lg font-black tracking-[-0.04em]">{store.name}</p>
              <p className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/48">
                <AtSign size={12} />
                creator storefront
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-xs font-black uppercase tracking-[0.12em] text-white/62 md:flex">
            {nav.map((item) => (
              <a key={item} href="#products" className="hover:text-white">
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#products"
            className="hidden rounded-full bg-white px-5 py-2.5 text-xs font-black uppercase tracking-[0.1em] text-neutral-950 md:inline-flex"
          >
            Shop now
          </a>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/8 md:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden">
          <aside className="ml-auto h-full w-[82%] max-w-sm bg-[#08080a] p-5 text-white">
            <div className="flex items-center justify-between">
              <strong className="text-xl font-black tracking-[-0.04em]">{store.name}</strong>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-white/8"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="mt-8 grid gap-3">
              {nav.map((item) => (
                <a
                  key={item}
                  href="#products"
                  onClick={() => setOpen(false)}
                  className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-3 text-sm font-black uppercase tracking-[0.1em]"
                >
                  {item}
                </a>
              ))}
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
