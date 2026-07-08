import { useCallback } from 'react';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

type HapticKind = 'light' | 'medium' | 'success';

const MAP: Record<HapticKind, string> = {
  light: 'impactLight',
  medium: 'impactMedium',
  success: 'notificationSuccess',
};

/** Thin wrapper so components trigger haptics without importing the lib. */
export function useHaptics() {
  return useCallback((kind: HapticKind = 'light') => {
    try {
      ReactNativeHapticFeedback.trigger(MAP[kind] as any, OPTIONS);
    } catch {
      // no-op: haptics are best-effort
    }
  }, []);
}
