import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../../constants/theme';

export interface OrangeCornerProps {
  icon?: keyof typeof Ionicons.glyphMap;
  count?: number | string;
  children?: React.ReactNode;
  width?: number;
  height?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconSize?: number;
  iconColor?: string;
  testID?: string;
}

export const OrangeCorner: React.FC<OrangeCornerProps> = ({
  icon,
  count,
  children,
  width = 68,
  height = 52,
  onPress,
  style,
  textStyle,
  iconSize = 22,
  iconColor = '#FFFFFF',
  testID,
}) => {
  const content = (
    <View
      style={[
        styles.corner,
        {
          width,
          height,
        },
        style,
      ]}
    >
      {children ? (
        children
      ) : count !== undefined ? (
        <Text style={[styles.countText, textStyle]}>{count}</Text>
      ) : icon ? (
        <Ionicons name={icon} size={iconSize} color={iconColor} style={styles.iconShift} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={0.8}
        onPress={onPress}
        style={[styles.container, { width, height }]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View pointerEvents="none" testID={testID} style={[styles.container, { width, height }]}>
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
    backgroundColor: Colors.accent,
    borderTopLeftRadius: Radius.cornerCut, // 40px
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
    paddingTop: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  iconShift: {
    marginLeft: 4,
  },
});
