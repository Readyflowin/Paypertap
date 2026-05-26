import { type ReactElement } from "react";

import HomePage from "../homepage/HomePage";
import { AboutPage } from "../pages/about/AboutPage";
import { ContactPage } from "../pages/contact/ContactPage";
import { FAQPage } from "../pages/faq/FAQPage";
import { FounderPage } from "../pages/founder/FounderPage";
import { HowItWorksPage } from "../pages/how-it-works/HowItWorksPage";
import { PricingPage } from "../pages/pricing/PricingPage";
import { PrivacyPage } from "../pages/privacy/PrivacyPage";
import { RefundCancellationPage } from "../pages/refund-cancellation/RefundCancellationPage";
import { TermsPage } from "../pages/terms/TermsPage";
import { CompareHubPage } from "../seo-pages/CompareHubPage";
import { ComparisonPage } from "../seo-pages/ComparisonPage";
import { FeaturePage } from "../seo-pages/FeaturePage";
import {
  type ComparisonSlug,
  type FeatureSlug,
  type UseCaseSlug,
} from "../seo-pages/seoPageTypes";
import { UseCasePage } from "../seo-pages/UseCasePage";
import { routeMetadata, type RouteMetadata } from "./metadata";
import { getRouteJsonLd } from "./routeSchemas";
import { type JsonLdObject } from "./schema";

export type StaticRoute = RouteMetadata & {
  element: ReactElement;
  jsonLd: JsonLdObject[];
  outputPath: string;
};

function outputPathFor(routePath: string) {
  return routePath === "/" ? "index.html" : `${routePath.replace(/^\//, "")}/index.html`;
}

function elementForPath(path: string) {
  if (path === "/") return <HomePage />;
  if (path === "/pricing") return <PricingPage />;
  if (path === "/how-it-works") return <HowItWorksPage />;
  if (path === "/about") return <AboutPage />;
  if (path === "/founder") return <FounderPage />;
  if (path === "/contact") return <ContactPage />;
  if (path === "/faq") return <FAQPage />;
  if (path === "/privacy") return <PrivacyPage />;
  if (path === "/terms") return <TermsPage />;
  if (path === "/refund-cancellation") return <RefundCancellationPage />;
  if (path === "/compare") return <CompareHubPage />;

  if (path.startsWith("/features/")) {
    return <FeaturePage slug={path.replace("/features/", "") as FeatureSlug} />;
  }

  if (path.startsWith("/for/")) {
    return <UseCasePage slug={path.replace("/for/", "") as UseCaseSlug} />;
  }

  if (path.startsWith("/compare/")) {
    return <ComparisonPage slug={path.replace("/compare/", "") as ComparisonSlug} />;
  }

  throw new Error(`No static route element configured for ${path}`);
}

export const staticRoutes: StaticRoute[] = routeMetadata.map((metadata) => ({
  ...metadata,
  element: elementForPath(metadata.path),
  jsonLd: getRouteJsonLd(metadata.path),
  outputPath: outputPathFor(metadata.path),
}));

export const staticRoutePaths = staticRoutes.map((route) => route.path);
