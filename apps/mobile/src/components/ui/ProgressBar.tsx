import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@recallr/tokens';

export interface ProgressBarProps {
  value?: number; // 0 to 100
  progress?: number; // 0 to 1 or 0 to 100
  barColor?: string;
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  progress,
  barColor,
  color,
  height = 6,
  style,
}) => {
  const raw = value !== undefined ? value : progress !== undefined ? (progress <= 1 ? progress * 100 : progress) : 0;
  const clamped = Math.min(100, Math.max(0, raw));
  const activeColor = color || barColor || colors.accent;

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }, style]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: activeColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    height: 6,
    backgroundColor: colors.fill,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
