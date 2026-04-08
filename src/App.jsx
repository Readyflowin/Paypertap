"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

const WHATSAPP_NUMBER = "918602555840";
const EARLY_ACCESS_MESSAGE =
  "Hi Pay Per Tap, I want early access. Please add me to the waitlist. I understand early access users get 50% off on month 1.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(EARLY_ACCESS_MESSAGE)}`;

const cn = (...classes) => classes.filter(Boolean).join(" ");

const easeOut = [0.22, 1, 0.36, 1];

const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const ArrowRightIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ShieldIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SparkIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
  </svg>
);

const TagIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const CatalogIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const MessageIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
  </svg>
);

const TargetIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2" />
    <path d="M21 12h-2" />
    <path d="M12 21v-2" />
    <path d="M3 12h2" />
  </svg>
);

const Dot = ({ active = false }) => (
  <span
    className={cn(
      "inline-block h-2 w-2 rounded-full transition-all duration-300",
      active ? "w-6 bg-[#20c997]" : "bg-black/15"
    )}
  />
);

const Section = ({ children, className = "" }) => (
  <section className={cn("px-4 sm:px-6", className)}>
    <div className="mx-auto w-full max-w-7xl">{children}</div>
  </section>
);

const SectionHeading = ({ eyebrow, title, subtitle, align = "left" }) => (
  <div className={cn(align === "center" ? "mx-auto text-center" : "", "max-w-3xl")}>
    {eyebrow ? (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.45, ease: easeOut }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-black bg-amber-200 px-4 py-1 text-xs font-bold tracking-[0.22em] text-black uppercase shadow-[3px_3px_0px_#111]"
      >
        <SparkIcon size={12} />
        {eyebrow}
      </motion.div>
    ) : null}
    <motion.h2
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="text-3xl font-black tracking-tight text-black sm:text-4xl lg:text-5xl"
    >
      {title}
    </motion.h2>
    {subtitle ? (
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.05, ease: easeOut }}
        className="mt-4 text-base leading-8 text-black/65 sm:text-lg"
      >
        {subtitle}
      </motion.p>
    ) : null}
  </div>
);

const HoverButton = ({ href, children, variant = "primary", className = "" }) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-black px-5 py-3 text-sm font-bold transition-all duration-200 shadow-[4px_4px_0px_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111]";
  const styles =
    variant === "primary"
      ? "bg-[#25D366] text-black hover:bg-[#21c55d]"
      : variant === "pink"
      ? "bg-[#f7b6ff] text-black hover:bg-[#f29dfd]"
      : variant === "yellow"
      ? "bg-[#ffe36e] text-black hover:bg-[#ffd84d]"
      : "bg-white text-black hover:bg-black/5";

  return (
    <a href={href} className={cn(base, styles, className)}>
      {children}
    </a>
  );
};

const Pill = ({ icon, title, text, color = "bg-white" }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.45, ease: easeOut }}
    className={cn("rounded-3xl border-2 border-black p-5 shadow-[5px_5px_0px_#111]", color)}
  >
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-black bg-white text-black shadow-[3px_3px_0px_#111]">
        {icon}
      </div>
      <div>
        <div className="text-lg font-black">{title}</div>
        <div className="mt-1 text-sm leading-6 text-black/65">{text}</div>
      </div>
    </div>
  </motion.div>
);

const PricingToggle = ({ billing, setBilling }) => (
  <div className="inline-flex rounded-full border-2 border-black bg-white p-1 shadow-[4px_4px_0px_#111]">
    <button
      onClick={() => setBilling("monthly")}
      className={cn(
        "rounded-full px-5 py-2 text-sm font-bold transition-all duration-200",
        billing === "monthly" ? "bg-[#20c997] text-black" : "bg-transparent text-black/70 hover:text-black"
      )}
    >
      Monthly
    </button>
    <button
      onClick={() => setBilling("yearly")}
      className={cn(
        "rounded-full px-5 py-2 text-sm font-bold transition-all duration-200",
        billing === "yearly" ? "bg-[#20c997] text-black" : "bg-transparent text-black/70 hover:text-black"
      )}
    >
      Yearly · 25% off
    </button>
  </div>
);

const PricingCard = ({ title, price, yearlyPrice, subtitle, features, accent, highlight = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.35 }}
    transition={{ duration: 0.5, ease: easeOut }}
    className={cn("rounded-[2rem] border-2 border-black p-7 shadow-[10px_10px_0px_#111]", accent)}
  >
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-3xl font-black tracking-tight text-black">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-black/65">{subtitle}</p>
      </div>
      {highlight ? (
        <span className="rounded-full border-2 border-black bg-amber-300 px-3 py-1 text-xs font-black shadow-[3px_3px_0px_#111]">
          Best value
        </span>
      ) : null}
    </div>

    <div className="mt-6 flex items-end gap-3">
      <div className="text-5xl font-black tracking-tight text-black">₹{price}</div>
      <div className="pb-1 text-sm font-bold text-black/65">/month</div>
    </div>
    <div className="mt-1 text-sm font-medium text-black/55">Yearly: ₹{yearlyPrice} paid once</div>

    <div className="mt-6 rounded-3xl border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#111]">
      <div className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-black/40">Includes</div>
      <ul className="space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-black/80">
            <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#20c997]/20 text-[#0f8f67]">
              <CheckIcon size={13} />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>

    <HoverButton href={WHATSAPP_URL} variant={highlight ? "primary" : "white"} className="mt-6 w-full">
      Select plan <ArrowRightIcon size={16} />
    </HoverButton>
  </motion.div>
);

const MiniFlowCard = ({ step, title, desc, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.35 }}
    transition={{ duration: 0.5, ease: easeOut }}
    className={cn("rounded-[1.8rem] border-2 border-black p-5 shadow-[5px_5px_0px_#111]", color)}
  >
    <div className="mb-3 flex items-center justify-between">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#111] font-black">
        {step}
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/35">flow</div>
    </div>
    <div className="text-xl font-black text-black">{title}</div>
    <p className="mt-2 text-sm leading-6 text-black/65">{desc}</p>
  </motion.div>
);

const PhoneMockup = () => {
  const [screen, setScreen] = useState(0);
  const screens = ["catalog", "checkout", "whatsapp"];

  useEffect(() => {
    const timer = setInterval(() => setScreen((s) => (s + 1) % screens.length), 2800);
    return () => clearInterval(timer);
  }, []);

  const products = [
    { name: "Oversized Tee", price: "₹449" },
    { name: "Denim Cargo", price: "₹1,299" },
    { name: "Printed Shirt", price: "₹599" },
    { name: "Layered Set", price: "₹849" },
  ];

  return (
    <div className="relative mx-auto h-[350px] w-[176px] sm:h-[390px] sm:w-[196px] md:h-[500px] md:w-[246px] lg:h-[520px] lg:w-[260px]">
      <div className="absolute inset-0 rounded-[2.4rem] border-2 border-black bg-white shadow-[12px_12px_0px_#111] sm:rounded-[2.6rem] sm:shadow-[14px_14px_0px_#111]">
        <div className="absolute inset-[6px] overflow-hidden rounded-[2.05rem] border-2 border-black bg-[#fbfbfb] sm:inset-[7px] sm:rounded-[2.3rem]">
          <AnimatePresence mode="wait">
            {screen === 0 ? (
              <motion.div
                key="catalog"
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.32, ease: easeOut }}
                className="flex h-full flex-col"
              >
                <div className="bg-[#25D366] px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#111] sm:h-11 sm:w-11 sm:rounded-2xl">
                      <img src="/logo.png" alt="Pay Per Tap" className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-black sm:text-sm">Jiya Fashions</div>
                      <div className="text-[9px] font-medium text-black/70 sm:text-[10px]">paypertap.in/jiya</div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-2.5 sm:p-3">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-black/35 sm:text-[11px] sm:tracking-[0.25em]">
                    New arrivals
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {products.map((product) => (
                      <div key={product.name} className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#111] sm:shadow-[3px_3px_0px_#111]">
                        <div className="flex h-18 items-center justify-center bg-gradient-to-br from-emerald-50 to-yellow-50 sm:h-24">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-white text-[10px] font-black text-black/45 sm:h-12 sm:w-12 sm:text-[11px]">
                            IMG
                          </div>
                        </div>
                        <div className="p-1.5 sm:p-2">
                          <div className="text-[10px] font-bold text-black leading-tight sm:text-[11px]">{product.name}</div>
                          <div className="mt-1 text-[10px] font-black text-[#0f8f67] sm:text-[11px]">{product.price}</div>
                          <div className="mt-2 rounded-full border-2 border-black bg-[#ffe36e] px-2 py-0.5 text-center text-[9px] font-black shadow-[2px_2px_0px_#111] sm:py-1 sm:text-[10px]">
                            BUY
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}

            {screen === 1 ? (
              <motion.div
                key="checkout"
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.32, ease: easeOut }}
                className="flex h-full flex-col"
              >
                <div className="bg-[#ffe36e] px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="text-[11px] font-black text-black sm:text-sm">Complete order</div>
                </div>

                <div className="flex-1 p-2.5 sm:p-3">
                  <div className="rounded-2xl border-2 border-black bg-emerald-50 p-2.5 shadow-[2px_2px_0px_#111] sm:p-3 sm:shadow-[3px_3px_0px_#111]">
                    <div className="flex gap-2.5 sm:gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-black bg-white text-[9px] font-black text-black/45 sm:h-14 sm:w-14 sm:text-[11px]">
                        IMG
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black text-black leading-tight sm:text-sm">Printed Shirt · M</div>
                        <div className="text-[11px] font-black text-[#0f8f67] sm:text-sm">₹599</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 space-y-2 sm:mt-3 sm:space-y-2.5">
                    {["Your name", "Phone number", "Delivery address"].map((label) => (
                      <div key={label}>
                        <div className="mb-1 text-[8px] font-black uppercase tracking-[0.18em] text-black/35 sm:text-[10px] sm:tracking-[0.2em]">
                          {label}
                        </div>
                        <div className="h-8 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_#111] sm:h-10" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-2xl border-2 border-black bg-[#25D366] px-3 py-2.5 text-center text-[10px] font-black shadow-[2px_2px_0px_#111] sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
                    Continue on WhatsApp
                  </div>
                </div>
              </motion.div>
            ) : null}

            {screen === 2 ? (
              <motion.div
                key="whatsapp"
                initial={{ x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -24, opacity: 0 }}
                transition={{ duration: 0.32, ease: easeOut }}
                className="flex h-full flex-col"
              >
                <div className="bg-[#075E54] px-3 py-2.5 sm:px-4 sm:py-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-[#25D366] shadow-[2px_2px_0px_#111] sm:h-8 sm:w-8">
                      <WhatsAppIcon size={13} className="text-white" />
                    </div>
                    <div>
                      <div className="text-[11px] font-black text-white sm:text-sm">Jiya Fashions</div>
                      <div className="text-[9px] font-medium text-white/70 sm:text-[10px]">online</div>
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 bg-[#efe6dd] p-2.5 sm:p-3"
                  style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                >
                  <div className="rounded-2xl border-2 border-black bg-white p-2.5 shadow-[2px_2px_0px_#111] sm:p-3 sm:shadow-[3px_3px_0px_#111]">
                    <div className="text-[9px] font-semibold leading-4 text-black/85 sm:text-[11px] sm:leading-5">
                      New Order
                      {"\n"}Product: Printed Shirt (M)
                      {"\n"}Price: ₹599
                      {"\n"}Priya Sharma
                      {"\n"}Bhopal, MP
                      {"\n"}+91 98765 43210
                    </div>
                    <div className="mt-1.5 text-right text-[9px] font-medium text-black/40 sm:mt-2 sm:text-[10px]">11:28 AM ✓✓</div>
                  </div>

                  <div className="mt-2.5 flex justify-end sm:mt-3">
                    <div className="max-w-[82%] rounded-2xl border-2 border-black bg-[#dcf8c6] p-2.5 shadow-[2px_2px_0px_#111] sm:p-3 sm:shadow-[3px_3px_0px_#111]">
                      <div className="text-[10px] font-semibold text-black/85 sm:text-[11px]">Send payment QR manually</div>
                      <div className="mt-1 text-right text-[9px] font-medium text-black/40 sm:text-[10px]">11:29 AM ✓✓</div>
                    </div>
                  </div>

                  <div className="mt-3 text-center sm:mt-4">
                    <span className="inline-flex rounded-full border-2 border-black bg-amber-200 px-3 py-1 text-[9px] font-black shadow-[2px_2px_0px_#111] sm:text-[10px]">
                      Sale done — no 2% cut
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-1.5 sm:-bottom-9">
        {screens.map((_, index) => (
          <Dot key={index} active={screen === index} />
        ))}
      </div>
    </div>
  );
};

const FloatingBadge = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85, y: 14 }}
    whileInView={{ opacity: 1, scale: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ delay, duration: 0.5, type: "spring", bounce: 0.34 }}
    className={cn("absolute z-20", className)}
  >
    {children}
  </motion.div>
);

const Stat = ({ value, label, icon, color = "bg-white" }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.45 }}
    transition={{ duration: 0.45, ease: easeOut }}
    className={cn("rounded-3xl border-2 border-black p-4 shadow-[5px_5px_0px_#111]", color)}
  >
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#111] text-black">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-black">{value}</div>
        <div className="text-sm font-medium text-black/60">{label}</div>
      </div>
    </div>
  </motion.div>
);

export default function PaypertapHero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 50, stiffness: 90 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 90 });
  const [billing, setBilling] = useState("monthly");

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) * 0.012);
    mouseY.set((e.clientY - rect.top - rect.height / 2) * 0.012);
  };

  const isYearly = billing === "yearly";

  const pricing = useMemo(
    () => [
      {
        title: "Starter",
        price: isYearly ? "2691" : "299",
        yearlyPrice: "2691",
        subtitle: isYearly ? "25% off yearly billing · perfect for getting started" : "Best for small sellers who want a clean launch",
        accent: "bg-sky-100",
        features: [
          "Up to 25 products",
          "Branded catalog page",
          "Manual WhatsApp checkout",
          "50 paise per retarget message",
          "10 paise per review request",
        ],
      },
      {
        title: "Pro",
        price: isYearly ? "8991" : "999",
        yearlyPrice: "8991",
        subtitle: isYearly ? "25% off yearly billing · built for growing brands" : "For sellers who want automation and better costs",
        accent: "bg-emerald-100",
        highlight: true,
        features: [
          "Up to 45 products",
          "Custom branding + better templates",
          "Razorpay API support",
          "35 paise per retarget message",
          "7 paise per review request",
        ],
      },
    ],
    [isYearly]
  );

  const cards = [
    {
      icon: <CatalogIcon size={18} />,
      title: "Choose a template",
      text: "Pick a colorful storefront style that matches your brand.",
      color: "bg-sky-100",
    },
    {
      icon: <MessageIcon size={18} />,
      title: "Buyer taps buy",
      text: "Collect phone, address, and order details before WhatsApp opens.",
      color: "bg-amber-100",
    },
    {
      icon: <TargetIcon size={18} />,
      title: "Retarget later",
      text: "Bring back previous buyers when a new drop goes live.",
      color: "bg-pink-100",
    },
  ];

  const headline = ['Turn "Price?" into "Paid" in a single tap.', "Smart catalogs. Total control. Still closed on WhatsApp."];

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-[#faf7f2] text-black"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .noise {
          background-image:
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .soft-shadow { box-shadow: 6px 6px 0px #111; }
        .soft-shadow-sm { box-shadow: 4px 4px 0px #111; }
      `}</style>

      <div className="noise absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -top-32 right-[-120px] h-[420px] w-[420px] rounded-full bg-[#25D366]/12 blur-3xl" />
      <div className="pointer-events-none absolute top-[500px] left-[-100px] h-[320px] w-[320px] rounded-full bg-[#f7b6ff]/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-120px] right-[10%] h-[300px] w-[300px] rounded-full bg-[#ffe36e]/15 blur-3xl" />

      <header className="relative z-30">
        <Section className="pt-6">
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="flex items-center justify-between rounded-[2rem] border-2 border-black bg-white px-4 py-3 soft-shadow"
          >
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Pay Per Tap" className="h-12 w-12 object-contain" />
              <div>
                <div className="text-lg font-black tracking-tight">
                  payper<span className="text-[#0f8f67]">tap</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-black/40">
                  coming soon
                </div>
              </div>
            </div>

            <nav className="hidden items-center gap-6 text-sm font-semibold text-black/70 md:flex">
              <a href="#how-it-works" className="transition hover:text-black">
                How it works
              </a>
              <a href="#pricing" className="transition hover:text-black">
                Pricing
              </a>
              <a href="#faq" className="transition hover:text-black">
                FAQ
              </a>
            </nav>

            <HoverButton href={WHATSAPP_URL} variant="primary" className="hidden sm:inline-flex">
              Talk to us
            </HoverButton>
          </motion.div>
        </Section>
      </header>

      <main className="relative z-10">
        <Section className="pt-8 sm:pt-12 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-10">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: easeOut }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-black bg-amber-200 px-4 py-2 text-xs font-black tracking-[0.2em] uppercase soft-shadow-sm"
              >
                <SparkIcon size={12} />
                whatsapp-first commerce
              </motion.div>

              <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl" style={{ lineHeight: 1.02 }}>
                {headline.map((line, i) => (
                  <motion.span
                    key={line}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.55, delay: 0.08 + i * 0.08, ease: easeOut }}
                    className="block"
                  >
                    {i === 1 ? <span className="text-[#0f8f67]">{line}</span> : line}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.5, ease: easeOut }}
                className="mt-6 max-w-xl text-base leading-8 text-black/65 sm:text-lg"
              >
                Pay Per Tap is for Instagram and WhatsApp sellers who want a branded catalog without the cost and complexity of a full website. Customers browse, submit details, and finish the order on WhatsApp while you stay in control.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.5, ease: easeOut }}
                className="mt-8 flex flex-wrap gap-3"
              >
                <HoverButton href={WHATSAPP_URL} variant="primary">
                  Get early access <ArrowRightIcon size={16} />
                </HoverButton>
                <HoverButton href="#pricing" variant="white">
                  See pricing
                </HoverButton>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5, ease: easeOut }}
                className="mt-4 text-sm font-semibold text-black/45"
              >
                Early access users get <span className="text-black">50% off on month 1</span>.
              </motion.div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <Pill
                  icon={<CatalogIcon size={18} />}
                  title="Catalog, not chaos"
                  text="Show products, variants, and prices in a clean branded flow."
                  color="bg-sky-100"
                />
                <Pill
                  icon={<ShieldIcon size={18} />}
                  title="Manual control"
                  text="You can keep the payment and conversation in your own hands."
                  color="bg-emerald-100"
                />
                <Pill
                  icon={<TargetIcon size={18} />}
                  title="Retargeting built in"
                  text="Bring back customers when your next drop goes live."
                  color="bg-pink-100 sm:col-span-2"
                />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, type: "spring", bounce: 0.22 }}
              style={{ x: springX, y: springY }}
              className="relative mx-auto w-full max-w-[580px] lg:mt-4"
            >
              <div className="absolute -left-3 top-10 h-24 w-24 rounded-full bg-[#25D366]/12 blur-2xl" />
              <div className="absolute -right-4 top-0 h-28 w-28 rounded-full bg-[#f7b6ff]/20 blur-2xl" />

              <div className="rounded-[2.1rem] border-2 border-black bg-white p-3.5 shadow-[12px_12px_0px_#111] sm:p-5">
                <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="rounded-[1.65rem] border-2 border-black bg-[#f7f2ff] p-4 shadow-[5px_5px_0px_#111] sm:p-5">
                    <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-black/40">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#25D366]" />
                      live preview
                    </div>
                    <PhoneMockup />
                  </div>

                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="rounded-[1.65rem] border-2 border-black bg-[#fff0a6] p-4 shadow-[5px_5px_0px_#111] sm:p-5">
                      <div className="text-xs font-black uppercase tracking-[0.24em] text-black/40">What it replaces</div>
                      <div className="mt-3 space-y-2.5 text-sm leading-7 text-black/80">
                        <div className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>Shopify fees and setup overwhelm.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>WordPress speed and maintenance pain.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="mt-1">•</span>
                          <span>Instagram DM chaos after every drop.</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      <div className="rounded-[1.65rem] border-2 border-black bg-[#dcf8c6] p-4 shadow-[5px_5px_0px_#111]">
                        <div className="flex items-center gap-2 text-sm font-black">
                          <MessageIcon size={16} />
                          Buyer flow
                        </div>
                        <div className="mt-3 space-y-1.5 text-sm font-medium leading-7 text-black/75">
                          <div>Browse the catalog</div>
                          <div>Enter phone + address</div>
                          <div>Open WhatsApp with order context</div>
                        </div>
                      </div>

                      <div className="rounded-[1.65rem] border-2 border-black bg-[#d8f2ff] p-4 shadow-[5px_5px_0px_#111]">
                        <div className="flex items-center gap-2 text-sm font-black">
                          <TargetIcon size={16} />
                          Seller dashboard
                        </div>
                        <div className="mt-3 space-y-1.5 text-sm font-medium leading-7 text-black/75">
                          <div>Mark sale / lead / not interested</div>
                          <div>See conversation history</div>
                          <div>Retarget buyers on next drop</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Section>

        <Section className="mt-14 sm:mt-20">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat value="₹0" label="setup to start" icon={<SparkIcon size={18} />} color="bg-sky-100" />
            <Stat value="Manual" label="seller control" icon={<ShieldIcon size={18} />} color="bg-emerald-100" />
            <Stat value="Fast" label="React-first storefront" icon={<TagIcon size={18} />} color="bg-pink-100" />
          </div>
        </Section>

        <Section className="mt-16 sm:mt-24">
          <SectionHeading
            eyebrow="why it exists"
            title="Made for sellers who want a real brand without a real headache."
            subtitle="Pay Per Tap bridges the gap between a plain WhatsApp chat and an expensive full e-commerce stack."
            align="center"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Pill icon={<SparkIcon size={18} />} title="Cheaper than Shopify" text="Get started without paying for a heavy stack." color="bg-amber-100" />
            <Pill icon={<CatalogIcon size={18} />} title="Looks like a brand" text="Templates, colors, product cards, and a clean catalog feel." color="bg-sky-100" />
            <Pill icon={<MessageIcon size={18} />} title="WhatsApp-native" text="Buyer flow closes where your sellers already work." color="bg-emerald-100" />
            <Pill icon={<TargetIcon size={18} />} title="Retarget later" text="Your next drop can reach earlier buyers instantly." color="bg-pink-100" />
          </div>
        </Section>

        <Section className="mt-16 sm:mt-24" id="how-it-works">
          <SectionHeading
            eyebrow="how it works"
            title="From catalog to WhatsApp in one smooth flow."
            subtitle="This is intentionally simple. The customer gets a clean page, and the seller keeps manual control."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <MiniFlowCard
              step="1"
              title="Pick a template"
              desc="Choose how your storefront should look, then add your branding and colors."
              color="bg-sky-100"
            />
            <MiniFlowCard
              step="2"
              title="Add products"
              desc="Upload product images, variants, descriptions, and pricing without building a full website."
              color="bg-amber-100"
            />
            <MiniFlowCard
              step="3"
              title="Close on WhatsApp"
              desc="The buyer submits details and the complete order opens in WhatsApp for your seller to handle."
              color="bg-emerald-100"
            />
          </div>
        </Section>

        <Section className="mt-16 sm:mt-24">
          <SectionHeading
            eyebrow="retargeting"
            title="Don’t start every drop from zero."
            subtitle="Your dashboard remembers who bought what, who replied, and who is worth reaching out to again."
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border-2 border-black bg-white p-6 shadow-[10px_10px_0px_#111] sm:p-7">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.6rem] border-2 border-black bg-[#d8f2ff] p-5 shadow-[4px_4px_0px_#111]">
                  <div className="text-sm font-black uppercase tracking-[0.22em] text-black/40">lead score</div>
                  <div className="mt-3 text-4xl font-black">87</div>
                  <p className="mt-2 text-sm leading-6 text-black/65">Better outcomes in the dashboard mean better follow-up opportunities later.</p>
                </div>
                <div className="rounded-[1.6rem] border-2 border-black bg-[#dcf8c6] p-5 shadow-[4px_4px_0px_#111]">
                  <div className="text-sm font-black uppercase tracking-[0.22em] text-black/40">latest action</div>
                  <div className="mt-3 text-2xl font-black">Marked as Sale</div>
                  <p className="mt-2 text-sm leading-6 text-black/65">Seller can update the conversation status after each chat.</p>
                </div>
              </div>
              <div className="mt-4 rounded-[1.6rem] border-2 border-black bg-[#f7f2ff] p-5 shadow-[4px_4px_0px_#111]">
                <div className="flex items-center gap-2 text-sm font-black">
                  <TargetIcon size={16} />
                  Example future drop
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-black/70">
                  A seller launches another jeans drop after one month. The dashboard surfaces earlier buyers and interested leads, then creates pre-filled WhatsApp messages for the new launch.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border-2 border-black bg-[#fff0a6] p-6 shadow-[10px_10px_0px_#111] sm:p-7">
              <div className="text-xs font-black uppercase tracking-[0.25em] text-black/40">what changes for the seller</div>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-black/80">
                <li className="flex gap-3"><span>•</span><span>No more starting each drop from zero.</span></li>
                <li className="flex gap-3"><span>•</span><span>Old customers can be reached again in a single tap.</span></li>
                <li className="flex gap-3"><span>•</span><span>Manual control stays intact while the business becomes more organized.</span></li>
                <li className="flex gap-3"><span>•</span><span>You save on unnecessary payment cuts when the flow stays WhatsApp-first.</span></li>
              </ul>
              <div className="mt-6 rounded-[1.5rem] border-2 border-black bg-white p-4 shadow-[4px_4px_0px_#111]">
                <div className="text-sm font-black">Retarget message pricing</div>
                <div className="mt-2 text-sm leading-7 text-black/75">Starter: 50 paise / message · Pro: 35 paise / message</div>
              </div>
            </div>
          </div>
        </Section>

        <Section className="mt-16 sm:mt-24" id="pricing">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="pricing"
              title="Affordable pricing with zero setup fees."
              subtitle="Pick monthly for flexibility or yearly for a cleaner discount."
            />
            <PricingToggle billing={billing} setBilling={setBilling} />
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {pricing.map((plan) => (
              <PricingCard key={plan.title} {...plan} />
            ))}
          </div>

          <div className="mt-5 rounded-[2rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#111]">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border-2 border-black bg-sky-100 p-4 shadow-[3px_3px_0px_#111]">
                <div className="text-sm font-black">Starter</div>
                <div className="mt-1 text-sm text-black/70">50 paise retargeting</div>
              </div>
              <div className="rounded-2xl border-2 border-black bg-emerald-100 p-4 shadow-[3px_3px_0px_#111]">
                <div className="text-sm font-black">Pro</div>
                <div className="mt-1 text-sm text-black/70">35 paise retargeting</div>
              </div>
              <div className="rounded-2xl border-2 border-black bg-pink-100 p-4 shadow-[3px_3px_0px_#111]">
                <div className="text-sm font-black">Review requests</div>
                <div className="mt-1 text-sm text-black/70">10 paise / 7 paise per message</div>
              </div>
            </div>
          </div>
        </Section>

        <Section className="mt-16 sm:mt-24">
          <SectionHeading
            eyebrow="comparison"
            title="Why this feels lighter than a full website stack."
            subtitle="The goal is not to replace everything. The goal is to make selling simpler for people who do not want complexity."
            align="center"
          />

          <div className="mt-10 grid gap-4 xl:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, ease: easeOut }}
              className="rounded-[1.8rem] border-2 border-black bg-[#ffe36e] p-5 shadow-[5px_5px_0px_#111]"
            >
              <div className="text-lg font-black">Pay Per Tap</div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-black/80">
                <div>• Clean catalog page</div>
                <div>• WhatsApp-first order flow</div>
                <div>• Manual control retained</div>
                <div>• Retargeting built in</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.03, ease: easeOut }}
              className="rounded-[1.8rem] border-2 border-black bg-sky-100 p-5 shadow-[5px_5px_0px_#111]"
            >
              <div className="text-lg font-black">Shopify</div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-black/80">
                <div>• More setup</div>
                <div>• More cost</div>
                <div>• More overhead</div>
                <div>• Less manual simplicity</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.06, ease: easeOut }}
              className="rounded-[1.8rem] border-2 border-black bg-[#f7b6ff] p-5 shadow-[5px_5px_0px_#111]"
            >
              <div className="text-lg font-black">WordPress</div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-black/80">
                <div>• Needs upkeep</div>
                <div>• Can get slow</div>
                <div>• Plugin management</div>
                <div>• More moving parts</div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45, delay: 0.09, ease: easeOut }}
              className="rounded-[1.8rem] border-2 border-black bg-emerald-100 p-5 shadow-[5px_5px_0px_#111]"
            >
              <div className="text-lg font-black">DM-only selling</div>
              <div className="mt-3 space-y-2 text-sm leading-6 text-black/80">
                <div>• Hard to track</div>
                <div>• Hard to retarget</div>
                <div>• No branded page</div>
                <div>• Chaotic at scale</div>
              </div>
            </motion.div>
          </div>
        </Section>

        <Section className="mt-16 sm:mt-24" id="faq">
          <SectionHeading
            eyebrow="faq"
            title="A few things people will ask."
            subtitle="Simple answers for the coming soon page, so the idea feels clear right away."
            align="center"
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              {
                q: "Is this a full e-commerce store?",
                a: "Not exactly. It is a branded catalog and WhatsApp-first selling flow built for simple, fast selling.",
              },
              {
                q: "Can I keep payment manual?",
                a: "Yes. Manual QR / UPI collection is part of the flow for sellers who want control.",
              },
              {
                q: "Why is this different?",
                a: "Because it keeps the sale simple for the customer and the seller, while still letting you track and retarget later.",
              },
            ].map((faq) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, ease: easeOut }}
                className="rounded-[1.8rem] border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#111]"
              >
                <div className="text-xl font-black">{faq.q}</div>
                <p className="mt-3 text-sm leading-7 text-black/70">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        <Section className="mt-16 sm:mt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: easeOut }}
            className="rounded-[2.2rem] border-2 border-black bg-[#20c997] p-8 shadow-[10px_10px_0px_#111] sm:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-black tracking-[0.22em] uppercase shadow-[3px_3px_0px_#111]">
                  launching soon
                </div>
                <h2 className="max-w-2xl text-3xl font-black tracking-tight text-black sm:text-4xl lg:text-5xl">
                  Start looking like a real brand without building a heavy store.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-black/75 sm:text-lg">
                  Join the waitlist now and get early access when Pay Per Tap opens. It is built for sellers who want speed, style, and control.
                </p>
              </div>

              <div className="rounded-[1.8rem] border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#111]">
                <div className="text-sm font-black uppercase tracking-[0.24em] text-black/40">Join waitlist</div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <HoverButton href={WHATSAPP_URL} variant="primary" className="w-full">
                    WhatsApp us <WhatsAppIcon size={16} />
                  </HoverButton>
                  <HoverButton href="#pricing" variant="white" className="w-full">
                    View plans
                  </HoverButton>
                </div>
                <div className="mt-4 text-sm font-medium text-black/60">
                  Early access users get 50% off on month 1.
                </div>
              </div>
            </div>
          </motion.div>
        </Section>
      </main>

      <footer className="relative z-10 border-t-2 border-black/10 bg-white/70 px-4 py-8 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-2">
          <div className="text-sm font-semibold text-black/55">
            © 2026 paypertap · Built for WhatsApp-first sellers.
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-black/55">
            <a href="#how-it-works" className="transition hover:text-black">
              How it works
            </a>
            <span className="text-black/20">•</span>
            <a href="#pricing" className="transition hover:text-black">
              Pricing
            </a>
            <span className="text-black/20">•</span>
            <a href={WHATSAPP_URL} className="transition hover:text-black">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}