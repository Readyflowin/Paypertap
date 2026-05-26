import { type RouteMetadata } from "./metadata";
import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  type JsonLdObject,
  SITE_NAME,
} from "./schema";

export type StaticHeadInput = Partial<RouteMetadata> & {
  canonicalPath: string;
  description: string;
  image?: string;
  jsonLd?: JsonLdObject[];
  noindex?: boolean;
  title: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeJsonLd(schema: JsonLdObject) {
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

export function fullSeoTitle(title: string) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

export function renderHeadTags({
  canonicalPath,
  description,
  image = DEFAULT_OG_IMAGE,
  jsonLd = [],
  noindex = false,
  ogDescription,
  ogImage,
  ogTitle,
  ogType = "website",
  robots,
  title,
  twitterCard = "summary_large_image",
}: StaticHeadInput) {
  const canonical = absoluteUrl(canonicalPath);
  const imageUrl = absoluteUrl(ogImage ?? image);
  const fullTitle = fullSeoTitle(title);
  const robotsContent = robots ?? (noindex ? "noindex,nofollow" : "index,follow");
  const socialTitle = ogTitle ?? fullTitle;
  const socialDescription = ogDescription ?? description;

  return [
    `<title>${escapeHtml(fullTitle)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${robotsContent}" />`,
    `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:title" content="${escapeHtml(socialTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(socialDescription)}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta name="twitter:card" content="${twitterCard}" />`,
    `<meta name="twitter:title" content="${escapeHtml(socialTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(socialDescription)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    '<link rel="icon" href="/favicon.ico" sizes="any" />',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />',
    '<link rel="manifest" href="/site.webmanifest" />',
    ...jsonLd.map(
      (schema) =>
        `<script type="application/ld+json">${safeJsonLd(schema)}</script>`,
    ),
  ].join("\n    ");
}
