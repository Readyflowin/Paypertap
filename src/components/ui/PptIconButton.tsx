import { type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

import { type PptTone } from "./PptBadge";

export type PptIconButtonProps = {
  tone?: PptTone;
  label: string;
  children: ReactNode;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  className?: string;
};

export function PptIconButton({
  tone = "neutral",
  children,
  label,
  onClick,
  className,
}: PptIconButtonProps) {
  return (
    <button
      type="button"
      className={clsx("pds-icon-button", `pds-icon-${tone}`, className)}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
