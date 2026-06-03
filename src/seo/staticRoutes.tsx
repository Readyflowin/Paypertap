import { lazy, type ReactElement } from "react";
import {
  type ComparisonSlug,
  type FeatureSlug,
  type UseCaseSlug,
} from "../seo-pages/seoPageTypes";
import { routeMetadata, type RouteMetadata } from "./metadata";
import { getRouteJsonLd } from "./routeSchemas";
import { type JsonLdObject } from "./schema";

const HomePage = lazy(() => import("../homepage/HomePage"));
const AboutPage = lazy(() =>
  import("../pages/about/AboutPage").then((module) => ({
    default: module.AboutPage,
  }))
);
const ContactPage = lazy(() =>
  import("../pages/contact/ContactPage").then((module) => ({
    default: module.ContactPage,
  }))
);
const FAQPage = lazy(() =>
  import("../pages/faq/FAQPage").then((module) => ({
    default: module.FAQPage,
  }))
);
const FounderPage = lazy(() =>
  import("../pages/founder/FounderPage").then((module) => ({
    default: module.FounderPage,
  }))
);
const HowItWorksPage = lazy(() =>
  import("../pages/how-it-works/HowItWorksPage").then((module) => ({
    default: module.HowItWorksPage,
  }))
);
const PricingPage = lazy(() =>
  import("../pages/pricing/PricingPage").then((module) => ({
    default: module.PricingPage,
  }))
);
const PrivacyPage = lazy(() =>
  import("../pages/privacy/PrivacyPage").then((module) => ({
    default: module.PrivacyPage,
  }))
);
const RefundCancellationPage = lazy(() =>
  import("../pages/refund-cancellation/RefundCancellationPage").then((module) => ({
    default: module.RefundCancellationPage,
  }))
);
const TermsPage = lazy(() =>
  import("../pages/terms/TermsPage").then((module) => ({
    default: module.TermsPage,
  }))
);
const CompareHubPage = lazy(() =>
  import("../seo-pages/CompareHubPage").then((module) => ({
    default: module.CompareHubPage,
  }))
);
const ComparisonPage = lazy(() =>
  import("../seo-pages/ComparisonPage").then((module) => ({
    default: module.ComparisonPage,
  }))
);
const FeaturePage = lazy(() =>
  import("../seo-pages/FeaturePage").then((module) => ({
    default: module.FeaturePage,
  }))
);
const UseCasePage = lazy(() =>
  import("../seo-pages/UseCasePage").then((module) => ({
    default: module.UseCasePage,
  }))
);

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
