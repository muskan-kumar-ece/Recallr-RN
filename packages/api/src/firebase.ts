import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';

declare const process: {
  env: Record<string, string | undefined>;
};

export interface FirebaseConfig {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export function getFirebaseConfig(): FirebaseConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let functionsInstance: Functions | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (appInstance) return appInstance;
  if (getApps().length > 0) {
    appInstance = getApp();
    return appInstance;
  }
  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.appId) {
    throw new Error('Firebase is not configured. Set the Firebase client variables in your environment.');
  }
  appInstance = initializeApp(config);
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (authInstance) return authInstance;
  const app = getFirebaseApp();
  authInstance = getAuth(app);
  return authInstance;
}

export function getFirebaseDb(): Firestore {
  if (dbInstance) return dbInstance;
  const app = getFirebaseApp();
  dbInstance = getFirestore(app);
  return dbInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (storageInstance) return storageInstance;
  const app = getFirebaseApp();
  storageInstance = getStorage(app);
  return storageInstance;
}

export function getFirebaseFunctions(): Functions {
  if (functionsInstance) return functionsInstance;
  const app = getFirebaseApp();
  functionsInstance = getFunctions(app, 'us-central1');
  return functionsInstance;
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId && config.appId);
}

export async function getFirebaseIdToken(forceRefresh: boolean = false): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch (err) {
    console.warn('[Firebase] Failed to fetch ID token:', err);
    return null;
  }
}

let confirmationResultInstance: ConfirmationResult | null = null;

export async function sendFirebasePhoneOtp(
  phoneNumber: string,
  recaptchaContainerId: string = 'recaptcha-container'
): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();

  if (typeof window !== 'undefined') {
    const win = window as unknown as { _recaptchaVerifier?: RecaptchaVerifier };
    const verifier =
      win._recaptchaVerifier ||
      new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
      });
    win._recaptchaVerifier = verifier;

    confirmationResultInstance = await signInWithPhoneNumber(auth, phoneNumber, verifier);
    return confirmationResultInstance;
  }
  throw new Error('Phone OTP via Recaptcha is only supported in browser environments.');
}

export async function verifyFirebasePhoneOtp(
  verificationCode: string,
  confirmationResult?: ConfirmationResult
): Promise<FirebaseUser> {
  const activeConfirmation = confirmationResult || confirmationResultInstance;
  if (!activeConfirmation) {
    throw new Error('No active verification session. Please request a new OTP code.');
  }
  const result = await activeConfirmation.confirm(verificationCode);
  confirmationResultInstance = null;
  return result.user;
}

export async function signInWithFirebaseEmail(email: string, password: string): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signUpWithFirebaseEmail(
  email: string,
  password: string,
  fullName?: string
): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (fullName && cred.user) {
    try {
      await updateProfile(cred.user, { displayName: fullName });
    } catch (err) {
      console.warn('[Firebase] Could not update displayName:', err);
    }
  }
  return cred.user;
}

export async function sendFirebasePasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  await sendPasswordResetEmail(auth, email);
}

export async function signInWithFirebaseGoogle(): Promise<FirebaseUser> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

export function onFirebaseUserChanged(callback: (user: FirebaseUser | null) => void): (() => void) {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

export type { FirebaseUser };
