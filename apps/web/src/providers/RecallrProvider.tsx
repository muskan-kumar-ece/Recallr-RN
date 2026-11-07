'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  signInWithPhoneOtp,
  verifyPhoneOtp,
  signInWithGoogle,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  resetPassword,
  signOut,
  deleteAccount,
  onFirebaseUserChanged,
  mapFirebaseUserToUser,
  migrateLegacyStoragePaths,
  QueryClient,
  QueryClientProvider,
  User,
  Session,
} from '@recallr/api';

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
    const unsubscribe = onFirebaseUserChanged(async (fbUser) => {
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
            .catch((err: unknown) => {
              console.warn('[RecallrProvider] Legacy media migration did not complete.');
              if (err instanceof Error) console.debug(err.message);
            });
        }
      }
      if (fbUser) {
        try {
          const token = (await fbUser.getIdToken()) || '';
          const mapped = mapFirebaseUserToUser(fbUser, token);
          setUser(mapped.user);
          setSession(mapped.session);
        } catch (err) {
          console.warn('[RecallrProvider] Error mapping Firebase session:', err);
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe?.();
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
