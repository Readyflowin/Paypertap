import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";

import { formatINR } from "@/lib/money";
import type { PreviewProduct, PreviewStore } from "../../types";

export function Theme1Header({
  isPreviewMobile = false,
  onProductSelect,
  products = [],
  store,
}: {
  isPreviewMobile?: boolean;
  onProductSelect?: (product: PreviewProduct) => void;
  products?: PreviewProduct[];
  store: PreviewStore;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const desktopNavItems = [
    { label: "New Drop", href: "#products" },
    { label: "Rare Finds", href: "#products" },
    { label: "Reviews", href: "#seller-reviews" },
    { label: "How It Works", href: "#booking" },
  ];
  const mobileNavItems = [
    { label: "New Drop", href: "#products" },
    { label: "Rare Finds", href: "#products" },
    { label: "Seller Reviews", href: "#seller-reviews" },
    { label: "How Booking Works", href: "#booking" },
    { label: "FAQ", href: "#faq" },
    { label: "Instagram", href: "#footer" },
  ];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    const source = normalizedQuery
      ? products.filter((product) =>
          [
            product.title,
            product.collection,
            product.description,
            product.badge,
            ...(product.sizes ?? []),
            ...(product.colors ?? []),
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        )
      : products.slice(0, 4);

    return source.slice(0, 5);
  }, [normalizedQuery, products]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let scrollParent = menuButtonRef.current?.parentElement;

    while (scrollParent) {
      if (scrollParent.scrollHeight > scrollParent.clientHeight) {
        break;
      }

      scrollParent = scrollParent.parentElement;
    }

    const lockTarget = scrollParent ?? document.body;
    const originalOverflow = lockTarget.style.overflow;
    lockTarget.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      lockTarget.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeyDown);
      searchButtonRef.current?.focus();
    };
  }, [searchOpen]);

  const openSearch = () => {
    setSearchOpen(true);
    setOpen(false);
  };

  const handleProductSelect = (product: PreviewProduct) => {
    onProductSelect?.(product);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <div className="border-b border-[#2d1b16] bg-[#111111] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F6F1E8]">
        {store.announcement}
      </div>
      <header className="sticky top-0 z-20 border-b border-[#DDD4C7] bg-[#F6F1E8]/95 px-3 py-3 backdrop-blur-xl sm:px-4">
        <div
          className={`mx-auto max-w-7xl items-center gap-2 ${
            isPreviewMobile
              ? "grid grid-cols-[44px_1fr_44px]"
              : "grid grid-cols-[44px_1fr_44px] md:flex md:justify-between md:gap-5"
          }`}
        >
          <button
            type="button"
            aria-label="Open menu"
            ref={menuButtonRef}
            onClick={() => setOpen(true)}
            className={`h-10 w-10 place-items-center rounded-full border border-[#DDD4C7] bg-[#F4EFE6] text-[#111111] ${
              isPreviewMobile ? "grid" : "grid md:hidden"
            }`}
          >
            <Menu size={19} aria-hidden="true" />
          </button>

          <a
            href="#top"
            className={`flex min-w-0 items-center justify-center gap-2 !text-[#111111] hover:!text-[#111111] ${
              isPreviewMobile ? "" : "md:justify-start"
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#111111] text-sm font-semibold text-[#F6F1E8]">
              {store.logoText}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold text-[#111111] sm:text-lg">
                {store.name}
              </span>
              <span className={`${isPreviewMobile ? "hidden" : "hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6F6A60] sm:block"}`}>
                Editorial thrift
              </span>
            </span>
          </a>

          <nav
            className={`items-center gap-6 text-sm font-semibold text-[#3a342d] ${
              isPreviewMobile ? "hidden" : "hidden md:flex"
            }`}
          >
            {desktopNavItems.map((item) => (
              <a key={item.label} href={item.href} className="!text-[#3a342d] hover:!text-[#7A2E2E]">
                {item.label}
              </a>
            ))}
          </nav>

          <div className={`items-center gap-2 ${isPreviewMobile ? "hidden" : "hidden md:flex"}`}>
            <button
              type="button"
              aria-label="Search this drop"
              ref={searchButtonRef}
              onClick={openSearch}
              className="grid h-10 w-10 place-items-center rounded-full border border-[#DDD4C7] bg-[#F4EFE6] text-[#111111]"
            >
              <Search size={18} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            aria-label="Search this drop"
            ref={isPreviewMobile ? searchButtonRef : undefined}
            onClick={openSearch}
            className={`h-10 w-10 place-items-center justify-self-end rounded-full border border-[#DDD4C7] bg-[#F4EFE6] text-[#111111] ${
              isPreviewMobile ? "grid" : "grid md:hidden"
            }`}
          >
            <Search size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {open ? (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          className={`fixed inset-0 z-40 bg-[#111111]/60 backdrop-blur-sm ${
            isPreviewMobile ? "" : "md:hidden"
          }`}
        >
          <aside
            aria-label="Theme 1 mobile navigation"
            onClick={(event) => event.stopPropagation()}
            className="h-full w-[min(92vw,360px)] bg-[#F6F1E8] px-5 py-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#111111] text-sm font-semibold text-[#F6F1E8]">
                  {store.logoText}
                </span>
                <strong className="text-lg text-[#111111]">{store.name}</strong>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                ref={closeButtonRef}
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-[#DDD4C7] bg-[#F4EFE6] text-[#111111]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <nav className="mt-10 grid gap-2">
              {mobileNavItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center border-b border-[#DDD4C7] px-1 py-3 text-xl font-semibold !text-[#111111] hover:!text-[#7A2E2E]"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <p className="mt-10 max-w-xs text-sm leading-6 text-[#6F6A60]">
              Small-batch vintage and streetwear pieces, reserved locally in this preview.
            </p>
          </aside>
        </div>
      ) : null}

      {searchOpen ? (
        <div
          role="presentation"
          onClick={() => setSearchOpen(false)}
          className="fixed inset-0 z-40 bg-[#111111]/58 px-3 py-4 backdrop-blur-sm"
        >
          <section
            aria-label="Search this drop"
            aria-modal="true"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
            className="mx-auto mt-14 max-h-[calc(100%-72px)] w-full max-w-lg overflow-y-auto border border-[#DDD4C7] bg-[#F6F1E8] p-4 shadow-[0_24px_70px_rgba(17,17,17,0.24)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7A2E2E]">
                  Search drop
                </p>
                <h2
                  className="mt-1 text-2xl font-semibold leading-tight text-[#111111]"
                  style={{ fontFamily: "Georgia, ui-serif, serif" }}
                >
                  Find a piece
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#DDD4C7] bg-[#F4EFE6] text-[#111111]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <label className="mt-4 flex min-h-12 items-center gap-2 border border-[#DDD4C7] bg-[#F9F5ED] px-3 focus-within:border-[#7A2E2E]">
              <Search size={17} aria-hidden="true" className="shrink-0 text-[#6F6A60]" />
              <span className="sr-only">Search products</span>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search jackets, denim, tees..."
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#111111] outline-none placeholder:text-[#8f8679]"
              />
            </label>

            <div className="mt-4 grid gap-2">
              {searchResults.length ? (
                searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProductSelect(product)}
                    className="grid min-h-[76px] grid-cols-[58px_1fr] gap-3 border border-[#DDD4C7] bg-[#F9F5ED] p-2 text-left transition hover:border-[#7A2E2E] hover:bg-[#F4EFE6]"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/5] h-full w-full object-cover"
                    />
                    <span className="min-w-0 self-center">
                      <span className="line-clamp-2 text-sm font-semibold leading-5 text-[#111111]">
                        {product.title}
                      </span>
                      <span className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[#6F6A60]">
                        <span>{formatINR(product.price)}</span>
                        <span className="max-w-full truncate">{product.collection}</span>
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="border border-[#DDD4C7] bg-[#F9F5ED] p-4 text-sm leading-6 text-[#6F6A60]">
                  No pieces match that search. Try denim, jackets, tees, or accessories.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
