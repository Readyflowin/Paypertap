import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { loadLocalEnv } from "./_env.js";
import {
  getAdminAuthIfConfigured,
  getAdminDbIfConfigured,
} from "./_lib/firebaseAdmin.js";

function sendJson(res: any, statusCode: number, body: unknown) {
  res.setHeader("Cache-Control", "no-store");
  res.status(statusCode).json(body);
}

function getBearerToken(req: any) {
  const header = req.headers?.authorization || req.headers?.Authorization;

  if (typeof header !== "string") return "";

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

function generatePaymentReturnToken(): string {
  return randomBytes(32).toString("hex");
}

async function readJson(req: any) {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  return rawBody ? JSON.parse(rawBody) : {};
}

export default async function handler(req: any, res: any) {
  loadLocalEnv({ override: true });

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { success: false, error: "Method not allowed." });
  }

  const auth = getAdminAuthIfConfigured();
  const db = getAdminDbIfConfigured();

  if (!auth || !db) {
    return sendJson(res, 500, {
      success: false,
      error: "Store payment token service is not configured.",
    });
  }

  const idToken = getBearerToken(req);

  if (!idToken) {
    return sendJson(res, 401, { success: false, error: "Please sign in first." });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const body = (await readJson(req)) as { storeId?: unknown };
    const storeId = typeof body.storeId === "string" ? body.storeId.trim() : "";

    if (!storeId) {
      return sendJson(res, 400, { success: false, error: "storeId is required." });
    }

    const storeRef = db.collection("stores").doc(storeId);
    let paymentReturnToken = "";

    await db.runTransaction(async (transaction) => {
      const storeSnap = await transaction.get(storeRef);

      if (!storeSnap.exists) {
        throw new Error("Store not found.");
      }

      const store = storeSnap.data() || {};

      if (store.sellerId !== decodedToken.uid) {
        throw new Error("Store not found.");
      }

      paymentReturnToken =
        typeof store.paymentReturnToken === "string" && store.paymentReturnToken.trim()
          ? store.paymentReturnToken.trim()
          : generatePaymentReturnToken();

      if (store.paymentReturnToken !== paymentReturnToken) {
        transaction.set(
          storeRef,
          {
            paymentReturnToken,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
    });

    return sendJson(res, 200, {
      success: true,
      paymentReturnToken,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not prepare payment settings.";
    const status = message === "Store not found." ? 404 : 500;

    return sendJson(res, status, {
      success: false,
      error: message,
    });
  }
}
