import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Typography } from '../../src/constants/theme';
import { QuickAddModal } from '../../src/components/QuickAddModal';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: Colors.muted,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0.5,
            borderTopColor: Colors.border,
            height: Platform.OS === 'ios' ? 64 + insets.bottom : 64,
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.04,
            shadowRadius: 6,
          },
          tabBarLabelStyle: {
            fontSize: Typography.sizes.xs,
            fontWeight: Typography.weights.medium,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={22}
                color={String(color)}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="people"
          options={{
            title: 'People',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={22}
                color={String(color)}
              />
            ),
          }}
        />

        {/* Center Quick Add (+) Button */}
        <Tabs.Screen
          name="quick-add"
          listeners={{
            tabPress: (e) => {
              // Prevent standard tab navigation and open Bottom Sheet
              e.preventDefault();
              setQuickAddOpen(true);
            },
          }}
          options={{
            title: '',
            tabBarIcon: () => (
              <View style={styles.centerPlusButton}>
                <Ionicons name="add" size={26} color="#FFFFFF" />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />

        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'document-text' : 'document-text-outline'}
                size={22}
                color={String(color)}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="ask-ai"
          options={{
            title: 'Ask AI',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'sparkles' : 'sparkles-outline'}
                size={22}
                color={String(color)}
              />
            ),
          }}
        />
      </Tabs>

      {/* Global Quick Add Bottom Sheet */}
      <QuickAddModal
        visible={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  centerPlusButton: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 14 : 16,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
