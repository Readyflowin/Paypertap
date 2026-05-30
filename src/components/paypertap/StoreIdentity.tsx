import clsx from "clsx";

import { Badge, PptBrandIcon } from "../ui";
import { getDisplayImageUrl } from "../../lib/imageUrls";
import { normalizeIndianMobileInput } from "../../lib/phone";

import { getWhatsAppHref } from "./WhatsAppButton";

type StoreIdentityMode = "publicHeader" | "compact" | "dashboard";

export type StoreIdentityProps = {
  storeName: string;
  logoUrl?: string;
  tagline?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  isLive?: boolean;
  mode?: StoreIdentityMode;
  className?: string;
};

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm8.7 2.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 2a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z"
      />
    </svg>
  );
}

function StoreLogo({ storeName, logoUrl, compact }: Pick<StoreIdentityProps, "storeName" | "logoUrl"> & { compact: boolean }) {
  const sizeClassName = compact ? "h-12 w-12 rounded-[var(--ppt-radius-md)]" : "h-16 w-16 rounded-[var(--ppt-radius-lg)]";
  const safeLogoUrl = getDisplayImageUrl(logoUrl);

  if (safeLogoUrl) {
    return (
      <img
        src={safeLogoUrl}
        alt={`${storeName} logo`}
        decoding="async"
        loading={compact ? "lazy" : "eager"}
        className={clsx(sizeClassName, "shrink-0 border border-[var(--ppt-border)] object-cover")}
      />
    );
  }

  return (
    <div
      className={clsx(
        sizeClassName,
        "flex shrink-0 items-center justify-center bg-[linear-gradient(135deg,var(--ppt-primary),#b755f6)] text-xl font-black text-white shadow-[var(--ppt-shadow-soft)]"
      )}
      aria-hidden="true"
    >
      {storeName.charAt(0).toUpperCase()}
    </div>
  );
}

export function StoreIdentity({
  storeName,
  logoUrl,
  tagline,
  instagramUrl,
  whatsappNumber,
  isLive = false,
  mode = "publicHeader",
  className,
}: StoreIdentityProps) {
  const compact = mode === "compact";
  const showWhatsApp = Boolean(
    mode !== "dashboard" && normalizeIndianMobileInput(whatsappNumber || "").ok
  );

  return (
    <div
      className={clsx(
        "flex items-center gap-3",
        mode === "publicHeader" && "rounded-[var(--ppt-radius-xl)] bg-white/85 p-4 shadow-[var(--ppt-shadow-soft)]",
        mode === "dashboard" && "rounded-[var(--ppt-radius-xl)] border border-[var(--ppt-border)] bg-[var(--ppt-surface)] p-4",
        className
      )}
    >
      <StoreLogo storeName={storeName} logoUrl={logoUrl} compact={compact} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            className={clsx(
              "truncate font-black tracking-normal text-[var(--ppt-text)]",
              compact ? "text-lg" : "text-2xl"
            )}
          >
            {storeName}
          </h2>
          {isLive ? <Badge variant="success" size="sm">Live</Badge> : null}
        </div>
        {tagline ? (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--ppt-text-muted)]">
            {tagline}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {instagramUrl ? (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${storeName} on Instagram`}
            className="ppt-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--ppt-radius-md)] border border-transparent bg-[linear-gradient(var(--ppt-surface),var(--ppt-surface))_padding-box,linear-gradient(135deg,#f58529,#dd2a7b,#8134af,#515bd4)_border-box] text-[var(--ppt-text)] shadow-[var(--ppt-shadow-soft)] transition hover:-translate-y-0.5"
          >
            <InstagramIcon />
          </a>
        ) : null}

        {showWhatsApp ? (
          <a
            href={getWhatsAppHref({ phone: whatsappNumber })}
            target="_blank"
            rel="noreferrer"
            aria-label={`Message ${storeName} on WhatsApp`}
            className="ppt-focus-ring inline-flex h-10 w-10 items-center justify-center rounded-[var(--ppt-radius-md)] bg-[var(--ppt-whatsapp)] text-white shadow-[0_12px_24px_rgba(37,211,102,0.18)] transition hover:-translate-y-0.5"
          >
            <PptBrandIcon type="whatsapp" size={20} />
          </a>
        ) : null}
      </div>
    </div>
  );
}
