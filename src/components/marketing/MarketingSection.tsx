import { type ReactNode } from "react";

import { MarketingPill } from "./MarketingPill";

type SectionProps = {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  id?: string;
  intro?: string;
  title?: string;
};

export function MarketingSection({
  children,
  className = "",
  eyebrow,
  id,
  intro,
  title,
}: SectionProps) {
  return (
    <section id={id} className={`ppt-section relative px-4 py-14 sm:px-6 sm:py-16 lg:px-8 ${className}`}>
      <div className="mx-auto w-full max-w-7xl">
        {eyebrow || title || intro ? (
          <div className="ppt-section-head mb-8 max-w-3xl">
            {eyebrow ? <MarketingPill>{eyebrow}</MarketingPill> : null}
            {title ? (
              <h2 className="ppt-section-title mt-4 text-3xl font-extrabold leading-tight text-[#070707] sm:text-4xl">
                {title}
              </h2>
            ) : null}
            {intro ? (
              <p className="ppt-section-intro ppt-home-copy mt-4 max-w-2xl text-base leading-7">
                {intro}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
