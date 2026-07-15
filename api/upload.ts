import uploadImageHandler, { config as uploadImageConfig } from "./_lib/uploadImage.js";

export const config = uploadImageConfig;

type ApiRequest = {
  method?: string;
  url?: string;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

function sendJson(res: ApiResponse, statusCode: number, body: unknown) {
  res.setHeader("Cache-Control", "no-store");
  res.status(statusCode).json(body);
}

export default async function uploadRouter(req: ApiRequest, res: ApiResponse) {
  const method = (req.method || "GET").toUpperCase();
  const url = new URL(req.url || "/", "https://paypertap.local");
  const action = url.searchParams.get("action")?.trim() || "";
  const startedAt = Date.now();

  console.info("[api/upload] Incoming request", { method, action });

  try {
    if (action === "image" && method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendJson(res, 405, {
        success: false,
        code: "METHOD_NOT_ALLOWED",
        message: "Method not allowed.",
      });
    }

    if (method === "POST" && action === "image") {
      return await uploadImageHandler(req, res);
    }

    return sendJson(res, 404, {
      success: false,
      code: "UNKNOWN_UPLOAD_ACTION",
      message: "Unknown upload action.",
      details: { method, action },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload request failed.";
    console.error("[api/upload] Request failed", { method, action, message });
    return sendJson(res, 500, {
      success: false,
      code: "UPLOAD_ROUTE_FAILED",
      message,
    });
  } finally {
    console.info("[api/upload] Completed request", {
      method,
      action,
      durationMs: Date.now() - startedAt,
    });
  }
}
