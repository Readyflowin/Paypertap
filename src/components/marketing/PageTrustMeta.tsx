import { getRouteMetadata, SITE_REVIEWER_NAME } from "../../seo/metadata";

export function PageTrustMeta({ path }: { path: string }) {
  const metadata = getRouteMetadata(path);
  const trust = metadata?.trust;

  if (!trust) return null;

  const reviewer = trust.reviewerName ?? SITE_REVIEWER_NAME;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap gap-x-4 gap-y-2 border-y border-black/5 py-3 text-xs font-semibold text-neutral-500">
        {trust.authorName ? (
          <span>
            By <span className="text-neutral-800">{trust.authorName}</span>
          </span>
        ) : null}
        <span>
          Reviewed by <span className="text-neutral-800">{reviewer}</span>
        </span>
        {trust.lastUpdated ? (
          <span>
            Last updated: <span className="text-neutral-800">{trust.lastUpdated}</span>
          </span>
        ) : null}
      </div>
    </div>
  );
}
