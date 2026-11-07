import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
  resetPassword,
  onFirebaseUserChanged,
  mapFirebaseUserToUser,
  migrateLegacyStoragePaths,
  signInWithPhoneOtp as signInWithWebPhoneOtp,
  verifyPhoneOtp as verifyWebPhoneOtp,
  signInWithGoogle as signInWithWebGoogle,
  signOut as signOutWebFirebase,
  deleteAccount as deleteAccountApi,
  QueryClient,
  QueryClientProvider,
} from '@recallr/api';
import type { User, Session } from '@recallr/api';
import {
  sendNativePhoneOtp,
  verifyNativePhoneOtp,
  signInWithNativeGoogle,
  signOutNativeFirebase,
  onNativeAuthChanged as subscribeToNativeAuth,
  syncNativeAuthUser,
} from '../lib/nativeFirebaseAuth';

const signInWithPhoneOtp = (phone: string, recaptchaContainerId?: string) =>
  Platform.OS === 'web' ? signInWithWebPhoneOtp(phone, recaptchaContainerId) : sendNativePhoneOtp(phone);
const verifyPhoneOtp = (phone: string, code: string) =>
  Platform.OS === 'web' ? verifyWebPhoneOtp(phone, code) : verifyNativePhoneOtp(phone, code);
const signInWithGoogle = (redirectTo?: string) =>
  Platform.OS === 'web' ? signInWithWebGoogle(redirectTo) : signInWithNativeGoogle();
const signOut = async () => {
  if (Platform.OS !== 'web') await signOutNativeFirebase();
  await signOutWebFirebase();
};
const deleteAccount = async () => {
  await deleteAccountApi();
  if (Platform.OS !== 'web') await signOutNativeFirebase();
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPhoneOtp: (phone: string, recaptchaContainerId?: string) => Promise<unknown>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<unknown>;
  signInWithGoogle: (redirectTo?: string) => Promise<unknown>;
  signInWithEmailPassword: (email: string, password: string) => Promise<unknown>;
  signUpWithEmailPassword: (email: string, password: string, fullName?: string) => Promise<unknown>;
  resetPassword: (email: string) => Promise<unknown>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signInWithPhoneOtp: async () => {},
  verifyPhoneOtp: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmailPassword: async () => {},
  signUpWithEmailPassword: async () => {},
  resetPassword: async () => {},
  signOut: async () => {},
  deleteAccount: async () => {},
});

export const useRecallrAuth = () => useContext(AuthContext);

export interface RecallrProviderProps {
  children: React.ReactNode;
}

export const RecallrProvider: React.FC<RecallrProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );
  const activeUid = useRef<string | null>(null);

  useEffect(() => {
    const updateState = async (fbUser: Parameters<typeof mapFirebaseUserToUser>[0] | null) => {
      const nextUid = fbUser?.uid ?? null;
      if (activeUid.current !== nextUid) {
        queryClient.clear();
        activeUid.current = nextUid;
        if (nextUid) {
          void migrateLegacyStoragePaths()
            .then(() => Promise.all([
              queryClient.invalidateQueries({ queryKey: ['contacts'] }),
              queryClient.invalidateQueries({ queryKey: ['myCard'] }),
            ]))
            .catch(() => console.warn('[RecallrProvider Mobile] Legacy media migration did not complete.'));
        }
      }
      if (fbUser) {
        try {
          const token = (await fbUser.getIdToken()) || '';
          const mapped = mapFirebaseUserToUser(fbUser, token);
          setUser(mapped.user);
          setSession(mapped.session);
        } catch (err) {
          console.warn('[RecallrProvider Mobile] Error mapping Firebase session:', err);
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    };

    if (Platform.OS === 'web') {
      const unsubscribe = onFirebaseUserChanged(updateState);
      return () => unsubscribe?.();
    }

    const unsubscribe = subscribeToNativeAuth(async (nativeUser) => {
      if (!nativeUser) {
        if (activeUid.current !== null) {
          queryClient.clear();
          activeUid.current = null;
        }
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }
      const identityChanged = activeUid.current !== nativeUser.uid;
      if (identityChanged) {
        queryClient.clear();
        activeUid.current = nativeUser.uid;
      }
      try {
        const mapped = await syncNativeAuthUser(nativeUser);
        setUser(mapped.user);
        setSession(mapped.session);
        if (identityChanged) {
          void migrateLegacyStoragePaths()
            .then(() => Promise.all([
              queryClient.invalidateQueries({ queryKey: ['contacts'] }),
              queryClient.invalidateQueries({ queryKey: ['myCard'] }),
            ]))
            .catch(() => console.warn('[RecallrProvider Mobile] Legacy media migration did not complete.'));
        }
      } catch (error) {
        console.warn('[RecallrProvider Mobile] Error restoring Firebase session:', error);
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);

  const authValue = useMemo(
    () => ({
      user,
      session,
      loading,
      signInWithPhoneOtp,
      verifyPhoneOtp,
      signInWithGoogle,
      signInWithEmailPassword,
      signUpWithEmailPassword,
      resetPassword,
      signOut,
      deleteAccount,
    }),
    [user, session, loading]
  );

  return (
    <AuthContext.Provider value={authValue}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthContext.Provider>
  );
};
