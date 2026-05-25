import { type ReactNode } from "react";

import { MarketingLayout } from "./MarketingLayout";

export function MarketingPageShell({ children }: { children: ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
