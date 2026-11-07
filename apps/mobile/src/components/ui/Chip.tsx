import React from 'react';
import { StyleSheet, Text, StyleProp, ViewStyle, TextStyle, View } from 'react-native';
import { tokens } from '@recallr/tokens';
import { PressableScale } from './PressableScale';

export interface ChipProps {
  label: string;
  variant?: 'default' | 'selected' | 'outline' | 'outline-accent' | 'dashed' | 'tag';
  active?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  count?: number | string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  active,
  onPress,
  icon,
  count,
  style,
  textStyle,
  testID,
}) => {
  const isTag = variant === 'tag';
  const effectiveVariant = active ? 'selected' : variant === 'outline' ? 'outline-accent' : variant;

  const getContainerStyle = (): StyleProp<ViewStyle> => {
    switch (effectiveVariant) {
      case 'selected':
        return styles.selectedChip;
      case 'outline-accent':
        return styles.outlineAccentChip;
      case 'dashed':
        return styles.dashedChip;
      case 'tag':
        return styles.tagChip;
      default:
        return styles.defaultChip;
    }
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    switch (effectiveVariant) {
      case 'selected':
        return styles.selectedText;
      case 'outline-accent':
      case 'dashed':
        return styles.accentText;
      case 'tag':
        return styles.tagText;
      default:
        return styles.defaultText;
    }
  };

  const chipContent = (
    <View style={styles.innerRow}>
      {icon && <View style={isTag ? styles.iconTag : styles.iconChip}>{icon}</View>}
      <Text style={[getTextStyle(), textStyle]}>
        {label}
      </Text>
      {count !== undefined && (
        <Text style={[styles.countText, effectiveVariant === 'selected' ? styles.selectedCount : styles.defaultCount]}>
          {count}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale
        testID={testID}
        onPress={onPress}
        haptic="selection"
        style={[
          styles.base,
          isTag ? styles.tagBase : styles.chipBase,
          getContainerStyle(),
          style,
        ]}
      >
        {chipContent}
      </PressableScale>
    );
  }

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        isTag ? styles.tagBase : styles.chipBase,
        getContainerStyle(),
        style,
      ]}
    >
      {chipContent}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBase: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.chip,
    borderWidth: 0.5,
    borderColor: tokens.colors.border,
  },
  tagBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultChip: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.border,
  },
  selectedChip: {
    backgroundColor: tokens.colors.accent,
    borderColor: tokens.colors.accent,
  },
  outlineAccentChip: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.accent,
    borderWidth: 1,
  },
  dashedChip: {
    backgroundColor: tokens.colors.surface,
    borderColor: tokens.colors.accent,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  tagChip: {
    backgroundColor: tokens.colors.accentTint,
  },
  defaultText: {
    fontSize: tokens.typography.small.size,
    color: tokens.colors.text,
    fontWeight: '500',
  },
  selectedText: {
    fontSize: tokens.typography.small.size,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  accentText: {
    fontSize: tokens.typography.small.size,
    color: tokens.colors.accent,
    fontWeight: '500',
  },
  tagText: {
    fontSize: tokens.typography.caption.size,
    color: tokens.colors.accentDark,
    fontWeight: '500',
  },
  countText: {
    marginLeft: 6,
    fontSize: 11,
    fontWeight: '500',
  },
  defaultCount: {
    color: tokens.colors.textSecondary,
  },
  selectedCount: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  iconChip: {
    marginRight: 6,
  },
  iconTag: {
    marginRight: 4,
  },
});
