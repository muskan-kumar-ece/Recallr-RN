import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@recallr/tokens';
import { Card, PressableScale } from '../components/ui';
import {
  IconScan,
  IconUserPlus,
  IconNotebook,
  IconAddressBook,
  IconChevronRight,
} from '@tabler/icons-react-native';

export interface QuickAddSheetProps {
  onClose: () => void;
  onScanCard: () => void;
  onAddContact: () => void;
  onNewNote: () => void;
  onImport: () => void;
}

export const QuickAddSheet: React.FC<QuickAddSheetProps> = ({
  onClose,
  onScanCard,
  onAddContact,
  onNewNote,
  onImport,
}) => {
  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />
      <View style={styles.sheetContainer}>
        <View style={styles.handle} />

        <Text style={styles.sheetTitle}>Quick Add</Text>

        <Card style={styles.menuCard}>
          <PressableScale
            onPress={() => {
              onClose();
              onScanCard();
            }}
            haptic="light"
            style={styles.menuRow}
          >
            <View style={styles.iconBox}>
              <IconScan size={20} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.menuTitle}>Scan Business Card</Text>
              <Text style={styles.menuDesc}>Auto-fill with OCR extraction</Text>
            </View>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => {
              onClose();
              onAddContact();
            }}
            haptic="light"
            style={styles.menuRow}
          >
            <View style={styles.iconBox}>
              <IconUserPlus size={20} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.menuTitle}>Add Person Manually</Text>
              <Text style={styles.menuDesc}>Create contact profile</Text>
            </View>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => {
              onClose();
              onNewNote();
            }}
            haptic="light"
            style={styles.menuRow}
          >
            <View style={styles.iconBox}>
              <IconNotebook size={20} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.menuTitle}>New Note & Reminder</Text>
              <Text style={styles.menuDesc}>Jot details or follow-up alert</Text>
            </View>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => {
              onClose();
              onImport();
            }}
            haptic="light"
            style={styles.menuRow}
          >
            <View style={styles.iconBox}>
              <IconAddressBook size={20} color={colors.accent} strokeWidth={2} />
            </View>
            <View style={styles.textCol}>
              <Text style={styles.menuTitle}>Import from Phone</Text>
              <Text style={styles.menuDesc}>Select contacts from device</Text>
            </View>
            <IconChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </PressableScale>
        </Card>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    fontFamily: 'Inter',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    minHeight: 52,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    fontFamily: 'Inter',
  },
  menuDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginLeft: 66,
  },
});
