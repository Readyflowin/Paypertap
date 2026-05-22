import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Theme } from "../types/firestore";

export async function getThemeById(themeId: string): Promise<Theme | null> {
  const themeRef = doc(db, "themes", themeId);
  const themeSnap = await getDoc(themeRef);

  if (!themeSnap.exists()) {
    return null;
  }

  return themeSnap.data() as Theme;
}