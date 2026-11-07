import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '@recallr/tokens';
import { IconCamera } from '@tabler/icons-react-native';
import { useStorageDownloadUrl } from '@recallr/api';

export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const SIZES = {
  xs: { size: 32, fontSize: 12, badgeSize: 14, badgeIconSize: 8 },
  sm: { size: 40, fontSize: 14, badgeSize: 18, badgeIconSize: 10 },
  md: { size: 48, fontSize: 16, badgeSize: 20, badgeIconSize: 12 },
  lg: { size: 64, fontSize: 20, badgeSize: 24, badgeIconSize: 14 },
  xl: { size: 80, fontSize: 24, badgeSize: 28, badgeIconSize: 16 },
};

export const Avatar: React.FC<AvatarProps> = ({
  name = '',
  src,
  size = 'sm',
  showBadge = false,
  badgeIcon,
  style,
}) => {
  const { data: storageSrc } = useStorageDownloadUrl(src && !/^https:\/\//i.test(src) ? src : '');
  const resolvedSrc = src && /^https:\/\//i.test(src) ? src : storageSrc;
  const currentSize = SIZES[size] || SIZES.sm;

  const initials = name
    ? name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <View
      style={[
        styles.container,
        {
          width: currentSize.size,
          height: currentSize.size,
          borderRadius: currentSize.size / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: currentSize.size,
            height: currentSize.size,
            borderRadius: currentSize.size / 2,
          },
        ]}
      >
        {resolvedSrc ? (
          <Image
            source={{ uri: resolvedSrc }}
            style={{ width: currentSize.size, height: currentSize.size }}
            resizeMode="cover"
          />
        ) : (
          <Text
            style={[
              styles.initials,
              { fontSize: currentSize.fontSize, color: colors.accent },
            ]}
          >
            {initials}
          </Text>
        )}
      </View>

      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: currentSize.badgeSize,
              height: currentSize.badgeSize,
              borderRadius: currentSize.badgeSize / 2,
            },
          ]}
        >
          {badgeIcon || (
            <IconCamera
              size={currentSize.badgeIconSize}
              color={colors.surface}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  inner: {
    backgroundColor: colors.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
});
