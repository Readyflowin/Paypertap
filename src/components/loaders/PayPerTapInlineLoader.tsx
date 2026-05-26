import clsx from "clsx";

export type PayPerTapInlineLoaderProps = {
  label?: string;
  tone?: "light" | "dark" | "brand" | "whatsapp";
  className?: string;
};

export function PayPerTapInlineLoader({
  label,
  tone = "brand",
  className,
}: PayPerTapInlineLoaderProps) {
  return (
    <span className={clsx("ppt-inline-loader", `ppt-inline-loader-${tone}`, className)}>
      <span className="ppt-inline-loader-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {label ? <span className="ppt-inline-loader-label">{label}</span> : null}
    </span>
  );
}
