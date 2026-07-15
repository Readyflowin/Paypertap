import { randomBytes } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";

import { loadLocalEnv } from "../_env.js";
import {
  getAdminAuthIfConfigured,
  getAdminDbIfConfigured,
  getFirebaseAdminEnvDebugState,
} from "./firebaseAdmin.js";

const DEFAULT_ADVANCE_AMOUNT = 100;
const DEFAULT_THEME_ID = "theme1";
const DEFAULT_COLORS = {
  primaryColor: "#111111",
  secondaryColor: "#F6F1E8",
  accentColor: "#7A2E2E",
};

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

function slugifyStoreName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeIndianMobileInput(value: string): {
  ok: boolean;
  localNumber: string;
  error?: string;
} {
  const digits = String(value || "").replace(/\D/g, "");
  const withoutCountryCode = digits.startsWith("91") && digits.length === 12
    ? digits.slice(2)
    : digits;

  if (!/^[6-9]\d{9}$/.test(withoutCountryCode)) {
    return {
      ok: false,
      localNumber: "",
      error: "Please enter a valid 10-digit Indian WhatsApp number.",
    };
  }

  return { ok: true, localNumber: withoutCountryCode };
}

function normalizeInstagramProfile(value?: string): {
  instagramUrl: string;
  instagramHandle: string;
} {
  const raw = (value || "").trim();

  if (!raw) return { instagramUrl: "", instagramHandle: "" };

  const withoutAt = raw.replace(/^@+/, "").trim();
  const urlMatch = withoutAt.match(/^https?:\/\/(www\.)?instagram\.com\/([^/?#]+)/i);

  if (urlMatch?.[2]) {
    const handle = urlMatch[2].replace(/\/+$/g, "");
    return {
      instagramHandle: handle,
      instagramUrl: `https://instagram.com/${handle}`,
    };
  }

  const handle = withoutAt
    .replace(/^instagram\.com\//i, "")
    .replace(/[^a-zA-Z0-9._]/g, "")
    .replace(/\/+$/g, "");

  if (!handle) return { instagramUrl: "", instagramHandle: "" };

  return {
    instagramHandle: handle,
    instagramUrl: `https://instagram.com/${handle}`,
  };
}

function generatePaymentReturnToken(): string {
  return randomBytes(32).toString("hex");
}

function isHttpsUrl(value: string) {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
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
      error: "Firebase Admin is not configured for store onboarding.",
      env: getFirebaseAdminEnvDebugState(),
    });
  }

  const idToken = getBearerToken(req);

  if (!idToken) {
    return sendJson(res, 401, { success: false, error: "Please sign in first." });
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const body = (await readJson(req)) as {
      phone?: unknown;
      storeName?: unknown;
      instagramProfile?: unknown;
      logoUrl?: unknown;
    };

    const storeName = typeof body.storeName === "string" ? body.storeName.trim() : "";
    const instagramProfile =
      typeof body.instagramProfile === "string" ? body.instagramProfile.trim() : "";
    const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl.trim() : "";
    const phoneResult = normalizeIndianMobileInput(String(body.phone || ""));

    if (!storeName) {
      return sendJson(res, 400, { success: false, error: "Store name is required." });
    }

    if (!phoneResult.ok || !phoneResult.localNumber) {
      return sendJson(res, 400, {
        success: false,
        error: phoneResult.error || "Please enter a valid WhatsApp number.",
      });
    }

    if (logoUrl && !isHttpsUrl(logoUrl)) {
      return sendJson(res, 400, {
        success: false,
        error: "Please re-upload the store logo before saving.",
      });
    }

    const sellerRef = db.collection("sellers").doc(uid);
    const sellerSnap = await sellerRef.get();
    const seller = sellerSnap.exists ? sellerSnap.data() || {} : {};
    const existingStoreId =
      typeof seller.storeId === "string" && seller.storeId.trim()
        ? seller.storeId.trim()
        : "";
    const storeId = existingStoreId || slugifyStoreName(storeName);

    if (!storeId) {
      return sendJson(res, 400, {
        success: false,
        error: "Store name must include at least one letter or number.",
      });
    }

    const slugRef = db.collection("storeSlugs").doc(storeId);
    const storeRef = db.collection("stores").doc(storeId);
    const walletRef = db.collection("wallets").doc(uid);
    const instagram = normalizeInstagramProfile(instagramProfile);
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const [slugSnap, storeSnap, walletSnap] = await Promise.all([
        transaction.get(slugRef),
        transaction.get(storeRef),
        transaction.get(walletRef),
      ]);

      if (slugSnap.exists) {
        const reservation = slugSnap.data() || {};

        if (reservation.sellerId !== uid) {
          throw new Error("This store link is already taken.");
        }
      }

      const currentStore = storeSnap.exists ? storeSnap.data() || {} : {};
      const bio = "Fresh drops, limited pieces.";
      const currentPaymentReturnToken =
        typeof currentStore.paymentReturnToken === "string"
          ? currentStore.paymentReturnToken.trim()
          : "";

      transaction.set(
        slugRef,
        {
          slug: storeId,
          storeId,
          sellerId: uid,
          createdAt: slugSnap.exists ? slugSnap.get("createdAt") || now : now,
        },
        { merge: true },
      );

      transaction.set(
        storeRef,
        {
          storeId,
          sellerId: uid,
          storeSlug: storeId,
          storeName,
          storeDescription: bio,
          description: bio,
          bio,
          logoUrl,
          storeLogoUrl: logoUrl,
          heroTitle: "",
          heroSubtitle: "",
          heroImageUrl: "",
          themeId: DEFAULT_THEME_ID,
          primaryColor: DEFAULT_COLORS.primaryColor,
          secondaryColor: DEFAULT_COLORS.secondaryColor,
          accentColor: DEFAULT_COLORS.accentColor,
          paymentMode: "cod",
          advanceAmount: DEFAULT_ADVANCE_AMOUNT,
          paymentProvider: "razorpay",
          paymentLink: "",
          paymentReturnToken: currentPaymentReturnToken || generatePaymentReturnToken(),
          phone: phoneResult.localNumber,
          whatsappPhone: phoneResult.localNumber,
          instagramProfile,
          instagramUrl: instagram.instagramUrl,
          isPublished: true,
          acceptingOrders:
            typeof currentStore.acceptingOrders === "boolean"
              ? currentStore.acceptingOrders
              : true,
          pauseReason:
            typeof currentStore.pauseReason === "string" ? currentStore.pauseReason : "",
          createdAt: storeSnap.exists ? currentStore.createdAt || now : now,
          updatedAt: now,
        },
        { merge: true },
      );

      transaction.set(
        sellerRef,
        {
          sellerId: uid,
          authUid: uid,
          name:
            typeof seller.name === "string" && seller.name.trim()
              ? seller.name
              : decodedToken.name || storeName,
          email:
            typeof seller.email === "string" && seller.email.trim()
              ? seller.email
              : decodedToken.email || "",
          phone: phoneResult.localNumber,
          storeId,
          status:
            typeof seller.status === "string" && seller.status.trim()
              ? seller.status
              : "active",
          razorpayLinked:
            typeof seller.razorpayLinked === "boolean" ? seller.razorpayLinked : false,
          profileImageUrl:
            typeof seller.profileImageUrl === "string" && seller.profileImageUrl.trim()
              ? seller.profileImageUrl
              : decodedToken.picture || "",
          onboardingStatus: "store_completed",
          onboardingStep: "product",
          createdAt: sellerSnap.exists ? seller.createdAt || now : now,
          updatedAt: now,
        },
        { merge: true },
      );

      if (!walletSnap.exists) {
        transaction.set(walletRef, {
          sellerId: uid,
          balance: 0,
          freeOrdersRemaining: 5,
          totalOrdersCharged: 0,
          totalWalletSpent: 0,
          status: "active",
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    return sendJson(res, 200, {
      success: true,
      storeId,
      nextRoute: "/onboarding/product",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save your store.";
    const status = message === "This store link is already taken." ? 409 : 500;

    console.error("Store onboarding API failed:", error);

    return sendJson(res, status, {
      success: false,
      error: message,
    });
  }
}
