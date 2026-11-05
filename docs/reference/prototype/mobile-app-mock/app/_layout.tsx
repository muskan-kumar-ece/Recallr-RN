import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { QuickAddModal } from '../src/components/QuickAddModal';
import { Colors } from '../src/constants/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const [quickAddVisible, setQuickAddVisible] = useState(false);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen
              name="settings/index"
              options={{
                headerShown: true,
                title: 'Settings',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.text,
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="search"
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="scan-card"
              options={{
                headerShown: false,
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="contact/new"
              options={{
                headerShown: true,
                title: 'New Contact',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.text,
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="contact/[id]"
              options={{
                headerShown: true,
                title: '',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.text,
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="notes/new"
              options={{
                headerShown: true,
                title: 'New Note',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.text,
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="categories/index"
              options={{
                headerShown: true,
                title: 'Categories',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.text,
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="my-card"
              options={{
                headerShown: true,
                title: 'My Card',
                headerStyle: { backgroundColor: Colors.background },
                headerTintColor: Colors.text,
                headerShadowVisible: false,
              }}
            />
          </Stack>

          {/* Global Quick Add Bottom Sheet */}
          <QuickAddModal
            visible={quickAddVisible}
            onClose={() => setQuickAddVisible(false)}
          />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
