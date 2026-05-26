"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck, Store } from "lucide-react";
import { Link } from "react-router-dom";

import { HeroBadge, WhatsAppIcon } from "./HeroBadge";
import { HeroFlowCards } from "./HeroFlowCards";
import { HeroPhoneMockup } from "./HeroPhoneMockup";

const trustPoints = [
  {
    icon: <Store size={17} strokeWidth={2.1} />,
    label: "Bio-ready storefront",
  },
  {
    icon: <ShieldCheck size={17} strokeWidth={2.1} />,
    label: "₹20 booking intent",
  },
  {
    icon: <WhatsAppIcon size={17} />,
    label: "WhatsApp-ready details",
  },
];

export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const fadeUp = (y: number) => (reduceMotion ? false : { opacity: 0, y });
  const quickTransition = (delay = 0) => ({
    delay: reduceMotion ? 0 : delay,
    duration: reduceMotion ? 0 : 0.45,
    ease: "easeOut" as const,
  });

  return (
    <section className="ppt-hero">
      <div className="ppt-hero-shell">
        <div className="ppt-hero-copy">
          <motion.div
            className="ppt-social-badge"
            initial={fadeUp(8)}
            animate={{ opacity: 1, y: 0 }}
            transition={quickTransition()}
          >
            <HeroBadge />
          </motion.div>

          <motion.div
            initial={fadeUp(16)}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: reduceMotion ? 0 : 0.06,
              duration: reduceMotion ? 0 : 0.55,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <h1 className="ppt-hero-title">Turn Instagram DMs into confirmed bookings.</h1>
          </motion.div>

          <motion.p
            className="ppt-hero-subtitle ppt-home-copy"
            initial={fadeUp(12)}
            animate={{ opacity: 1, y: 0 }}
            transition={quickTransition(0.14)}
          >
            PayPerTap is a verified booking storefront for Indian Instagram and
            WhatsApp sellers. Sellers create a product store link, buyers pay a fixed
            ₹20 booking through PayPerTap to reserve an item, and the buyer then
            continues to WhatsApp with product, price, booking, and contact details ready.
          </motion.p>

          <motion.div
            className="ppt-hero-actions"
            initial={fadeUp(12)}
            animate={{ opacity: 1, y: 0 }}
            transition={quickTransition(0.2)}
          >
            <Link to="/auth" className="ppt-primary-link">
              Create your store <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/how-it-works" className="ppt-secondary-link">
              <PlayCircle size={18} aria-hidden="true" />
              See how it works
            </Link>
          </motion.div>

          <motion.div
            className="ppt-hero-trust-row"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={quickTransition(0.28)}
          >
            {trustPoints.map((point) => (
              <div className="ppt-hero-trust-point" key={point.label}>
                {point.icon}
                <span>{point.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="ppt-hero-visual" aria-label="PayPerTap storefront and booking preview">
          <HeroPhoneMockup />
          <HeroFlowCards />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
