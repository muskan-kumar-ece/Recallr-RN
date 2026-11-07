import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, Button } from '../components/ui';
import {
  IconUsers,
  IconScan,
  IconAlertTriangle,
  IconRefresh,
  IconCloudOff,
} from '@tabler/icons-react-native';

export interface SharedStatesScreenProps {
  onScanCard: () => void;
  onAddManually: () => void;
  onRetry: () => void;
  onUndo: () => void;
}

export const SharedStatesScreen: React.FC<SharedStatesScreenProps> = ({
  onScanCard,
  onAddManually,
  onRetry,
  onUndo,
}) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenHeading}>Shared States & Edge Cases</Text>

      {/* 1. Empty State */}
      <Text style={styles.stateTitle}>Empty (People list)</Text>
      <Card style={styles.emptyCard}>
        <View style={styles.emptyIconBox}>
          <IconUsers size={28} color={colors.accent} strokeWidth={1.8} />
        </View>
        <Text style={styles.emptyHeading}>No people yet</Text>
        <Text style={styles.emptyDesc}>
          Scan a business card to save your first contact.
        </Text>
        <View style={styles.emptyBtnRow}>
          <Button
            title="Scan card"
            variant="primary"
            size="sm"
            leftIcon={<IconScan size={16} color="#FFFFFF" />}
            onPress={onScanCard}
            style={styles.stateBtn}
          />
          <Button
            title="Add manually"
            variant="outline"
            size="sm"
            onPress={onAddManually}
            style={styles.stateBtn}
          />
        </View>
      </Card>

      {/* 2. Loading State */}
      <Text style={styles.stateTitle}>Loading</Text>
      <Card style={styles.skeletonCard}>
        {[1, 2, 3].map((i) => (
          <View key={i}>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonAvatar} />
              <View style={styles.skeletonLines}>
                <View
                  style={[
                    styles.skeletonLine,
                    { width: i === 1 ? '70%' : i === 2 ? '50%' : '60%' },
                  ]}
                />
                <View
                  style={[
                    styles.skeletonLine,
                    { width: i === 1 ? '90%' : i === 2 ? '80%' : '85%' },
                  ]}
                />
              </View>
            </View>
            {i < 3 && <View style={styles.divider} />}
          </View>
        ))}
      </Card>

      {/* 3. Offline State */}
      <Text style={styles.stateTitle}>Offline</Text>
      <View style={styles.offlineBanner}>
        <IconCloudOff size={20} color={colors.accent} strokeWidth={2} />
        <Text style={styles.offlineText}>
          You're offline. Your changes will sync when you're back online.
        </Text>
      </View>

      {/* 4. Error State */}
      <Text style={styles.stateTitle}>Error</Text>
      <Card style={styles.errorCard}>
        <View style={styles.errorIconBox}>
          <IconAlertTriangle size={28} color={colors.danger} strokeWidth={2} />
        </View>
        <Text style={styles.errorHeading}>Couldn't load your people</Text>
        <Text style={styles.errorDesc}>Check your connection and try again.</Text>
        <Button
          title="Try again"
          variant="primary"
          size="sm"
          leftIcon={<IconRefresh size={16} color="#FFFFFF" />}
          onPress={onRetry}
          style={styles.retryBtn}
        />
      </Card>

      {/* 5. Undo Toast */}
      <Text style={styles.stateTitle}>Undo toast</Text>
      <View style={styles.undoToastBox}>
        <Text style={styles.undoToastText}>Contact deleted</Text>
        <Text onPress={onUndo} style={styles.undoActionText}>
          Undo
        </Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  screenHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    fontFamily: 'Inter',
    marginBottom: 8,
    marginTop: 8,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  stateBtn: {
    minWidth: 120,
  },
  skeletonCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fill,
  },
  skeletonLines: {
    flex: 1,
    gap: 6,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.fill,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.accentTint,
    gap: 12,
    marginBottom: 16,
  },
  offlineText: {
    fontSize: 13,
    color: colors.accentDark,
    fontFamily: 'Inter',
    flex: 1,
    lineHeight: 18,
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.dangerTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
    marginBottom: 6,
  },
  errorDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginBottom: 18,
  },
  retryBtn: {
    minWidth: 130,
  },
  undoToastBox: {
    height: 50,
    borderRadius: radius.card,
    backgroundColor: colors.toastBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  undoToastText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  undoActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
    fontFamily: 'Inter',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
  },
});
