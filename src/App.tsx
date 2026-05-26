import { type ReactNode, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import BookingSuccessPage from "./pages/BookingSuccessPage";
import CheckoutPage from "./pages/CheckoutPage";
import DashboardPage from "./pages/DashboardPage";
import DesignSystemPage from "./pages/DesignSystemPage";
import IntegrationTestPage from "./pages/IntegrationTestPage";
import ProductOnboardingPage from "./pages/ProductOnboardingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import PublicStorePage from "./pages/PublicStorePage";
import StoreOnboardingPage from "./pages/StoreOnboardingPage";
import StorePolicyPage from "./pages/StorePolicyPage";
import { NoIndex, RouteMeta } from "./seo/Seo";
import { staticRoutes } from "./seo/staticRoutes";

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

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
