import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@recallr/tokens';
import { PressableScale } from './PressableScale';

export interface IconTileProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  bgColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const SIZES = {
  sm: { size: 32, borderRadius: 10 },
  md: { size: 40, borderRadius: 12 },
  lg: { size: 48, borderRadius: 14 },
  xl: { size: 56, borderRadius: 16 },
};

export const IconTile: React.FC<IconTileProps> = ({
  icon,
  size = 'md',
  bgColor,
  onPress,
  style,
}) => {
  const currentSize = SIZES[size] || SIZES.md;

  const content = (
    <View
      style={[
        styles.tile,
        {
          width: currentSize.size,
          height: currentSize.size,
          borderRadius: currentSize.borderRadius,
          backgroundColor: bgColor || colors.accentTint,
        },
        style,
      ]}
    >
      {icon}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        haptic="light"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {content}
      </PressableScale>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
