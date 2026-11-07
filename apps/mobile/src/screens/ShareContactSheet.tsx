import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, PressableScale } from '../components/ui';
import {
  IconCheck,
  IconLock,
  IconBrandWhatsapp,
  IconMessageCircle,
  IconCopy,
  IconAddressBook,
} from '@tabler/icons-react-native';

export interface ShareContactSheetProps {
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const ShareContactSheet: React.FC<ShareContactSheetProps> = ({
  onClose,
  onShowToast,
}) => {
  const [includeName, setIncludeName] = useState(true);
  const [includePhone, setIncludePhone] = useState(true);
  const [includeEmail, setIncludeEmail] = useState(true);
  const [includeAddress, setIncludeAddress] = useState(false);

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />
      <View style={styles.sheetContainer}>
        <View style={styles.handle} />

        <Text style={styles.title}>Share Ramesh Kumar</Text>

        {/* Inclusion Checklist Card */}
        <Card style={styles.checkCard}>
          <PressableScale
            onPress={() => setIncludeName(!includeName)}
            haptic="selection"
            style={styles.checkRow}
          >
            <View
              style={[
                styles.checkbox,
                includeName && styles.checkboxActive,
              ]}
            >
              {includeName && (
                <IconCheck size={12} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
            <Text style={styles.checkLabel}>Name and company</Text>
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => setIncludePhone(!includePhone)}
            haptic="selection"
            style={styles.checkRow}
          >
            <View
              style={[
                styles.checkbox,
                includePhone && styles.checkboxActive,
              ]}
            >
              {includePhone && (
                <IconCheck size={12} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
            <Text style={styles.checkLabel}>Phone</Text>
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => setIncludeEmail(!includeEmail)}
            haptic="selection"
            style={styles.checkRow}
          >
            <View
              style={[
                styles.checkbox,
                includeEmail && styles.checkboxActive,
              ]}
            >
              {includeEmail && (
                <IconCheck size={12} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
            <Text style={styles.checkLabel}>Email</Text>
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => setIncludeAddress(!includeAddress)}
            haptic="selection"
            style={styles.checkRow}
          >
            <View
              style={[
                styles.checkbox,
                includeAddress && styles.checkboxActive,
              ]}
            >
              {includeAddress && (
                <IconCheck size={12} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
            <Text style={styles.checkLabel}>Address</Text>
          </PressableScale>

          <View style={styles.divider} />

          <View style={styles.privacyRow}>
            <IconLock size={14} color={colors.textMuted} strokeWidth={2} />
            <Text style={styles.privacyText}>
              Your notes and files stay private
            </Text>
          </View>
        </Card>

        {/* 4 Sharing Action Tiles */}
        <View style={styles.actionGrid}>
          <PressableScale
            onPress={() => {
              onShowToast('Shared to WhatsApp');
              onClose();
            }}
            haptic="light"
            style={styles.actionCol}
          >
            <View style={styles.actionTileBox}>
              <IconBrandWhatsapp size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </PressableScale>

          <PressableScale
            onPress={() => {
              onShowToast('Shared via Messages');
              onClose();
            }}
            haptic="light"
            style={styles.actionCol}
          >
            <View style={styles.actionTileBox}>
              <IconMessageCircle size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Messages</Text>
          </PressableScale>

          <PressableScale
            onPress={() => {
              onShowToast('Contact info copied to clipboard');
              onClose();
            }}
            haptic="light"
            style={styles.actionCol}
          >
            <View style={styles.actionTileBox}>
              <IconCopy size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Copy</Text>
          </PressableScale>

          <PressableScale
            onPress={() => {
              onShowToast('Exported .vcf Contact file');
              onClose();
            }}
            haptic="light"
            style={styles.actionCol}
          >
            <View style={styles.actionTileBox}>
              <IconAddressBook size={22} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.actionLabel}>Contact file</Text>
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    minHeight: 48,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginHorizontal: 14,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.fill,
    gap: 8,
  },
  privacyText: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: 'Inter',
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  actionCol: {
    alignItems: 'center',
    gap: 8,
  },
  actionTileBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    fontFamily: 'Inter',
  },
});
