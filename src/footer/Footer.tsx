import { Link } from "react-router-dom";

import { SharePageButton } from "../components/marketing/SharePageButton";
import { companyLinks, legalLinks, productLinks, sellerLinks } from "./footerLinks";

const logo = "/images/logo/paypertap-logo.png";

function FooterColumn({
  links,
  title,
}: {
  links: Array<{ label: string; to: string }>;
  title: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase text-[#7C3AED]">
        {title}
      </p>
      <div className="mt-3 grid gap-2 text-sm">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="min-w-0 cursor-pointer break-words text-[#070707]/50 transition hover:text-[#070707]"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ppt-footer relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative mx-auto grid w-full max-w-7xl gap-8 rounded-[28px] p-6 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.8fr]">
        <div className="min-w-0">
          <Link to="/" className="inline-flex items-center gap-3 text-neutral-950">
            <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-white/70 shadow-[inset_0_0_0_1px_rgba(7,7,7,0.06)]">
              <img
                src={logo}
                alt="PayPerTap logo"
                className="h-full w-full object-contain"
                width={40}
                height={40}
                decoding="async"
                draggable={false}
                loading="lazy"
              />
            </span>
            <span className="text-lg font-extrabold">PayPerTap</span>
          </Link>
          <p className="ppt-home-copy mt-4 max-w-sm text-sm leading-6 text-[#070707]/50">
            India-first verified order storefronts for Instagram and WhatsApp sellers.
            PayPerTap is not a full payment gateway.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <SharePageButton />
            <p className="text-xs text-[#070707]/40">
              (c) {year} PayPerTap. All rights reserved.
            </p>
          </div>
        </div>

        <FooterColumn title="Product" links={productLinks} />
        <FooterColumn title="Sellers" links={sellerLinks} />
        <FooterColumn title="Company" links={companyLinks} />
        <FooterColumn title="Legal" links={legalLinks} />
      </div>
    </footer>
  );
}

export const MarketingFooter = Footer;
