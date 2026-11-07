import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '@recallr/tokens';
import { IconAlertTriangle, IconWifiOff } from '@tabler/icons-react-native';

export interface BannerProps {
  variant?: 'warning' | 'offline';
  message: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Banner: React.FC<BannerProps> = ({
  variant = 'warning',
  message,
  action,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.icon}>
        {variant === 'offline' ? (
          <IconWifiOff size={16} color={colors.accent} />
        ) : (
          <IconAlertTriangle size={16} color={colors.accent} />
        )}
      </View>

      <View style={styles.textContainer}>
        {typeof message === 'string' ? (
          <Text style={styles.message}>{message}</Text>
        ) : (
          message
        )}
      </View>

      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.bannerBg,
    borderRadius: 14,
  },
  icon: {
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.bannerText,
    lineHeight: 16,
  },
  actionContainer: {
    marginLeft: 8,
  },
});
