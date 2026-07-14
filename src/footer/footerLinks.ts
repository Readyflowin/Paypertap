import { headerLinks } from "../header/headerLinks";

export const productLinks = [
  { label: "Verified order", to: "/features/verified-order" },
  { label: "Link-in-bio storefront", to: "/features/link-in-bio-storefront" },
  { label: "WhatsApp handoff", to: "/features/whatsapp-handoff" },
  { label: "Compare tools", to: "/compare" },
];

export const sellerLinks = [
  { label: "Instagram sellers", to: "/for/instagram-sellers" },
  { label: "WhatsApp sellers", to: "/for/whatsapp-sellers" },
  { label: "Thrift sellers", to: "/for/thrift-sellers" },
  { label: "Boutique owners", to: "/for/boutiques" },
  { label: "Handmade sellers", to: "/for/handmade-sellers" },
  { label: "Student sellers", to: "/for/student-sellers" },
];

export const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Founder of PayPerTap", to: "/founder" },
  { label: "Contact", to: "/contact" },
  ...headerLinks
    .filter((item) => item.to === "/pricing" || item.to === "/faq")
    .map((item) => ({ ...item })),
];

export const legalLinks = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Refund & Cancellation", to: "/refund-cancellation" },
];
