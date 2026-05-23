import { type HTMLAttributes } from "react";
import clsx from "clsx";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx("ppt-skeleton rounded-[var(--ppt-radius-md)]", className)}
      {...props}
    />
  );
}

export function SkeletonLine({ className, ...props }: SkeletonProps) {
  return <Skeleton className={clsx("h-4 w-full", className)} {...props} />;
}

export function SkeletonImage({ className, ...props }: SkeletonProps) {
  return <Skeleton className={clsx("aspect-square w-full rounded-[var(--ppt-radius-xl)]", className)} {...props} />;
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--ppt-radius-xl)] border border-[var(--ppt-border)] bg-[var(--ppt-surface)] p-5 shadow-[var(--ppt-shadow-soft)]",
        className
      )}
      {...props}
    >
      <Skeleton className="h-32 w-full rounded-[var(--ppt-radius-lg)]" />
      <div className="mt-4 space-y-3">
        <SkeletonLine className="w-3/4" />
        <SkeletonLine className="w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonProductCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--ppt-radius-xl)] border border-[var(--ppt-border)] bg-white p-3 shadow-[var(--ppt-shadow-product)]",
        className
      )}
      {...props}
    >
      <Skeleton className="aspect-[4/5] w-full rounded-[var(--ppt-radius-lg)]" />
      <div className="mt-4 space-y-3">
        <SkeletonLine className="h-3 w-20" />
        <SkeletonLine className="h-5 w-4/5" />
        <div className="flex items-center justify-between gap-3">
          <SkeletonLine className="h-6 w-20" />
          <SkeletonLine className="h-6 w-16 rounded-full" />
        </div>
        <SkeletonLine className="h-10 w-full rounded-[var(--ppt-radius-md)]" />
      </div>
    </div>
  );
}

export function SkeletonDashboardStats({ className, ...props }: SkeletonProps) {
  return (
    <div className={clsx("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)} {...props}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[var(--ppt-radius-xl)] border border-[var(--ppt-border)] bg-white p-5 shadow-[var(--ppt-shadow-soft)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-8 w-20" />
            </div>
            <Skeleton className="h-11 w-11 rounded-[var(--ppt-radius-md)]" />
          </div>
          <SkeletonLine className="mt-6 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
