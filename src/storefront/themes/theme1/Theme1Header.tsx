import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, ImageIcon, Menu, Search, ShoppingBag, User, X } from "lucide-react";

import { getCollectionSlug } from "@/lib/collections";
import { formatINR } from "@/lib/money";
import { getStoreContactInfo } from "@/storefront/storePolicies";
import type { StorefrontProduct, StorefrontThemeProps } from "../types";
import { shareTheme1Store } from "./Theme1Navigation";
import {
  adaptTheme1Product,
  adaptTheme1Store,
  getTheme1ProductDescription,
  getTheme1ProductId,
  getTheme1ProductTitle,
  getTheme1StoreDescription,
} from "./theme1Utils";

export function Theme1Header({
  collections = [],
  isPreviewMobile = false,
  onProductSelect,
  products = [],
  store,
  storeSlug,
}: {
  collections?: StorefrontThemeProps["collections"];
  isPreviewMobile?: boolean;
  onProductSelect?: (product: StorefrontProduct) => void;
  products?: StorefrontProduct[];
  store: StorefrontThemeProps["store"];
  storeSlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const displayStore = adaptTheme1Store({ collections, products, store });
  const desktopNavItems = [
    { label: "Shop", href: "#products" },
    { label: "Collections", href: "#products" },
    { label: "New arrivals", href: "#products-all" },
  ];
  const storePath = storeSlug ? `/${storeSlug}` : "#top";
  const policiesPath = storeSlug ? `/${storeSlug}/policies/returns` : "#footer";
  const collectionsPath = storeSlug ? `/${storeSlug}/collections` : "#products";
  const contact = getStoreContactInfo(store);
  const contactHref =
    contact.whatsappUrl ||
    contact.supportPhoneHref ||
    contact.supportEmailHref ||
    `${storePath}#footer`;
  const featuredCollections = displayStore.collections.slice(0, 4);
  const featuredProducts = products.slice(0, 3);
  const mobileNavItems = [
    { label: "Home", href: storePath },
    { label: "Collections", href: collectionsPath },
    { label: "Policies", href: policiesPath },
    { label: "About", href: `${storePath}#footer` },
    { label: "Contact", href: contactHref },
  ];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!searchOpen) return [];

    const source = normalizedQuery
      ? products.filter((product) => {
          const displayProduct = adaptTheme1Product(product);

          return [
            displayProduct.title,
            displayProduct.collection,
            displayProduct.description,
            displayProduct.badge,
            product.category,
            product.collectionName,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        })
      : products;

    return source.slice(0, 6);
  }, [normalizedQuery, products, searchOpen]);

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

  const handleProductSelect = (product: StorefrontProduct) => {
    onProductSelect?.(product);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const shareStore = async () => {
    await shareTheme1Store({ collections, products, store, storeSlug: storeSlug || "" });
  };

  return (
    <>
      <div className="border-b border-[#111111] bg-[#111111] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffffff]">
        {displayStore.announcement}
      </div>
      <header className="sticky top-0 z-20 border-b border-[#ece7df] bg-[#fffdfa]/96 px-4 py-3 backdrop-blur-xl">
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
            className={`h-10 w-10 place-items-center rounded-full text-[#2b2926] ${
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
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#111111] text-xs font-semibold text-[#ffffff]">
              {displayStore.logoUrl ? (
                <img
                  src={displayStore.logoUrl}
                  alt={`${displayStore.name} logo`}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
              ) : (
                displayStore.logoText
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold uppercase tracking-[0.02em] text-[#111111] sm:text-base">
                {displayStore.name}
              </span>
              <span className={`${isPreviewMobile ? "hidden" : "hidden max-w-[220px] truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#60646c] sm:block"}`}>
                {store.tagline || store.bio || "Curated storefront"}
              </span>
            </span>
          </a>

          <nav
            className={`items-center gap-7 text-sm font-medium text-[#2b2926] ${
              isPreviewMobile ? "hidden" : "hidden md:flex"
            }`}
          >
            {desktopNavItems.map((item) => (
              <a key={item.label} href={item.href} className="!text-[#2b2926] hover:!text-[#111111]">
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
              className="grid h-10 w-10 place-items-center rounded-full text-[#2b2926]"
            >
              <Search size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Wishlist"
              className="grid h-10 w-10 place-items-center rounded-full text-[#2b2926]"
            >
              <Heart size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Account"
              className="grid h-10 w-10 place-items-center rounded-full text-[#2b2926]"
            >
              <User size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Orders"
              className="grid h-10 w-10 place-items-center rounded-full text-[#2b2926]"
            >
              <ShoppingBag size={18} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            aria-label="Search this store"
            ref={isPreviewMobile ? searchButtonRef : undefined}
            onClick={openSearch}
            className={`h-10 w-10 place-items-center justify-self-end rounded-full text-[#2b2926] ${
              isPreviewMobile ? "grid" : "grid md:hidden"
            }`}
          >
            <Search size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        role="presentation"
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-[#111111]/54 backdrop-blur-sm transition duration-300 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        } ${isPreviewMobile ? "" : "md:hidden"}`}
      >
        <aside
          aria-label="Theme 1 mobile navigation"
          aria-modal="true"
          role="dialog"
          onClick={(event) => event.stopPropagation()}
          className={`flex h-full w-[min(92vw,380px)] flex-col bg-[#ffffff] px-5 py-4 shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#111111] text-sm font-semibold text-[#ffffff]">
                  {displayStore.logoUrl ? (
                    <img
                      src={displayStore.logoUrl}
                      alt={`${displayStore.name} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    displayStore.logoText
                  )}
                </span>
                <strong className="min-w-0 truncate text-lg text-[#111111]">
                  {displayStore.name}
                </strong>
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#60646c]">
                {getTheme1StoreDescription(store)}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close menu"
              ref={closeButtonRef}
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e5e7eb] bg-[#f7f7f8] text-[#111111]"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <nav className="mt-8 grid overflow-hidden rounded-2xl bg-[#f7f4ef]">
            {mobileNavItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center border-b border-[#e7e1d8] px-4 text-base font-semibold !text-[#111111] last:border-b-0 hover:!text-[#6f6b64]"
              >
                {item.label}
              </a>
            ))}
            <button
              type="button"
              onClick={shareStore}
              className="min-h-12 px-4 text-left text-base font-semibold text-[#111111]"
            >
              Share Store
            </button>
          </nav>

          <div className="mt-7 min-h-0 flex-1 overflow-y-auto pb-3">
            {featuredCollections.length ? (
              <section aria-label="Featured collections">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d867d]">
                  Featured collections
                </p>
                <div className="mt-3 grid gap-2">
                  {featuredCollections.map((collection) => (
                    <a
                      key={collection}
                      href={`${collectionsPath}/${getCollectionSlug(collection)}`}
                      onClick={() => setOpen(false)}
                      className="flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-[#fbfaf7] px-4 text-sm font-semibold !text-[#111111]"
                    >
                      <span className="min-w-0 truncate">{collection}</span>
                      <span aria-hidden="true">-&gt;</span>
                    </a>
                  ))}
                </div>
              </section>
            ) : featuredProducts.length ? (
              <section aria-label="Featured products">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d867d]">
                  Featured products
                </p>
                <div className="mt-3 grid gap-3">
                  {featuredProducts.map((product) => {
                    const displayProduct = adaptTheme1Product(product);
                    const productHref =
                      storeSlug && getTheme1ProductId(product)
                        ? `/${storeSlug}/product/${getTheme1ProductId(product)}`
                        : "#products";

                    return (
                      <a
                        key={displayProduct.id || getTheme1ProductTitle(product)}
                        href={productHref}
                        onClick={() => setOpen(false)}
                        className="grid min-h-[74px] grid-cols-[56px_1fr] gap-3 rounded-2xl bg-[#fbfaf7] p-2 !text-[#111111]"
                      >
                        {displayProduct.imageUrl ? (
                          <img
                            src={displayProduct.imageUrl}
                            alt={displayProduct.title}
                            loading="lazy"
                            decoding="async"
                            className="aspect-[4/5] h-full w-full object-cover"
                          />
                        ) : (
                          <span className="grid aspect-[4/5] h-full w-full place-items-center bg-[#f1f2f4] text-[#60646c]">
                            <ImageIcon size={18} aria-hidden="true" />
                          </span>
                        )}
                        <span className="min-w-0 self-center">
                          <span className="line-clamp-2 text-sm font-semibold leading-5">
                            {displayProduct.title}
                          </span>
                          <span className="mt-1 block text-xs font-semibold text-[#60646c]">
                            {formatINR(displayProduct.price)}
                          </span>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
        </aside>
      </div>

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
            className="mx-auto mt-14 max-h-[calc(100%-72px)] w-full max-w-lg overflow-y-auto border border-[#e5e7eb] bg-[#ffffff] p-4 shadow-[0_24px_70px_rgba(17,17,17,0.24)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d867d]">
                  Search store
                </p>
                <h2
                  className="mt-1 text-2xl font-semibold leading-tight text-[#111111]"
                  style={{ fontFamily: "Georgia, ui-serif, serif" }}
                >
                  Find a product
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#e5e7eb] bg-[#f7f7f8] text-[#111111]"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <label className="mt-4 flex min-h-12 items-center gap-2 rounded-full border border-[#e5e7eb] bg-[#ffffff] px-4 focus-within:border-[#111111]">
              <Search size={17} aria-hidden="true" className="shrink-0 text-[#60646c]" />
              <span className="sr-only">Search products</span>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search products, sizes, categories..."
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#111111] outline-none placeholder:text-[#8b9099]"
              />
            </label>

            <div className="mt-4 grid gap-2">
              {searchResults.length ? (
                searchResults.map((product) => {
                  const displayProduct = adaptTheme1Product(product);

                  return (
                    <button
                      key={displayProduct.id || getTheme1ProductTitle(product)}
                      type="button"
                      onClick={() => handleProductSelect(product)}
                      className="grid min-h-[76px] grid-cols-[58px_1fr] gap-3 border border-[#e5e7eb] bg-[#ffffff] p-2 text-left transition hover:border-[#111111] hover:bg-[#f7f7f8]"
                    >
                      {displayProduct.imageUrl ? (
                        <img
                          src={displayProduct.imageUrl}
                          alt={displayProduct.title}
                          loading="lazy"
                          decoding="async"
                          className="aspect-[4/5] h-full w-full object-cover"
                        />
                      ) : (
                        <span className="grid aspect-[4/5] h-full w-full place-items-center bg-[#f1f2f4] text-[#60646c]">
                          <ImageIcon size={18} aria-hidden="true" />
                        </span>
                      )}
                      <span className="min-w-0 self-center">
                        <span className="line-clamp-2 text-sm font-semibold leading-5 text-[#111111]">
                          {displayProduct.title}
                        </span>
                        <span className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-xs font-semibold text-[#60646c]">
                          <span>{formatINR(displayProduct.price)}</span>
                          <span className="max-w-full truncate">{displayProduct.collection}</span>
                        </span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="border border-[#e5e7eb] bg-[#ffffff] p-4 text-sm leading-6 text-[#60646c]">
                  No products match that search. Try another name, size, or category.
                </p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
