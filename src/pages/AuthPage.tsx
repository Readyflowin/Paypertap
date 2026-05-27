import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FormEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  ShieldCheck,
  Store,
  TrendingUp,
} from "lucide-react";

import logo from "../assets/Logo.png";
import { PayPerTapInlineLoader, PptField, PptNotice } from "../components/ui";
import {
  continueSellerWithEmail,
  continueSellerWithGoogle,
} from "../services/authService";
import { prepareSellerAfterAuth } from "../services/sellerService";

function getAuthErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: unknown }).code);
  }
  return "";
}

function getFriendlyAuthError(error: unknown) {
  const code = getAuthErrorCode(error);

  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in was closed before finishing.";
  }

  if (code === "auth/popup-blocked") {
    return "Popup was blocked. Please allow popups and try again.";
  }

  if (code === "auth/unauthorized-domain") {
    return "This domain is not authorized in Firebase Authentication.";
  }

  if (code === "auth/network-request-failed") {
    return "Network issue. Please try again.";
  }

  if (error instanceof Error && error.message) return error.message;

  return "We could not continue with those details. Please try again.";
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error(message)), timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeoutId));
  });
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.35 0-4.34-1.58-5.05-3.72H.93v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.41 5.41 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.93A9 9 0 0 0 0 9c0 1.45.34 2.82.93 4.03l3.02-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.59-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .93 4.97L3.95 7.3C4.66 5.16 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

function WhatsAppLogo({ size = 18 }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        fill="#25D366"
        d="M16 2.75c-7.31 0-13.25 5.94-13.25 13.25 0 2.34.61 4.62 1.77 6.63L2.75 29.25l6.78-1.78A13.18 13.18 0 0 0 16 29.25c7.31 0 13.25-5.94 13.25-13.25S23.31 2.75 16 2.75Z"
      />
      <path
        fill="#ffffff"
        d="M23.53 19.34c-.41-.2-2.41-1.19-2.79-1.32-.37-.14-.65-.2-.92.2-.27.41-1.06 1.32-1.3 1.59-.24.27-.48.31-.89.1-.41-.2-1.74-.64-3.31-2.04-1.22-1.09-2.05-2.44-2.29-2.85-.24-.41-.03-.63.18-.84.18-.18.41-.48.61-.72.2-.24.27-.41.41-.68.14-.27.07-.51-.03-.72-.1-.2-.92-2.22-1.26-3.04-.33-.8-.67-.69-.92-.7h-.78c-.27 0-.72.1-1.09.51-.37.41-1.43 1.4-1.43 3.42s1.47 3.97 1.67 4.24c.2.27 2.9 4.43 7.02 6.21.98.42 1.75.68 2.35.87.99.31 1.89.27 2.6.16.79-.12 2.41-.99 2.75-1.94.34-.96.34-1.78.24-1.94-.1-.17-.37-.27-.78-.48Z"
      />
    </svg>
  );
}

/* ─── Animated grid background ─── */
function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      if (!canvas || !ctx) return;

      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const dots: { x: number; y: number; r: number; speed: number; phase: number }[] = [];

    for (let i = 0; i < 55; i += 1) {
      dots.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 2.2 + 0.6,
        speed: Math.random() * 0.4 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    function draw() {
      if (!canvas || !ctx) return;

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      ctx.clearRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 0.5;

      const cols = 14;
      const rows = 20;

      for (let c = 0; c <= cols; c += 1) {
        ctx.beginPath();
        ctx.moveTo((c / cols) * W, 0);
        ctx.lineTo((c / cols) * W, H);
        ctx.stroke();
      }

      for (let r = 0; r <= rows; r += 1) {
        ctx.beginPath();
        ctx.moveTo(0, (r / rows) * H);
        ctx.lineTo(W, (r / rows) * H);
        ctx.stroke();
      }

      if (!reducedMotion) t += 0.005;

      dots.forEach((d) => {
        const px = (d.x / 100) * W + Math.sin(t * d.speed + d.phase) * 18;
        const py = (d.y / 100) * H + Math.cos(t * d.speed * 0.7 + d.phase) * 12;
        const alpha = 0.18 + 0.12 * Math.sin(t * d.speed * 2 + d.phase);

        ctx.beginPath();
        ctx.arc(px, py, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${alpha})`;
        ctx.fill();
      });

      const gx = W * 0.3 + Math.sin(t * 0.4) * 40;
      const gy = H * 0.4 + Math.cos(t * 0.3) * 30;
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, 220);

      grad.addColorStop(0, "rgba(124,58,237,0.22)");
      grad.addColorStop(0.5, "rgba(139,92,246,0.08)");
      grad.addColorStop(1, "rgba(139,92,246,0)");

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      if (!reducedMotion) raf = requestAnimationFrame(draw);
    }

    resize();
    draw();

    window.addEventListener("resize", resize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

/* ─── Stat card used on left panel ─── */
function StatPill({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: ElementType;
  label: string;
  value: string;
  delay: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "14px",
        padding: "14px 18px",
        backdropFilter: "blur(12px)",
        animation: "fadeSlideUp 0.6s ease both",
        animationDelay: delay,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: "rgba(139,92,246,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color="#c4b5fd" />
      </div>

      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#f5f3ff",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.45)",
            marginTop: 2,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function FlowCircle({
  children,
  label,
  color,
  delay,
}: {
  children: ReactNode;
  label: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className="flow-step"
      style={{
        animationDelay: delay,
      }}
      title={label}
      aria-label={label}
    >
      <div
        className="flow-step-icon"
        style={{
          background: color,
        }}
      >
        {children}
      </div>
      <span className="flow-step-label">{label}</span>
    </div>
  );
}

/* ─── Trust flow strip ─── */
function TrustFlowStrip() {
  return (
    <div className="trust-flow-strip" aria-label="PayPerTap seller workflow">
      <FlowCircle label="Store" color="#7c3aed" delay="0.05s">
        <Store size={15} strokeWidth={2.6} />
      </FlowCircle>

      <FlowCircle label="Intent" color="#0891b2" delay="0.1s">
        <BadgeCheck size={15} strokeWidth={2.6} />
      </FlowCircle>

      <FlowCircle label="Chat" color="#25D366" delay="0.15s">
        <WhatsAppLogo size={16} />
      </FlowCircle>

      <FlowCircle label="Confirm" color="#0d9488" delay="0.2s">
        <CheckCircle2 size={15} strokeWidth={2.6} />
      </FlowCircle>
    </div>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");
  const isLoading = loading !== null;

  async function continueAfterAuth(
    userPromise: Promise<Awaited<ReturnType<typeof continueSellerWithEmail>>>,
  ) {
    setError("");
    setStatusText("Checking your account...");

    const user = await withTimeout(
      userPromise,
      45000,
      "Sign-in took too long. Please try again.",
    );

    setStatusText("Creating your store...");

    const result = await withTimeout(
      prepareSellerAfterAuth(user),
      45000,
      "Account setup took too long. Please try again.",
    );

    navigate(result.nextRoute);
  }

  async function handleEmailContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading("email");
      await continueAfterAuth(continueSellerWithEmail(email.trim(), password));
    } catch (err) {
      console.error("Email auth failed:", err);
      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(null);
      setStatusText("");
    }
  }

  async function handleGoogleContinue() {
    try {
      setLoading("google");
      await continueAfterAuth(continueSellerWithGoogle());
    } catch (err) {
      console.error("Google auth failed:", err);
      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(null);
      setStatusText("");
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeSlideRight {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139,92,246,0.45); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 10px rgba(139,92,246,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }

        @keyframes floatBadge {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }

        .auth-root {
          font-family: 'DM Sans', sans-serif;
          display: flex;
          min-height: 100vh;
          background: #09080f;
        }

        /* ── LEFT PANEL ── */
        .auth-left {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 52px;
          background: linear-gradient(145deg, #0f0a28 0%, #130d35 40%, #0a1428 100%);
          overflow: hidden;
        }

        .auth-left::before {
          content: '';
          position: absolute;
          top: -80px;
          left: -80px;
          width: 380px;
          height: 380px;
          background: radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%);
          pointer-events: none;
        }

        .auth-left::after {
          content: '';
          position: absolute;
          bottom: 80px;
          right: -60px;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(8,145,178,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Sora', sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #f5f3ff;
          letter-spacing: -0.04em;
          animation: fadeSlideRight 0.5s ease both;
        }

        .brand-logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-ring 2.8s ease-in-out infinite;
        }

        .brand-logo-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .left-headline {
          font-family: 'Sora', sans-serif;
          font-size: clamp(32px, 3.5vw, 46px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.05em;
          color: #f5f3ff;
          animation: fadeSlideUp 0.6s 0.1s ease both;
        }

        .left-headline .shimmer-word {
          background: linear-gradient(90deg, #a78bfa, #818cf8, #c4b5fd, #a78bfa);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .left-sub {
          margin-top: 16px;
          font-size: 15px;
          color: rgba(255,255,255,0.45);
          line-height: 1.65;
          max-width: 420px;
          animation: fadeSlideUp 0.6s 0.2s ease both;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 40px;
        }

        .trust-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 18px 22px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          animation: fadeSlideUp 0.6s 0.6s ease both;
        }

        .trust-bar-text {
          min-width: 0;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
        }

        .trust-bar-text strong {
          color: rgba(255,255,255,0.8);
          font-weight: 500;
        }

        .trust-flow-strip {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .flow-step {
          display: grid;
          place-items: center;
          gap: 5px;
          animation: fadeSlideUp 0.45s ease both;
        }

        .flow-step-icon {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 2px solid rgba(15,10,40,0.9);
          color: #ffffff;
          display: grid;
          place-items: center;
          box-shadow: 0 10px 24px rgba(0,0,0,0.18);
        }

        .flow-step-label {
          max-width: 44px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 8px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: rgba(255,255,255,0.72);
        }

        /* ── RIGHT PANEL ── */
        .auth-right {
          width: min(520px, 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 56px;
          background: #ffffff;
          position: relative;
        }

        .auth-right::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #7c3aed, #4f46e5, #0891b2);
        }

        .form-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f5f3ff;
          border: 1px solid #e9d5ff;
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 11.5px;
          font-weight: 600;
          color: #6d28d9;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 24px;
          animation: fadeSlideUp 0.5s ease both;
        }

        .form-title {
          font-family: 'Sora', sans-serif;
          font-size: 30px;
          font-weight: 700;
          color: #1a1235;
          letter-spacing: -0.04em;
          line-height: 1.2;
          margin-bottom: 6px;
          animation: fadeSlideUp 0.5s 0.05s ease both;
        }

        .form-subtitle {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 36px;
          animation: fadeSlideUp 0.5s 0.1s ease both;
        }

        .google-btn-enterprise {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 13px 20px;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          animation: fadeSlideUp 0.5s 0.15s ease both;
        }

        .google-btn-enterprise:hover:not(:disabled) {
          border-color: #c7d2fe;
          background: #fafbff;
          box-shadow: 0 2px 12px rgba(99,102,241,0.1);
        }

        .google-btn-enterprise:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
          animation: fadeSlideUp 0.5s 0.2s ease both;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #f1f5f9;
        }

        .divider-text {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .field-wrapper {
          margin-bottom: 16px;
          animation: fadeSlideUp 0.5s ease both;
        }

        .field-wrapper:nth-child(1) { animation-delay: 0.25s; }
        .field-wrapper:nth-child(2) { animation-delay: 0.3s; }

        .submit-btn-enterprise {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(109,40,217,0.3);
          margin-top: 6px;
          animation: fadeSlideUp 0.5s 0.35s ease both;
          letter-spacing: -0.01em;
        }

        .submit-btn-enterprise:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(109,40,217,0.4);
        }

        .submit-btn-enterprise:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn-enterprise:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .security-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 20px;
          font-size: 12px;
          color: #94a3b8;
          animation: fadeSlideUp 0.5s 0.4s ease both;
        }

        /* ── Float badge ── */
        .float-badge {
          position: absolute;
          top: 42px;
          right: 48px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 12px;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          font-weight: 500;
          animation: floatBadge 4s ease-in-out infinite, fadeSlideUp 0.6s 0.3s ease both;
          backdrop-filter: blur(10px);
          z-index: 2;
        }

        .float-badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.25);
          flex-shrink: 0;
        }

        @media (max-width: 1180px) {
          .auth-left {
            padding: 42px 40px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 820px) {
          .auth-left {
            display: none;
          }

          .auth-right {
            width: 100%;
            min-height: 100vh;
            padding: 48px 32px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="auth-root">
        {/* ════ LEFT PANEL ════ */}
        <div className="auth-left">
          <GridCanvas />

          {/* Floating live badge */}
          <div className="float-badge">
            <div className="float-badge-dot" />
            Built for social sellers
          </div>

          {/* Brand */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="brand-logo">
              <div className="brand-logo-icon">
                <img src={logo} alt="PayPerTap logo" draggable={false} />
              </div>
              PayPerTap
            </div>
          </div>

          {/* Middle content */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="left-headline">
              Launch your store.
              <br />
              <span className="shimmer-word">Confirm serious buyers.</span>
            </div>

            <p className="left-sub">
              PayPerTap gives social sellers a clean storefront, verified buyer interest
              through a fixed booking step, and a WhatsApp-first flow that
              fits into the way they already sell.
            </p>

            <div className="stats-grid">
              <StatPill
                icon={BadgeCheck}
                label="Buyer intent"
                value="Verified"
                delay="0.3s"
              />

              <StatPill
                icon={WhatsAppLogo}
                label="WhatsApp flow"
                value="WhatsApp"
                delay="0.35s"
              />

              <StatPill
                icon={Globe}
                label="Storefront"
                value="Link-ready"
                delay="0.4s"
              />

              <StatPill
                icon={TrendingUp}
                label="Workflow"
                value="Fits in"
                delay="0.45s"
              />
            </div>
          </div>

          {/* Trust bar */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="trust-bar">
              <TrustFlowStrip />

              <div className="trust-bar-text">
                <strong>Built for your existing workflow</strong> — share a store
                link, check buyer interest, then continue the conversation where
                your customers already are.
              </div>
            </div>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div className="auth-right">
          <div>
            <div className="form-eyebrow">
              <ShieldCheck size={12} />
              Seller Portal
            </div>

            <h1 className="form-title">Create or continue your store</h1>

            <p className="form-subtitle">
              Sign in to manage your storefront, products, bookings, and buyer
              conversations.
            </p>

            {/* Google */}
            <button
              type="button"
              className="google-btn-enterprise"
              disabled={isLoading}
              onClick={handleGoogleContinue}
            >
              {loading === "google" ? (
                <>
                  <PayPerTapInlineLoader tone="brand" />
                  {statusText || "Checking your account..."}
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="divider-row">
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailContinue}>
              <div className="field-wrapper">
                <PptField
                  label="Email address"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  icon={<Mail size={17} />}
                  required
                />
              </div>

              <div className="field-wrapper">
                <PptField
                  label="Password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Minimum 6 characters"
                  icon={<Lock size={17} />}
                  minLength={6}
                  required
                />
              </div>

              {error ? (
                <div style={{ marginBottom: 14 }}>
                  <PptNotice tone="danger" title="Could not continue">
                    {error}
                  </PptNotice>
                </div>
              ) : null}

              <button
                type="submit"
                className="submit-btn-enterprise"
                disabled={isLoading}
              >
                {loading === "email" ? (
                  <>
                    <PayPerTapInlineLoader tone="light" />
                    {statusText || "Checking your account..."}
                  </>
                ) : (
                  <>
                    Continue with Email
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Security note */}
            <div className="security-note">
              <ShieldCheck size={13} color="#94a3b8" />
              Seller login powered by Firebase Authentication
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
