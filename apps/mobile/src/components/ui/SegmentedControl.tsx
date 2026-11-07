import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, radius } from '@recallr/tokens';
import { PressableScale } from './PressableScale';

export interface SegmentOption<T extends string = string> {
  label: React.ReactNode;
  value: T;
}

export interface SegmentItem<T extends string = string> {
  key: T;
  label: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options?: SegmentOption<T>[];
  segments?: SegmentItem<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string = string>({
  options,
  segments,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const effectiveOptions: SegmentOption<T>[] =
    options ||
    (segments
      ? segments.map((s) => ({ label: s.label, value: s.key }))
      : []);
  return (
    <View style={[styles.container, style]}>
      {effectiveOptions.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <PressableScale
            key={opt.value}
            onPress={() => onChange(opt.value)}
            haptic="selection"
            style={[
              styles.segment,
              isSelected && styles.selectedSegment,
            ]}
          >
            {typeof opt.label === 'string' ? (
              <Text
                style={[
                  styles.label,
                  isSelected ? styles.selectedLabel : styles.unselectedLabel,
                ]}
              >
                {opt.label}
              </Text>
            ) : (
              opt.label
            )}
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EDEBE5',
    borderRadius: radius.chip,
    padding: 3,
    alignItems: 'center',
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    minHeight: 36,
  },
  selectedSegment: {
    backgroundColor: colors.surface,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    textAlign: 'center',
  },
  selectedLabel: {
    fontWeight: '500',
    color: colors.text,
  },
  unselectedLabel: {
    fontWeight: '400',
    color: colors.textSecondary,
  },
});
