import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isOnboarded: boolean;
  isLoading: boolean;
  loginWithPhone: (phone: string) => Promise<{ success: boolean; message?: string }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  loginDemoUser: () => Promise<void>;
  completeOnboarding: (starterCategoryNames?: string[]) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILE: Profile = {
  id: 'demo-user-123',
  name: 'Muskan Kapoor',
  email: 'muskan@recallr.app',
  phone: '+91 98765 43210',
  headline: 'Product Designer & Builder',
  company: 'Recallr Network',
  bio: 'Connecting tech leaders, creators, and founders across the globe.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      setIsLoading(true);
      const storedUser = await AsyncStorage.getItem('@recallr_user');
      const storedProfile = await AsyncStorage.getItem('@recallr_profile');
      const onboardedFlag = await AsyncStorage.getItem('@recallr_onboarded');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Default to demo user for seamless pairing and testing out of the box
        setUser({
          id: DEMO_PROFILE.id,
          name: DEMO_PROFILE.name,
          phone: DEMO_PROFILE.phone,
          email: DEMO_PROFILE.email,
        });
      }

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        setProfile(DEMO_PROFILE);
      }

      // Check onboarding state
      setIsOnboarded(onboardedFlag === 'true');
    } catch (e) {
      console.warn('Failed to load stored session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phone: string) => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        return { success: true };
      } else {
        // Demo mode fallback
        return { success: true, message: 'OTP sent (Demo code: 123456)' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send OTP' };
    }
  };

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: 'sms',
        });
        if (error) throw error;
        if (data.user) {
          const newUser: User = {
            id: data.user.id,
            phone: data.user.phone,
            email: data.user.email,
            name: (data.user.user_metadata?.full_name as string) || 'Recallr User',
          };
          setUser(newUser);
          await AsyncStorage.setItem('@recallr_user', JSON.stringify(newUser));
        }
        return { success: true };
      } else {
        // Demo mode verification
        const demoUser: User = {
          id: DEMO_PROFILE.id,
          phone,
          name: 'Muskan Kapoor',
        };
        setUser(demoUser);
        setProfile(DEMO_PROFILE);
        await AsyncStorage.setItem('@recallr_user', JSON.stringify(demoUser));
        await AsyncStorage.setItem('@recallr_profile', JSON.stringify(DEMO_PROFILE));
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Invalid OTP code' };
    }
  };

  const loginWithGoogle = async () => {
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (error) throw error;
        return { success: true };
      } else {
        // In demo mode, sign in with demo profile
        await loginDemoUser();
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Google Sign In failed' };
    }
  };

  const loginDemoUser = async () => {
    const demoUser: User = {
      id: DEMO_PROFILE.id,
      name: DEMO_PROFILE.name,
      phone: DEMO_PROFILE.phone,
      email: DEMO_PROFILE.email,
    };
    setUser(demoUser);
    setProfile(DEMO_PROFILE);
    await AsyncStorage.setItem('@recallr_user', JSON.stringify(demoUser));
    await AsyncStorage.setItem('@recallr_profile', JSON.stringify(DEMO_PROFILE));
  };

  const completeOnboarding = async (starterCategoryNames?: string[]) => {
    setIsOnboarded(true);
    await AsyncStorage.setItem('@recallr_onboarded', 'true');
    if (starterCategoryNames && starterCategoryNames.length > 0) {
      await AsyncStorage.setItem(
        '@recallr_starter_categories',
        JSON.stringify(starterCategoryNames)
      );
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setIsOnboarded(false);
    await AsyncStorage.removeItem('@recallr_user');
    await AsyncStorage.removeItem('@recallr_profile');
    await AsyncStorage.removeItem('@recallr_onboarded');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);
    await AsyncStorage.setItem('@recallr_profile', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isOnboarded,
        isLoading,
        loginWithPhone,
        verifyPhoneOtp,
        loginWithGoogle,
        loginDemoUser,
        completeOnboarding,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
