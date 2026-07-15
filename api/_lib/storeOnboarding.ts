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

type OnboardingDecisionDetails = {
  uid: string;
  requestedSlug: string;
  selectedStoreId: string;
  previousStoreId: string;
  sellerExists: boolean;
  existingStoreFound: boolean;
  existingStoreOwnedBySeller: boolean;
  creatingSlug: boolean;
  creatingStore: boolean;
  updatingSeller: boolean;
  branch: "create_new_store" | "update_existing_store";
};

function sendJson(res: any, statusCode: number, body: unknown) {
  res.setHeader("Cache-Control", "no-store");
  res.status(statusCode).json(body);
}

function onboardingLog(
  level: "info" | "warn" | "error",
  event: string,
  details: Record<string, unknown> = {}
) {
  const payload = {
    event,
    component: "store-onboarding",
    ...details,
  };

  if (level === "error") console.error(event, payload);
  else if (level === "warn") console.warn(event, payload);
  else console.info(event, payload);
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

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildSlugCandidates(baseSlug: string) {
  const candidates = [baseSlug];

  for (let index = 2; index <= 20; index += 1) {
    candidates.push(`${baseSlug}-${index}`);
  }

  candidates.push(`${baseSlug}-${randomBytes(3).toString("hex")}`);

  return Array.from(new Set(candidates.filter(Boolean)));
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

  let uidForLog = "";
  let requestedSlugForLog = "";
  let selectedStoreId = "";
  let decisionDetails: OnboardingDecisionDetails | null = null;

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    uidForLog = uid;
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

    const requestedSlug = slugifyStoreName(storeName);
    requestedSlugForLog = requestedSlug;

    if (!requestedSlug) {
      return sendJson(res, 400, {
        success: false,
        error: "Store name must include at least one letter or number.",
      });
    }

    const sellerRef = db.collection("sellers").doc(uid);
    const walletRef = db.collection("wallets").doc(uid);
    const instagram = normalizeInstagramProfile(instagramProfile);
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const [sellerSnap, walletSnap] = await Promise.all([
        transaction.get(sellerRef),
        transaction.get(walletRef),
      ]);
      const seller = sellerSnap.exists ? sellerSnap.data() || {} : {};
      const previousStoreId = toText(seller.storeId);
      const existingStoreRef = previousStoreId
        ? db.collection("stores").doc(previousStoreId)
        : null;
      const existingStoreSnap = existingStoreRef
        ? await transaction.get(existingStoreRef)
        : null;
      const existingStore = existingStoreSnap?.exists ? existingStoreSnap.data() || {} : {};
      const existingStoreOwnedBySeller =
        existingStoreSnap?.exists === true && existingStore.sellerId === uid;

      onboardingLog("info", "Store onboarding seller state loaded.", {
        uid,
        requestedSlug,
        sellerExists: sellerSnap.exists,
        previousStoreId,
        existingStoreFound: existingStoreSnap?.exists === true,
        existingStoreOwnedBySeller,
        onboardingStatus: toText(seller.onboardingStatus),
        onboardingStep: toText(seller.onboardingStep),
      });

      let storeId = "";
      let slugSnap: FirebaseFirestore.DocumentSnapshot | null = null;
      let storeSnap: FirebaseFirestore.DocumentSnapshot | null = null;
      let branch: OnboardingDecisionDetails["branch"] = "create_new_store";

      if (existingStoreOwnedBySeller && previousStoreId) {
        storeId = previousStoreId;
        branch = "update_existing_store";
        const slugRef = db.collection("storeSlugs").doc(storeId);
        const storeRef = db.collection("stores").doc(storeId);

        [slugSnap, storeSnap] = await Promise.all([
          transaction.get(slugRef),
          transaction.get(storeRef),
        ]);

        onboardingLog("info", "Store onboarding chose existing owned store.", {
          uid,
          requestedSlug,
          storeId,
          slugExists: slugSnap.exists,
        });
      } else {
        const candidates = buildSlugCandidates(requestedSlug);
        const candidateSlugRefs = candidates.map((slug) => db.collection("storeSlugs").doc(slug));
        const candidateStoreRefs = candidates.map((slug) => db.collection("stores").doc(slug));
        const candidateSlugSnaps = await Promise.all(
          candidateSlugRefs.map((ref) => transaction.get(ref))
        );
        const candidateStoreSnaps = await Promise.all(
          candidateStoreRefs.map((ref) => transaction.get(ref))
        );
        const availableIndex = candidates.findIndex((candidate, index) => {
          const candidateSlugSnap = candidateSlugSnaps[index];
          const candidateStoreSnap = candidateStoreSnaps[index];
          const reservation = candidateSlugSnap.exists ? candidateSlugSnap.data() || {} : {};
          const candidateStore = candidateStoreSnap.exists ? candidateStoreSnap.data() || {} : {};
          const slugAvailable = !candidateSlugSnap.exists || reservation.sellerId === uid;
          const storeAvailable = !candidateStoreSnap.exists || candidateStore.sellerId === uid;

          return Boolean(candidate) && slugAvailable && storeAvailable;
        });

        if (availableIndex < 0) {
          onboardingLog("warn", "Store onboarding could not find an available slug.", {
            uid,
            requestedSlug,
            candidates,
          });
          throw new Error("This store link is already taken.");
        }

        storeId = candidates[availableIndex];
        slugSnap = candidateSlugSnaps[availableIndex];
        storeSnap = candidateStoreSnaps[availableIndex];

        onboardingLog("info", "Store onboarding chose new store slug.", {
          uid,
          requestedSlug,
          selectedStoreId: storeId,
          previousStoreId,
          ignoredPreviousStoreId: previousStoreId && !existingStoreOwnedBySeller,
          candidateIndex: availableIndex,
        });
      }

      selectedStoreId = storeId;
      const slugRef = db.collection("storeSlugs").doc(storeId);
      const storeRef = db.collection("stores").doc(storeId);

      if (slugSnap.exists) {
        const reservation = slugSnap.data() || {};

        if (reservation.sellerId !== uid) {
          throw new Error("This store link is already taken.");
        }
      }

      const currentStore = storeSnap.exists ? storeSnap.data() || {} : {};
      const creatingSlug = !slugSnap.exists;
      const creatingStore = !storeSnap.exists;
      decisionDetails = {
        uid,
        requestedSlug,
        selectedStoreId: storeId,
        previousStoreId,
        sellerExists: sellerSnap.exists,
        existingStoreFound: existingStoreSnap?.exists === true,
        existingStoreOwnedBySeller,
        creatingSlug,
        creatingStore,
        updatingSeller: sellerSnap.exists,
        branch,
      };
      onboardingLog("info", "Store onboarding transaction decision finalized.", {
        ...decisionDetails,
      });
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
      storeId: selectedStoreId,
      nextRoute: "/onboarding/product",
      details: decisionDetails,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save your store.";
    const status = message === "This store link is already taken." ? 409 : 500;

    onboardingLog("error", "Store onboarding API failed.", {
      uid: uidForLog,
      requestedSlug: requestedSlugForLog,
      selectedStoreId,
      details: decisionDetails,
      message,
      error: error instanceof Error ? error.stack || error.message : error,
    });

    return sendJson(res, status, {
      success: false,
      error: message,
      message,
      code: status === 409 ? "store_slug_taken" : "store_onboarding_failed",
      details: decisionDetails || {
        requestedSlug: requestedSlugForLog,
        selectedStoreId,
      },
    });
  }
}
