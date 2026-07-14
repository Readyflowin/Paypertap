import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { getRouteMetadata, type RouteMetadata } from "./metadata";
import { fullSeoTitle } from "./renderHead";
import { getRouteJsonLd } from "./routeSchemas";
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
  description = "PayPerTap storefront and verified order flow.",
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
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", description);
    removeJsonLdScripts();

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

function removeJsonLdScripts() {
  document.head
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((script) => script.remove());
}

function upsertJsonLdScripts(jsonLd: JsonLdObject[]) {
  removeJsonLdScripts();

  jsonLd.forEach((schema, index) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.paypertapJsonLd = "true";
    script.dataset.paypertapJsonLdIndex = String(index);
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

function resolveSeoProps({
  canonicalPath,
  description,
  image,
  jsonLd = [],
  noindex = false,
  title,
}: SeoProps): RouteMetadata & {
  image?: string;
  jsonLd: JsonLdObject[];
  noindex: boolean;
} {
  const metadata = getRouteMetadata(canonicalPath);

  if (metadata) {
    return {
      ...metadata,
      image: metadata.ogImage,
      jsonLd: getRouteJsonLd(metadata.path),
      noindex: metadata.robots === "noindex,nofollow",
    };
  }

  return {
    breadcrumbLabel: title,
    breadcrumbs: [],
    canonicalPath,
    description,
    image,
    jsonLd,
    noindex,
    ogDescription: description,
    ogImage: image ?? DEFAULT_OG_IMAGE,
    ogTitle: title,
    ogType: "website",
    path: canonicalPath,
    robots: noindex ? "noindex,nofollow" : "index,follow",
    title,
    twitterCard: "summary_large_image",
  };
}

export function Seo(props: SeoProps) {
  const seo = resolveSeoProps(props);
  const canonical = absoluteUrl(seo.canonicalPath);
  const imageUrl = absoluteUrl(seo.ogImage ?? seo.image ?? DEFAULT_OG_IMAGE);
  const fullTitle = fullSeoTitle(seo.title);

  useEffect(() => {
    document.title = fullTitle;
    upsertMeta("name", "description", seo.description);
    upsertMeta("name", "robots", seo.robots);
    upsertMeta("property", "og:title", seo.ogTitle);
    upsertMeta("property", "og:description", seo.ogDescription);
    upsertMeta("property", "og:type", seo.ogType);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("name", "twitter:card", seo.twitterCard);
    upsertMeta("name", "twitter:title", seo.ogTitle);
    upsertMeta("name", "twitter:description", seo.ogDescription);
    upsertMeta("name", "twitter:image", imageUrl);
    upsertJsonLdScripts(seo.jsonLd);

    setMetaAttribute('link[rel="canonical"]', "href", canonical, () => {
      const link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      return link;
    });
  }, [canonical, fullTitle, imageUrl, seo]);

  return null;
}
