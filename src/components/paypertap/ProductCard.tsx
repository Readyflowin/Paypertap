import { type ReactNode } from "react";
import clsx from "clsx";

import { Badge, Button, Card, type BadgeProps } from "@/components/ui";
import { formatINR } from "@/lib/money";
import { getDisplayImageUrl } from "@/lib/imageUrls";
import {
  getAvailableQuantity as getSharedAvailableQuantity,
  getProductUnavailableLabel,
} from "@/lib/productAvailability";

import { StatusBadge } from "./StatusBadge";

type ProductCardMode = "public" | "dashboard" | "compact";

export type ProductCardProps = {
  title: string;
  price: number;
  imageUrl?: string;
  category?: string;
  status?: "open" | "reserved" | "sold" | "hidden" | string;
  inventoryQuantity?: number;
  reservedQuantity?: number;
  soldQuantity?: number;
  badge?: string;
  href?: string;
  productHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onClick?: () => void;
  mode?: ProductCardMode;
  actions?: ReactNode;
  className?: string;
};

function getAvailableQuantity({
  inventoryQuantity,
  reservedQuantity,
  soldQuantity,
}: Pick<ProductCardProps, "inventoryQuantity" | "reservedQuantity" | "soldQuantity">) {
  if (
    typeof inventoryQuantity !== "number" ||
    typeof reservedQuantity !== "number" ||
    typeof soldQuantity !== "number"
  ) {
    return undefined;
  }

  return getSharedAvailableQuantity({
    inventoryQuantity,
    reservedQuantity,
    soldQuantity,
  });
}

function getCardBadge(props: ProductCardProps, availableQuantity?: number): {
  label: string;
  variant: BadgeProps["variant"];
} | null {
  const normalizedStatus = props.status?.toLowerCase();

  if (normalizedStatus === "sold") return { label: "Sold out", variant: "dark" };
  if (availableQuantity === 1) return { label: "1 left", variant: "warning" };
  if (typeof availableQuantity === "number" && availableQuantity <= 0) {
    const label =
      normalizedStatus === "reserved"
        ? "Reserved"
        : getProductUnavailableLabel({
            status: props.status,
            inventoryQuantity: props.inventoryQuantity,
            reservedQuantity: props.reservedQuantity,
            soldQuantity: props.soldQuantity,
          });

    return { label, variant: label === "Reserved" ? "warning" : "neutral" };
  }
  if (props.badge) return { label: props.badge, variant: "primary" };
  if (normalizedStatus === "open") return { label: "Open", variant: "success" };
  if (props.status) return { label: props.status, variant: "neutral" };

  return null;
}

function ProductImage({
  imageUrl,
  title,
  href,
  onClick,
  compact = false,
}: Pick<ProductCardProps, "imageUrl" | "title" | "href" | "onClick"> & { compact?: boolean }) {
  const safeImageUrl = getDisplayImageUrl(imageUrl);
  const image = safeImageUrl ? (
    <img
      src={safeImageUrl}
      alt={title}
      decoding="async"
      loading="lazy"
      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
    />
  ) : (
    <span className="text-xs font-bold text-[var(--ppt-text-muted)]">Product image</span>
  );

  const imageClassName = clsx(
    "group/image flex shrink-0 items-center justify-center overflow-hidden bg-[var(--ppt-surface-soft)]",
    compact ? "h-20 w-20 rounded-[var(--ppt-radius-lg)]" : "aspect-[4/5] w-full"
  );

  if (href) {
    return (
      <a href={href} className={imageClassName} aria-label={`View ${title}`}>
        {image}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={clsx(imageClassName, "text-left")}>
        {image}
      </button>
    );
  }

  return <div className={imageClassName}>{image}</div>;
}

function ProductTitle({
  title,
  href,
  onClick,
  className,
}: Pick<ProductCardProps, "title" | "href" | "onClick"> & { className?: string }) {
  const titleClassName = clsx(
    "line-clamp-2 text-left font-bold leading-snug text-[var(--ppt-text)] transition hover:text-[var(--ppt-primary-dark)]",
    className
  );

  if (href) {
    return (
      <a href={href} className={titleClassName}>
        {title}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={titleClassName}>
        {title}
      </button>
    );
  }

  return <h3 className={titleClassName}>{title}</h3>;
}

function Cta({
  href,
  onClick,
  ctaLabel,
  ctaDisabled,
}: Pick<ProductCardProps, "href" | "onClick" | "ctaLabel" | "ctaDisabled">) {
  if (ctaDisabled) {
    return (
      <Button fullWidth disabled variant="secondary">
        {ctaLabel}
      </Button>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className="ppt-focus-ring inline-flex min-h-11 w-full items-center justify-center rounded-[var(--ppt-radius-md)] bg-[var(--ppt-primary)] px-4 text-sm font-bold text-white shadow-[var(--ppt-shadow-button)] transition hover:-translate-y-0.5 hover:bg-[var(--ppt-primary-dark)]"
      >
        {ctaLabel}
      </a>
    );
  }

  return (
    <Button fullWidth onClick={onClick}>
      {ctaLabel}
    </Button>
  );
}

export function ProductCard({
  title,
  price,
  imageUrl,
  category,
  status = "open",
  inventoryQuantity,
  reservedQuantity,
  soldQuantity,
  badge,
  href,
  productHref,
  ctaHref,
  ctaLabel = "View product",
  ctaDisabled = false,
  onClick,
  mode = "public",
  actions,
  className,
}: ProductCardProps) {
  const availableQuantity = getAvailableQuantity({
    inventoryQuantity,
    reservedQuantity,
    soldQuantity,
  });
  const displayBadge = getCardBadge(
    { title, price, status, inventoryQuantity, reservedQuantity, soldQuantity, badge },
    availableQuantity
  );
  const detailHref = productHref || href;
  const actionHref = ctaHref || href;

  if (mode === "dashboard") {
    return (
      <Card
        padding="sm"
        hoverable
        className={clsx(
          "flex items-center gap-4 border-[var(--ppt-border)] hover:border-[rgba(109,61,245,0.38)]",
          className
        )}
      >
        <ProductImage imageUrl={imageUrl} title={title} href={detailHref} onClick={onClick} compact />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <ProductTitle title={title} href={detailHref} onClick={onClick} className="text-base" />
            <StatusBadge type="product" status={status} />
          </div>
          {category ? (
            <p className="mt-1 text-sm text-[var(--ppt-text-muted)]">{category}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-black text-[var(--ppt-text)]">{formatINR(price)}</span>
            {typeof availableQuantity === "number" ? (
              <span className="text-[var(--ppt-text-muted)]">{availableQuantity} available</span>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </Card>
    );
  }

  if (mode === "compact") {
    return (
      <Card padding="sm" hoverable className={clsx("flex gap-3", className)}>
        <ProductImage imageUrl={imageUrl} title={title} href={detailHref} onClick={onClick} compact />
        <div className="min-w-0 flex-1">
          <ProductTitle title={title} href={detailHref} onClick={onClick} className="text-sm" />
          <p className="mt-1 text-base font-black text-[var(--ppt-text)]">{formatINR(price)}</p>
          <p className="mt-2 text-xs font-semibold text-[var(--ppt-text-muted)]">
            Order through seller checkout
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      padding="sm"
      hoverable
      className={clsx(
        "group overflow-hidden p-0 hover:border-[rgba(109,61,245,0.38)]",
        className
      )}
    >
      <ProductImage imageUrl={imageUrl} title={title} href={detailHref} onClick={onClick} />
      <div className="p-4">
        <div className="mb-3 flex min-h-7 items-center justify-between gap-2">
          {category ? (
            <span className="truncate text-xs font-semibold text-[var(--ppt-text-muted)]">
              {category}
            </span>
          ) : (
            <span />
          )}
          {displayBadge ? <Badge variant={displayBadge.variant}>{displayBadge.label}</Badge> : null}
        </div>

        <ProductTitle title={title} href={detailHref} onClick={onClick} className="text-base" />

        <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
          <p className="text-xl font-black text-[var(--ppt-text)]">{formatINR(price)}</p>
          <span className="rounded-full bg-[var(--ppt-primary-soft)] px-2.5 py-1 text-xs font-bold text-[var(--ppt-primary-dark)]">
            Place order
          </span>
        </div>

        <div className="mt-4">
          <Cta href={actionHref} onClick={onClick} ctaLabel={ctaLabel} ctaDisabled={ctaDisabled} />
        </div>
      </div>
    </Card>
  );
}
