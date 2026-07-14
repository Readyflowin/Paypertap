import { IndianRupee, ShieldCheck } from "lucide-react";

import googlePayLogo from "@/assets/payment/google-pay-logo.svg";
import phonePeLogo from "@/assets/payment/phonepe-logo.svg";
import upiLogo from "@/assets/payment/upi-logo.svg";
import { PptBrandIcon } from "@/components/ui";

type PaymentTrustVariant = "theme1";

type PaymentTrustStripProps = {
  compact?: boolean;
  showTrustRows?: boolean;
  variant: PaymentTrustVariant;
};

const variantClasses: Record<
  PaymentTrustVariant,
  {
    shell: string;
    label: string;
    badge: string;
    logoBadge: string;
    iconBadge: string;
  }
> = {
  theme1: {
    shell:
      "border-neutral-200 bg-white text-neutral-600 shadow-[0_12px_32px_rgba(17,18,23,0.04)]",
    label: "text-neutral-950",
    badge: "border-neutral-200 bg-neutral-50 text-neutral-700",
    logoBadge: "border-neutral-200 bg-white",
    iconBadge: "bg-neutral-950 text-white",
  },
};

const paymentLogos = [
  {
    alt: "UPI accepted by seller",
    imageClassName: "max-h-[18px] max-w-[64px] sm:max-h-[22px] sm:max-w-[88px]",
    src: upiLogo,
  },
  {
    alt: "Google Pay accepted by seller",
    imageClassName: "h-[18px] w-[76px] sm:h-[22px] sm:w-[92px]",
    src: googlePayLogo,
  },
  {
    alt: "PhonePe accepted by seller",
    imageClassName: "max-h-[18px] max-w-[64px] sm:max-h-[22px] sm:max-w-[88px]",
    src: phonePeLogo,
  },
];

export function PaymentTrustStrip({
  compact = false,
  showTrustRows = true,
  variant,
}: PaymentTrustStripProps) {
  const classes = variantClasses[variant];

  return (
    <section
      aria-label="Payment and Order trust"
      className={`min-w-0 rounded-[24px] border ${classes.shell} ${
        compact ? "p-3" : "p-3.5 sm:p-4"
      }`}
    >
      <div
        className={`flex min-w-0 flex-col gap-3 ${
          compact ? "" : "sm:flex-row sm:items-center sm:justify-between"
        }`}
      >
        <div className="min-w-0">
          <p className={`text-xs font-semibold ${classes.label}`}>Place your order</p>
          <p className="mt-1 text-xs leading-5">
            order details go to the seller. Payment and delivery are confirmed directly.
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap gap-1.5 sm:justify-end sm:gap-2">
          {paymentLogos.map((logo) => (
            <span
              key={logo.alt}
              className={`inline-flex h-8 min-w-0 max-w-[90px] shrink items-center justify-center rounded-full border px-2.5 sm:h-9 sm:max-w-[104px] sm:px-3 ${classes.logoBadge}`}
            >
              <img
                src={logo.src}
                alt={logo.alt}
                decoding="async"
                loading="lazy"
                draggable={false}
                className={`block object-contain ${logo.imageClassName}`}
              />
            </span>
          ))}
        </div>
      </div>

      {showTrustRows ? (
        <div className={`mt-3 grid gap-2 ${compact ? "" : "min-[560px]:grid-cols-3"}`}>
          <div
            className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${classes.badge}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${classes.iconBadge}`}
            >
              <ShieldCheck size={14} aria-hidden="true" />
            </span>
            <span className="min-w-0 whitespace-normal break-words">
              order details sent to seller
            </span>
          </div>
          <div
            className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${classes.badge}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${classes.iconBadge}`}
            >
              <PptBrandIcon type="whatsapp" size={15} />
            </span>
            <span className="min-w-0 whitespace-normal break-words">
              Seller chat after order
            </span>
          </div>
          <div
            className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${classes.badge}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${classes.iconBadge}`}
            >
              <IndianRupee size={14} aria-hidden="true" />
            </span>
            <span className="min-w-0 whitespace-normal break-words">
              Pay the seller directly
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
