import { IndianRupee, ShieldCheck } from "lucide-react";

import googlePayLogo from "@/assets/payment/google-pay-logo.svg";
import phonePeLogo from "@/assets/payment/phonepe-logo.svg";
import upiLogo from "@/assets/payment/upi-logo.svg";
import { PptBrandIcon } from "@/components/ui";
import { BOOKING_ADVANCE_AMOUNT } from "@/lib/money";

type PaymentTrustVariant = "theme1" | "theme2" | "theme3";

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
  theme2: {
    shell:
      "border-[#e7ded4] bg-[#fffaf4] text-[#6f6257] shadow-[0_14px_38px_rgba(78,61,43,0.05)]",
    label: "text-[#171411]",
    badge: "border-[#dfd3c6] bg-white/72 text-[#53473d]",
    logoBadge: "border-[#dfd3c6] bg-white/82",
    iconBadge: "bg-[#171411] text-[#fffaf4]",
  },
  theme3: {
    shell:
      "border-neutral-800 bg-neutral-950 text-white/68 shadow-[0_18px_44px_rgba(10,10,12,0.16)]",
    label: "text-white",
    badge: "border-white/12 bg-white/8 text-white/72",
    logoBadge: "border-white/12 bg-white/95",
    iconBadge: "bg-white text-neutral-950",
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
      aria-label="Payment and booking trust"
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
          <p
            className={`text-xs font-semibold uppercase tracking-[0.14em] ${classes.label}`}
          >
            Booking and payment
          </p>
          <p className="mt-1 text-xs leading-5">
            Pay the booking fee on PayPerTap. Confirm the remaining amount
            directly with the seller.
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
      <div
        className={`mt-3 grid gap-2 ${
          compact ? "" : "min-[560px]:grid-cols-3"
        }`}
      >
        <div
          className={`flex min-w-0 items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium ${classes.badge}`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${classes.iconBadge}`}
          >
            <ShieldCheck size={14} aria-hidden="true" />
          </span>
          <span className="min-w-0 whitespace-normal break-words">
            ₹{BOOKING_ADVANCE_AMOUNT} booking via PayPerTap
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
            Seller confirms on WhatsApp
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
            Remaining amount paid directly to seller
          </span>
        </div>
      </div>
      ) : null}
    </section>
  );
}
