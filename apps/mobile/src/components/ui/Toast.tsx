import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { PressableScale } from './PressableScale';
import { colors } from '@recallr/tokens';

export interface ToastProps {
  message: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  isVisible?: boolean;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  actionText,
  actionLabel,
  onAction,
  isVisible = true,
  style,
}) => {
  if (!isVisible) return null;
  const label = actionLabel || actionText || 'Undo';

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.message} numberOfLines={1}>
        {message}
      </Text>
      {onAction && (
        <PressableScale
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.action}>{label}</Text>
        </PressableScale>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 84,
    alignSelf: 'center',
    backgroundColor: '#2B2B2B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minWidth: 280,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 1000,
  },
  message: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 12,
  },
  action: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    color: colors.toastAction,
  },
});
