import { type ReactNode } from "react";
import clsx from "clsx";

export type PptNoticeProps = {
  tone: "success" | "danger" | "warning" | "info";
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function PptNotice({ tone, title, children, icon, className }: PptNoticeProps) {
  return (
    <div className={clsx("pds-notice", `pds-notice-${tone}`, className)}>
      {icon ? <div className="pds-notice-icon">{icon}</div> : null}
      <section>
        <strong>{title}</strong>
        <p>{children}</p>
      </section>
    </div>
  );
}
