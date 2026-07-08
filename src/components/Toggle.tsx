import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { BRAND, DURATIONS, EASE } from '../theme/tokens';

/** iOS-style switch driven on the UI thread. */
export function Toggle({
  value,
  onChange,
  offColor,
}: {
  value: boolean;
  onChange: () => void;
  offColor: string;
}) {
  const v = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    v.value = withTiming(value ? 1 : 0, { duration: DURATIONS.key, easing: EASE });
  }, [value, v]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(v.value, [0, 1], [offColor, BRAND]),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 2 + v.value * 16 }],
  }));

  return (
    <Pressable onPress={onChange} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.knob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
});
