import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography, Layout } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  customIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  customIcon,
  style,
  textStyle,
  testID,
}) => {
  const getContainerStyle = (): StyleProp<ViewStyle> => {
    switch (variant) {
      case 'primary':
        return styles.primaryBtn;
      case 'secondary':
        return styles.secondaryBtn;
      case 'outline':
        return styles.outlineBtn;
      case 'danger':
        return styles.dangerBtn;
      case 'ghost':
        return styles.ghostBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'ghost':
        return styles.ghostText;
      default:
        return styles.primaryText;
    }
  };

  const getIconColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
        return Colors.accent;
      case 'secondary':
        return Colors.text;
      case 'ghost':
        return Colors.secondary;
      default:
        return '#FFFFFF';
    }
  };

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getIconColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {customIcon ? (
            <View style={styles.iconMargin}>{customIcon}</View>
          ) : leftIcon ? (
            <Ionicons
              name={leftIcon}
              size={18}
              color={getIconColor()}
              style={styles.iconMargin}
            />
          ) : null}
          <Text style={[styles.baseText, getTextStyle(), textStyle]}>
            {title}
          </Text>
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={18}
              color={getIconColor()}
              style={styles.rightIconMargin}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: Layout.btnHeight, // 50px pill button
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryBtn: {
    backgroundColor: Colors.card,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  secondaryText: {
    color: Colors.text,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  outlineText: {
    color: Colors.accent,
  },
  dangerBtn: {
    backgroundColor: Colors.danger,
  },
  dangerText: {
    color: '#FFFFFF',
  },
  ghostBtn: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: Colors.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  iconMargin: {
    marginRight: 8,
  },
  rightIconMargin: {
    marginLeft: 8,
  },
});
