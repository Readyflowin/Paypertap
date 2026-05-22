import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type NextOrObserver,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";

function getAuthErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: unknown }).code);
  }

  return "";
}

export async function continueSellerWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    const code = getAuthErrorCode(error);

    if (code === "auth/weak-password") {
      throw new Error("Password should be at least 6 characters.");
    }

    if (code === "auth/invalid-email") {
      throw new Error("Please enter a valid email address.");
    }

    if (code === "auth/email-already-in-use") {
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
      } catch (signInError) {
        const signInCode = getAuthErrorCode(signInError);

        if (
          signInCode === "auth/wrong-password" ||
          signInCode === "auth/invalid-credential"
        ) {
          throw new Error(
            "This email already exists. Password is incorrect, or this account may use Google login."
          );
        }

        throw signInError;
      }
    }

    throw error;
  }
}

export async function continueSellerWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutSeller(): Promise<void> {
  await signOut(auth);
}

export function getCurrentSeller(): User | null {
  return auth.currentUser;
}

export function subscribeToAuthState(callback: NextOrObserver<User>) {
  return onAuthStateChanged(auth, callback);
}
