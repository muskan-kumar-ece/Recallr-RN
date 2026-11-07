import { Platform } from 'react-native';
import {
  getAuth as getNativeAuth,
  onAuthStateChanged as subscribeNativeAuth,
  signInWithCredential,
  signInWithPhoneNumber,
  signOut as signOutNative,
  GoogleAuthProvider,
  type ConfirmationResult,
  type User as NativeUser,
} from '@react-native-firebase/auth';
import * as AuthSession from 'expo-auth-session';
import {
  ensureUserAccount,
  getFirebaseAuth,
  getFirebaseConfig,
  mapFirebaseUserToUser,
} from '@recallr/api';
import { signInWithCustomToken } from 'firebase/auth';

let phoneConfirmation: ConfirmationResult | null = null;

export async function syncNativeAuthUser(user: NativeUser) {
  const projectId = getFirebaseConfig().projectId;
  if (!projectId) throw new Error('Firebase project is not configured.');
  const idToken = await user.getIdToken();
  const response = await fetch(`https://us-central1-${projectId}.cloudfunctions.net/exchangeNativeAuth`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: {} }),
  });
  if (!response.ok) throw new Error('Could not sync the sign-in session. Try again.');
  const envelope = await response.json() as { result?: { customToken?: string }; data?: { customToken?: string } };
  const customToken = envelope.result?.customToken ?? envelope.data?.customToken;
  if (!customToken) throw new Error('Firebase returned an invalid sign-in session.');
  const credential = await signInWithCustomToken(getFirebaseAuth(), customToken);
  await ensureUserAccount(user.uid, user.phoneNumber, user.email, user.displayName);
  return mapFirebaseUserToUser(credential.user, await credential.user.getIdToken());
}

export async function sendNativePhoneOtp(phone: string): Promise<void> {
  phoneConfirmation = await signInWithPhoneNumber(getNativeAuth(), phone);
}

export async function verifyNativePhoneOtp(_phone: string, code: string) {
  if (!phoneConfirmation) throw new Error('Request a new verification code first.');
  const confirmation = phoneConfirmation;
  phoneConfirmation = null;
  const result = await confirmation.confirm(code);
  return syncNativeAuthUser(result.user);
}

export async function signInWithNativeGoogle() {
  const clientId = Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
    : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  if (!clientId) throw new Error('Google sign-in is not configured for this platform.');
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'recallr', path: 'oauth' });
  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    responseType: AuthSession.ResponseType.IdToken,
    scopes: ['openid', 'email', 'profile'],
    usePKCE: false,
  });
  const result = await request.promptAsync({
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  });
  if (result.type !== 'success') throw new Error('Google sign-in was cancelled.');
  const idToken = result.params.id_token;
  if (!idToken) throw new Error('Google did not return an ID token.');
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(getNativeAuth(), credential);
  return syncNativeAuthUser(userCredential.user);
}

export function onNativeAuthChanged(callback: (user: NativeUser | null) => void) {
  return subscribeNativeAuth(getNativeAuth(), callback);
}

export async function signOutNativeFirebase() {
  if (getNativeAuth().currentUser) await signOutNative(getNativeAuth());
}
