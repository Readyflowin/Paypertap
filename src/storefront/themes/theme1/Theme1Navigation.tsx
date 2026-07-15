import { useEffect, useMemo, useState } from "react";
import { Camera, Grid2X2, Home, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getStoreContactInfo } from "@/storefront/storePolicies";
import type { StorefrontThemeProps } from "../types";
import {
  adaptTheme1Store,
  getTheme1StoreDescription,
} from "./theme1Utils";

function getStorePath(storeSlug: string) {
  return `/${storeSlug}`;
}

function getStoreShareUrl(storeSlug: string) {
  if (typeof window === "undefined") {
    return getStorePath(storeSlug);
  }

  return `${window.location.origin}${getStorePath(storeSlug)}`;
}

export async function shareTheme1Store({
  collections = [],
  products = [],
  store,
  storeSlug,
}: {
  collections?: StorefrontThemeProps["collections"];
  products?: StorefrontThemeProps["products"];
  store: StorefrontThemeProps["store"];
  storeSlug: string;
}) {
  const displayStore = adaptTheme1Store({ collections, products, store });
  const shareUrl = getStoreShareUrl(storeSlug);

  try {
    if (navigator.share) {
      await navigator.share({
        title: displayStore.name,
        text: getTheme1StoreDescription(store),
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard?.writeText(shareUrl);
  } catch {
    // Sharing is best-effort storefront chrome; buyers can continue browsing.
  }
}

function Theme1Snackbar({ message }: { message: string }) {
  return (
    <div
      aria-live="polite"
      className={`fixed inset-x-4 bottom-[6.1rem] z-[60] mx-auto max-w-sm rounded-full bg-[#111111] px-4 py-3 text-center text-xs font-semibold text-white shadow-[0_16px_44px_rgba(17,17,17,0.22)] transition duration-300 sm:hidden ${
        message ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      {message}
    </div>
  );
}

export function Theme1BottomNav({
  collections = [],
  products = [],
  store,
  storeSlug,
}: {
  collections?: StorefrontThemeProps["collections"];
  products?: StorefrontThemeProps["products"];
  store: StorefrontThemeProps["store"];
  storeSlug: string;
}) {
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const contact = useMemo(() => getStoreContactInfo(store), [store]);
  const contactHref =
    contact.whatsappUrl ||
    contact.supportPhoneHref ||
    contact.supportEmailHref ||
    `${getStorePath(storeSlug)}#footer`;

  useEffect(() => {
    if (!toastMessage) return;

    const timeoutId = window.setTimeout(() => setToastMessage(""), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  useEffect(() => {
    if (!moreOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  const openInstagram = () => {
    if (contact.instagramUrl) {
      window.open(contact.instagramUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setToastMessage("Seller has not added their Instagram yet.");
  };

  const closeMore = () => {
    setMoreOpen(false);
    setAboutOpen(false);
  };

  const moreActions = [
    {
      label: "Share Store",
      onClick: () =>
        shareTheme1Store({ collections, products, store, storeSlug }),
    },
    {
      label: "Store Policies",
      onClick: () => {
        closeMore();
        navigate(`/${storeSlug}/policies/returns`);
      },
    },
    {
      label: "Contact Seller",
      onClick: () => {
        closeMore();
        window.location.href = contactHref;
      },
    },
    {
      label: "About Store",
      onClick: () => setAboutOpen((current) => !current),
    },
  ];

  return (
    <>
      <Theme1Snackbar message={toastMessage} />

      {moreOpen ? (
        <div
          role="presentation"
          onClick={closeMore}
          className="fixed inset-0 z-50 bg-[#111111]/46 px-3 backdrop-blur-sm sm:hidden"
        >
          <section
            aria-label="More store actions"
            aria-modal="true"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
            className="absolute inset-x-0 bottom-0 rounded-t-[26px] bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_60px_rgba(17,17,17,0.22)]"
            style={{ animation: "theme1SheetIn 240ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#d8d2c8]" />
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#111111]">More</p>
              <button
                type="button"
                aria-label="Close more actions"
                onClick={closeMore}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#f2f0ec] text-[#111111]"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-3 grid overflow-hidden rounded-2xl bg-[#f7f4ef]">
              {moreActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className="min-h-12 border-b border-[#e7e1d8] px-4 text-left text-sm font-semibold text-[#111111] last:border-b-0"
                >
                  {action.label}
                </button>
              ))}
            </div>
            {aboutOpen ? (
              <p className="mt-3 rounded-2xl bg-[#fbfaf7] px-4 py-3 text-sm leading-6 text-[#625d55]">
                {getTheme1StoreDescription(store)}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}

      <nav
        aria-label="Store quick navigation"
        className="fixed inset-x-3 bottom-3 z-40 rounded-[22px] border border-[#e5ded4] bg-white/94 px-2 py-2 shadow-[0_12px_34px_rgba(17,17,17,0.18)] backdrop-blur-xl sm:hidden"
      >
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => navigate(getStorePath(storeSlug))}
            className="grid min-h-12 place-items-center rounded-2xl text-[10px] font-medium text-[#2b2926]"
          >
            <Home size={19} aria-hidden="true" />
            <span>Home</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/${storeSlug}/collections`)}
            className="grid min-h-12 place-items-center rounded-2xl text-[10px] font-medium text-[#2b2926]"
          >
            <Grid2X2 size={19} aria-hidden="true" />
            <span>Collections</span>
          </button>
          <button
            type="button"
            onClick={openInstagram}
            className="grid min-h-12 place-items-center rounded-2xl text-[10px] font-medium text-[#2b2926]"
          >
            <Camera size={19} aria-hidden="true" />
            <span>Instagram</span>
          </button>
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="grid min-h-12 place-items-center rounded-2xl text-[10px] font-medium text-[#2b2926]"
          >
            <Menu size={19} aria-hidden="true" />
            <span>More</span>
          </button>
        </div>
      </nav>

      <style>
        {`@keyframes theme1SheetIn {
          from { transform: translateY(18px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }`}
      </style>
    </>
  );
}
