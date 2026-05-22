import { useState } from "react";
import { ImageUp, Loader2, Mail, Send, UploadCloud } from "lucide-react";

import {
  sendTestEmail,
  uploadTestImage,
  type UploadImageResponse,
} from "@/services/integrationTestService";

type StatusState = {
  type: "success" | "error" | "idle";
  message: string;
};

const initialStatus: StatusState = { type: "idle", message: "" };

function StatusMessage({ status }: { status: StatusState }) {
  if (status.type === "idle" || !status.message) {
    return null;
  }

  const colorClass =
    status.type === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-rose-200 bg-rose-50 text-rose-800";

  return <p className={`rounded-md border px-3 py-2 text-sm ${colorClass}`}>{status.message}</p>;
}

export default function IntegrationTestPage() {
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<StatusState>(initialStatus);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<StatusState>(initialStatus);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadImageResponse | null>(null);

  async function handleSendEmail() {
    setIsSendingEmail(true);
    setEmailStatus(initialStatus);

    try {
      const result = await sendTestEmail(email.trim());
      setEmailStatus({
        type: "success",
        message: result.id
          ? `Test email sent successfully. Resend id: ${result.id}`
          : "Test email sent successfully.",
      });
    } catch (error) {
      setEmailStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not send test email.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  }

  async function handleUploadImage() {
    if (!file) {
      setUploadStatus({ type: "error", message: "Choose an image before uploading." });
      return;
    }

    setIsUploading(true);
    setUploadStatus(initialStatus);
    setUploadResult(null);

    try {
      const result = await uploadTestImage(file);
      setUploadResult(result);
      setUploadStatus({
        type: "success",
        message: result.warning || "Image uploaded successfully.",
      });
    } catch (error) {
      setUploadStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Could not upload image.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Backend checks
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            PayPerTap Integration Test
          </h1>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
              <Mail size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Resend Email Test</h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-200"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
            />
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleSendEmail}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? (
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              ) : (
                <Send size={18} aria-hidden="true" />
              )}
              Send test email
            </button>
          </div>

          <div className="mt-4">
            <StatusMessage status={emailStatus} />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white">
              <ImageUp size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Cloudflare R2 Upload Test</h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-h-11 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-base file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-semibold file:text-slate-800"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <button
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-teal-700 px-4 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={handleUploadImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
              ) : (
                <UploadCloud size={18} aria-hidden="true" />
              )}
              Upload image
            </button>
          </div>

          <div className="mt-4">
            <StatusMessage status={uploadStatus} />
          </div>

          {uploadResult?.key ? (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Object key</p>
              <p className="mt-1 break-all text-sm text-slate-950">{uploadResult.key}</p>

              {uploadResult.url ? (
                <>
                  <p className="mt-4 text-sm font-semibold text-slate-700">Public URL</p>
                  <a
                    className="mt-1 block break-all text-sm font-medium text-teal-700 underline-offset-2 hover:underline"
                    href={uploadResult.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {uploadResult.url}
                  </a>
                  <img
                    className="mt-4 max-h-80 w-full rounded-md border border-slate-200 object-contain"
                    src={uploadResult.url}
                    alt="Uploaded preview"
                  />
                </>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
