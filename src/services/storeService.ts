import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Store } from "../types/firestore";

export async function getStoreById(storeId: string): Promise<Store | null> {
  const storeRef = doc(db, "stores", storeId);
  const storeSnap = await getDoc(storeRef);

  if (!storeSnap.exists()) {
    return null;
  }

  return storeSnap.data() as Store;
}

export async function updateStorePublishStatus(
  storeId: string,
  isPublished: boolean
): Promise<void> {
  await updateDoc(doc(db, "stores", storeId), {
    isPublished,
    updatedAt: serverTimestamp(),
  });
}
