import { ArrowRight, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { marketingFaqs } from "../../pages/faq/faqContent";
import { type FaqItem } from "../../seo-pages/seoPageTypes";

export function FAQBlock({
  items = marketingFaqs.slice(0, 4),
  showLink = true,
}: {
  items?: FaqItem[];
  showLink?: boolean;
}) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details
          key={item.question}
          className="ppt-faq-item group rounded-[22px] p-5"
          open={!showLink}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-neutral-950">
            <span className="min-w-0">{item.question}</span>
            <HelpCircle
              className="shrink-0 text-[#7C3AED] transition group-open:rotate-45"
              size={18}
              aria-hidden="true"
            />
          </summary>
          <p className="ppt-home-copy mt-3 text-sm leading-6 text-[#070707]/50">
            {item.answer}
            {item.links?.length ? (
              <>
                {" "}
                {item.links.map((link, index) => (
                  <span key={`${item.question}-${link.path}`}>
                    {index > 0 ? " " : ""}
                    {link.external ? (
                      <a href={link.path} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      <Link to={link.path}>{link.label}</Link>
                    )}
                    .
                  </span>
                ))}
              </>
            ) : null}
          </p>
        </details>
      ))}
      {showLink ? (
        <Link
          to="/faq"
          className="ppt-link-pill mt-4 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-neutral-950"
        >
          Read all FAQs <ArrowRight size={15} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export const FaqBlock = FAQBlock;
export const MarketingFAQ = FAQBlock;
