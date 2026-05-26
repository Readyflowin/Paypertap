import { type ReactNode } from "react";

import { Footer } from "../footer/Footer";
import { Header } from "../header/Header";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="ppt-home ppt-marketing-shell min-h-screen overflow-x-hidden text-[#070707]">
      <Header />
      <main className="relative z-10 pt-[82px] sm:pt-[92px] md:pt-[106px]">
        {children}
      </main>
      <Footer />
    </div>
  );
}
