import { loadLocalEnv } from "../_env.js";
import {
  getAdminDbIfConfigured,
  getFirebaseAdminEnvDebugState,
} from "./firebaseAdmin.js";
import { sendAdminSellerOnboardedEmailIfNeeded } from "./emailNotifications.js";

function sendJson(res: any, statusCode: number, body: unknown) {
  res.setHeader("Cache-Control", "no-store");
  res.status(statusCode).json(body);
}

function getRequestBody(req: any) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  return req.body && typeof req.body === "object" ? req.body : null;
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function getBearerToken(req: any) {
  const header = req.headers?.authorization || req.headers?.Authorization;

  if (typeof header !== "string") return "";

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

async function verifyFirebaseUser(req: any) {
  const idToken = getBearerToken(req);
  const apiKey = getRequiredEnv("VITE_FIREBASE_API_KEY");

  if (!idToken || !apiKey) return "";

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!response.ok) return "";

  const data = (await response.json().catch(() => ({}))) as {
    users?: Array<{ localId?: string }>;
  };

  return data.users?.[0]?.localId || "";
}

export default async function handler(req: any, res: any) {
  loadLocalEnv({ override: true });

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { success: false, error: "Method not allowed." });
  }

  const sellerId = await verifyFirebaseUser(req);

  if (!sellerId) {
    return sendJson(res, 401, {
      success: false,
      error: "Please sign in before sending onboarding notification.",
    });
  }

  const db = getAdminDbIfConfigured();

  if (!db) {
    console.warn("Admin onboarding email skipped: Firebase Admin not configured.", {
      ...getFirebaseAdminEnvDebugState(),
    });
    return sendJson(res, 500, {
      success: false,
      error: "Server email notification is not configured.",
    });
  }

  const body = getRequestBody(req);
  const storeId = typeof body?.storeId === "string" ? body.storeId.trim() : "";

  if (!storeId) {
    return sendJson(res, 400, { success: false, error: "storeId is required." });
  }

  try {
    await sendAdminSellerOnboardedEmailIfNeeded({
      db,
      sellerId,
      storeId,
    });

    return sendJson(res, 200, { success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Admin onboarding email failed.";
    console.error("Email failed: admin seller onboarding", {
      sellerId,
      storeId,
      error: message,
    });
    return sendJson(res, 500, { success: false, error: message });
  }
}
