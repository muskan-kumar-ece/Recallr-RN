import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { tokens } from '@recallr/tokens';
import { hapticLight, hapticSelection, hapticSuccess, hapticWarning } from '../../utils/haptics';

export type HapticType = 'light' | 'selection' | 'success' | 'warning' | 'none';

export interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  activeOpacity?: number;
  activeBackgroundColor?: string;
  haptic?: HapticType;
  minHeight?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  style,
  activeScale = tokens.press.pressedScale, // 0.97
  activeOpacity = tokens.press.pressedOpacity, // 0.90
  activeBackgroundColor,
  haptic = 'none',
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const triggerHaptic = () => {
    if (disabled || haptic === 'none') return;
    switch (haptic) {
      case 'light':
        hapticLight();
        break;
      case 'selection':
        hapticSelection();
        break;
      case 'success':
        hapticSuccess();
        break;
      case 'warning':
        hapticWarning();
        break;
    }
  };

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!disabled) {
      if (!reducedMotion) {
        scale.value = withTiming(activeScale, { duration: tokens.press.pressInDuration });
      }
      opacity.value = withTiming(activeOpacity, { duration: tokens.press.pressInDuration });
      triggerHaptic();
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (!disabled) {
      if (!reducedMotion) {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }
      opacity.value = withTiming(1, { duration: 120 });
    }
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      android_ripple={{
        color: 'rgba(0, 0, 0, 0.05)',
        borderless: false,
      }}
      style={[
        style,
        animatedStyle,
      ]}
      {...props}
    >
      {({ pressed }) => (
        <Animated.View
          style={[
            { width: '100%' },
            pressed && activeBackgroundColor ? { backgroundColor: activeBackgroundColor } : null,
          ]}
        >
          {typeof children === 'function' ? children({ pressed }) : children}
        </Animated.View>
      )}
    </AnimatedPressable>
  );
};
