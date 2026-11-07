import React from 'react';
import {
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import { colors } from '@recallr/tokens';
import { PressableScale } from './PressableScale';

export interface ToggleProps {
  checked?: boolean;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  onValueChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  value,
  onChange,
  onValueChange,
  disabled = false,
  style,
}) => {
  const isChecked = checked ?? value ?? false;
  const handleChange = onValueChange ?? onChange;
  const animatedValue = React.useRef(new Animated.Value(isChecked ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isChecked ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [isChecked, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  return (
    <PressableScale
      disabled={disabled}
      haptic="selection"
      onPress={() => handleChange?.(!isChecked)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.track,
        {
          backgroundColor: isChecked ? colors.accent : '#D6D3CC',
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.knob,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 38,
    height: 22,
    borderRadius: 11,
    padding: 2,
    justifyContent: 'center',
  },
  knob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
