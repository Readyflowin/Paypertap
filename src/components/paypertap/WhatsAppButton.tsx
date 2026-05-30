import { type AnchorHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

import { PayPerTapInlineLoader, PptBrandIcon } from "@/components/ui";
import { buildWhatsAppUrl } from "@/lib/phone";

type WhatsAppButtonSize = "sm" | "md" | "lg";

export type WhatsAppButtonProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href" | "onClick"
> & {
  href?: string;
  phone?: string;
  message?: string;
  children?: ReactNode;
  size?: WhatsAppButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
};

const sizeClasses: Record<WhatsAppButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-base",
};

export function getWhatsAppHref({ href, phone, message }: Pick<WhatsAppButtonProps, "href" | "phone" | "message">) {
  if (href) return href;

  return buildWhatsAppUrl(phone || "", message || "") || "#";
}

export function WhatsAppButton({
  href,
  phone,
  message,
  children,
  size = "md",
  fullWidth = false,
  isLoading = false,
  className,
  onClick,
  ...props
}: WhatsAppButtonProps) {
  return (
    <a
      href={getWhatsAppHref({ href, phone, message })}
      target="_blank"
      rel="noreferrer"
      aria-busy={isLoading || undefined}
      onClick={onClick}
      className={clsx(
        "ppt-focus-ring inline-flex shrink-0 items-center justify-center gap-2 rounded-[var(--ppt-radius-md)] bg-[var(--ppt-whatsapp)] font-semibold leading-none text-[#072d17] shadow-[0_12px_24px_rgba(37,211,102,0.22)] transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#1fbd5b] hover:shadow-[0_18px_40px_rgba(37,211,102,0.26)] active:scale-[0.98]",
        fullWidth && "w-full",
        isLoading && "pointer-events-none opacity-75",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading ? <PayPerTapInlineLoader tone="whatsapp" /> : <PptBrandIcon type="whatsapp" size={18} />}
      <span>{isLoading ? "Preparing message..." : children || "Message on WhatsApp"}</span>
    </a>
  );
}
