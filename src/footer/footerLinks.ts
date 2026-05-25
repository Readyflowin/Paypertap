import { headerLinks } from "../header/headerLinks";

export const productLinks = [
  { label: "Verified booking", to: "/features/verified-booking" },
  { label: "Link-in-bio storefront", to: "/features/link-in-bio-storefront" },
  { label: "WhatsApp handoff", to: "/features/whatsapp-handoff" },
  { label: "Compare tools", to: "/compare" },
];

export const sellerLinks = [
  { label: "Instagram sellers", to: "/for/instagram-sellers" },
  { label: "WhatsApp sellers", to: "/for/whatsapp-sellers" },
  { label: "Thrift sellers", to: "/for/thrift-sellers" },
  { label: "Boutique owners", to: "/for/boutiques" },
];

export const companyLinks = [
  ...headerLinks.map((item) => ({
    ...item,
    label: item.to === "/founder" ? "Founder of PayPerTap" : item.label,
  })),
  { label: "Contact", to: "/contact" },
];

export const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Refund & Cancellation", to: "/refund-cancellation" },
];
