import { Link } from "react-router-dom";
import { Store as StoreIcon } from "lucide-react";

import { getDisplayImageUrl } from "@/lib/imageUrls";
import {
  getStoreContactInfo,
  getStoreFooterCollectionNames,
  getStoreFooterSubheading,
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

export function Theme1EditorialFooter({
  collections: managedCollections,
  isPreviewMobile = false,
  store,
  storeSlug = "",
}: {
  collections?: StorefrontThemeProps["collections"];
  isPreviewMobile?: boolean;
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
  const aboutText = getStoreFooterSubheading(liveStore);

  return (
    <footer id="footer" className="mt-8 bg-[#111111] px-3 py-10 text-[#F6F1E8] sm:px-4">
      <div
        className={`mx-auto grid max-w-7xl gap-8 ${
          isPreviewMobile ? "" : "md:grid-cols-[1.2fr_0.8fr_0.8fr]"
        }`}
      >
        <div className="min-w-0">
          <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-[#F6F1E8] text-sm font-semibold text-[#111111]">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${contact.displayName} logo`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              logoText || <StoreIcon size={18} aria-hidden="true" />
            )}
          </div>
          <h2
            className="mt-4 break-words text-3xl font-semibold leading-tight"
            style={{ fontFamily: "Georgia, ui-serif, serif" }}
          >
            {contact.displayName}
          </h2>
          <p className="mt-3 max-w-md break-words text-sm leading-6 text-[#F6F1E8]/60">
            {aboutText}
          </p>
          <p className="mt-5 text-xs font-medium text-[#F6F1E8]/36">
            Powered by PayPerTap.
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EFE3C8]/70">
            Links
          </p>
          <div className="mt-3 grid gap-1 text-sm text-[#F6F1E8]/70">
            {contact.instagramUrl ? (
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 max-w-full items-center break-words !text-[#DDD4C7] hover:!text-[#EFE3C8]"
              >
                {contact.instagramLabel || "Instagram"}
              </a>
            ) : (
              <a href="#footer" className="inline-flex min-h-10 items-center !text-[#DDD4C7] hover:!text-[#EFE3C8]">
                Instagram
              </a>
            )}
            <a href="#booking" className="inline-flex min-h-10 items-center !text-[#DDD4C7] hover:!text-[#EFE3C8]">
              WhatsApp
            </a>
            <a href="#faq" className="inline-flex min-h-10 items-center !text-[#DDD4C7] hover:!text-[#EFE3C8]">
              Policies / FAQ
            </a>
            {contact.supportEmail ? (
              contact.supportEmailHref ? (
                <a
                  href={contact.supportEmailHref}
                  className="inline-flex min-h-10 max-w-full items-center break-words !text-[#DDD4C7] hover:!text-[#EFE3C8]"
                >
                  {contact.supportEmail}
                </a>
              ) : (
                <span className="inline-flex min-h-10 max-w-full items-center break-words text-[#DDD4C7]">
                  {contact.supportEmail}
                </span>
              )
            ) : null}
          </div>
          {policyLinks.length ? (
            <nav className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-[#F6F1E8]/40">
              {policyLinks.map((policy) => (
                <Link
                  key={policy.type}
                  to={`/${storeSlug}/policies/${policy.type}`}
                  className="hover:!text-[#EFE3C8]"
                >
                  {policy.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#EFE3C8]/70">
            Collections
          </p>
          <div className="mt-3 grid gap-1 text-sm text-[#F6F1E8]/70">
            {collectionNames.length ? (
              collectionNames.slice(0, 4).map((collection) => (
                <a
                  key={collection}
                  href="#products"
                  className="inline-flex min-h-10 max-w-full items-center break-words !text-[#DDD4C7] hover:!text-[#EFE3C8]"
                >
                  {collection}
                </a>
              ))
            ) : (
              <a href="#products" className="inline-flex min-h-10 items-center !text-[#DDD4C7] hover:!text-[#EFE3C8]">
                All products
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
