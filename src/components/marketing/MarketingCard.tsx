import { type ReactNode } from "react";

export function MarketingCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`ppt-home-glass ppt-marketing-card min-w-0 rounded-[24px] p-6 ${className}`}
    >
      {children}
    </div>
  );
}
