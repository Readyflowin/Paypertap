import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  type JsonLdObject,
  SITE_NAME,
} from "./schema";

type SeoProps = {
  canonicalPath: string;
  description: string;
  image?: string;
  jsonLd?: JsonLdObject[];
  noindex?: boolean;
  title: string;
};

export function NoIndex() {
  return <RouteMeta robots="noindex,nofollow" />;
}

export function RouteMeta({
  description = "PayPerTap storefront and verified booking flow.",
  robots = "index,follow",
  title = SITE_NAME,
}: {
  description?: string;
  robots?: "index,follow" | "noindex,nofollow";
  title?: string;
}) {
  const location = useLocation();

  useEffect(() => {
    const canonical = absoluteUrl(location.pathname);

    document.title = title;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonical);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);

    setMetaAttribute('link[rel="canonical"]', "href", canonical, () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      return link;
    });
  }, [description, location.pathname, robots, title]);

  return null;
}

function setMetaAttribute(
  selector: string,
  attribute: "content" | "href",
  value: string,
  createElement: () => HTMLMetaElement | HTMLLinkElement,
) {
  let element = document.head.querySelector(selector) as
    | HTMLMetaElement
    | HTMLLinkElement
    | null;

  if (!element) {
    element = createElement();
    document.head.appendChild(element);
  }

  element.setAttribute(attribute, value);
}

function upsertMeta(nameOrProperty: "name" | "property", key: string, content: string) {
  setMetaAttribute(
    `meta[${nameOrProperty}="${key}"]`,
    "content",
    content,
    () => {
      const meta = document.createElement("meta");
      meta.setAttribute(nameOrProperty, key);
      return meta;
    },
  );
}

export function Seo({
  canonicalPath,
  description,
  image = DEFAULT_OG_IMAGE,
  jsonLd = [],
  noindex = false,
  title,
}: SeoProps) {
  const canonical = absoluteUrl(canonicalPath);
  const imageUrl = absoluteUrl(image);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  // TODO: Consider prerender/SSR/static generation later for stronger SEO and social crawler previews.
  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", noindex ? "noindex,nofollow" : "index,follow");
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", imageUrl);

    setMetaAttribute('link[rel="canonical"]', "href", canonical, () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      return link;
    });
  }, [canonical, description, fullTitle, imageUrl, noindex]);

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={`${canonicalPath}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
