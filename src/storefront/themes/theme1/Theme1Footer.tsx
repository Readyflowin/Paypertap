import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Store as StoreIcon } from "lucide-react";

import { PptBrandIcon } from "@/components/ui";
import { getDisplayImageUrl } from "@/lib/imageUrls";
import {
  getStoreContactInfo,
  getStoreFooterCollectionNames,
  getStorePolicyLinks,
} from "../../storePolicies";
import type { StorefrontThemeProps } from "../types";

type Theme1FooterStore = Partial<StorefrontThemeProps["store"]> & {
  name?: string;
  logoText?: string;
  collections?: string[];
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function isValidFooterEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

export function Theme1EditorialFooter({
  collections: managedCollections,
  reserveStickySpace = false,
  store,
  storeSlug = "",
}: {
  collections?: StorefrontThemeProps["collections"];
  isPreviewMobile?: boolean;
  reserveStickySpace?: boolean;
  store: Theme1FooterStore;
  storeSlug?: string;
}) {
  const liveStore = store as StorefrontThemeProps["store"];
  const contact = getStoreContactInfo(liveStore);
  const collectionNames =
    getStoreFooterCollectionNames(managedCollections).length > 0
      ? getStoreFooterCollectionNames(managedCollections)
      : store.collections?.slice(0, 4) ?? [];
  const policyLinks = storeSlug ? getStorePolicyLinks(liveStore) : [];
  const logoUrl = getDisplayImageUrl(store.logoUrl || store.storeLogoUrl);
  const logoText =
    store.logoText || getInitials(contact.displayName || store.name || "Store");
  const [email, setEmail] = useState("");
  const [signupStatus, setSignupStatus] = useState<"idle" | "saved" | "error">("idle");
  const [signupMessage, setSignupMessage] = useState("");

  function handleEmailSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidFooterEmail(email)) {
      setSignupStatus("error");
      setSignupMessage("Enter a valid email address.");
      return;
    }

    setEmail("");
    setSignupStatus("saved");
    setSignupMessage("Thanks for joining.");
  }

  return (
    <footer
      id="footer"
      className={`mt-6 border-t border-[#e8e3db] bg-[#fbfaf7] px-5 pt-7 text-[#2b2926] sm:px-6 ${
        reserveStickySpace
          ? "pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:pb-8"
          : "pb-8"
      }`}
    >
      <div className="mx-auto max-w-md">
        <h2
          className="text-2xl font-medium leading-tight tracking-[-0.02em] text-[#2b2926]"
          style={{ fontFamily: "Georgia, ui-serif, serif" }}
        >
          Join our email list
        </h2>
        <p className="mt-2 max-w-xs text-sm leading-6 text-[#6f6b64]">
          Get exclusive deals and early access to new products.
        </p>

        <form onSubmit={handleEmailSignup} className="mt-5">
          <label className="flex min-h-14 items-center rounded-full border border-[#e5ded4] bg-white px-5 shadow-sm focus-within:border-[#2b2926]">
            <span className="sr-only">Email address</span>
            <input
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (signupStatus !== "idle") {
                  setSignupStatus("idle");
                  setSignupMessage("");
                }
              }}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email address"
              className="min-w-0 flex-1 bg-transparent text-sm text-[#2b2926] outline-none placeholder:text-[#8d867d]"
            />
            <button
              type="submit"
              aria-label="Join email list"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#2b2926] transition hover:bg-[#f5f1ea]"
            >
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </label>
          {signupMessage ? (
            <p
              className={`mt-2 text-xs font-medium ${
                signupStatus === "error" ? "text-red-600" : "text-[#4b4a45]"
              }`}
            >
              {signupMessage}
            </p>
          ) : null}
        </form>

        <div className="mt-9 text-center">
          <div className="mx-auto mb-4 grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[#e5ded4] bg-white text-xs font-semibold text-[#2b2926]">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${contact.displayName} logo`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              logoText || <StoreIcon size={16} aria-hidden="true" />
            )}
          </div>
          <p className="text-xs text-[#8d867d]">
            Â© 2026 {contact.displayName}
          </p>

          {policyLinks.length ? (
            <nav className="mt-5 text-xs text-[#4b4a45]">
              <Link
                to={`/${storeSlug}/policies/Order`}
                className="hover:!text-[#111111]"
              >
                Terms and Policies
              </Link>
            </nav>
          ) : null}

          {contact.instagramUrl ? (
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="mx-auto mt-6 grid h-9 w-9 place-items-center rounded-full !text-[#4b4a45] hover:!text-[#111111]"
            >
              <PptBrandIcon type="instagram" size={20} />
            </a>
          ) : null}

          {collectionNames.length ? (
            <nav className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b948b]">
              {collectionNames.slice(0, 3).map((collection) => (
                <a key={collection} href="#products" className="hover:!text-[#111111]">
                  {collection}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
