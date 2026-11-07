import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { colors, radius, tokens } from '@recallr/tokens';
import { IconSearch, IconX } from '@tabler/icons-react-native';
import { PressableScale } from './PressableScale';

export interface SearchBarProps extends Omit<TextInputProps, 'style'> {
  onClear?: () => void;
  focusedBorder?: boolean;
  insideCard?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search name, company, note',
  focusedBorder = false,
  insideCard = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View
      style={[
        styles.container,
        insideCard && styles.insideCardContainer,
        (isFocused || focusedBorder) && styles.focused,
        style,
      ]}
    >
      <IconSearch
        size={18}
        color={colors.textMuted}
        style={styles.searchIcon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={styles.input}
        {...props}
      />
      {!!value && onClear && (
        <PressableScale
          onPress={onClear}
          haptic="light"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.clearBtn}
        >
          <IconX size={15} color={colors.textMuted} />
        </PressableScale>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  insideCardContainer: {
    backgroundColor: tokens.colors.inputCardFill,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: colors.accent,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  clearBtn: {
    marginLeft: 6,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
