export type TestEmailResponse = {
  success: boolean;
  id?: string | null;
  error?: string;
};

export type UploadImageResponse = {
  success: boolean;
  key?: string;
  url?: string | null;
  warning?: string;
  error?: string;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export async function sendTestEmail(to: string) {
  const response = await fetch("/api/test-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to }),
  });

  return parseJsonResponse<TestEmailResponse>(response);
}

export async function uploadTestImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload-image", {
    method: "POST",
    body: formData,
  });

  return parseJsonResponse<UploadImageResponse>(response);
}
