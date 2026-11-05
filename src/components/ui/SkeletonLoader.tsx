import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, StyleProp, ViewStyle } from 'react-native';
import { Radius } from '../../constants/theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = Radius.sm,
  style,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const CardSkeleton: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <Skeleton width="40%" height={14} style={{ marginBottom: 12 }} />
      <Skeleton width="70%" height={22} style={{ marginBottom: 16 }} />
      <Skeleton width="90%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={14} />
    </View>
  );
};

export const ListRowSkeleton: React.FC = () => {
  return (
    <View style={styles.listRow}>
      <Skeleton width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={12} />
      </View>
      <Skeleton width={50} height={20} borderRadius={8} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E2DC',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.card,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 16,
    marginBottom: 12,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
});
