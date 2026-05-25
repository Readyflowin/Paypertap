import { type ReactNode } from "react";

export function MarketingGradientText({ children }: { children: ReactNode }) {
  return <span className="ppt-home-gradient-text">{children}</span>;
}

export function MarketingPill({ children }: { children: ReactNode }) {
  return (
    <span className="ppt-marketing-pill inline-flex w-fit items-center rounded-full px-4 py-2 text-xs font-bold uppercase">
      {children}
    </span>
  );
}
