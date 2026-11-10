import { initializeApp, type FirebaseApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase is optional. Without VITE_FIREBASE_* build variables the app runs in
 * demo mode with sample bins, so the site is never broken by missing config.
 *
 * Note: Firebase web API keys are public identifiers (they ship in every client
 * bundle). Access control lives in Firebase security rules, not in this key.
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "",
};

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId,
);

export const firebaseProjectId: string | null = config.projectId || null;

interface FirebaseBundle {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  googleProvider: GoogleAuthProvider;
}

let cached: FirebaseBundle | null = null;

/** Lazily create the Firebase bundle on first use. */
export const getFirebase = (): FirebaseBundle | null => {
  if (!isFirebaseConfigured) return null;
  if (!cached) {
    const app = initializeApp(config);
    cached = {
      app,
      auth: getAuth(app),
      db: getFirestore(app),
      googleProvider: new GoogleAuthProvider(),
    };
  }
  return cached;
};
