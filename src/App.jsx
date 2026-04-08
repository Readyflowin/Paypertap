import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import Logo from "./assets/Logo.png";

const WHATSAPP_NUMBER = "918602555840";
const EARLY_ACCESS_MESSAGE =
  "Hi Pay Per Tap, I want early access. Please add me to the waitlist. I understand early access users get 50% off on month 1.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  EARLY_ACCESS_MESSAGE
)}`;

const WhatsAppIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const CheckIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ArrowRightIcon = ({ size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const StarIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BoltIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const ShieldIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TagIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const CatalogIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const MessageIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
  </svg>
);

const TargetIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2" />
    <path d="M21 12h-2" />
    <path d="M12 21v-2" />
    <path d="M3 12h2" />
  </svg>
);

const FloatingBadge = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.7, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ delay, duration: 0.6, type: "spring", bounce: 0.4 }}
    className={`absolute z-20 ${className}`}
  >
    {children}
  </motion.div>
);

const PhoneMockup = () => {
  const [screen, setScreen] = useState(0);
  const screens = ["catalog", "checkout", "whatsapp"];

  useEffect(() => {
    const t = setInterval(() => setScreen((s) => (s + 1) % screens.length), 2800);
    return () => clearInterval(t);
  }, []);

  const demoProducts = [
    { name: "Minimal Shirt", price: "₹599" },
    { name: "Denim Cargo", price: "₹1,299" },
    { name: "Oversized Tee", price: "₹449" },
    { name: "Layered Set", price: "₹849" },
  ];

  return (
    <div className="relative w-[200px] h-[400px] md:w-[240px] md:h-[480px] mx-auto">
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] shadow-2xl border border-white/10">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0d0d0d] rounded-full z-10" />
        <div className="absolute inset-[6px] rounded-[2.2rem] overflow-hidden bg-white">
          <AnimatePresence mode="wait">
            {screen === 0 && (
              <motion.div key="catalog" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.4 }} className="w-full h-full flex flex-col">
                <div className="bg-[#25D366] px-3 py-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                    <img src={Logo} alt="Pay Per Tap" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-white text-[8px] font-bold leading-none">Jiya Fashions</div>
                    <div className="text-white/70 text-[6px]">paypertap.in/jiyafashions</div>
                  </div>
                </div>
                <div className="flex-1 bg-[#f9f9f9] p-2 overflow-hidden">
                  <div className="text-[7px] font-bold text-gray-500 mb-1.5">NEW ARRIVALS</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {demoProducts.map((item, i) => (
                      <div key={i} className="rounded-lg overflow-hidden bg-white shadow-sm border border-gray-100">
                        <div className="bg-white h-14 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-[7px] font-bold text-gray-500">IMG</div>
                        </div>
                        <div className="p-1">
                          <div className="text-[6px] font-semibold text-gray-800 leading-tight">{item.name}</div>
                          <div className="text-[6px] text-[#25D366] font-bold">{item.price}</div>
                          <div className="mt-1 bg-[#25D366] rounded text-white text-[5px] text-center py-0.5 font-bold">BUY</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {screen === 1 && (
              <motion.div key="checkout" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.4 }} className="w-full h-full flex flex-col">
                <div className="bg-[#25D366] px-3 py-2">
                  <div className="text-white text-[8px] font-bold">Complete Order</div>
                </div>
                <div className="flex-1 bg-white p-3 space-y-2">
                  <div className="bg-[#f0fdf4] rounded-lg p-2 flex gap-2 items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-[7px] font-bold text-gray-500">IMG</div>
                    <div>
                      <div className="text-[7px] font-bold">Minimal Shirt · Size M</div>
                      <div className="text-[7px] text-[#25D366] font-bold">₹599</div>
                    </div>
                  </div>
                  {["Your Name", "Phone Number", "Delivery Address"].map((label, i) => (
                    <div key={i}>
                      <div className="text-[6px] text-gray-400 mb-0.5">{label}</div>
                      <div className="h-4 bg-gray-100 rounded border border-gray-200 w-full" />
                    </div>
                  ))}
                  <div className="mt-2 bg-[#25D366] rounded-lg py-2 flex items-center justify-center gap-1">
                    <WhatsAppIcon size={10} className="text-white" />
                    <span className="text-white text-[7px] font-bold">Continue on WhatsApp</span>
                  </div>
                </div>
              </motion.div>
            )}

            {screen === 2 && (
              <motion.div key="whatsapp" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }} transition={{ duration: 0.4 }} className="w-full h-full flex flex-col">
                <div className="bg-[#075E54] px-3 py-2 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#25D366] flex items-center justify-center">
                    <WhatsAppIcon size={10} className="text-white" />
                  </div>
                  <div>
                    <div className="text-white text-[8px] font-bold">Jiya Fashions</div>
                    <div className="text-green-300 text-[6px]">online</div>
                  </div>
                </div>
                <div
                  className="flex-1 bg-[#e5ddd5] p-2 space-y-1.5"
                  style={{
                    backgroundImage:
                      'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c1b5a9\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                  }}
                >
                  <div className="flex justify-start">
                    <div className="bg-white rounded-lg p-1.5 max-w-[80%] shadow-sm">
                      <div className="text-[6px] text-gray-800 leading-relaxed">
                        New Order
                        <br />
                        Product: Minimal Shirt (M)
                        <br />
                        Price: ₹599
                        <br />
                        Priya Sharma
                        <br />
                        Bhopal, MP 462001
                        <br />
                        +91 98765 43210
                      </div>
                      <div className="text-[5px] text-gray-400 text-right mt-0.5">11:28 AM ✓✓</div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#dcf8c6] rounded-lg p-1.5 max-w-[70%] shadow-sm">
                      <div className="text-[6px] text-gray-800">Sending payment QR...</div>
                      <div className="text-[5px] text-gray-400 text-right mt-0.5">11:29 AM ✓✓</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-[5px] bg-[#25D366]/20 text-[#075E54] px-2 py-0.5 rounded-full font-bold">Sale done — no 2% cut</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {screens.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${screen === i ? "bg-[#25D366] w-3.5" : "bg-white/30"}`} />
        ))}
      </div>
    </div>
  );
};

const StatPill = ({ value, label, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 backdrop-blur-sm"
  >
    <div className="w-7 h-7 rounded-xl bg-[#25D366]/20 flex items-center justify-center text-[#25D366] shrink-0">{icon}</div>
    <div>
      <div className="text-white font-bold text-sm leading-none">{value}</div>
      <div className="text-white/40 text-[10px] leading-none mt-0.5">{label}</div>
    </div>
  </motion.div>
);

const PrimaryWhatsAppButton = ({ className = "", children }) => (
  <motion.a
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    href={WHATSAPP_URL}
    className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25 hover:bg-[#22c55e] transition-colors ${className}`}
  >
    <WhatsAppIcon size={16} />
    {children}
  </motion.a>
);

const SecondaryWhatsAppButton = ({ className = "" }) => (
  <a href={WHATSAPP_URL} className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-sm font-semibold text-white hover:bg-white/12 transition-colors ${className}`}>
    <MessageIcon size={16} />
    Join Waitlist
  </a>
);

const GlowOrb = ({ className }) => <div className={`absolute rounded-full blur-3xl pointer-events-none ${className}`} />;

export default function PaypertapHero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 50, stiffness: 100 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 100 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) * 0.015);
    mouseY.set((e.clientY - rect.top - rect.height / 2) * 0.015);
  };

  const headlineWords = ["Launch a beautiful", "selling page.", "Keep the closing", "on WhatsApp."];

  const subText =
    "Pay Per Tap helps sellers who do not want a heavy website, expensive development, or complicated management. It gives them a clean catalog-style storefront, a smooth buyer flow, and a seller dashboard that keeps every conversation visible.";

  const perks = [
    "Cheaper than Shopify for a lean launch",
    "Faster than WordPress for a simple catalog flow",
    "WhatsApp checkout with manual seller control",
    "Retargeting and follow-up built in",
  ];

  const flowCards = [
    { title: "Browse", desc: "A clean catalog with templates, product images, variants, and pricing.", icon: <CatalogIcon size={18} /> },
    { title: "Checkout", desc: "Buyer fills details, taps complete purchase, and opens WhatsApp with context.", icon: <MessageIcon size={18} /> },
    { title: "Retarget", desc: "Mark outcomes in the dashboard, score conversations, and run follow-ups later.", icon: <TargetIcon size={18} /> },
  ];

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(135deg, #0a0f0a 0%, #0d1a10 40%, #071209 100%)", fontFamily: "'DM Sans', 'Sora', system-ui, sans-serif" }}
      onMouseMove={handleMouseMove}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;1,9..40,400&display=swap');
        * { font-family: 'DM Sans', system-ui, sans-serif; }
        h1, h2, .display { font-family: 'Sora', system-ui, sans-serif; }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .shimmer-text {
          background: linear-gradient(90deg, #fff 0%, #25D366 35%, #fff 50%, #25D366 65%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .float-anim { animation: floatY 4s ease-in-out infinite; }
      `}</style>

      <GlowOrb className="w-[600px] h-[600px] bg-[#25D366]/8 -top-40 -right-40" />
      <GlowOrb className="w-[400px] h-[400px] bg-[#25D366]/5 bottom-0 -left-20" />
      <GlowOrb className="w-[300px] h-[300px] bg-emerald-900/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(37,211,102,1) 1px, transparent 1px), linear-gradient(90deg, rgba(37,211,102,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <motion.nav initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-30 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10 overflow-hidden shadow-lg shadow-black/20 flex items-center justify-center">
            <img src={Logo} alt="Pay Per Tap" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "Sora" }}>
            payper<span className="text-[#25D366]">tap</span>
          </span>
          <span className="hidden sm:flex items-center gap-1 bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-[10px] font-bold px-2 py-0.5 rounded-full">
            <BoltIcon size={9} /> LAUNCHING SOON
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 text-white/40 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
            Building in public
          </div>
          <SecondaryWhatsAppButton className="hidden sm:inline-flex" />
        </div>
      </motion.nav>

      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-10 px-6 md:px-12 py-8 lg:py-0 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col items-start max-w-xl">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="flex items-center gap-2 mb-5">
            <span className="w-2 h-2 rounded-full bg-[#25D366]" />
            <span className="text-white/50 text-xs font-medium">For Instagram & WhatsApp sellers</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-[#25D366] text-xs font-semibold">India-first</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.08] tracking-tight mb-3" style={{ fontFamily: "Sora" }}>
            {headlineWords.map((word, wi) => (
              <motion.span key={wi} initial={{ opacity: 0, y: 30, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ delay: 0.2 + wi * 0.1, duration: 0.6 }} className="block">
                {wi === 0 || wi === 2 ? (
                  <span className={wi === 0 ? "shimmer-text" : "text-white/30"}>{word}</span>
                ) : (
                  <span className="text-white">{word}</span>
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }} className="text-white/55 text-base leading-relaxed mb-7 max-w-lg">
            {subText}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 w-full">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full bg-[#25D366]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckIcon size={10} className="text-[#25D366]" />
                </div>
                <span className="text-white/60 text-[13px] leading-snug">{perk}</span>
              </div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-7 w-full max-w-2xl">
            <StatPill value="₹0" label="setup to start" icon={<BoltIcon size={12} />} delay={0.8} />
            <StatPill value="Manual" label="seller control" icon={<ShieldIcon size={12} />} delay={0.9} />
            <StatPill value="Fast" label="React catalog" icon={<TagIcon size={12} />} delay={1.0} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <PrimaryWhatsAppButton>Get Early Access</PrimaryWhatsAppButton>
            <SecondaryWhatsAppButton className="sm:hidden" />
          </div>
          <p className="text-white/28 text-[11px] mt-2 pl-1">Early access users get 50% off for month 1.</p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15, duration: 0.5 }} className="flex items-center gap-3 mt-5 flex-wrap">
            <div className="flex">
              {["✓", "✓", "✓", "✓", "✓"].map((e, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1a2e1e] to-[#0d1a10] border-2 border-[#0a0f0a] flex items-center justify-center text-[10px] font-bold text-[#25D366] -ml-1 first:ml-0">
                  {e}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => <StarIcon key={i} className="text-amber-400" />)}
              </div>
              <span className="text-white/30 text-[10px]">Built for sellers who want control</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <ShieldIcon size={12} className="text-[#25D366]" />
              <span className="text-white/30 text-[10px]">WhatsApp-first launch flow</span>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.7, type: "spring" }} style={{ x: springX, y: springY }} className="relative flex items-center justify-center w-full lg:w-auto lg:flex-1 max-w-sm lg:max-w-none">
          <div className="absolute w-64 h-64 rounded-full bg-[#25D366]/10 blur-2xl" />
          <div className="absolute w-48 h-48 rounded-full border border-[#25D366]/10 animate-ping" style={{ animationDuration: "3s" }} />

          <div className="float-anim relative z-10 mt-8">
            <PhoneMockup />
          </div>

          <FloatingBadge className="-top-2 -left-4 md:-left-12" delay={0.9}>
            <div className="bg-[#0d1a10] border border-[#25D366]/30 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xl backdrop-blur-md">
              <div className="w-7 h-7 rounded-xl bg-[#25D366] flex items-center justify-center">
                <BoltIcon size={13} className="text-white" />
              </div>
              <div>
                <div className="text-white text-[11px] font-bold leading-none">₹0 setup</div>
                <div className="text-white/40 text-[9px] leading-none mt-0.5">free to launch</div>
              </div>
            </div>
          </FloatingBadge>

          <FloatingBadge className="top-16 -right-4 md:-right-14" delay={1.0}>
            <div className="bg-[#0d1a10] border border-white/10 rounded-2xl px-3 py-2 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-[#25D366] text-[10px] font-bold">NEW SALE</span>
              </div>
              <div className="text-white text-[11px] font-bold">Priya → Minimal Shirt</div>
              <div className="text-white/40 text-[9px]">just now · via WhatsApp</div>
            </div>
          </FloatingBadge>

          <FloatingBadge className="bottom-12 -left-4 md:-left-16" delay={1.1}>
            <div className="bg-[#0d1a10] border border-white/10 rounded-2xl px-3 py-2 shadow-xl backdrop-blur-md">
              <div className="text-white/40 text-[9px] mb-0.5">vs Shopify + WordPress</div>
              <div className="flex items-end gap-1">
                <span className="text-[#25D366] text-base font-bold leading-none">Lean</span>
                <span className="text-white/30 text-[9px] mb-0.5">launch stack</span>
              </div>
            </div>
          </FloatingBadge>
        </motion.div>
      </div>

      <div className="relative z-20 px-6 md:px-12 pb-10 pt-2 max-w-7xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {flowCards.map((card, i) => (
            <div key={card.title} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-2xl shadow-black/10">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/20 flex items-center justify-center text-xl text-[#25D366]">
                  {card.icon}
                </div>
                <div className="text-white/20 text-[10px] uppercase tracking-[0.3em]">0{i + 1}</div>
              </div>
              <div className="text-white font-semibold text-lg mb-1">{card.title}</div>
              <p className="text-white/45 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-md px-5 py-4">
          <div>
            <div className="text-white font-semibold">Manual control first. Automation later.</div>
            <div className="text-white/40 text-sm">Start with WhatsApp checkout, then add payments and retargeting as you grow.</div>
          </div>
          <a href={WHATSAPP_URL} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#25D366]/25">
            Get Early Access <ArrowRightIcon size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
