import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { DURATIONS, EASE } from '../theme/tokens';
import { useHaptics } from '../hooks/useHaptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Floating "+" button: scales to 0.92 on press-in, light haptic on tap. */
export function Fab({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const haptic = useHaptics();

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel="Add expense"
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: DURATIONS.press, easing: EASE });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: DURATIONS.release, easing: EASE });
      }}
      onPress={() => {
        haptic('light');
        onPress();
      }}
      style={[styles.fab, style]}>
      <Text style={styles.plus}>+</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 26,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1c1c1a',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    shadowColor: '#1c1c1a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 8,
  },
  plus: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '400',
    marginTop: -2,
  },
});
