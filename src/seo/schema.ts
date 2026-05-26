import { SITE_NAME, SITE_URL } from "./metadata";

export { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "./metadata";

export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export type JsonLdObject = { [key: string]: JsonLdValue };

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/images/logo/paypertap-logo.png`,
    founder: {
      "@type": "Person",
      name: "Aditya",
    },
    description:
      "PayPerTap helps Indian Instagram and WhatsApp sellers create storefronts with a fixed ₹20 verified booking flow.",
  };
}

export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
  };
}

export function webApplicationSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    applicationCategory: "ECommerceApplication",
    operatingSystem: "Web",
    description:
      "PayPerTap is a verified booking storefront for Indian Instagram and WhatsApp sellers.",
  };
}

export function personSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Aditya",
    jobTitle: "Founder",
    description:
      "Aditya is the founder of PayPerTap, a verified booking storefront for Indian Instagram and WhatsApp sellers.",
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/founder`,
  };
}

export function breadcrumbListSchema(
  items: Array<{ name: string; path: string }>,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageSchema(items: Array<{ answer: string; question: string }>): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function articleSchema(input: {
  authorName: string;
  dateModified: string;
  description: string;
  headline: string;
  path: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    url: absoluteUrl(input.path),
    author: {
      "@type": "Organization",
      name: input.authorName,
    },
    dateModified: input.dateModified,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
  };
}

export const articleSchemaPlaceholder = articleSchema;

export function productSchemaPlaceholder(input: {
  description: string;
  name: string;
  path: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
  };
}
