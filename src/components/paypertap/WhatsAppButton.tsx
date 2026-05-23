import { type AnchorHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

import { LoadingPulse } from "@/components/ui";

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

function normalizePhone(phone?: string) {
  return phone?.replace(/[^\d]/g, "") ?? "";
}

export function getWhatsAppHref({ href, phone, message }: Pick<WhatsAppButtonProps, "href" | "phone" | "message">) {
  if (href) return href;

  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : "";
  const normalizedPhone = normalizePhone(phone);

  return normalizedPhone
    ? `https://wa.me/${normalizedPhone}${encodedMessage}`
    : `https://wa.me/${encodedMessage}`;
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 3.5a8.35 8.35 0 0 0-7.13 12.7l-.91 3.35 3.43-.9a8.34 8.34 0 1 0 4.61-15.15Zm0 1.5a6.84 6.84 0 1 1 0 13.68 6.8 6.8 0 0 1-3.48-.95l-.3-.18-2.02.53.54-1.97-.2-.31A6.84 6.84 0 0 1 12.04 5Zm-2.3 3.38c-.15-.34-.31-.35-.46-.36h-.39c-.14 0-.36.05-.55.26-.19.2-.72.7-.72 1.72 0 1 .74 1.98.84 2.12.1.13 1.44 2.3 3.55 3.13 1.76.7 2.12.56 2.5.53.39-.04 1.24-.51 1.42-1 .18-.5.18-.92.13-1-.06-.1-.2-.15-.42-.26-.22-.12-1.25-.62-1.45-.69-.2-.08-.34-.12-.49.11-.14.22-.56.7-.69.84-.13.15-.25.17-.47.06a5.62 5.62 0 0 1-1.64-1.02 6.2 6.2 0 0 1-1.14-1.43c-.12-.22 0-.34.1-.45.1-.1.22-.25.33-.38.11-.13.15-.22.22-.37.08-.14.04-.28-.02-.39-.05-.11-.48-1.16-.66-1.59Z"
      />
    </svg>
  );
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
      {isLoading ? <LoadingPulse size="sm" tone="whatsapp" inline /> : <WhatsAppIcon />}
      <span>{isLoading ? "Preparing message..." : children || "Message on WhatsApp"}</span>
    </a>
  );
}
