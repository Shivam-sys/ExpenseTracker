import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { DURATIONS, EASE, Theme, font } from '../theme/tokens';
import { useHaptics } from '../hooks/useHaptics';

const KEY_LAYOUT = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'];
const BACKSPACE = '⌫';
const HOLD_DELAY = 400;
const REPEAT_INTERVAL = 80;

interface Props {
  onKey: (ch: string) => void;
  dotUsed: boolean;
  theme: Theme;
}

export function Keypad({ onKey, dotUsed, theme }: Props) {
  return (
    <View style={styles.grid}>
      {KEY_LAYOUT.map(label => {
        const isDot = label === '.';
        const isBackspace = label === BACKSPACE;
        const disabled = isDot && dotUsed;
        return (
          <View key={label} style={styles.cell}>
            <Key
              label={label}
              disabled={disabled}
              isBackspace={isBackspace}
              theme={theme}
              onKey={onKey}
            />
          </View>
        );
      })}
    </View>
  );
}

function Key({
  label,
  disabled,
  isBackspace,
  theme,
  onKey,
}: {
  label: string;
  disabled: boolean;
  isBackspace: boolean;
  theme: Theme;
  onKey: (ch: string) => void;
}) {
  const darken = useSharedValue(0);
  const haptic = useHaptics();
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const repeatFired = useRef(false);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: darken.value }));

  const press = () => {
    haptic('light');
    onKey(label);
  };

  const clearTimers = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (repeatTimer.current) clearInterval(repeatTimer.current);
    holdTimer.current = null;
    repeatTimer.current = null;
  };

  const onPressIn = () => {
    if (disabled) return;
    darken.value = withTiming(0.09, { duration: DURATIONS.key, easing: EASE });
    if (isBackspace) {
      repeatFired.current = false;
      holdTimer.current = setTimeout(() => {
        repeatTimer.current = setInterval(() => {
          repeatFired.current = true;
          haptic('light');
          onKey(BACKSPACE);
        }, REPEAT_INTERVAL);
      }, HOLD_DELAY);
    }
  };

  const onPressOut = () => {
    darken.value = withTiming(0, { duration: DURATIONS.key, easing: EASE });
    clearTimers();
  };

  const onPress = () => {
    if (disabled) return;
    // Suppress the trailing tap-delete if a long-press repeat already ran.
    if (isBackspace && repeatFired.current) {
      repeatFired.current = false;
      return;
    }
    press();
  };

  return (
    <Pressable
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.key,
        {
          backgroundColor: disabled
            ? theme.keyDisabledBg
            : isBackspace
            ? theme.keyBgAlt
            : theme.keyBg,
        },
      ]}>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}
        pointerEvents="none"
      />
      <Text
        style={[
          styles.keyText,
          { color: disabled ? theme.keyDisabledColor : theme.keyColor },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    marginHorizontal: -4,
  },
  cell: {
    width: '33.333%',
    padding: 4,
  },
  key: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  overlay: {
    backgroundColor: '#000',
    borderRadius: 12,
  },
  keyText: {
    fontSize: 22,
    fontFamily: font(500),
  },
});
