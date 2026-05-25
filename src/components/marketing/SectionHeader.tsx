import { type ReactNode } from "react";

import { MarketingPill } from "./MarketingPill";

export function SectionHeader({
  children,
  eyebrow,
  h1,
  subtitle,
}: {
  children?: ReactNode;
  eyebrow?: string;
  h1: string;
  subtitle: string;
}) {
  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-200/30 blur-3xl" />
      <div className="relative mx-auto w-full max-w-7xl">
        <div className="max-w-4xl">
          {eyebrow ? <MarketingPill>{eyebrow}</MarketingPill> : null}
          <h1 className="mt-4 text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-neutral-950 sm:text-6xl lg:text-7xl">
            {h1}
          </h1>
          <p className="ppt-home-copy mt-6 max-w-2xl text-lg leading-8">{subtitle}</p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
