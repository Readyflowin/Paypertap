import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { headerLinks } from "./headerLinks";

const logo = "/images/logo/paypertap-logo.png";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let frameId: number | null = null;

    const updateScrolledState = () => {
      const next = window.scrollY > 18;
      setIsScrolled((prev) => (prev === next ? prev : next));
    };

    const handleScroll = () => {
      if (frameId !== null) return;
      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        updateScrolledState();
      });
    };

    updateScrolledState();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex justify-center px-3 py-3 sm:px-5 md:py-5">
        <motion.div
          initial={reduceMotion ? false : { y: -76, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1], delay: reduceMotion ? 0 : 0.04 }}
          aria-label="Marketing navigation"
          className={[
            "pointer-events-auto relative flex w-full max-w-[1080px] items-center justify-between overflow-hidden rounded-full border px-3 py-2 transition-colors duration-300 sm:px-4 md:px-5 md:py-2.5",
            isScrolled
              ? "border-white/70 bg-[#eef3f5]/92 shadow-[0_12px_34px_rgba(7,7,7,0.1)] backdrop-blur-sm sm:backdrop-blur-md"
              : "border-white/80 bg-[#f4f7f8]/82 shadow-[0_10px_26px_rgba(7,7,7,0.07)] backdrop-blur-sm",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.12))]" />

          <Link
            to="/"
            aria-label="PayPerTap homepage"
            className="group relative z-10 flex min-w-0 items-center gap-2.5 text-[#070707]"
          >
            <img
              src={logo}
              alt="PayPerTap logo"
              className="h-9 w-9 shrink-0 object-contain transition-transform duration-500 group-hover:rotate-[8deg] md:h-10 md:w-10"
              width={40}
              height={40}
              decoding="async"
              draggable={false}
            />

            <span className="block truncate text-sm font-black uppercase text-[#070707] md:text-base">
              PayPerTap
            </span>
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {headerLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      "ppt-header-link group relative inline-flex pb-1 text-[11px] font-bold uppercase transition-colors duration-300",
                      isActive ? "is-active" : "",
                    ].join(" ")
                  }
                >
                  {link.label}
                  <span
                    className={[
                      "absolute bottom-0 left-0 h-[2px] w-full origin-left rounded-full bg-[#1DFF8A] transition-transform duration-300 ease-out group-hover:scale-x-100",
                      location.pathname === link.to ? "scale-x-100" : "scale-x-0",
                    ].join(" ")}
                  />
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="relative z-10 flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/auth"
              className="ppt-header-cta group inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#070707] px-3 text-[10px] font-black uppercase shadow-[0_12px_28px_rgba(7,7,7,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#1DFF8A] sm:px-4 md:px-5"
            >
              <span className="hidden md:inline">Create your store</span>
              <span className="md:hidden">Start</span>
              <ArrowRight
                size={14}
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>

            <button
              type="button"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="paypertap-mobile-sidebar"
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="ppt-header-menu-button flex h-10 items-center justify-center gap-2 rounded-full px-3 text-[#070707] transition hover:bg-black/5 lg:hidden"
            >
              <span className="text-[10px] font-black uppercase">Menu</span>
              {mobileMenuOpen ? (
                <X size={22} strokeWidth={2.6} />
              ) : (
                <Menu size={22} strokeWidth={2.6} />
              )}
            </button>
          </div>
        </motion.div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
              className="fixed inset-0 z-[130] bg-[#070707]/28 lg:hidden"
            />

            <motion.aside
              id="paypertap-mobile-sidebar"
              role="dialog"
              aria-modal="true"
              aria-label="PayPerTap menu"
              initial={reduceMotion ? false : { x: "104%" }}
              animate={{ x: 0 }}
              exit={{ x: "104%" }}
              transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-3 right-3 top-3 z-[140] flex w-[min(88vw,360px)] flex-col overflow-hidden rounded-[28px] border border-white/70 bg-[#eef3f5]/98 p-5 shadow-[0_20px_54px_rgba(7,7,7,0.18)] backdrop-blur-sm lg:hidden"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(124,58,237,0.14),transparent_34%),radial-gradient(circle_at_88%_88%,rgba(29,255,138,0.13),transparent_26%)]" />
              <div className="relative flex items-center justify-between gap-4">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-w-0 items-center gap-3 text-[#070707]"
                >
                  <img
                    src={logo}
                    alt="PayPerTap logo"
                    className="h-10 w-10 shrink-0 object-contain"
                    width={40}
                    height={40}
                    decoding="async"
                    draggable={false}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-base font-black text-[#070707]">
                      PayPerTap
                    </span>
                    <span className="block text-[10px] font-bold uppercase text-black/40">
                      Menu
                    </span>
                  </span>
                </Link>

                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70 text-[#070707] shadow-[inset_0_0_0_1px_rgba(7,7,7,0.06)]"
                >
                  <X size={20} strokeWidth={2.8} />
                </button>
              </div>

              <div className="relative mt-10 flex flex-col gap-3">
                {headerLinks.map((link, index) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="ppt-mobile-menu-link group rounded-3xl border border-black/10 bg-white/50 px-4 py-4 shadow-[0_14px_34px_rgba(7,7,7,0.06)] transition active:scale-[0.99]"
                  >
                    <motion.span
                      initial={reduceMotion ? false : { opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
                      className="flex items-center justify-between gap-4"
                    >
                      <span className="min-w-0">
                        <span className="mb-1 block text-[10px] font-black uppercase text-[#7C3AED]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="block truncate text-xl font-black text-[#070707]">
                          {link.label}
                        </span>
                      </span>
                      <ArrowRight
                        size={17}
                        className="shrink-0 opacity-35 transition group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </motion.span>
                  </Link>
                ))}
              </div>

              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="ppt-header-cta relative mt-auto inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-[#070707] px-5 text-xs font-black uppercase transition active:scale-[0.99]"
              >
                Create your store
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
