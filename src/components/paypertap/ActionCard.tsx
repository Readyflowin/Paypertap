import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

export type ActionCardProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
};

const actionCardClassName =
  "ppt-focus-ring group flex w-full items-center gap-4 rounded-[var(--ppt-radius-xl)] border border-[var(--ppt-border)] bg-[var(--ppt-surface)] p-5 text-left shadow-[var(--ppt-shadow-soft)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[rgba(109,61,245,0.38)] hover:bg-[linear-gradient(0deg,rgba(109,61,245,0.045),rgba(109,61,245,0.045)),var(--ppt-surface)] hover:shadow-[var(--ppt-shadow-float)] active:scale-[0.99]";

export function ActionCard({
  title,
  description,
  icon,
  action,
  onClick,
  href,
  className,
}: ActionCardProps) {
  const content = (
    <>
      {icon ? (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--ppt-radius-md)] bg-[var(--ppt-primary-soft)] text-[var(--ppt-primary-dark)]">
          {icon}
        </div>
      ) : null}

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold text-[var(--ppt-text)]">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-[var(--ppt-text-muted)]">{description}</p>
        ) : null}
      </div>

      {action ? (
        <div className="shrink-0">{action}</div>
      ) : (
        <ArrowRight
          size={20}
          className="shrink-0 text-[var(--ppt-text-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--ppt-primary-dark)]"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={clsx(actionCardClassName, className)}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={clsx(actionCardClassName, className)}>
      {content}
    </button>
  );
}
