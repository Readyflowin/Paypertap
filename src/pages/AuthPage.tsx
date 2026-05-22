import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  continueSellerWithEmail,
  continueSellerWithGoogle,
} from "../services/authService";
import { prepareSellerAfterAuth } from "../services/sellerService";

function getFriendlyAuthError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not continue with those details. Please try again.";
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

    const user = await userPromise;

    setStatusText("Creating your store...");

    const result = await prepareSellerAfterAuth(user);
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
      setError("Google sign-in was cancelled or failed. Please try again.");
    } finally {
      setLoading(null);
      setStatusText("");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f7f9] px-4 py-10 text-gray-950">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-500">PayPerTap Seller</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Start selling in minutes
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Continue with your existing account or create one automatically.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleContinue}
          disabled={isLoading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-xs font-semibold">
            G
          </span>
          {loading === "google" ? statusText || "Checking your account..." : "Continue with Google"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleEmailContinue} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-800">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-800">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 6 characters"
              required
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-950"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-2xl bg-gray-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading === "email" ? statusText || "Checking your account..." : "Continue with Email"}
          </button>
        </form>
      </section>
    </main>
  );
}
