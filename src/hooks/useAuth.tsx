import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFirebase, isFirebaseConfigured } from "@/config/firebase";
import { fetchProfile } from "@/lib/deposits";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  /** "demo" means Firebase env vars are missing; the app still works. */
  mode: "live" | "demo";
  loading: boolean;
  signingIn: boolean;
  error: string | null;
  points: number;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const firebase = getFirebase();
    if (!firebase) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebase.auth, (nextUser) => {
      setUser(nextUser);
      if (!nextUser) setProfile(null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const next = await fetchProfile(user.uid);
    setProfile(next);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    void refreshProfile();
  }, [user, refreshProfile]);

  const signIn = useCallback(async () => {
    const firebase = getFirebase();
    if (!firebase) {
      setError("Sign-in is not configured on this deployment (demo mode).");
      return;
    }

    setSigningIn(true);
    setError(null);
    try {
      const credential = await signInWithPopup(firebase.auth, firebase.googleProvider);
      const signedIn = credential.user;

      // Create the profile document once; never overwrite an existing points balance.
      const reference = doc(firebase.db, "user", signedIn.uid);
      const snapshot = await getDoc(reference);
      if (!snapshot.exists()) {
        await setDoc(reference, {
          name: signedIn.displayName,
          email: signedIn.email,
          photo: signedIn.photoURL,
          points: 0,
          createdAt: new Date().toISOString(),
        });
      }
      await refreshProfile();
    } catch (signInError) {
      const message =
        signInError instanceof Error ? signInError.message : "Could not sign in";
      // Popup-closed-by-user is not worth alarming anyone about.
      if (!/popup-closed|cancelled-popup|popup-blocked/i.test(message)) setError(message);
    } finally {
      setSigningIn(false);
    }
  }, [refreshProfile]);

  const signOutUser = useCallback(async () => {
    const firebase = getFirebase();
    if (!firebase) return;
    await signOut(firebase.auth);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      mode: isFirebaseConfigured ? "live" : "demo",
      loading,
      signingIn,
      error,
      points: profile?.points ?? 0,
      signIn,
      signOutUser,
      refreshProfile,
    }),
    [user, profile, loading, signingIn, error, signIn, signOutUser, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
};
