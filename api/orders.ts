import { createOrderHandler } from "./_lib/createOrder.js";
import { orderActionHandler } from "./_lib/orderActions.js";
import { paymentReturnHandler } from "./_lib/paymentReturn.js";
import publicOrderHandler from "./_lib/publicOrder.js";

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

  if (typeof req.body === "string") {
    try {
      const parsed = JSON.parse(req.body) as { action?: unknown };
      return typeof parsed.action === "string" ? parsed.action.trim() : "";
    } catch {
      return "";
    }
  }

  return "";
}

function setBodyAction(req: ApiRequest, action: string) {
  if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
    req.body = { ...(req.body as Record<string, unknown>), action };
    return;
  }

  if (typeof req.body === "string") {
    try {
      const parsed = JSON.parse(req.body) as Record<string, unknown>;
      req.body = JSON.stringify({ ...parsed, action });
    } catch {
      req.body = JSON.stringify({ action });
    }
  }
}

export default async function ordersRouter(req: ApiRequest, res: ApiResponse) {
  const method = (req.method || "GET").toUpperCase();
  const action = getAction(req);
  const startedAt = Date.now();

  console.info("[api/orders] Incoming request", { method, action });

  try {
    if (method === "POST" && action === "create") {
      return await createOrderHandler(req, res);
    }

    if (method === "POST" && action === "payment-return") {
      return await paymentReturnHandler(req, res);
    }

    if ((method === "POST" || method === "GET") && action === "status") {
      return await publicOrderHandler(req, res);
    }

    if (method === "POST") {
      const orderActions = new Set([
        "verify-payment",
        "confirm-payment",
        "accept",
        "complete",
        "cancel",
        "update-notes",
        "notes",
      ]);

      if (orderActions.has(action)) {
        if (action === "notes") setBodyAction(req, "update-notes");
        return await orderActionHandler(req, res);
      }
    }

    return sendJson(res, 404, {
      success: false,
      code: "UNKNOWN_ORDER_ACTION",
      message: "Unknown order action.",
      error: "Unknown order action.",
      details: { method, action },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Order request failed.";
    console.error("[api/orders] Request failed", { method, action, message });
    return sendJson(res, 500, {
      success: false,
      code: "ORDER_ROUTE_FAILED",
      message,
      error: message,
      details: { method, action },
    });
  } finally {
    console.info("[api/orders] Completed request", {
      method,
      action,
      durationMs: Date.now() - startedAt,
    });
  }
}
