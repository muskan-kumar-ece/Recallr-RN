import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, tokens } from '@recallr/tokens';
import { IconChevronRight } from '@tabler/icons-react-native';
import { PressableScale } from './PressableScale';

export interface ListRowProps {
  leading?: React.ReactNode;
  left?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  followUpDue?: boolean;
  tag?: string;
  tagColor?: string;
  trailing?: React.ReactNode;
  right?: React.ReactNode;
  showChevron?: boolean;
  showDivider?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ListRow: React.FC<ListRowProps> = ({
  leading,
  left,
  title,
  subtitle,
  followUpDue = false,
  tag,
  trailing,
  right,
  showChevron = false,
  showDivider = true,
  clickable = true,
  onClick,
  onPress,
  style,
}) => {
  const effectiveLeading = leading || left;
  const effectiveTrailing = trailing || right;
  const handlePress = onPress || onClick;
  const isInteractive = clickable && !!handlePress;

  const content = (
    <View
      style={[
        styles.row,
        showDivider && styles.divider,
        style,
      ]}
    >
      {effectiveLeading && <View style={styles.leading}>{effectiveLeading}</View>}

      <View style={styles.center}>
        {typeof title === 'string' ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          title
        )}

        {subtitle && (
          <View style={styles.subtitleRow}>
            {followUpDue && <View style={styles.dueDot} />}
            {typeof subtitle === 'string' ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </View>
        )}
      </View>

      {tag && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      )}

      {effectiveTrailing && <View style={styles.trailing}>{effectiveTrailing}</View>}

      {showChevron && (
        <IconChevronRight
          size={16}
          color={colors.textMuted}
          style={styles.chevron}
        />
      )}
    </View>
  );

  if (isInteractive) {
    return (
      <PressableScale
        onPress={handlePress}
        activeBackgroundColor={tokens.colors.pressedRow}
        activeScale={0.99}
        haptic="light"
      >
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
    paddingHorizontal: 14,
    paddingVertical: 11,
    minHeight: 44,
    backgroundColor: colors.surface,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  leading: {
    marginRight: 12,
  },
  center: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 18,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginRight: 6,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  tag: {
    backgroundColor: colors.accentTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.accentDark,
  },
  trailing: {
    marginLeft: 8,
  },
  chevron: {
    marginLeft: 4,
  },
});
