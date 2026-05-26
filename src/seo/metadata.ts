import { comparisonContent } from "../seo-pages/comparisonContent";
import { featureContent } from "../seo-pages/featureContent";
import { type ComparisonSlug, type FeatureSlug, type UseCaseSlug } from "../seo-pages/seoPageTypes";
import { useCaseContent } from "../seo-pages/useCaseContent";

export const SITE_URL = "https://www.paypertap.in";
export const SITE_NAME = "PayPerTap";
export const LOGO_IMAGE = "/images/logo/paypertap-logo.png";
export const DEFAULT_OG_IMAGE = LOGO_IMAGE;
export const SITE_AUTHOR_NAME = "PayPerTap team";
export const SITE_REVIEWER_NAME = "PayPerTap team";
export const FOUNDER_NAME = "Aditya";
export const DEFAULT_LAST_UPDATED = "May 2026";

export type BreadcrumbItem = {
  label: string;
  path: string;
};

export type RouteTrustMeta = {
  authorName?: string;
  reviewerName?: string;
  lastUpdated?: string;
};

export type RouteMetadata = {
  breadcrumbLabel: string;
  breadcrumbs: BreadcrumbItem[];
  canonicalPath: string;
  description: string;
  lastUpdated?: string;
  ogDescription: string;
  ogImage?: string;
  ogTitle: string;
  ogType: "website" | "article";
  path: string;
  robots: "index,follow" | "noindex,nofollow";
  title: string;
  trust?: RouteTrustMeta;
  twitterCard: "summary" | "summary_large_image";
};

function sellerTrust(): RouteTrustMeta {
  return {
    reviewerName: SITE_REVIEWER_NAME,
    lastUpdated: DEFAULT_LAST_UPDATED,
  };
}

function editorialTrust(): RouteTrustMeta {
  return {
    authorName: SITE_AUTHOR_NAME,
    reviewerName: SITE_REVIEWER_NAME,
    lastUpdated: DEFAULT_LAST_UPDATED,
  };
}

function founderTrust(): RouteTrustMeta {
  return {
    authorName: FOUNDER_NAME,
    reviewerName: SITE_REVIEWER_NAME,
    lastUpdated: DEFAULT_LAST_UPDATED,
  };
}

function metadata(input: {
  breadcrumbLabel: string;
  breadcrumbs?: BreadcrumbItem[];
  description: string;
  ogType?: "website" | "article";
  path: string;
  title: string;
  trust?: RouteTrustMeta;
}): RouteMetadata {
  const breadcrumbs = input.breadcrumbs ?? [
    { label: "Home", path: "/" },
    { label: input.breadcrumbLabel, path: input.path },
  ];

  return {
    breadcrumbLabel: input.breadcrumbLabel,
    breadcrumbs,
    canonicalPath: input.path,
    description: input.description,
    lastUpdated: input.trust?.lastUpdated,
    ogDescription: input.description,
    ogImage: DEFAULT_OG_IMAGE,
    ogTitle: input.title,
    ogType: input.ogType ?? "website",
    path: input.path,
    robots: "index,follow",
    title: input.title,
    trust: input.trust,
    twitterCard: "summary_large_image",
  };
}

const coreRouteMetadata: RouteMetadata[] = [
  metadata({
    path: "/",
    breadcrumbLabel: "Home",
    breadcrumbs: [{ label: "Home", path: "/" }],
    title: "PayPerTap | Verified Booking Storefront for Instagram & WhatsApp Sellers",
    description:
      "PayPerTap helps Indian Instagram and WhatsApp sellers create verified booking storefronts, collect a fixed ₹20 buyer booking, and continue order confirmation on WhatsApp.",
  }),
  metadata({
    path: "/pricing",
    breadcrumbLabel: "Pricing",
    title: "PayPerTap Pricing | ₹20 Booking for Instagram & WhatsApp Sellers",
    description:
      "Simple PayPerTap pricing for Indian Instagram and WhatsApp sellers: buyers pay a fixed ₹20 booking, while sellers collect the remaining amount directly.",
    trust: sellerTrust(),
  }),
  metadata({
    path: "/how-it-works",
    breadcrumbLabel: "How It Works",
    title: "How PayPerTap Works | ₹20 Product Booking to WhatsApp Handoff",
    description:
      "See how PayPerTap helps sellers share product links, collect a fixed ₹20 buyer booking, and continue confirmation directly on WhatsApp.",
    trust: sellerTrust(),
  }),
  metadata({
    path: "/about",
    breadcrumbLabel: "About",
    title: "About PayPerTap | Built for Instagram & WhatsApp Sellers in India",
    description:
      "Learn how PayPerTap helps Indian Instagram and WhatsApp sellers create verified booking storefronts with product links and WhatsApp handoff.",
    trust: sellerTrust(),
  }),
  metadata({
    path: "/founder",
    breadcrumbLabel: "Founder",
    title: "Founder of PayPerTap | Aditya, PayPerTap Founder",
    description:
      "Meet Aditya, founder of PayPerTap, and learn why PayPerTap was started for Indian Instagram and WhatsApp sellers.",
    trust: founderTrust(),
  }),
  metadata({
    path: "/contact",
    breadcrumbLabel: "Contact",
    title: "Contact PayPerTap | Support for Instagram & WhatsApp Sellers",
    description:
      "Contact PayPerTap for seller support, product questions, partnerships, press, and founder requests related to verified booking storefronts.",
    trust: sellerTrust(),
  }),
  metadata({
    path: "/faq",
    breadcrumbLabel: "FAQ",
    title: "PayPerTap FAQ | ₹20 Booking, WhatsApp Handoff & Seller Payments",
    description:
      "Clear answers about PayPerTap, fixed ₹20 verified booking, seller payments, WhatsApp handoff, KYC, cancellations, and platform limits.",
    trust: editorialTrust(),
  }),
  metadata({
    path: "/privacy",
    breadcrumbLabel: "Privacy Policy",
    title: "Privacy Policy | PayPerTap",
    description:
      "PayPerTap privacy policy for sellers and buyers using verified booking storefronts, fixed ₹20 booking, and WhatsApp handoff.",
    trust: editorialTrust(),
  }),
  metadata({
    path: "/terms",
    breadcrumbLabel: "Terms of Service",
    title: "Terms of Service | PayPerTap",
    description:
      "Terms for using PayPerTap verified booking storefronts, including the fixed ₹20 booking model and direct seller-buyer confirmation.",
    trust: editorialTrust(),
  }),
  metadata({
    path: "/refund-cancellation",
    breadcrumbLabel: "Refund & Cancellation Policy",
    title: "Refund & Cancellation Policy | PayPerTap",
    description:
      "Refund and cancellation policy for PayPerTap verified booking flows, fixed ₹20 booking, and seller-managed remaining payments.",
    trust: editorialTrust(),
  }),
];

const featureTitleOverrides: Partial<Record<FeatureSlug, string>> = {
  "verified-booking": "Verified Booking for Instagram & WhatsApp Sellers | PayPerTap",
  "link-in-bio-storefront": "Link-in-Bio Storefront for Product Sellers | PayPerTap",
  "whatsapp-handoff": "WhatsApp Handoff for Product Bookings | PayPerTap",
};

const featureRouteMetadata = (Object.entries(featureContent) as Array<[FeatureSlug, (typeof featureContent)[FeatureSlug]]>).map(
  ([slug, page]) =>
    metadata({
      path: page.path,
      breadcrumbLabel: page.h1,
      breadcrumbs: [
        { label: "Home", path: "/" },
        { label: "Features", path: "/features/verified-booking" },
        { label: page.h1, path: page.path },
      ],
      title: featureTitleOverrides[slug] ?? `${page.title} | PayPerTap`,
      description: page.description,
      trust: editorialTrust(),
    }),
);

const useCaseTitleOverrides: Partial<Record<UseCaseSlug, string>> = {
  "instagram-sellers": "PayPerTap for Instagram Sellers in India | ₹20 Product Booking",
  "whatsapp-sellers": "PayPerTap for WhatsApp Sellers | Verified Product Booking",
};

const useCaseRouteMetadata = (Object.entries(useCaseContent) as Array<[UseCaseSlug, (typeof useCaseContent)[UseCaseSlug]]>).map(
  ([slug, page]) =>
    metadata({
      path: page.path,
      breadcrumbLabel: page.h1,
      breadcrumbs: [
        { label: "Home", path: "/" },
        { label: "For Sellers", path: "/for/instagram-sellers" },
        { label: page.h1, path: page.path },
      ],
      title: useCaseTitleOverrides[slug] ?? `${page.title} | PayPerTap`,
      description: page.description,
      ogType: "article",
      trust: editorialTrust(),
    }),
);

const comparisonTitleOverrides: Record<ComparisonSlug, string> = {
  "paypertap-vs-linktree":
    "PayPerTap vs Linktree | Product Booking Storefront vs Link-in-Bio Tool",
  "paypertap-vs-whatsapp-catalog":
    "PayPerTap vs WhatsApp Catalog | Storefront Booking vs Catalog Listing",
  "paypertap-vs-google-forms":
    "PayPerTap vs Google Forms | Product Booking vs Form Collection",
  "paypertap-vs-shopify-starter":
    "PayPerTap vs Shopify Starter | Booking-First Storefront for Social Sellers",
};

const comparisonRouteMetadata: RouteMetadata[] = [
  metadata({
    path: "/compare",
    breadcrumbLabel: "Compare",
    title: "Compare PayPerTap With Linktree, WhatsApp Catalog, Google Forms and Shopify Starter",
    description:
      "Compare PayPerTap with popular selling tools and choose the right storefront, fixed ₹20 booking, and WhatsApp handoff flow for social sellers.",
    ogType: "article",
    trust: editorialTrust(),
  }),
  ...(Object.entries(comparisonContent) as Array<[ComparisonSlug, (typeof comparisonContent)[ComparisonSlug]]>).map(
    ([slug, page]) =>
      metadata({
        path: page.path,
        breadcrumbLabel: page.h1,
        breadcrumbs: [
          { label: "Home", path: "/" },
          { label: "Compare", path: "/compare" },
          { label: page.h1, path: page.path },
        ],
        title: comparisonTitleOverrides[slug],
        description: page.description,
        ogType: "article",
        trust: editorialTrust(),
      }),
  ),
];

export const routeMetadata = [
  ...coreRouteMetadata,
  ...featureRouteMetadata,
  ...useCaseRouteMetadata,
  ...comparisonRouteMetadata,
];

export const routeMetadataByPath = Object.fromEntries(
  routeMetadata.map((route) => [route.path, route]),
) as Record<string, RouteMetadata>;

export function normalizeRoutePath(path: string) {
  const [pathname] = path.split("?");
  return pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
}

export function getRouteMetadata(path: string) {
  return routeMetadataByPath[normalizeRoutePath(path)];
}
