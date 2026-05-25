import { type ReactNode, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import HomePage from "./homepage/HomePage";
import { AboutPage } from "./pages/about/AboutPage";
import AuthPage from "./pages/AuthPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import CheckoutPage from "./pages/CheckoutPage";
import { ContactPage } from "./pages/contact/ContactPage";
import DashboardPage from "./pages/DashboardPage";
import DesignSystemPage from "./pages/DesignSystemPage";
import { FAQPage } from "./pages/faq/FAQPage";
import { FounderPage } from "./pages/founder/FounderPage";
import { HowItWorksPage } from "./pages/how-it-works/HowItWorksPage";
import IntegrationTestPage from "./pages/IntegrationTestPage";
import { PricingPage } from "./pages/pricing/PricingPage";
import ProductOnboardingPage from "./pages/ProductOnboardingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import PublicStorePage from "./pages/PublicStorePage";
import { RefundCancellationPage } from "./pages/refund-cancellation/RefundCancellationPage";
import StoreOnboardingPage from "./pages/StoreOnboardingPage";
import StorePolicyPage from "./pages/StorePolicyPage";
import { TermsPage } from "./pages/terms/TermsPage";
import { PrivacyPage } from "./pages/privacy/PrivacyPage";
import { NoIndex, RouteMeta } from "./seo/Seo";
import { CompareHubPage } from "./seo-pages/CompareHubPage";
import { ComparisonPage } from "./seo-pages/ComparisonPage";
import { FeaturePage } from "./seo-pages/FeaturePage";
import { UseCasePage } from "./seo-pages/UseCasePage";

const enableIntegrationTests =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_INTEGRATION_TESTS === "true";

function PrivateRoute({ children }: { children: ReactNode }) {
  return (
    <>
      <NoIndex />
      {children}
    </>
  );
}

function PublicAppRoute({ children }: { children: ReactNode }) {
  return (
    <>
      <RouteMeta />
      {children}
    </>
  );
}

function NoIndexAppRoute({ children }: { children: ReactNode }) {
  return (
    <>
      <RouteMeta
        description="PayPerTap buyer flow."
        robots="noindex,nofollow"
        title="PayPerTap"
      />
      {children}
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/founder" element={<FounderPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-cancellation" element={<RefundCancellationPage />} />
        <Route path="/features/verified-booking" element={<FeaturePage slug="verified-booking" />} />
        <Route
          path="/features/link-in-bio-storefront"
          element={<FeaturePage slug="link-in-bio-storefront" />}
        />
        <Route path="/features/whatsapp-handoff" element={<FeaturePage slug="whatsapp-handoff" />} />
        <Route
          path="/features/order-organization"
          element={<FeaturePage slug="order-organization" />}
        />
        <Route path="/features/product-links" element={<FeaturePage slug="product-links" />} />
        <Route path="/features/customer-leads" element={<FeaturePage slug="customer-leads" />} />
        <Route path="/for/instagram-sellers" element={<UseCasePage slug="instagram-sellers" />} />
        <Route path="/for/whatsapp-sellers" element={<UseCasePage slug="whatsapp-sellers" />} />
        <Route path="/for/thrift-sellers" element={<UseCasePage slug="thrift-sellers" />} />
        <Route path="/for/boutiques" element={<UseCasePage slug="boutiques" />} />
        <Route path="/for/handmade-sellers" element={<UseCasePage slug="handmade-sellers" />} />
        <Route path="/for/student-sellers" element={<UseCasePage slug="student-sellers" />} />
        <Route path="/compare" element={<CompareHubPage />} />
        <Route
          path="/compare/paypertap-vs-linktree"
          element={<ComparisonPage slug="paypertap-vs-linktree" />}
        />
        <Route
          path="/compare/paypertap-vs-whatsapp-catalog"
          element={<ComparisonPage slug="paypertap-vs-whatsapp-catalog" />}
        />
        <Route
          path="/compare/paypertap-vs-google-forms"
          element={<ComparisonPage slug="paypertap-vs-google-forms" />}
        />
        <Route
          path="/compare/paypertap-vs-shopify-starter"
          element={<ComparisonPage slug="paypertap-vs-shopify-starter" />}
        />
        <Route
          path="/auth"
          element={
            <PrivateRoute>
              <AuthPage />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route
          path="/onboarding/store"
          element={
            <PrivateRoute>
              <StoreOnboardingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/onboarding/product"
          element={
            <PrivateRoute>
              <ProductOnboardingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/design-system"
          element={
            <PrivateRoute>
              <DesignSystemPage />
            </PrivateRoute>
          }
        />
        {enableIntegrationTests ? (
          <Route
            path="/integration-test"
            element={
              <PrivateRoute>
                <IntegrationTestPage />
              </PrivateRoute>
            }
          />
        ) : null}
        <Route
          path="/:storeSlug/product/:productId"
          element={
            <PublicAppRoute>
              <ProductDetailPage />
            </PublicAppRoute>
          }
        />
        <Route
          path="/:storeSlug/checkout/:productId"
          element={
            <NoIndexAppRoute>
              <CheckoutPage />
            </NoIndexAppRoute>
          }
        />
        <Route
          path="/:storeSlug/policies/:policyType"
          element={
            <PublicAppRoute>
              <StorePolicyPage />
            </PublicAppRoute>
          }
        />
        <Route
          path="/:storeSlug/booking-success/:checkoutId"
          element={
            <NoIndexAppRoute>
              <BookingSuccessPage />
            </NoIndexAppRoute>
          }
        />

        {/* Linktree-style public store URL */}
        <Route
          path="/:storeSlug"
          element={
            <PublicAppRoute>
              <PublicStorePage />
            </PublicAppRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
