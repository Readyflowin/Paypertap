import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

type ServiceAccountShape = {
  client_email?: string;
  private_key?: string;
  project_id?: string;
};

function normalizeEnvValue(value: string | undefined) {
  let normalized = value?.trim() || "";

  while (normalized.length >= 2) {
    const quote = normalized[0];

    if ((quote === '"' || quote === "'") && normalized.endsWith(quote)) {
      normalized = normalized.slice(1, -1).trim();
      continue;
    }

    break;
  }

  return normalized;
}

function normalizePrivateKey(value: string | undefined) {
  return normalizeEnvValue(value).replace(/\\n/g, "\n");
}

function parseServiceAccountJson(): ServiceAccountShape | null {
  const rawJson = normalizeEnvValue(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

  if (!rawJson) return null;

  try {
    const parsed = JSON.parse(rawJson) as ServiceAccountShape | string;
    const account =
      typeof parsed === "string"
        ? (JSON.parse(parsed) as ServiceAccountShape)
        : parsed;

    return {
      ...account,
      client_email: normalizeEnvValue(account.client_email),
      private_key: normalizePrivateKey(account.private_key),
      project_id: normalizeEnvValue(account.project_id),
    };
  } catch {
    return null;
  }
}

function getServiceAccountFromEnv(): ServiceAccountShape | null {
  const jsonAccount = parseServiceAccountJson();
  if (jsonAccount?.client_email && jsonAccount.private_key) {
    return jsonAccount;
  }

  const clientEmail = normalizeEnvValue(process.env.FIREBASE_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const projectId = normalizeEnvValue(process.env.FIREBASE_PROJECT_ID);

  if (!clientEmail || !privateKey || !projectId) {
    return null;
  }

  return {
    client_email: clientEmail,
    private_key: privateKey,
    project_id: projectId,
  };
}

export function getFirebaseAdminEnvDebugState() {
  const jsonAccount = parseServiceAccountJson();
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  return {
    hasServiceAccountJson: Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() &&
        jsonAccount?.client_email &&
        jsonAccount.private_key
    ),
    hasProjectId: Boolean(normalizeEnvValue(process.env.FIREBASE_PROJECT_ID)),
    hasClientEmail: Boolean(normalizeEnvValue(process.env.FIREBASE_CLIENT_EMAIL)),
    hasPrivateKey: Boolean(privateKey),
  };
}

export function getAdminDbIfConfigured() {
  if (!getApps().length) {
    const serviceAccount = getServiceAccountFromEnv();

    if (serviceAccount?.client_email && serviceAccount.private_key) {
      try {
        initializeApp({
          credential: cert({
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key,
            projectId: serviceAccount.project_id,
          }),
        });
      } catch (error) {
        console.warn("Firebase Admin initialization failed.", {
          ...getFirebaseAdminEnvDebugState(),
          errorName: error instanceof Error ? error.name : "UnknownError",
        });
        return null;
      }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        initializeApp({
          credential: applicationDefault(),
        });
      } catch (error) {
        console.warn("Firebase Admin application default initialization failed.", {
          errorName: error instanceof Error ? error.name : "UnknownError",
        });
        return null;
      }
    } else {
      return null;
    }
  }

  return getFirestore();
}
