import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Store as StoreIcon } from "lucide-react";

import { PptEmptyState, PptTapLoader } from "@/components/ui";
import { usePublicStore } from "@/hooks/usePublicStore";
import {
  getStoreContactInfo,
  getStorePolicyContent,
  getStorePolicyLinks,
} from "@/storefront/storePolicies";

function PolicyLoadingState() {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-4 py-8">
      <PptTapLoader
        title="Loading policy..."
        description="Fetching this store's policy details."
      />
    </main>
  );
}

function PolicyErrorState({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-neutral-50 px-4 py-8">
      <PptEmptyState
        title={title}
        description={description}
        icon={<StoreIcon size={22} />}
      />
    </main>
  );
}

export default function StorePolicyPage() {
  const { policyType, storeSlug = "" } = useParams();
  const { data, loading, error } = usePublicStore(storeSlug);

  if (loading) {
    return <PolicyLoadingState />;
  }

  if (!data) {
    const isNotFound = error === "Store not found";

    return (
      <PolicyErrorState
        title={isNotFound ? "Store not found" : "Unable to load this policy"}
        description={
          isNotFound
            ? "This store may be unavailable or not published yet."
            : "Please try again in a little while."
        }
      />
    );
  }

  const policy = getStorePolicyContent(data.store, policyType);
  const contact = getStoreContactInfo(data.store);
  const policyLinks = getStorePolicyLinks(data.store);
  const currentYear = new Date().getFullYear();

  if (!policy) {
    return (
      <PolicyErrorState
        title="Policy not found"
        description="Choose a privacy, returns, or Order policy for this store."
      />
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-neutral-50 px-4 py-6 text-neutral-950 sm:px-6 sm:py-10">
      <article className="mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_18px_60px_rgba(17,18,23,0.08)]">
        <div className="border-b border-neutral-100 px-5 py-5 sm:px-7">
          <Link
            to={`/${storeSlug}`}
            className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-950"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span className="truncate">Back to {contact.displayName}</span>
          </Link>
          <div className="mt-5 flex min-w-0 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white">
              <FileText size={19} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {contact.displayName}
              </p>
              <h1 className="mt-2 break-words text-3xl font-semibold tracking-[-0.05em] text-neutral-950 sm:text-4xl">
                {policy.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[1fr_220px]">
          <section className="min-w-0 space-y-4 text-sm leading-7 text-neutral-600">
            {policy.body.map((paragraph) => (
              <p key={paragraph} className="break-words">
                {paragraph}
              </p>
            ))}
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
              <p className="font-semibold text-neutral-950">Contact</p>
              {contact.ownerName ? <p className="mt-2">{contact.ownerName}</p> : null}
              {contact.supportPhone ? (
                contact.supportPhoneHref ? (
                  <a className="mt-2 block break-words" href={contact.supportPhoneHref}>
                    {contact.supportPhone}
                  </a>
                ) : (
                  <p className="mt-2 break-words">{contact.supportPhone}</p>
                )
              ) : null}
              {contact.supportEmail ? (
                contact.supportEmailHref ? (
                  <a className="mt-2 block break-words" href={contact.supportEmailHref}>
                    {contact.supportEmail}
                  </a>
                ) : (
                  <p className="mt-2 break-words">{contact.supportEmail}</p>
                )
              ) : null}
            </div>
          </section>

          <aside className="min-w-0 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
              Policies
            </p>
            <nav className="mt-3 grid gap-2">
              {policyLinks.map((link) => (
                <Link
                  key={link.type}
                  to={`/${storeSlug}/policies/${link.type}`}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                    link.type === policy.type
                      ? "border-neutral-950 bg-neutral-950 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:text-neutral-950"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>

        <footer className="border-t border-neutral-100 px-5 py-4 text-xs font-medium text-neutral-400 sm:px-7">
          (c) {currentYear} {contact.displayName}. Powered by PayPerTap.
        </footer>
      </article>
    </main>
  );
}
