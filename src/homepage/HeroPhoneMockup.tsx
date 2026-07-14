import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Search, ShieldCheck } from "lucide-react";

import { WhatsAppIcon } from "./HeroBadge";

const products = [
  {
    alt: "Vintage denim jacket on a hanger",
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=420&q=74",
    name: "Denim jacket",
    price: "- Rs 1,499",
  },
  {
    alt: "Neutral linen clothing flatlay",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=420&q=74",
    name: "Linen co-ord",
    price: "- Rs 899",
  },
  {
    alt: "Handmade tote bag and accessories",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=420&q=74",
    name: "Handmade bag",
    price: "- Rs 649",
  },
  {
    alt: "Minimal jewellery on a boutique tray",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=420&q=74",
    name: "Drop earrings",
    price: "- Rs 399",
  },
];

export function HeroPhoneMockup() {
  const reduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const shouldFloat = !reduceMotion && !isMobile;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");
    const updateMobileState = () => setIsMobile(mediaQuery.matches);

    updateMobileState();
    mediaQuery.addEventListener("change", updateMobileState);
    return () => mediaQuery.removeEventListener("change", updateMobileState);
  }, []);

  return (
    <motion.div
      className="ppt-phone-stage"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.16, duration: reduceMotion ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ppt-phone-glow" />

      <motion.div
        className="ppt-phone"
        animate={shouldFloat ? { y: [0, -5, 0] } : { y: 0 }}
        transition={shouldFloat ? { duration: 7.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
      >
        <div className="ppt-phone-notch">
          <div />
          <span />
        </div>

        <div className="ppt-phone-screen">
          <div className="ppt-phone-screen-bg" />
          <div className="ppt-store-ui">
            <div className="ppt-store-topbar">
              <div>
                <span>PayPerTap store</span>
                <span className="ppt-faux-strong">aditya.thrift</span>
              </div>
              <div className="ppt-store-avatar">P</div>
            </div>

            <div className="ppt-store-hero-card">
              <div className="ppt-store-hero-copy">
                <span>New drop</span>
                <span className="ppt-faux-strong">Reserved through verified orders</span>
              </div>
              <div className="ppt-store-hero-metric">seller wallet</div>
            </div>

            <div className="ppt-store-search">
              <Search size={14} strokeWidth={2.2} />
              <span>Search products</span>
            </div>

            <div className="ppt-store-tabs">
              <span className="is-active">All</span>
              <span>Thrift</span>
              <span>Handmade</span>
            </div>

            <div className="ppt-store-grid">
              {products.map((product, index) => (
                <div className="ppt-store-product" key={product.name}>
                  <div className="ppt-store-product-media">
                    <img
                      src={product.image}
                      alt={product.alt}
                      width={420}
                      height={260}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={index === 0 ? "high" : "auto"}
                    />
                    <Heart size={13} strokeWidth={2.4} />
                  </div>
                  <p>{product.name}</p>
                  <span>{product.price}</span>
                </div>
              ))}
            </div>

            <div className="ppt-store-Order-strip">
              <ShieldCheck size={16} strokeWidth={2.2} />
              <div>
                <span className="ppt-faux-strong">order via PayPerTap</span>
                <span>Remaining amount paid directly to seller</span>
              </div>
            </div>

            <div className="ppt-store-whatsapp">
              <WhatsAppIcon size={17} />
              <span>Continue to WhatsApp</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
