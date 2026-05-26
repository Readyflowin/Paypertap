import type { CSSProperties } from "react";
import { BadgeCheck, CheckCircle2, Store } from "lucide-react";
import clsx from "clsx";

import logo from "../../assets/Logo.png";
import { PptBrandIcon } from "../ui/PptBrandIcon";

export type PayPerTapLoaderVariant = "fullPage" | "card";

export type PayPerTapLoaderProps = {
  variant?: PayPerTapLoaderVariant;
  label?: string;
  description?: string;
  className?: string;
};

const steps = [
  { label: "Store", className: "ppt-loader-node-store", icon: <Store size={15} /> },
  { label: "Intent", className: "ppt-loader-node-intent", icon: <BadgeCheck size={15} /> },
  {
    label: "WhatsApp",
    className: "ppt-loader-node-whatsapp",
    icon: <PptBrandIcon type="whatsapp" size={15} />,
  },
  { label: "Confirm", className: "ppt-loader-node-confirm", icon: <CheckCircle2 size={15} /> },
] as const;

export function PayPerTapLoader({
  variant = "card",
  label = "Preparing PayPerTap...",
  description: _description,
  className,
}: PayPerTapLoaderProps) {
  return (
    <div
      className={clsx("ppt-loader", `ppt-loader-${variant}`, className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="ppt-loader-stage" aria-hidden="true">
        <div className="ppt-loader-orbit-ring" />
        {steps.map((step, index) => (
          <span
            className={clsx("ppt-loader-node", step.className)}
            style={{ "--ppt-loader-step": index } as CSSProperties}
            key={step.label}
          >
            {step.icon}
            <span>{step.label}</span>
          </span>
        ))}
        <span className="ppt-loader-logo-shell">
          <span className="ppt-loader-logo-glow" />
          <img src={logo} alt="" width="54" height="54" decoding="async" draggable="false" />
        </span>
      </div>

      <div className="ppt-loader-copy">
        <strong>{label}</strong>
      </div>
    </div>
  );
}
