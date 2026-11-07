import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle, Platform } from 'react-native';
import { tokens } from '@recallr/tokens';
import { PressableScale } from './PressableScale';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  selected?: boolean;
  flat?: boolean;
  onPress?: () => void;
  activeOpacity?: number;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  selected = false,
  flat = false,
  onPress,
  testID,
}) => {
  const paddingStyles = {
    none: 0,
    sm: 10,
    md: 14,
    lg: 20,
  }[padding];

  const cardStyle = [
    styles.card,
    !flat && styles.cardShadow,
    paddingStyles > 0 && { padding: paddingStyles },
    selected && styles.selected,
    style,
  ];

  if (onPress) {
    return (
      <PressableScale
        testID={testID ? `${testID}-pressable` : undefined}
        onPress={onPress}
        haptic="light"
        style={cardStyle}
      >
        {children}
      </PressableScale>
    );
  }

  return (
    <View testID={testID} style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 0.5,
    borderColor: tokens.colors.border,
    position: 'relative',
    overflow: 'hidden',
  },
  cardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: tokens.shadows.shadowCard,
      },
    }),
  },
  selected: {
    backgroundColor: tokens.colors.accentTintSoft,
    borderColor: tokens.colors.accent,
    borderWidth: 1,
  },
});
