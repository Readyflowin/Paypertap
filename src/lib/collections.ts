export const COMPATIBILITY_COLLECTION_NAME = "General";

export function normalizeCollectionName(name?: string | null): string {
  return (name || "").replace(/\s+/g, " ").trim();
}

export function getCollectionNameKey(name?: string | null): string {
  return normalizeCollectionName(name).toLowerCase();
}

export function getCollectionSlug(name: string): string {
  return normalizeCollectionName(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isCompatibilityCollectionName(name?: string | null): boolean {
  return getCollectionNameKey(name) === getCollectionNameKey(COMPATIBILITY_COLLECTION_NAME);
}
