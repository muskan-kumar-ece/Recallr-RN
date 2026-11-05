import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@recallr/tokens';

export default function IndexScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.corner} />
        <Text style={styles.title}>Recallr Mobile</Text>
        <Text style={styles.subtitle}>Phase M0 Monorepo Scaffolded</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing.screenPadding,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.card,
    padding: 24,
    borderWidth: 0.5,
    borderColor: tokens.colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 56,
    height: 44,
    backgroundColor: tokens.colors.accent,
    borderTopLeftRadius: 40,
  },
  title: {
    fontSize: tokens.typography.title.size,
    fontWeight: '500',
    color: tokens.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.textSecondary,
  },
});
