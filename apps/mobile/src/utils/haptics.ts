import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const hapticLight = () => {
  if (Platform.OS === 'web') return;
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  } catch {
    // Ignore unsupported environments
  }
};

export const hapticSelection = () => {
  if (Platform.OS === 'web') return;
  try {
    Haptics.selectionAsync().catch(() => {});
  } catch {
    // Ignore unsupported environments
  }
};

export const hapticSuccess = () => {
  if (Platform.OS === 'web') return;
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  } catch {
    // Ignore unsupported environments
  }
};

export const hapticWarning = () => {
  if (Platform.OS === 'web') return;
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  } catch {
    // Ignore unsupported environments
  }
};
