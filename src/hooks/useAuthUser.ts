import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { subscribeToAuthState } from "../services/authService";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
