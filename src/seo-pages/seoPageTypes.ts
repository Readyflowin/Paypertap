export type FaqItem = {
  answer: string;
  question: string;
};

export type RelatedLink = {
  label: string;
  path: string;
};

export type SeoPageContent = {
  benefits: string[];
  bestFor?: string[];
  description: string;
  example: string;
  faqs: FaqItem[];
  h1: string;
  howItWorks: string[];
  notBestFor?: string[];
  path: string;
  related: RelatedLink[];
  summary: string;
  title: string;
  whatItIs: string;
};

export type ComparisonRow = {
  label: string;
  other: string;
  paypertap: string;
};

export type ComparisonPageContent = {
  bestFor: string[];
  description: string;
  faqs: FaqItem[];
  h1: string;
  honestNote: string;
  path: string;
  related: RelatedLink[];
  rows: ComparisonRow[];
  summary: string;
  title: string;
  whatItIs: string;
};

export type FeatureSlug =
  | "verified-booking"
  | "link-in-bio-storefront"
  | "whatsapp-handoff"
  | "order-organization"
  | "product-links"
  | "customer-leads";

export type UseCaseSlug =
  | "instagram-sellers"
  | "whatsapp-sellers"
  | "thrift-sellers"
  | "boutiques"
  | "handmade-sellers"
  | "student-sellers";

export type ComparisonSlug =
  | "paypertap-vs-linktree"
  | "paypertap-vs-whatsapp-catalog"
  | "paypertap-vs-google-forms"
  | "paypertap-vs-shopify-starter";
