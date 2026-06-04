import { useEffect, useState } from "react";
import { useAuthUser } from "./useAuthUser";
import {
  getPublicStoreData,
  type PublicStoreData,
} from "../services/publicStoreService";

type UsePublicStoreState = {
  data: PublicStoreData | null;
  loading: boolean;
  error: string | null;
};

export function usePublicStore(storeId: string): UsePublicStoreState {
  const { user } = useAuthUser();
  const [data, setData] = useState<PublicStoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStore() {
      try {
        setLoading(true);
        setError(null);

        const storeData = await getPublicStoreData(storeId, user?.uid);

        if (cancelled) return;

        if (!storeData) {
          setData(null);
          setError("Store not found");
          return;
        }

        setData(storeData);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load public store:", err);
        setData(null);
        setError("Unable to load this storefront right now");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStore();

    return () => {
      cancelled = true;
    };
  }, [storeId, user?.uid]);

  return {
    data,
    loading,
    error,
  };
}
