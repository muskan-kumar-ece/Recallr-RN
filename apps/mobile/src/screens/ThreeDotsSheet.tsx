import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors } from '@recallr/tokens';
import { Card, PressableScale } from '../components/ui';
import {
  IconPencil,
  IconShare,
  IconArrowsExchange,
  IconTrash,
} from '@tabler/icons-react-native';

export interface ThreeDotsSheetProps {
  onClose: () => void;
  onEdit: () => void;
  onShare: () => void;
  onMerge: () => void;
  onDelete: () => void;
}

export const ThreeDotsSheet: React.FC<ThreeDotsSheetProps> = ({
  onClose,
  onEdit,
  onShare,
  onMerge,
  onDelete,
}) => {
  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />
      <View style={styles.sheetContainer}>
        <View style={styles.handle} />

        <Text style={styles.sheetTitle}>Contact Options</Text>

        <Card style={styles.menuCard}>
          <PressableScale
            onPress={() => {
              onClose();
              onEdit();
            }}
            haptic="light"
            style={styles.menuRow}
          >
            <View style={styles.iconBox}>
              <IconPencil size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.menuLabel}>Edit Contact</Text>
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => {
              onClose();
              onShare();
            }}
            haptic="light"
            style={styles.menuRow}
          >
            <View style={styles.iconBox}>
              <IconShare size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.menuLabel}>Share Contact</Text>
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => {
              onClose();
              onMerge();
            }}
            haptic="light"
            style={styles.menuRow}
          >
            <View style={styles.iconBox}>
              <IconArrowsExchange size={18} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={styles.menuLabel}>Merge Duplicates</Text>
          </PressableScale>

          <View style={styles.divider} />

          <PressableScale
            onPress={() => {
              onClose();
              onDelete();
            }}
            haptic="warning"
            style={styles.menuRow}
          >
            <View style={[styles.iconBox, { backgroundColor: colors.dangerTint }]}>
              <IconTrash size={18} color={colors.danger} strokeWidth={2} />
            </View>
            <Text style={[styles.menuLabel, { color: colors.danger }]}>
              Delete Contact
            </Text>
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
    minHeight: 48,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    fontFamily: 'Inter',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.divider,
    marginLeft: 62,
  },
});
