import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors } from '@recallr/tokens';
import { PressableScale } from './PressableScale';

export interface FieldRowProps {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  flagged?: boolean;
  showDivider?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  label,
  value,
  icon,
  flagged = false,
  showDivider = true,
  onPress,
  style,
  children,
}) => {
  const content = (
    <View
      style={[
        styles.row,
        showDivider && styles.divider,
        flagged && styles.flaggedRow,
        style,
      ]}
    >
      <View style={styles.labelCol}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.valueCol}>
        {children || (
          typeof value === 'string' ? (
            <Text style={styles.value} numberOfLines={1}>
              {value}
            </Text>
          ) : (
            value
          )
        )}
      </View>

      {flagged && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CHECK</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress}>
        {content}
      </PressableScale>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    backgroundColor: colors.surface,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  flaggedRow: {
    backgroundColor: colors.accentTintSoft,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: colors.textSecondary,
  },
  valueCol: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: colors.text,
  },
  badge: {
    marginLeft: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    color: colors.surface,
    letterSpacing: 0.5,
  },
});
