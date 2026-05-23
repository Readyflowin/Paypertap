import { useState } from "react";
import { ImageUp, Mail, Send, UploadCloud } from "lucide-react";

import {
  sendTestEmail,
  uploadTestImage,
  type UploadImageResponse,
} from "@/services/integrationTestService";
import { Button, Card, Input } from "@/components/ui";

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
      ? "border-[#b9eadf] bg-[#ecfdf8] text-[#08745f]"
      : "border-[#fecaca] bg-[#fff1f2] text-[var(--ppt-danger)]";

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
    <main className="min-h-screen px-4 py-8 text-[var(--ppt-text)] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <header className="border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--ppt-text-muted)]">
            Backend checks
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal text-[var(--ppt-text)] sm:text-4xl">
            PayPerTap Integration Test
          </h1>
        </header>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--ppt-radius-sm)] bg-[var(--ppt-text)] text-white">
              <Mail size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[var(--ppt-text)]">Resend Email Test</h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              fullWidth
            />
            <Button
              onClick={handleSendEmail}
              isLoading={isSendingEmail}
              leftIcon={<Send size={18} aria-hidden="true" />}
            >
              Send test email
            </Button>
          </div>

          <div className="mt-4">
            <StatusMessage status={emailStatus} />
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--ppt-radius-sm)] bg-[var(--ppt-success)] text-white">
              <ImageUp size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[var(--ppt-text)]">
                Cloudflare R2 Upload Test
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              fullWidth
              className="file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-[var(--ppt-text)]"
            />
            <Button
              variant="success"
              onClick={handleUploadImage}
              isLoading={isUploading}
              leftIcon={<UploadCloud size={18} aria-hidden="true" />}
            >
              Upload image
            </Button>
          </div>

          <div className="mt-4">
            <StatusMessage status={uploadStatus} />
          </div>

          {uploadResult?.key ? (
            <div className="mt-4 rounded-[var(--ppt-radius-md)] border border-[var(--ppt-border)] bg-[var(--ppt-surface-soft)] p-4">
              <p className="text-sm font-semibold text-[var(--ppt-text-muted)]">Object key</p>
              <p className="mt-1 break-all text-sm text-[var(--ppt-text)]">{uploadResult.key}</p>

              {uploadResult.url ? (
                <>
                  <p className="mt-4 text-sm font-semibold text-[var(--ppt-text-muted)]">
                    Public URL
                  </p>
                  <a
                    className="mt-1 block break-all text-sm font-medium underline-offset-2 hover:underline"
                    href={uploadResult.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {uploadResult.url}
                  </a>
                  <img
                    className="mt-4 max-h-80 w-full rounded-[var(--ppt-radius-md)] border border-[var(--ppt-border)] object-contain"
                    src={uploadResult.url}
                    alt="Uploaded preview"
                  />
                </>
              ) : null}
            </div>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
