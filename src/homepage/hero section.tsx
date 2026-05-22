"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, ShieldCheck, Store } from "lucide-react";

type IconProps = { size?: number };
type Step = { icon: ReactNode; label: string; bg: string; isWA?: boolean };

const INSTAGRAM_LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/f/f2/Instagram-Logo-Round-Color.png";

const WHATSAPP_LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/WhatsApp_Logo_green.svg/500px-WhatsApp_Logo_green.svg.png";

const LogoImg = ({
  src,
  alt,
  size = 20,
}: {
  src: string;
  alt: string;
  size?: number;
}) => (
  <img
    src={src}
    alt={alt}
    width={size}
    height={size}
    loading="eager"
    decoding="async"
    draggable={false}
    style={{
      width: size,
      height: size,
      objectFit: "contain",
      display: "block",
      userSelect: "none",
      pointerEvents: "none",
    }}
  />
);

const InstagramIcon = ({ size = 20 }: IconProps) => (
  <LogoImg src={INSTAGRAM_LOGO_URL} alt="Instagram" size={size} />
);

const WhatsAppIcon = ({ size = 20 }: IconProps) => (
  <LogoImg src={WHATSAPP_LOGO_URL} alt="WhatsApp" size={size} />
);

const StoreBadgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9l1-4h16l1 4M5 9v10h14V9M9 19v-6h6v6"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CartBadgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="21" r="1.2" fill="white" />
    <circle cx="19" cy="21" r="1.2" fill="white" />
    <path
      d="M2.5 3h3l2.5 12h10.5l2-8H7"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CardBadgeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="5" width="20" height="14" rx="3" stroke="white" strokeWidth="2" />
    <path d="M2 10h20" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const WAConfirmIcon = () => (
  <LogoImg src={WHATSAPP_LOGO_URL} alt="WhatsApp" size={18} />
);

const FlowStep = ({ icon, label, bg, isWA }: Step) => (
  <div className={`ppt-flow-step ${isWA ? "ppt-flow-step-wa" : ""}`}>
    <div
      className="ppt-flow-step-icon"
      style={{
        background: bg,
        boxShadow: isWA
          ? "0 4px 14px rgba(37,211,102,0.24)"
          : "0 4px 14px rgba(124,58,237,0.22)",
      }}
    >
      {icon}
    </div>

    <span>{label}</span>

    {isWA ? <div className="ppt-flow-check">✓</div> : null}
  </div>
);

const TrustPoint = ({
  icon,
  line1,
  line2,
}: {
  icon: ReactNode;
  line1: string;
  line2: string;
}) => (
  <div className="ppt-trust-point">
    <div>{icon}</div>
    <span>
      {line1}
      <br />
      {line2}
    </span>
  </div>
);

const AvatarCluster = () => {
  const colors = ["#7C3AED", "#a78bfa", "#6366f1", "#8b5cf6", "#c4b5fd", "#7C3AED"];

  return (
    <div className="ppt-avatar-cluster">
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            zIndex: colors.length - i,
          }}
        >
          {String.fromCharCode(65 + i)}
        </div>
      ))}
    </div>
  );
};

function MobileMockup() {
  return (
    <motion.div
      className="ppt-phone-stage"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="ppt-phone-glow" />

      <motion.div
        className="ppt-phone"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="ppt-phone-notch">
          <div />
          <span />
        </div>

        <div className="ppt-phone-screen">
          <div className="ppt-phone-screen-bg" />
          <div className="ppt-phone-placeholder">
            <span>mockup.png</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const FLOW: Step[] = [
  {
    icon: <StoreBadgeIcon />,
    label: "Create your branded store",
    bg: "#7C3AED",
  },
  {
    icon: <CartBadgeIcon />,
    label: "Customers browse your products",
    bg: "#7C3AED",
  },
  {
    icon: <CardBadgeIcon />,
    label: "They pay a small advance to reserve",
    bg: "#7C3AED",
  },
  {
    icon: <WAConfirmIcon />,
    label: "You confirm on WhatsApp",
    bg: "#E9FBF0",
    isWA: true,
  },
];

export function HeroSection() {
  const startFlow = () => {
    window.location.href = "/auth";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

        .ppt-root {
          position: relative;
          min-height: 100svh;
          background: transparent;
          overflow: visible;
          font-family: 'Sora', system-ui, sans-serif;
        }

        .ppt-root::before {
          display: none;
        }

        .ppt-wrapper {
          position: relative;
          z-index: 10;
          max-width: 1360px;
          margin: 0 auto;
          padding: 148px 44px 78px;
        }

        .ppt-hero-grid {
          display: grid;
          grid-template-columns: 1.08fr 0.92fr 300px;
          gap: 34px;
          align-items: center;
        }

        .ppt-left-col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ppt-copy-stack {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .ppt-social-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.54);
          border: 1px solid rgba(124,58,237,0.10);
          border-radius: 100px;
          padding: 6px 14px 6px 10px;
          width: fit-content;
          box-shadow: 0 2px 14px rgba(124,58,237,0.06);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .ppt-social-badge span {
          font-size: 12px;
          font-weight: 600;
          color: #4a4a70;
          font-family: 'DM Sans', sans-serif;
        }

        .ppt-headline {
          font-size: clamp(44px, 4.4vw, 58px);
          font-weight: 800;
          line-height: 0.98;
          color: #0D0D14;
          letter-spacing: -0.04em;
          font-family: 'Sora', sans-serif;
          margin: 0;
          max-width: 660px;
        }

        .ppt-accent-wrap {
          position: relative;
          display: inline-block;
          margin-top: 3px;
        }

        .ppt-accent {
          font-size: clamp(44px, 4.4vw, 58px);
          font-weight: 800;
          line-height: 0.98;
          letter-spacing: -0.04em;
          font-family: 'Sora', sans-serif;
          margin: 0;
          background: linear-gradient(135deg, #6d5dfc 0%, #7C3AED 45%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ppt-underline {
          position: absolute;
          bottom: -7px;
          left: 0;
          width: 100%;
          height: 10px;
        }

        .ppt-subtext {
          font-size: 15.5px;
          line-height: 1.5;
          color: #6b6b8a;
          font-weight: 400;
          font-family: 'DM Sans', sans-serif;
          max-width: 420px;
          margin: 0;
        }

        .ppt-chip-row {
          display: flex;
          gap: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(124,58,237,0.08);
        }

        .ppt-trust-point {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          flex: 1;
          min-width: 0;
        }

        .ppt-trust-point > div {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: rgba(124,58,237,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ppt-trust-point span {
          font-size: 11.25px;
          font-weight: 500;
          color: #6b6b8a;
          text-align: center;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.25;
        }

        .ppt-proof-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ppt-avatar-cluster {
          display: flex;
          flex-shrink: 0;
        }

        .ppt-avatar-cluster div {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2.5px solid #f8f6ff;
          margin-left: -8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .ppt-avatar-cluster div:first-child {
          margin-left: 0;
        }

        .ppt-avatar-copy {
          font-size: 12.8px;
          color: #6b6b8a;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.35;
        }

        .ppt-avatar-copy strong {
          color: #7C3AED;
          font-weight: 700;
        }

        .ppt-mobile-trust-pill {
          display: none;
        }

        .ppt-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ppt-btn-primary,
        .ppt-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }

        .ppt-btn-primary {
          background: #0D0D14;
          color: white;
          border: none;
          padding: 12px 20px;
        }

        .ppt-btn-primary:hover {
          background: #1a1a40;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(13,13,20,0.18);
        }

        .ppt-btn-secondary {
          background: rgba(255,255,255,0.52);
          color: #0D0D14;
          border: 1.5px solid rgba(0,0,0,0.08);
          padding: 12px 18px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .ppt-btn-secondary:hover {
          border-color: rgba(124,58,237,0.35);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124,58,237,0.08);
        }

        .ppt-play-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,0.14);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ppt-phone-col {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ppt-phone-stage {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
          padding-top: 16px;
          padding-bottom: 16px;
        }

        .ppt-phone-glow {
          position: absolute;
          inset: -10%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.16) 0%, transparent 68%);
          filter: blur(24px);
          pointer-events: none;
        }

        .ppt-phone {
          position: relative;
          width: 240px;
          background: #18182a;
          border-radius: 38px;
          padding: 8px 7px;
          box-shadow:
            0 40px 80px rgba(0,0,0,0.16),
            0 12px 34px rgba(0,0,0,0.10),
            inset 0 0 0 1.5px rgba(255,255,255,0.1);
          transform: perspective(950px) rotateY(-6deg) rotateX(2deg);
          will-change: transform;
        }

        .ppt-phone-notch {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 22px;
          background: #0d0d1a;
          border-radius: 13px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .ppt-phone-notch div {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #111120;
        }

        .ppt-phone-notch span {
          width: 42px;
          height: 7px;
          border-radius: 4px;
          background: #111120;
        }

        .ppt-phone-screen {
          width: 100%;
          border-radius: 30px;
          overflow: hidden;
          background: #f6f4ff;
          min-height: 470px;
          position: relative;
        }

        .ppt-phone-screen-bg {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,246,255,0.98) 100%),
            linear-gradient(180deg, rgba(124,58,237,0.05) 0%, rgba(255,255,255,0) 34%, rgba(167,139,250,0.05) 100%);
        }

        .ppt-phone-placeholder {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          opacity: 0.85;
        }

        .ppt-phone-placeholder span {
          width: 72%;
          aspect-ratio: 9 / 16;
          border-radius: 22px;
          border: 1px dashed rgba(124,58,237,0.25);
          display: grid;
          place-items: center;
          background: rgba(124,58,237,0.03);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #7c3aed;
          font-weight: 600;
        }

        .ppt-flow-col {
          display: flex;
          flex-direction: column;
        }

        .ppt-flow-step {
          position: relative;
          background: rgba(255,255,255,0.56);
          border: 1px solid rgba(124,58,237,0.08);
          border-radius: 18px;
          padding: 12px 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 2px 18px rgba(0,0,0,0.06);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .ppt-flow-step-wa {
          background: linear-gradient(135deg, rgba(240,253,244,0.72) 0%, rgba(220,252,231,0.64) 100%);
          border-color: #b7f0cc;
        }

        .ppt-flow-step-icon {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ppt-flow-step span {
          font-size: 12.5px;
          font-weight: 500;
          color: #1a1a2e;
          line-height: 1.25;
          font-family: 'DM Sans', sans-serif;
        }

        .ppt-flow-check {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #25D366;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          color: white;
          font-size: 10px;
          font-weight: 800;
          box-shadow: 0 2px 8px rgba(37,211,102,0.45);
        }

        .ppt-flow-arrow {
          display: flex;
          justify-content: center;
          padding: 3px 0;
          margin-left: 20px;
        }

        .ppt-payment-card {
          margin-top: 12px;
          background: rgba(255,255,255,0.56);
          border: 1px solid rgba(124,58,237,0.08);
          border-radius: 16px;
          padding: 11px 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 2px 18px rgba(0,0,0,0.05);
        }

        .ppt-payment-icon {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          background: #ede9fe;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ppt-payment-card strong {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          color: #0D0D14;
          font-family: 'DM Sans', sans-serif;
        }

        .ppt-payment-card span {
          display: block;
          font-size: 11px;
          color: #9999bb;
          font-family: 'DM Sans', sans-serif;
          margin-top: 1px;
        }

        @media (max-width: 1280px) {
          .ppt-wrapper {
            padding-top: 148px;
          }

          .ppt-hero-grid {
            grid-template-columns: 1.05fr 0.95fr !important;
            gap: 28px !important;
          }

          .ppt-flow-col {
            display: none !important;
          }

          .ppt-headline,
          .ppt-accent {
            font-size: clamp(44px, 4.8vw, 56px) !important;
          }
        }

        @media (max-width: 900px) {
          .ppt-wrapper {
            padding-top: 134px;
          }

          .ppt-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 42px !important;
            padding-top: 0 !important;
          }

          .ppt-phone-col {
            order: 2 !important;
          }
        }

        @media (max-width: 680px) {
          .ppt-root {
            min-height: auto;
            background: transparent;
          }

          .ppt-root::before {
            display: none;
          }

          .ppt-wrapper {
            padding: 126px 24px 82px !important;
          }

          .ppt-hero-grid {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 52px !important;
          }

          .ppt-left-col {
            width: 100%;
            gap: 0 !important;
            align-items: center;
          }

          .ppt-copy-stack {
            align-items: center;
            text-align: center;
            gap: 25px !important;
          }

          .ppt-social-badge {
            padding: 8px 16px 8px 12px;
            box-shadow: 0 16px 40px rgba(124,58,237,0.08);
          }

          .ppt-social-badge span {
            font-size: 13px;
          }

          .ppt-headline {
            max-width: 430px;
            font-size: clamp(45px, 12.4vw, 56px) !important;
            line-height: 0.98 !important;
            letter-spacing: -0.065em !important;
            text-align: center;
          }

          .ppt-accent-wrap {
            margin-top: 0;
          }

          .ppt-accent {
            font-size: clamp(45px, 12.4vw, 56px) !important;
            line-height: 0.98 !important;
            letter-spacing: -0.065em !important;
            text-align: center;
          }

          .ppt-underline {
            display: none;
          }

          .ppt-subtext {
            max-width: 390px;
            font-size: 18px !important;
            line-height: 1.55 !important;
            color: #11111a;
            text-align: center;
          }

          .ppt-chip-row,
          .ppt-proof-row,
          .ppt-flow-col {
            display: none !important;
          }

          .ppt-mobile-trust-pill {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 390px;
            min-height: 58px;
            padding: 14px 20px;
            border-radius: 999px;
            background: rgba(255,255,255,0.58);
            border: 1px solid rgba(124,58,237,0.08);
            box-shadow: 0 24px 70px rgba(124,58,237,0.12);
            color: #0D0D14;
            font-family: 'DM Sans', sans-serif;
            font-size: 15.5px;
            font-weight: 700;
            text-align: center;
          }

          .ppt-mobile-trust-pill strong {
            color: #7C3AED;
            font-weight: 900;
          }

          .ppt-actions {
            width: 100%;
            max-width: 390px;
            margin-top: 26px;
            flex-direction: column;
            gap: 12px;
          }

          .ppt-btn-primary,
          .ppt-btn-secondary {
            width: 100%;
            height: 58px;
            border-radius: 999px;
            font-size: 16px;
          }

          .ppt-btn-secondary {
            background: rgba(255,255,255,0.54);
          }

          .ppt-phone-col {
            width: 100%;
            display: flex !important;
            justify-content: center !important;
            margin-top: 0;
            order: 2 !important;
            overflow: visible !important;
          }

          .ppt-phone-stage {
            width: 100%;
            max-width: 390px;
            min-height: 470px;
            overflow: visible !important;
            padding-top: 28px;
            padding-bottom: 22px;
          }

          .ppt-phone-glow {
            inset: auto;
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(124,58,237,0.13) 0%, transparent 68%);
            filter: blur(22px);
          }

          .ppt-phone {
            width: 220px;
            border-radius: 36px;
            padding: 7px;
            transform: none;
          }

          .ppt-phone-screen {
            min-height: 430px;
            border-radius: 29px;
          }
        }

        @media (max-width: 430px) {
          .ppt-wrapper {
            padding: 120px 18px 74px !important;
          }

          .ppt-headline,
          .ppt-accent {
            font-size: clamp(40px, 12vw, 48px) !important;
          }

          .ppt-subtext {
            font-size: 16.5px !important;
          }

          .ppt-copy-stack {
            gap: 22px !important;
          }

          .ppt-phone-stage {
            min-height: 440px;
            padding-top: 26px;
          }

          .ppt-phone {
            width: 205px;
          }

          .ppt-phone-screen {
            min-height: 400px;
          }
        }
      `}</style>

      <section className="ppt-root">
        <div className="ppt-wrapper">
          <div className="ppt-hero-grid">
            <div className="ppt-left-col">
              <div className="ppt-copy-stack">
                <motion.div
                  className="ppt-social-badge"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <InstagramIcon size={18} />
                  <WhatsAppIcon size={18} />
                  <span>Built for Instagram &amp; WhatsApp Sellers</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.06,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <h1 className="ppt-headline">
                    Turn followers
                    <br />
                    into customers.
                  </h1>

                  <div className="ppt-accent-wrap">
                    <h1 className="ppt-accent">Secure every sale.</h1>

                    <svg
                      viewBox="0 0 460 10"
                      className="ppt-underline"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M4 6 C80 2, 200 1, 280 3.5 C360 6, 420 7, 456 5.5"
                        stroke="url(#pptUlGrad)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="pptUlGrad" x1="0" x2="1" y1="0" y2="0">
                          <stop stopColor="#6d5dfc" />
                          <stop offset="1" stopColor="#c4b5fd" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </motion.div>

                <motion.p
                  className="ppt-subtext"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14, duration: 0.45 }}
                >
                  Create your branded storefront, let customers browse, and collect a small
                  advance to reserve any item — before moving to WhatsApp.
                </motion.p>

                <motion.div
                  className="ppt-chip-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.28, duration: 0.45 }}
                >
                  <TrustPoint
                    icon={<Store size={18} color="#7C3AED" strokeWidth={1.8} />}
                    line1="Branded"
                    line2="Storefronts"
                  />

                  <TrustPoint
                    icon={<ShieldCheck size={18} color="#7C3AED" strokeWidth={1.8} />}
                    line1="Secure Advance"
                    line2="Payments"
                  />

                  <TrustPoint
                    icon={<WhatsAppIcon size={20} />}
                    line1="Confirm on"
                    line2="WhatsApp"
                  />
                </motion.div>

                <motion.div
                  className="ppt-proof-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.36, duration: 0.45 }}
                >
                  <AvatarCluster />

                  <span className="ppt-avatar-copy">
                    <strong>10,000+</strong> sellers trust PayPerTap across India
                  </span>
                </motion.div>

                <motion.div
                  className="ppt-mobile-trust-pill"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22, duration: 0.45 }}
                >
                  <span>
                    Trusted by <strong>10,000+</strong> sellers across India
                  </span>
                </motion.div>
              </div>

              <motion.div
                className="ppt-actions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
              >
                <button className="ppt-btn-primary" type="button" onClick={startFlow}>
                  Create Your Store <ArrowRight size={15} />
                </button>

                <button className="ppt-btn-secondary">
                  <div className="ppt-play-circle">
                    <Play size={10} fill="#0D0D14" />
                  </div>
                  See How It Works
                </button>
              </motion.div>
            </div>

            <div className="ppt-phone-col">
              <MobileMockup />
            </div>

            <div className="ppt-flow-col">
              {FLOW.map((step, i) => (
                <div key={`${step.label}-${i}`}>
                  <FlowStep {...step} />

                  {i < FLOW.length - 1 ? (
                    <div className="ppt-flow-arrow">
                      <svg width="12" height="18" viewBox="0 0 12 18" fill="none">
                        <path
                          d="M6 1v13M2 11l4 5 4-5"
                          stroke="rgba(124,58,237,0.35)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : null}
                </div>
              ))}

              <div className="ppt-payment-card">
                <div className="ppt-payment-icon">
                  <ShieldCheck size={18} color="#7C3AED" strokeWidth={1.8} />
                </div>

                <div>
                  <strong>Secure Payments</strong>
                  <span>100% Safe &amp; Trusted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HeroSection;
