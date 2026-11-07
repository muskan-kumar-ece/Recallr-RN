import React from 'react';
import { StyleSheet, View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { tokens } from '@recallr/tokens';
import { PressableScale } from './PressableScale';

export interface OrangeCornerProps {
  size?: 'sm' | 'md' | 'lg';
  count?: number | string;
  icon?: React.ReactNode;
  color?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const OrangeCorner: React.FC<OrangeCornerProps> = ({
  size = 'md',
  count,
  icon,
  color = tokens.colors.accent,
  children,
  onPress,
  style,
  textStyle,
  testID,
}) => {
  const sizeConfig = {
    sm: { width: 48, height: 38, radius: 36, paddingRight: 10, paddingBottom: 8 },
    md: { width: 56, height: 44, radius: 40, paddingRight: 12, paddingBottom: 10 },
    lg: { width: 78, height: 58, radius: 48, paddingRight: 14, paddingBottom: 12 },
  }[size];

  const content = (
    <View
      style={[
        styles.corner,
        {
          width: sizeConfig.width,
          height: sizeConfig.height,
          borderTopLeftRadius: sizeConfig.radius,
          backgroundColor: color,
          paddingRight: sizeConfig.paddingRight,
          paddingBottom: sizeConfig.paddingBottom,
        },
        style,
      ]}
    >
      {children ? (
        children
      ) : count !== undefined ? (
        <Text style={[styles.countText, textStyle]}>{count}</Text>
      ) : icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <View style={[styles.container, { width: sizeConfig.width, height: sizeConfig.height }]}>
        <PressableScale
          testID={testID}
          onPress={onPress}
          haptic="light"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {content}
        </PressableScale>
      </View>
    );
  }

  return (
    <View pointerEvents="none" testID={testID} style={[styles.container, { width: sizeConfig.width, height: sizeConfig.height }]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  corner: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 14,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
