import {
  getFirebaseAuth,
  getFirebaseDb,
  getFirebaseFunctions,
  sendFirebasePhoneOtp,
  verifyFirebasePhoneOtp,
  signInWithFirebaseGoogle,
  signOutFirebase,
  signInWithFirebaseEmail,
  signUpWithFirebaseEmail,
  sendFirebasePasswordReset,
  FirebaseUser,
} from './firebase';
import { httpsCallable } from 'firebase/functions';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

export interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  uid?: string;
  email?: string | null;
  phone?: string | null;
  displayName?: string | null;
  user_metadata?: UserMetadata;
  app_metadata?: Record<string, unknown>;
  aud?: string;
  created_at?: string;
}

export interface Session {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  user: User;
}

export interface NormalizedAuthUser {
  id: string;
  phone?: string | null;
  email?: string | null;
  displayName?: string | null;
  provider: 'firebase';
}

export function mapFirebaseUserToUser(fbUser: FirebaseUser, token: string = ''): { user: User; session: Session } {
  const user: User = {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email,
    phone: fbUser.phoneNumber,
    displayName: fbUser.displayName,
    user_metadata: {
      full_name: fbUser.displayName || undefined,
      avatar_url: fbUser.photoURL || undefined,
    },
    app_metadata: { provider: 'firebase' },
    aud: 'authenticated',
    created_at: fbUser.metadata.creationTime || new Date().toISOString(),
  };

  const session: Session = {
    access_token: token,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: fbUser.refreshToken || '',
    user,
  };

  return { user, session };
}

/**
 * Ensures user has an initialized profile, settings, free plan entitlement,
 * and 4 canonical categories (Family, Friends, Work, VIP) in Firestore.
 */
export async function ensureUserAccount(
  userId: string,
  phone?: string | null,
  email?: string | null,
  fullName?: string | null
): Promise<void> {
  const db = getFirebaseDb();
  // 1. Profile
  const profileRef = doc(db, 'profiles', userId);
  const profileSnap = await getDoc(profileRef);
  if (!profileSnap.exists()) {
    await setDoc(profileRef, {
      id: userId,
      user_id: userId,
      full_name: fullName || '',
      phone: phone || null,
      email: email || null,
      avatar_path: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }

  // 2. Settings; keep these defaults aligned with docs/05-data-model.md.
  const settingsRef = doc(db, 'user_settings', userId);
  const settingsSnap = await getDoc(settingsRef);
  if (!settingsSnap.exists()) {
    await setDoc(settingsRef, {
      userId,
      user_id: userId,
      nudge_days: 30,
      default_reminder_time: '09:00',
      snooze_minutes: 60,
      reminders_enabled: true,
      nudges_enabled: true,
      daily_brief_enabled: true,
      daily_brief_time: '08:30',
      quiet_hours_enabled: true,
      quiet_start: '22:00',
      quiet_end: '07:00',
      ai_use_notes: true,
      accent_theme: 'orange',
      timezone: 'Asia/Kolkata',
      onboarding_done: false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }

  // 3. Entitlement
  const entitlementRef = doc(db, 'entitlements', userId);
  const entitlementSnap = await getDoc(entitlementRef);
  if (!entitlementSnap.exists()) {
    await setDoc(entitlementRef, {
      userId,
      user_id: userId,
      plan: 'free',
      source: 'signup',
      expires_at: null,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  }

  // 4. Canonical categories. Stable IDs make repeated sign-in/bootstrap idempotent.
  const catQuery = query(collection(db, 'categories'), where('user_id', '==', userId));
  const catSnap = await getDocs(catQuery);
  if (catSnap.empty) {
    const defaultCategories = [
      { name: 'Family', icon: 'heart', color: '#EF4444' },
      { name: 'Friends', icon: 'users', color: '#3B82F6' },
      { name: 'Work', icon: 'briefcase', color: '#10B981' },
      { name: 'VIP', icon: 'star', color: '#F59E0B' },
    ];

    for (const cat of defaultCategories) {
      const catDocRef = doc(db, 'categories', `${userId}_${cat.name.toLowerCase()}`);
      await setDoc(catDocRef, {
        id: catDocRef.id,
        userId,
        user_id: userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        created_at: new Date().toISOString(),
      }, { merge: true });
    }
  }
}

export async function signInWithPhoneOtp(phone: string, recaptchaContainerId: string = 'recaptcha-container') {
  return await sendFirebasePhoneOtp(phone, recaptchaContainerId);
}

export async function verifyPhoneOtp(_phone: string, token: string) {
  const firebaseUser = await verifyFirebasePhoneOtp(token);
  await ensureUserAccount(
    firebaseUser.uid,
    firebaseUser.phoneNumber,
    firebaseUser.email,
    firebaseUser.displayName
  );
  const idToken = (await firebaseUser.getIdToken()) || '';
  return mapFirebaseUserToUser(firebaseUser, idToken);
}

export async function signInWithEmailPassword(email: string, password: string) {
  const firebaseUser = await signInWithFirebaseEmail(email, password);
  await ensureUserAccount(
    firebaseUser.uid,
    firebaseUser.phoneNumber,
    firebaseUser.email,
    firebaseUser.displayName
  );
  const idToken = (await firebaseUser.getIdToken()) || '';
  return mapFirebaseUserToUser(firebaseUser, idToken);
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  fullName?: string
) {
  const firebaseUser = await signUpWithFirebaseEmail(email, password, fullName);
  await ensureUserAccount(
    firebaseUser.uid,
    firebaseUser.phoneNumber,
    firebaseUser.email,
    fullName || firebaseUser.displayName
  );
  const idToken = (await firebaseUser.getIdToken()) || '';
  return mapFirebaseUserToUser(firebaseUser, idToken);
}

export async function resetPassword(email: string) {
  await sendFirebasePasswordReset(email);
  return { success: true };
}

export async function signInWithGoogle(_redirectTo?: string) {
  const firebaseUser = await signInWithFirebaseGoogle();
  await ensureUserAccount(
    firebaseUser.uid,
    firebaseUser.phoneNumber,
    firebaseUser.email,
    firebaseUser.displayName
  );
  const idToken = (await firebaseUser.getIdToken()) || '';
  return mapFirebaseUserToUser(firebaseUser, idToken);
}

export async function signOut() {
  await signOutFirebase();
}

export async function deleteAccount() {
  if (!getFirebaseAuth().currentUser) throw new Error('Unauthenticated');
  const fn = httpsCallable<undefined, { success: boolean }>(getFirebaseFunctions(), 'deleteAccount');
  const result = await fn(undefined);
  if (!result.data.success) throw new Error('Account deletion did not complete.');
  await signOutFirebase();
  return { success: true };
}
