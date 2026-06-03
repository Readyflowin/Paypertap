import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";

import type { PreviewStore } from "../../types";

export function Theme2Header({ store }: { store: PreviewStore }) {
  const [open, setOpen] = useState(false);
  const nav = ["Bestsellers", "Collections", "Reviews", "How it works"];

  return (
    <>
      <div className="bg-[#f3e7da] px-4 py-2 text-center text-xs font-semibold text-[#6f5948]">
        {store.announcement}
      </div>
      <header className="sticky top-0 z-20 border-b border-[#eadfd4] bg-[#fffdf9]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#3b2b22] text-sm font-semibold text-[#fffdf9]">
              {store.logoText}
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.035em] text-[#231812]">
                {store.name}
              </p>
              <p className="text-xs text-[#8c7664]">Boutique demo</p>
            </div>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#6f5948] md:flex">
            {nav.map((item) => (
              <a key={item} href="#products" className="hover:text-[#231812]">
                {item}
              </a>
            ))}
          </nav>
          <a
            href="#products"
            className="hidden rounded-full bg-[#3b2b22] px-5 py-2.5 text-sm font-semibold text-white md:inline-flex"
          >
            Shop bestsellers
          </a>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#eadfd4] bg-white md:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>
      {open ? (
        <div className="fixed inset-0 z-40 bg-[#231812]/50 backdrop-blur-sm md:hidden">
          <aside className="ml-auto h-full w-[82%] max-w-sm bg-[#fffdf9] p-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-semibold text-[#231812]">
                <ShoppingBag size={18} />
                {store.name}
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#eadfd4]"
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
                  className="rounded-2xl border border-[#eadfd4] bg-[#fff8f0] px-4 py-3 text-sm font-semibold text-[#4d3a2f]"
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
