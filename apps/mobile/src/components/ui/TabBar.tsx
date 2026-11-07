import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Keyboard,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, tokens } from '@recallr/tokens';
import {
  IconHome,
  IconUsers,
  IconPlus,
  IconNotebook,
  IconSparkles,
} from '@tabler/icons-react-native';
import { PressableScale } from './PressableScale';
import { hapticLight, hapticSelection } from '../../utils/haptics';

export type TabKey = 'home' | 'people' | 'notes' | 'ask';

export interface TabBarProps {
  activeTab?: TabKey;
  onTabChange?: (tab: TabKey) => void;
  onQuickAdd?: () => void;
  isQuickAddOpen?: boolean;
  notesBadgeCount?: number;
  onScrollToTop?: (tab: TabKey) => void;
  style?: StyleProp<ViewStyle>;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab = 'home',
  onTabChange,
  onQuickAdd,
  isQuickAddOpen = false,
  notesBadgeCount = 0,
  onScrollToTop,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  // Plus button rotation
  const plusRotation = useSharedValue(0);
  const plusScale = useSharedValue(1);

  useEffect(() => {
    if (!reducedMotion) {
      plusRotation.value = withTiming(isQuickAddOpen ? 45 : 0, {
        duration: tokens.motion.sheetsSpring,
      });
    } else {
      plusRotation.value = isQuickAddOpen ? 45 : 0;
    }
  }, [isQuickAddOpen, reducedMotion, plusRotation]);

  const animatedPlusStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: plusScale.value },
        { rotate: `${plusRotation.value}deg` },
      ],
    };
  });

  // Keyboard hide listener
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (isKeyboardVisible) {
    return null;
  }

  const handleTabPress = (tab: TabKey) => {
    if (tab === activeTab) {
      onScrollToTop?.(tab);
    } else {
      hapticSelection();
      onTabChange?.(tab);
    }
  };

  const handlePlusPressIn = () => {
    if (!reducedMotion) {
      plusScale.value = withTiming(0.92, { duration: tokens.press.pressInDuration });
    }
    hapticLight();
  };

  const handlePlusPressOut = () => {
    if (!reducedMotion) {
      plusScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const renderBadge = () => {
    if (!notesBadgeCount || notesBadgeCount <= 0) return null;
    const badgeText = notesBadgeCount > 9 ? '9+' : String(notesBadgeCount);
    return (
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: 12 + Math.max(insets.bottom, 4),
        },
        style,
      ]}
    >
      <View style={styles.pillContainer}>
        {/* Tab 1: Home */}
        <PressableScale
          onPress={() => handleTabPress('home')}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <View style={styles.tabIconWrapper}>
            {activeTab === 'home' && <View style={styles.activePill} />}
            <IconHome
              size={20}
              color={activeTab === 'home' ? colors.accent : colors.textMuted}
              strokeWidth={activeTab === 'home' ? 2.4 : 1.8}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'home' ? styles.activeLabel : styles.inactiveLabel,
            ]}
          >
            Home
          </Text>
        </PressableScale>

        {/* Tab 2: People */}
        <PressableScale
          onPress={() => handleTabPress('people')}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <View style={styles.tabIconWrapper}>
            {activeTab === 'people' && <View style={styles.activePill} />}
            <IconUsers
              size={20}
              color={activeTab === 'people' ? colors.accent : colors.textMuted}
              strokeWidth={activeTab === 'people' ? 2.4 : 1.8}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'people' ? styles.activeLabel : styles.inactiveLabel,
            ]}
          >
            People
          </Text>
        </PressableScale>

        {/* Center Raised + Button */}
        <View style={styles.centerSlot}>
          <Animated.View style={[styles.centerRaisedWrapper, animatedPlusStyle]}>
            <PressableScale
              onPress={onQuickAdd}
              onPressIn={handlePlusPressIn}
              onPressOut={handlePlusPressOut}
              style={styles.centerButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconPlus size={26} color="#FFFFFF" strokeWidth={2.8} />
            </PressableScale>
          </Animated.View>
        </View>

        {/* Tab 3: Notes */}
        <PressableScale
          onPress={() => handleTabPress('notes')}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <View style={styles.tabIconWrapper}>
            {activeTab === 'notes' && <View style={styles.activePill} />}
            <IconNotebook
              size={20}
              color={activeTab === 'notes' ? colors.accent : colors.textMuted}
              strokeWidth={activeTab === 'notes' ? 2.4 : 1.8}
            />
            {renderBadge()}
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'notes' ? styles.activeLabel : styles.inactiveLabel,
            ]}
          >
            Notes
          </Text>
        </PressableScale>

        {/* Tab 4: Ask AI */}
        <PressableScale
          onPress={() => handleTabPress('ask')}
          style={styles.tabButton}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <View style={styles.tabIconWrapper}>
            {activeTab === 'ask' && <View style={styles.activePill} />}
            <IconSparkles
              size={20}
              color={activeTab === 'ask' ? colors.accent : colors.textMuted}
              strokeWidth={activeTab === 'ask' ? 2.4 : 1.8}
            />
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'ask' ? styles.activeLabel : styles.inactiveLabel,
            ]}
          >
            Ask AI
          </Text>
        </PressableScale>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 999,
  },
  pillContainer: {
    width: '100%',
    maxWidth: 420,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: tokens.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.10,
        shadowRadius: 28,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: tokens.shadows.shadowNav,
      },
    }),
  },
  tabButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapper: {
    position: 'relative',
    width: 52,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: tokens.colors.accentTint,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  activeLabel: {
    fontWeight: '500',
    color: colors.accent,
  },
  inactiveLabel: {
    fontWeight: '400',
    color: colors.textMuted,
  },
  centerSlot: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerRaisedWrapper: {
    position: 'absolute',
    top: -28,
    width: 54,
    height: 54,
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.accent,
    borderWidth: 4,
    borderColor: tokens.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.40,
        shadowRadius: 18,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: tokens.shadows.shadowAccent,
      },
    }),
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: 8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 11,
  },
});
