import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";

import { PptButton, PptField, PptNotice } from "../components/ui";
import {
  continueSellerWithEmail,
  continueSellerWithGoogle,
} from "../services/authService";
import { prepareSellerAfterAuth } from "../services/sellerService";

function getAuthErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: unknown }).code);
  }

  return "";
}

function getFriendlyAuthError(error: unknown) {
  const code = getAuthErrorCode(error);

  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in was closed before finishing.";
  }

  if (code === "auth/popup-blocked") {
    return "Popup was blocked. Please allow popups and try again.";
  }

  if (code === "auth/unauthorized-domain") {
    return "This domain is not authorized in Firebase Authentication.";
  }

  if (code === "auth/network-request-failed") {
    return "Network issue. Please try again.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not continue with those details. Please try again.";
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeoutId));
  });
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.35 0-4.34-1.58-5.05-3.72H.93v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.41 5.41 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.93A9 9 0 0 0 0 9c0 1.45.34 2.82.93 4.03l3.02-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.43 1.35l2.59-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .93 4.97L3.95 7.3C4.66 5.16 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function AuthPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"email" | "google" | null>(null);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState("");

  const isLoading = loading !== null;

  async function continueAfterAuth(userPromise: Promise<Awaited<ReturnType<typeof continueSellerWithEmail>>>) {
    setError("");
    setStatusText("Checking your account...");

    const user = await withTimeout(
      userPromise,
      45000,
      "Sign-in took too long. Please try again."
    );

    setStatusText("Creating your store...");

    const result = await withTimeout(
      prepareSellerAfterAuth(user),
      45000,
      "Account setup took too long. Please try again."
    );
    navigate(result.nextRoute);
  }

  async function handleEmailContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading("email");
      await continueAfterAuth(continueSellerWithEmail(email.trim(), password));
    } catch (err) {
      console.error("Email auth failed:", err);
      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(null);
      setStatusText("");
    }
  }

  async function handleGoogleContinue() {
    try {
      setLoading("google");
      await continueAfterAuth(continueSellerWithGoogle());
    } catch (err) {
      console.error("Google auth failed:", err);
      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(null);
      setStatusText("");
    }
  }

  return (
    <main className="pds-page flex min-h-screen items-center justify-center px-4 py-10">
      <section className="pds-panel w-full max-w-md">
        <div className="text-center">
          <div className="pds-kicker mx-auto">
            <ShieldCheck size={16} />
            PayPerTap Seller
          </div>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.05em] text-[var(--pds-text)]">
            Start selling in minutes
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--pds-muted)]">
            Continue with your existing account or create one automatically.
          </p>
        </div>

        <div className="mt-8">
          <PptButton
            type="button"
            variant="secondary"
            fullWidth
            icon={<GoogleIcon />}
            className="ppt-google-button"
            loading={loading === "google"}
            disabled={isLoading}
            onClick={handleGoogleContinue}
          >
            {loading === "google" ? statusText || "Checking your account..." : "Continue with Google"}
          </PptButton>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--pds-border)]" />
          <span className="text-xs font-medium text-[var(--pds-muted-light)]">OR</span>
          <div className="h-px flex-1 bg-[var(--pds-border)]" />
        </div>

        <form onSubmit={handleEmailContinue} className="space-y-4">
          <PptField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            icon={<Mail size={17} />}
            required
          />

          <PptField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />

          {error ? (
            <PptNotice tone="danger" title="Could not continue">
              {error}
            </PptNotice>
          ) : null}

          <PptButton type="submit" fullWidth loading={loading === "email"} disabled={isLoading}>
            {loading === "email" ? statusText || "Checking your account..." : "Continue with Email"}
          </PptButton>
        </form>
      </section>
    </main>
  );
}
