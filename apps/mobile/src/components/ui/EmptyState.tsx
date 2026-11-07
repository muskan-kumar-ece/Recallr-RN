import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { Button } from './Button';
import { IconAlertTriangle } from '@tabler/icons-react-native';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
    icon?: React.ReactNode;
  };
  isError?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  isError = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconTile,
          {
            backgroundColor: isError ? colors.dangerTint : colors.accentTint,
          },
        ]}
      >
        {icon || (
          isError ? (
            <IconAlertTriangle size={26} color={colors.danger} />
          ) : null
        )}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {(primaryAction || secondaryAction) && (
        <View style={styles.actionContainer}>
          {primaryAction && (
            <Button
              variant="primary"
              size="md"
              onPress={primaryAction.onPress}
              icon={primaryAction.icon}
              style={styles.actionButton}
            >
              {primaryAction.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              size="md"
              onPress={secondaryAction.onPress}
              icon={secondaryAction.icon}
              style={styles.actionButton}
            >
              {secondaryAction.label}
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconTile: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    maxWidth: 280,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 280,
    gap: 10,
  },
  actionButton: {
    width: '100%',
  },
});
