import { marketingFaqs } from "../pages/faq/faqContent";
import { comparisonContent } from "../seo-pages/comparisonContent";
import { clusterDeepContent, compareHubFaqs, comparisonDeepContent } from "../seo-pages/deepContent";
import { featureContent } from "../seo-pages/featureContent";
import { useCaseContent } from "../seo-pages/useCaseContent";
import { getRouteMetadata, SITE_AUTHOR_NAME } from "./metadata";
import {
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  organizationSchema,
  personSchema,
  webApplicationSchema,
  websiteSchema,
  type JsonLdObject,
} from "./schema";

const pricingFaqQuestions = [
  "How does the order work?",
  "Does PayPerTap process buyer payments?",
  "Who collects the remaining product amount?",
  "Can sellers use UPI, Google Pay, PhonePe, or COD?",
  "Does PayPerTap provide seller payouts?",
  "Do sellers need payout KYC in current model?",
  "Is PayPerTap a payment gateway?",
  "Can sellers change the order amount in current model?",
];

const howItWorksFaqQuestions = [
  "How does the order work?",
  "Does PayPerTap process buyer payments?",
  "What happens after a buyer books?",
  "How does WhatsApp handoff work?",
  "Does the product become reserved after Order?",
  "What is the difference between reserved and sold?",
  "Can sellers use WhatsApp Business?",
  "Can sellers use UPI, Google Pay, PhonePe, or COD?",
  "Can sellers share direct product links?",
  "Who handles returns and exchanges?",
  "Can buyers cancel an order?",
  "Is PayPerTap a payment gateway?",
];

function breadcrumbSchemaForPath(path: string): JsonLdObject | null {
  const metadata = getRouteMetadata(path);
  if (!metadata) return null;

  return breadcrumbListSchema(
    metadata.breadcrumbs.map((item) => ({ name: item.label, path: item.path })),
  );
}

function articleForPath(path: string): JsonLdObject | null {
  const metadata = getRouteMetadata(path);
  if (!metadata || metadata.ogType !== "article" || !metadata.trust?.lastUpdated) {
    return null;
  }

  return articleSchema({
    authorName: metadata.trust.authorName ?? SITE_AUTHOR_NAME,
    dateModified: metadata.trust.lastUpdated,
    description: metadata.description,
    headline: metadata.title,
    path: metadata.path,
  });
}

export function getRouteJsonLd(path: string): JsonLdObject[] {
  const metadata = getRouteMetadata(path);
  const breadcrumb = breadcrumbSchemaForPath(path);
  if (!metadata || !breadcrumb) return [];

  if (metadata.path === "/") {
    return [
      organizationSchema(),
      websiteSchema(),
      webApplicationSchema(),
      breadcrumb,
      faqPageSchema(marketingFaqs.slice(0, 6)),
    ];
  }

  if (metadata.path === "/founder") {
    return [personSchema(), breadcrumb];
  }

  if (metadata.path === "/faq") {
    return [faqPageSchema(marketingFaqs), breadcrumb];
  }

  if (metadata.path === "/pricing") {
    const faqs = marketingFaqs.filter((item) => pricingFaqQuestions.includes(item.question));
    return [faqPageSchema(faqs), breadcrumb];
  }

  if (metadata.path === "/how-it-works") {
    const faqs = marketingFaqs.filter((item) => howItWorksFaqQuestions.includes(item.question));
    return [faqPageSchema(faqs), breadcrumb];
  }

  const featurePage = Object.values(featureContent).find((page) => page.path === metadata.path);
  if (featurePage) {
    const extraFaqs = clusterDeepContent[metadata.path]?.extraFaqs ?? [];
    return [faqPageSchema([...featurePage.faqs, ...extraFaqs]), breadcrumb];
  }

  const useCasePage = Object.values(useCaseContent).find((page) => page.path === metadata.path);
  if (useCasePage) {
    const extraFaqs = clusterDeepContent[metadata.path]?.extraFaqs ?? [];
    return [articleForPath(metadata.path), faqPageSchema([...useCasePage.faqs, ...extraFaqs]), breadcrumb].filter(Boolean) as JsonLdObject[];
  }

  const comparisonPage = Object.values(comparisonContent).find((page) => page.path === metadata.path);
  if (comparisonPage) {
    const extraFaqs = comparisonDeepContent[metadata.path]?.extraFaqs ?? [];
    return [articleForPath(metadata.path), faqPageSchema([...comparisonPage.faqs, ...extraFaqs]), breadcrumb].filter(Boolean) as JsonLdObject[];
  }

  if (metadata.path === "/compare") {
    return [articleForPath(metadata.path), faqPageSchema(compareHubFaqs), breadcrumb].filter(Boolean) as JsonLdObject[];
  }

  return [breadcrumb];
}
