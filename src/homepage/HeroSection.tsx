"use client";

import { motion } from "framer-motion";
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
  return (
    <section className="ppt-hero">
      <div className="ppt-hero-shell">
        <div className="ppt-hero-copy">
          <motion.div
            className="ppt-social-badge"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <HeroBadge />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="ppt-hero-title">Turn Instagram DMs into confirmed bookings.</h1>
          </motion.div>

          <motion.p
            className="ppt-hero-subtitle ppt-home-copy"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.45 }}
          >
            Create a clean store link for your products. Buyers pay ₹20 to reserve an
            item, then continue to WhatsApp with product and buyer details already filled.
          </motion.p>

          <motion.div
            className="ppt-hero-actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.45 }}
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
