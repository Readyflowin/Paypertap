import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import HeroSection from "./homepage/hero section";
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

const enableIntegrationTests =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_INTEGRATION_TESTS === "true";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/onboarding/store" element={<StoreOnboardingPage />} />
        <Route path="/onboarding/product" element={<ProductOnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        {enableIntegrationTests ? (
          <Route path="/integration-test" element={<IntegrationTestPage />} />
        ) : null}
        <Route path="/:storeSlug/product/:productId" element={<ProductDetailPage />} />
        <Route path="/:storeSlug/checkout/:productId" element={<CheckoutPage />} />
        <Route
          path="/:storeSlug/booking-success/:checkoutId"
          element={<BookingSuccessPage />}
        />

        {/* Linktree-style public store URL */}
        <Route path="/:storeSlug" element={<PublicStorePage />} />
      </Routes>
    </BrowserRouter>
  );
}
