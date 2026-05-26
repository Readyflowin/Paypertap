import { Link } from "react-router-dom";

import { getRouteMetadata, type BreadcrumbItem } from "./metadata";
import { breadcrumbListSchema } from "./schema";

export { breadcrumbListSchema };

export function getBreadcrumbsForPath(path: string): BreadcrumbItem[] {
  return getRouteMetadata(path)?.breadcrumbs ?? [
    { label: "Home", path: "/" },
    { label: "PayPerTap", path },
  ];
}

export function MarketingBreadcrumbs({ path }: { path: string }) {
  const breadcrumbs = getBreadcrumbsForPath(path);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-xs font-bold uppercase tracking-[0.12em] text-neutral-500">
      <ol className="flex flex-wrap items-center gap-2">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li className="flex min-w-0 items-center gap-2" key={`${item.path}-${item.label}`}>
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {isLast ? (
                <span className="max-w-[18rem] truncate text-neutral-700">{item.label}</span>
              ) : (
                <Link className="max-w-[12rem] truncate text-neutral-500 hover:text-neutral-950" to={item.path}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
