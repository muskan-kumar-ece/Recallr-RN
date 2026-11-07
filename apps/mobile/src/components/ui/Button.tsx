import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { tokens } from '@recallr/tokens';
import { PressableScale } from './PressableScale';

export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'text' | 'danger';

export interface ButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  testID,
}) => {
  const isSmall = size === 'sm';
  const effectiveLeftIcon = leftIcon || icon;
  const content = children || title;
  const lastPressRef = useRef<number>(0);

  const handlePress = () => {
    if (disabled || loading) return;
    const now = Date.now();
    // Ignore double taps within 400ms
    if (now - lastPressRef.current < 400) return;
    lastPressRef.current = now;
    onPress?.();
  };

  const getContainerStyle = (): StyleProp<ViewStyle> => {
    switch (variant) {
      case 'primary':
        return styles.primaryBtn;
      case 'outline':
        return styles.outlineBtn;
      case 'secondary':
        return styles.secondaryBtn;
      case 'text':
        return styles.textBtn;
      case 'danger':
        return styles.dangerBtn;
      default:
        return styles.primaryBtn;
    }
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'outline':
        return styles.outlineText;
      case 'secondary':
        return styles.secondaryText;
      case 'text':
        return styles.linkText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <PressableScale
      testID={testID}
      onPress={handlePress}
      disabled={disabled || loading}
      haptic={variant === 'danger' ? 'warning' : 'light'}
      style={[
        styles.base,
        isSmall ? styles.smallBase : styles.mediumBase,
        getContainerStyle(),
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      <View style={styles.innerContainer}>
        {/* Invisible or visible content to preserve exact width */}
        <View style={[styles.contentRow, loading && styles.hiddenContent]}>
          {effectiveLeftIcon && <View style={styles.iconLeft}>{effectiveLeftIcon}</View>}
          {typeof content === 'string' ? (
            <Text style={[styles.baseText, getTextStyle(), textStyle]}>
              {content}
            </Text>
          ) : (
            content
          )}
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>

        {/* Centered spinner overlay without changing button dimensions */}
        {loading && (
          <View style={styles.spinnerOverlay} pointerEvents="none">
            <ActivityIndicator
              color={variant === 'primary' ? '#FFFFFF' : tokens.colors.accent}
              size="small"
            />
          </View>
        )}
      </View>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: 44,
  },
  innerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mediumBase: {
    height: 50,
    borderRadius: tokens.radius.button,
    paddingHorizontal: 22,
  },
  smallBase: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenContent: {
    opacity: 0,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseText: {
    fontSize: tokens.typography.body.size,
    fontWeight: '500',
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: tokens.colors.accent,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  outlineBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: tokens.colors.accent,
  },
  outlineText: {
    color: tokens.colors.accent,
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: tokens.colors.border,
  },
  secondaryText: {
    color: tokens.colors.text,
  },
  textBtn: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  linkText: {
    color: tokens.colors.accent,
  },
  dangerBtn: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  dangerText: {
    color: tokens.colors.danger,
  },
  disabled: {
    backgroundColor: tokens.colors.fill,
    borderColor: 'transparent',
    opacity: 0.75,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
