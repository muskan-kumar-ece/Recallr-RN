import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Colors, Radius, Typography } from '../constants/theme';

interface ToastOptions {
  duration?: number;
  undoLabel?: string;
  onUndo?: () => void;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [undoAction, setUndoAction] = useState<(() => void) | null>(null);
  const [undoLabel, setUndoLabel] = useState('Undo');

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timerRef = useRef<any>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setUndoAction(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (msg: string, options?: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setMessage(msg);
      setUndoLabel(options?.undoLabel || 'Undo');
      setUndoAction(options?.onUndo ? () => options.onUndo : null);
      setVisible(true);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      const duration = options?.duration || 4500;
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacity, translateY]
  );

  const handleUndoPress = () => {
    if (undoAction) {
      undoAction();
    }
    hideToast();
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && (
        <SafeAreaView pointerEvents="box-none" style={styles.toastContainer}>
          <Animated.View
            style={[
              styles.toastBox,
              {
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <Text style={styles.toastMessage} numberOfLines={2}>
              {message}
            </Text>
            {undoAction ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleUndoPress}
                style={styles.undoButton}
              >
                <Text style={styles.undoText}>{undoLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 84, // Sits comfortably above bottom tab bar
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastBox: {
    backgroundColor: '#1E1E1E',
    borderRadius: Radius.card,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  toastMessage: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    flex: 1,
    marginRight: 12,
  },
  undoButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  undoText: {
    color: Colors.accent,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },
});
