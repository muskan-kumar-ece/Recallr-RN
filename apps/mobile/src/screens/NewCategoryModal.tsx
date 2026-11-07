import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Card, Button, PressableScale } from '../components/ui';
import {
  IconUsers,
  IconBuildingStore,
  IconBriefcase,
  IconHeart,
  IconStar,
  IconCheck,
} from '@tabler/icons-react-native';
import { useCreateCategory } from '@recallr/api';

export interface NewCategoryModalProps {
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
  onShowToast: (message: string) => void;
}

export const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  onClose,
  onCreate,
  onShowToast,
}) => {
  const { mutateAsync: createCategoryMutate, isPending: isCreating } = useCreateCategory();

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(colors.accent);
  const [selectedIconIdx, setSelectedIconIdx] = useState(0);

  const icons = [
    { component: IconUsers, name: 'users' },
    { component: IconBuildingStore, name: 'store' },
    { component: IconBriefcase, name: 'briefcase' },
    { component: IconHeart, name: 'heart' },
    { component: IconStar, name: 'star' },
  ];

  const categoryColors = [
    colors.accent,
    '#4F5BD5',
    '#1D9E75',
    '#D4537E',
    '#2B2B2B',
  ];

  const CurrentIcon = icons[selectedIconIdx]?.component || IconUsers;

  const handleCreate = async () => {
    if (!name.trim()) {
      onShowToast('Please enter a category name');
      return;
    }

    try {
      await createCategoryMutate({
        input: {
          name: name.trim(),
          color: selectedColor,
          icon: icons[selectedIconIdx]?.name || 'users',
        },
      });
      onShowToast(`Category "${name.trim()}" created`);
      onCreate(name.trim(), selectedColor);
    } catch (err: unknown) {
      onShowToast(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      />
      <View style={styles.sheetContainer}>
        <View style={styles.handle} />

        <Text style={styles.sheetTitle}>New category</Text>

        {/* Live Preview Card */}
        <Card style={styles.previewCard}>
          <View
            style={[
              styles.previewIconBox,
              { backgroundColor: selectedColor === colors.accent ? colors.accentTint : colors.fill },
            ]}
          >
            <CurrentIcon size={22} color={selectedColor} strokeWidth={2} />
          </View>
          <View>
            <Text style={styles.previewName}>{name || 'Category name'}</Text>
            <Text style={styles.previewCount}>0 people</Text>
          </View>
        </Card>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Clients, Tech Founders, Suppliers"
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
          />
        </View>

        {/* Icon Selector */}
        <Text style={styles.sectionLabel}>Icon</Text>
        <View style={styles.iconsRow}>
          {icons.map((item, idx) => {
            const isSelected = selectedIconIdx === idx;
            const IconComp = item.component;
            return (
              <PressableScale
                key={item.name}
                onPress={() => setSelectedIconIdx(idx)}
                haptic="selection"
                style={[
                  styles.iconSquare,
                  isSelected && styles.iconSquareActive,
                ]}
              >
                <IconComp
                  size={20}
                  color={isSelected ? colors.accent : colors.textSecondary}
                  strokeWidth={2}
                />
              </PressableScale>
            );
          })}
        </View>

        {/* Color Picker */}
        <Text style={styles.sectionLabel}>Color</Text>
        <View style={styles.colorsRow}>
          {categoryColors.map((c) => {
            const isSelected = selectedColor === c;
            return (
              <PressableScale
                key={c}
                onPress={() => setSelectedColor(c)}
                haptic="selection"
                style={[
                  styles.colorCircle,
                  { backgroundColor: c },
                  isSelected && styles.colorCircleSelected,
                ]}
              >
                {isSelected && (
                  <IconCheck size={14} color="#FFFFFF" strokeWidth={3} />
                )}
              </PressableScale>
            );
          })}
        </View>

        {/* Create Button */}
        <Button
          title={isCreating ? 'Creating...' : 'Create category'}
          variant="primary"
          size="md"
          onPress={handleCreate}
          disabled={isCreating}
          style={styles.createBtn}
        />
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
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.borderStrong,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    marginBottom: 16,
    gap: 12,
  },
  previewIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  previewCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    height: 48,
    backgroundColor: colors.background,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  iconSquareActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTintSoft,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 4,
  },
  createBtn: {
    marginTop: 8,
  },
});
