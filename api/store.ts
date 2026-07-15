import storeOnboardingHandler from "./_lib/storeOnboarding.js";
import storePaymentTokenHandler from "./_lib/storePaymentToken.js";

type ApiRequest = {
  method?: string;
  url?: string;
  body?: unknown;
};

type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (statusCode: number) => { json: (body: unknown) => void };
};

function sendJson(res: ApiResponse, statusCode: number, body: unknown) {
  res.setHeader("Cache-Control", "no-store");
  res.status(statusCode).json(body);
}

function getAction(req: ApiRequest) {
  const url = new URL(req.url || "/", "https://paypertap.local");
  const queryAction = url.searchParams.get("action")?.trim();

  if (queryAction) return queryAction;

  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    const bodyAction = (req.body as { action?: unknown }).action;
    return typeof bodyAction === "string" ? bodyAction.trim() : "";
  }

  return "";
}

export default async function storeRouter(req: ApiRequest, res: ApiResponse) {
  const method = (req.method || "GET").toUpperCase();
  const action = getAction(req);
  const startedAt = Date.now();

  console.info("[api/store] Incoming request", { method, action });

  try {
    if (method === "POST" && action === "onboarding") {
      return await storeOnboardingHandler(req, res);
    }

    if (method === "POST" && (action === "payment-token" || action === "payment-settings")) {
      return await storePaymentTokenHandler(req, res);
    }

    return sendJson(res, 404, {
      success: false,
      code: "UNKNOWN_STORE_ACTION",
      message: "Unknown store action.",
      details: { method, action },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Store request failed.";
    console.error("[api/store] Request failed", { method, action, message });
    return sendJson(res, 500, {
      success: false,
      code: "STORE_ROUTE_FAILED",
      message,
    });
  } finally {
    console.info("[api/store] Completed request", {
      method,
      action,
      durationMs: Date.now() - startedAt,
    });
  }
}
