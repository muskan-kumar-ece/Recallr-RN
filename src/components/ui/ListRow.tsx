import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Typography } from '../../constants/theme';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  avatarText?: string;
  avatarUrl?: string;
  tag?: string;
  tagColor?: string;
  onPress?: () => void;
  showDivider?: boolean;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const ListRow: React.FC<ListRowProps> = ({
  title,
  subtitle,
  avatarText,
  avatarUrl,
  tag,
  tagColor = Colors.accentLight,
  onPress,
  showDivider = true,
  rightElement,
  showChevron = false,
  style,
  testID,
}) => {
  // Generate initials if not provided
  const initials = avatarText || (title ? title.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : '');

  const content = (
    <View style={[styles.row, showDivider && styles.divider, style]}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitials}>{initials}</Text>
        </View>
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {tag ? (
        <View style={[styles.tagBadge, { backgroundColor: tagColor }]}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}

      {rightElement}

      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.muted}
          style={styles.chevron}
        />
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={0.7}
        onPress={onPress}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    marginRight: 12,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    color: Colors.accent,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.secondary,
    marginTop: 2,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginLeft: 6,
  },
  tagText: {
    fontSize: Typography.sizes.xs,
    color: Colors.accentDark,
    fontWeight: Typography.weights.medium,
  },
  chevron: {
    marginLeft: 6,
  },
});
