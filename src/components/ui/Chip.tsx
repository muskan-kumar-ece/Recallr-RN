import React from 'react';
import { StyleSheet, Text, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../../constants/theme';

export interface ChipProps {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  active = false,
  onPress,
  icon,
  count,
  style,
  textStyle,
  testID,
}) => {
  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={active ? '#FFFFFF' : Colors.secondary}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          active ? styles.labelActive : styles.labelInactive,
          textStyle,
        ]}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text
          style={[
            styles.count,
            active ? styles.countActive : styles.countInactive,
          ]}
        >
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
  },
  chipInactive: {
    backgroundColor: Colors.chipBg,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.chipActiveBg,
    borderColor: Colors.chipActiveBg,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  labelInactive: {
    color: Colors.text,
  },
  labelActive: {
    color: Colors.chipActiveText,
  },
  count: {
    marginLeft: 6,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  countInactive: {
    color: Colors.secondary,
  },
  countActive: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
