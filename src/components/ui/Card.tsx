import React from 'react';
import { StyleSheet, View, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radius, Layout } from '../../constants/theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  activeOpacity?: number;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  activeOpacity = 0.85,
  testID,
}) => {
  if (onPress) {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={[styles.card, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View testID={testID} style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    borderWidth: Layout.cardBorderWidth,
    borderColor: Colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
});
