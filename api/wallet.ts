import {
  adminWalletAdjustmentHandler,
  walletRechargeHandler,
  walletRechargeReturnHandler,
} from "./_lib/walletRecharge.js";
import { walletReconcileHandler } from "./_lib/walletReconcile.js";

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

export default async function walletRouter(req: ApiRequest, res: ApiResponse) {
  const method = (req.method || "GET").toUpperCase();
  const action = getAction(req);
  const startedAt = Date.now();

  console.info("[api/wallet] Incoming request", { method, action });

  try {
    if (method === "POST" && action === "recharge") {
      return await walletRechargeHandler(req, res);
    }

    if (method === "POST" && action === "recharge-return") {
      return await walletRechargeReturnHandler(req, res);
    }

    if (method === "POST" && action === "reconcile") {
      return await walletReconcileHandler(req, res);
    }

    if (method === "POST" && action === "admin-adjustment") {
      return await adminWalletAdjustmentHandler(req, res);
    }

    return sendJson(res, 404, {
      success: false,
      code: "UNKNOWN_WALLET_ACTION",
      message: "Unknown wallet action.",
      details: { method, action },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Wallet request failed.";
    console.error("[api/wallet] Request failed", { method, action, message });
    return sendJson(res, 500, {
      success: false,
      code: "WALLET_ROUTE_FAILED",
      message,
    });
  } finally {
    console.info("[api/wallet] Completed request", {
      method,
      action,
      durationMs: Date.now() - startedAt,
    });
  }
}
