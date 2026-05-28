import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import formidable from "formidable";

import { loadLocalEnv } from "./_env.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;
const publicImageCacheControl = "public, max-age=31536000, immutable";

type UploadedFile = {
  filepath: string;
  originalFilename?: string | null;
  mimetype?: string | null;
  size: number;
};

type UploadFolder = "stores" | "products" | "test";

function sendJson(res: any, statusCode: number, body: unknown) {
  res.setHeader("Cache-Control", "no-store");
  res.status(statusCode).json(body);
}

function getRequiredEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function getBearerToken(req: any) {
  const header = req.headers?.authorization || req.headers?.Authorization;

  if (typeof header !== "string") {
    return "";
  }

  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

async function verifyFirebaseUser(req: any) {
  const idToken = getBearerToken(req);
  const apiKey = getRequiredEnv("VITE_FIREBASE_API_KEY");

  if (!idToken || !apiKey) {
    return false;
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!response.ok) {
    return false;
  }

  const data = (await response.json().catch(() => ({}))) as {
    users?: unknown[];
  };
  return Array.isArray(data.users) && data.users.length > 0;
}

function firstFile(value: unknown): UploadedFile | null {
  if (Array.isArray(value)) {
    return (value[0] as UploadedFile | undefined) ?? null;
  }

  return (value as UploadedFile | undefined) ?? null;
}

function firstField(value: unknown): string | null {
  if (Array.isArray(value)) {
    const firstValue = value[0];
    return typeof firstValue === "string" ? firstValue : null;
  }

  return typeof value === "string" ? value : null;
}

function getUploadFolder(value: unknown): UploadFolder {
  const folder = firstField(value);
  return folder === "stores" || folder === "products" || folder === "test" ? folder : "test";
}

function getExtensionForMimeType(mimetype: string) {
  if (mimetype === "image/jpeg") return ".jpg";
  if (mimetype === "image/png") return ".png";
  if (mimetype === "image/webp") return ".webp";
  return "";
}

function toSafeObjectKey(filename: string, folder: UploadFolder, mimetype: string) {
  const lowerFilename = filename.toLowerCase();
  const extension = getExtensionForMimeType(mimetype);
  const originalExtension = path.extname(lowerFilename).replace(/[^.a-z0-9]/g, "");
  const nameWithoutExtension = path.basename(lowerFilename, originalExtension);
  const safeName = nameWithoutExtension.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const finalName = safeName || "image";
  const timestamp = Date.now();
  const random = randomBytes(8).toString("hex");

  return `uploads/${folder}/${timestamp}-${random}-${finalName}${extension}`;
}

function buildPublicUrl(baseUrl: string | undefined, key: string) {
  const trimmedBaseUrl = baseUrl?.trim().replace(/\/+$/g, "");
  if (!trimmedBaseUrl) {
    return null;
  }

  const url = `${trimmedBaseUrl}/${key.replace(/^\/+/g, "")}`;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (
      parsed.protocol !== "https:" ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1"
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return url;
}

function parseUpload(req: any) {
  const form = formidable({
    multiples: false,
    maxFiles: 1,
    maxFileSize,
  });

  return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
    form.parse(req, (error, fields, files) => {
      if (error) {
        reject(error);
        return;
      }

      resolve({ fields, files });
    });
  });
}

export default async function handler(req: any, res: any) {
  loadLocalEnv({ override: true });
  // TODO: require authenticated seller session before production launch.

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { success: false, error: "Method not allowed." });
  }

  if (!(await verifyFirebaseUser(req))) {
    return sendJson(res, 401, {
      success: false,
      error: "Please sign in before uploading images.",
    });
  }

  const bucketName = getRequiredEnv("CLOUDFLARE_R2_BUCKET_NAME");
  const endpoint = getRequiredEnv("CLOUDFLARE_R2_ENDPOINT");
  const accessKeyId = getRequiredEnv("CLOUDFLARE_R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY");

  if (!bucketName || !endpoint || !accessKeyId || !secretAccessKey) {
    return sendJson(res, 500, {
      success: false,
      error: "Cloudflare R2 upload environment variables are not configured.",
    });
  }

  try {
    const { fields, files } = await parseUpload(req);
    const file = firstFile(files.file);

    if (!file) {
      return sendJson(res, 400, {
        success: false,
        error: "Image file is required in multipart field 'file'.",
      });
    }

    const mimetype = file.mimetype ?? "";
    if (!allowedMimeTypes.has(mimetype)) {
      return sendJson(res, 400, {
        success: false,
        error: "Only JPEG, PNG, and WebP images are allowed.",
      });
    }

    if (file.size > maxFileSize) {
      return sendJson(res, 400, {
        success: false,
        error: "Image must be 5MB or smaller.",
      });
    }

    const originalFilename = file.originalFilename || "image";
    const folder = getUploadFolder(fields.folder);
    const key = toSafeObjectKey(originalFilename, folder, mimetype);
    const body = await readFile(file.filepath);

    const client = new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        CacheControl: publicImageCacheControl,
        ContentType: mimetype,
      }),
    );

    const url = buildPublicUrl(process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL, key);

    if (!url) {
      return sendJson(res, 500, {
        success: false,
        error:
          "Cloudflare R2 public image URL is not configured as a durable HTTPS URL.",
      });
    }

    return sendJson(res, 200, {
      success: true,
      key,
      url,
      cacheControl: publicImageCacheControl,
    });
  } catch (error) {
    const statusCode =
      error instanceof Error && "httpCode" in error && error.httpCode === 413 ? 400 : 500;
    const message =
      statusCode === 400
        ? "Image must be 5MB or smaller."
        : error instanceof Error
          ? error.message
          : "Image upload failed.";

    return sendJson(res, statusCode, { success: false, error: message });
  }
}
