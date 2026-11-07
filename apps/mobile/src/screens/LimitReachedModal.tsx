import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Button, PressableScale } from '../components/ui';
import { IconScan } from '@tabler/icons-react-native';

export interface LimitReachedModalProps {
  onSeePro: () => void;
  onAddManually: () => void;
  onClose: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  onSeePro,
  onAddManually,
  onClose,
}) => {
  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />
      <View style={styles.sheetContainer}>
        <View style={styles.handle} />

        <View style={styles.iconBox}>
          <IconScan size={28} color={colors.accent} strokeWidth={2} />
        </View>

        <Text style={styles.title}>You've used all 10 scans this month</Text>
        <Text style={styles.subtitle}>
          Go Pro for unlimited scans, or add this contact manually for free.
        </Text>

        <View style={styles.btnCol}>
          <Button
            title="See Recallr Pro"
            variant="primary"
            size="md"
            onPress={onSeePro}
            style={styles.btn}
          />
          <Button
            title="Add manually"
            variant="outline"
            size="md"
            onPress={onAddManually}
            style={styles.btn}
          />
          <PressableScale
            onPress={onClose}
            haptic="light"
            style={styles.laterBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.laterText}>Maybe later</Text>
          </PressableScale>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 999,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: 20,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  btnCol: {
    width: '100%',
    gap: 12,
  },
  btn: {
    width: '100%',
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  laterText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
});
