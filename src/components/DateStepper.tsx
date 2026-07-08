import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ChevronIcon } from './CategoryIcon';
import { DURATIONS, EASE, Theme, font } from '../theme/tokens';

interface Props {
  label: string;
  /** false when already at Today — forward (newer) is a future date, blocked. */
  canGoForward: boolean;
  onBack: () => void; // older
  onForward: () => void; // newer
  theme: Theme;
}

/** ◀ Today ▶ — label slides out/in toward the pressed arrow (~180ms). */
export function DateStepper({
  label,
  canGoForward,
  onBack,
  onForward,
  theme,
}: Props) {
  const tx = useSharedValue(0);
  const opacity = useSharedValue(1);
  const lastDir = useRef<'L' | 'R'>('R');

  useEffect(() => {
    const from = lastDir.current === 'R' ? 10 : -10;
    tx.value = from;
    opacity.value = 0;
    tx.value = withTiming(0, { duration: DURATIONS.date, easing: EASE });
    opacity.value = withTiming(1, { duration: DURATIONS.date, easing: EASE });
  }, [label, tx, opacity]);

  const labelStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: tx.value }],
  }));

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => {
          lastDir.current = 'L';
          onBack();
        }}
        style={styles.arrow}
        hitSlop={8}>
        <ChevronIcon dir="left" color={theme.textMuted45} size={12} />
      </Pressable>

      <View style={styles.labelWrap}>
        <Animated.Text style={[styles.label, { color: theme.text }, labelStyle]}>
          {label}
        </Animated.Text>
      </View>

      <Pressable
        onPress={() => {
          if (!canGoForward) return; // future blocked — no feedback
          lastDir.current = 'R';
          onForward();
        }}
        disabled={!canGoForward}
        style={[styles.arrow, { opacity: canGoForward ? 1 : 0.3 }]}
        hitSlop={8}>
        <ChevronIcon dir="right" color={theme.textMuted45} size={12} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    minWidth: 92,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontFamily: font(600),
  },
});
