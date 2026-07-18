import { Suspense, lazy, type ReactNode, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import { NoIndex, RouteMeta } from "./seo/Seo";
import { staticRoutes } from "./seo/staticRoutes";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DesignSystemPage = lazy(() => import("./pages/DesignSystemPage"));
const IntegrationTestPage = lazy(() => import("./pages/IntegrationTestPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const ProductOnboardingPage = lazy(() => import("./pages/ProductOnboardingPage"));
const PublicStoreCollectionsPage = lazy(() => import("./pages/PublicStoreCollectionsPage"));
const PublicStorePage = lazy(() => import("./pages/PublicStorePage"));
const PaymentReturnPage = lazy(() => import("./pages/PaymentReturnPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const StoreOnboardingPage = lazy(() => import("./pages/StoreOnboardingPage"));
const StorePolicyPage = lazy(() => import("./pages/StorePolicyPage"));

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
      <RouteMeta robots="noindex,nofollow" />
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

function RouteFallback() {
  return (
    <div className="min-h-screen bg-white px-6 py-10 text-sm font-medium text-gray-500">
      Loading PayPerTap...
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {staticRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
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
            path="/payment-return/:token"
            element={
              <NoIndexAppRoute>
                <PaymentReturnPage />
              </NoIndexAppRoute>
            }
          />
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
            path="/:storeSlug/collections"
            element={
              <PublicAppRoute>
                <PublicStoreCollectionsPage />
              </PublicAppRoute>
            }
          />
          <Route
            path="/:storeSlug/collections/:collectionSlug"
            element={
              <PublicAppRoute>
                <PublicStoreCollectionsPage />
              </PublicAppRoute>
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
            path="/:storeSlug/order-success/:checkoutId"
            element={
              <NoIndexAppRoute>
                <OrderSuccessPage />
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
      </Suspense>
    </BrowserRouter>
  );
}
