import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Animated } from 'react-native';
import { colors, radius } from '@recallr/tokens';

export interface SkeletonProps {
  variant?: 'rect' | 'circle' | 'text' | 'card' | 'row';
  width?: number | string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  style,
}) => {
  const opacity = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  if (variant === 'row') {
    return (
      <View style={[styles.rowContainer, style]}>
        <Animated.View style={[styles.rowAvatar, { opacity }]} />
        <View style={styles.rowTextCol}>
          <Animated.View style={[styles.rowTitle, { opacity }]} />
          <Animated.View style={[styles.rowSubtitle, { opacity }]} />
        </View>
      </View>
    );
  }

  const customStyle = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
  };

  return (
    <Animated.View
      style={[
        styles.base,
        variant === 'circle' && styles.circle,
        variant === 'rect' && styles.rect,
        variant === 'text' && styles.text,
        variant === 'card' && styles.card,
        customStyle,
        { opacity },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.fill,
  },
  circle: {
    borderRadius: 9999,
  },
  rect: {
    borderRadius: 6,
  },
  text: {
    height: 12,
    borderRadius: 4,
  },
  card: {
    borderRadius: radius.card,
    height: 96,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.fill,
    marginRight: 12,
  },
  rowTextCol: {
    flex: 1,
    gap: 8,
  },
  rowTitle: {
    width: '40%',
    height: 14,
    borderRadius: 4,
    backgroundColor: colors.fill,
  },
  rowSubtitle: {
    width: '60%',
    height: 10,
    borderRadius: 4,
    backgroundColor: colors.fill,
  },
});
