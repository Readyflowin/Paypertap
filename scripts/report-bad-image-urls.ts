import { loadLocalEnv } from "../api/_env.ts";
import { getAdminDbIfConfigured } from "../api/_lib/firebaseAdmin.ts";
import { hasTemporaryImageUrl } from "../src/lib/imageUrls.ts";

type Finding = {
  collection: "products" | "stores";
  docId: string;
  fields: string[];
};

function findBadUrlFields(value: unknown, path: string): string[] {
  if (typeof value === "string") {
    return hasTemporaryImageUrl(value) ? [path] : [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findBadUrlFields(item, `${path}[${index}]`));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    findBadUrlFields(child, path ? `${path}.${key}` : key)
  );
}

function getImageFieldCandidates(data: Record<string, unknown>) {
  return {
    images: data.images,
    imageUrl: data.imageUrl,
    productImages: data.productImages,
    imageUrls: data.imageUrls,
    imagesUrls: data.imagesUrls,
    logoUrl: data.logoUrl,
    heroImageUrl: data.heroImageUrl,
    bannerImageUrl: data.bannerImageUrl,
    coverImageUrl: data.coverImageUrl,
  };
}

async function collectFindings(collectionName: "products" | "stores") {
  const db = getAdminDbIfConfigured();

  if (!db) {
    throw new Error("Firebase Admin is not configured.");
  }

  const snapshot = await db.collection(collectionName).get();
  const findings: Finding[] = [];

  snapshot.forEach((document) => {
    const data = document.data();
    const fields = findBadUrlFields(getImageFieldCandidates(data), "");

    if (fields.length) {
      findings.push({
        collection: collectionName,
        docId: document.id,
        fields,
      });
    }
  });

  return findings;
}

async function main() {
  loadLocalEnv({ override: true });

  const findings = [
    ...(await collectFindings("products")),
    ...(await collectFindings("stores")),
  ];

  console.log(
    JSON.stringify(
      {
        scannedCollections: ["products", "stores"],
        badDocumentCount: findings.length,
        findings,
        recommendation: findings.length
          ? "Re-upload the listed product/store images from the dashboard."
          : "No temporary localhost/blob image URLs found.",
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        error: error instanceof Error ? error.message : "Bad image URL report failed.",
      },
      null,
      2
    )
  );
  process.exitCode = 1;
});
