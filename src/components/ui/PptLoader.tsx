import clsx from "clsx";

export function PptTapLoader({
  title = "Preparing WhatsApp...",
  description = "Used for booking success, redirects and seller actions.",
  className,
}: {
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={clsx("pds-loader-card", className)}>
      <div className="pds-tap-pulse" />
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}

export function PptSkeletonProductGrid({ className }: { className?: string }) {
  return (
    <div className={clsx("pds-skeleton-grid", className)}>
      {[1, 2, 3, 4].map((item) => (
        <div className="pds-skeleton-product" key={item}>
          <div className="pds-skeleton-img" />
          <div className="pds-skeleton-line short" />
          <div className="pds-skeleton-line" />
          <div className="pds-skeleton-line long" />
        </div>
      ))}
    </div>
  );
}
