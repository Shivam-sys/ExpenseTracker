import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { TrashIcon, ChevronIcon } from './CategoryIcon';
import { getCategoryConfig } from '../theme/categories';
import { DisplayExpense } from '../hooks/useExpenses';
import { DELETE_RED, DURATIONS, EASE, SPRING, Theme, font } from '../theme/tokens';

const DELETE_WIDTH = 80;
const OPEN_THRESHOLD = -40;
const FLICK_VELOCITY = -600; // px/s
const MAX_DRAG = -100;

interface Props {
  entry: DisplayExpense;
  theme: Theme;
  onPress: () => void;
  onDelete: () => void;
}

export function ExpenseRow({ entry, theme, onPress, onDelete }: Props) {
  const { icon: CategoryGlyph, iconColor } = getCategoryConfig(entry.categoryId);
  const tx = useSharedValue(0);
  const base = useSharedValue(0); // committed position: 0 (closed) or -80 (open)
  const pressed = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);

  const commit = (open: boolean) => setIsOpen(open);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onUpdate(e => {
      tx.value = Math.max(MAX_DRAG, Math.min(0, base.value + e.translationX));
    })
    .onEnd(e => {
      const fastFlick = e.velocityX < FLICK_VELOCITY;
      if (fastFlick && tx.value < -20) {
        tx.value = withTiming(MAX_DRAG, { duration: 150, easing: EASE }, () =>
          runOnJS(onDelete)(),
        );
        return;
      }
      const open = tx.value < OPEN_THRESHOLD;
      base.value = open ? -DELETE_WIDTH : 0;
      tx.value = withSpring(base.value, SPRING);
      runOnJS(commit)(open);
    });

  const tap = Gesture.Tap()
    .maxDuration(260)
    .onBegin(() => {
      pressed.value = withTiming(1, { duration: DURATIONS.press, easing: EASE });
    })
    .onFinalize(() => {
      pressed.value = withTiming(0, { duration: DURATIONS.release, easing: EASE });
    })
    .onEnd(() => {
      if (base.value < 0) {
        base.value = 0;
        tx.value = withSpring(0, SPRING);
        runOnJS(commit)(false);
      } else {
        runOnJS(onPress)();
      }
    });

  const gesture = Gesture.Race(pan, tap);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }],
  }));
  const pressStyle = useAnimatedStyle(() => ({
    opacity: pressed.value * 0.05,
  }));
  const deleteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-20, -6], [1, 0], 'clamp'),
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(260)}
      style={[styles.clip, { borderBottomColor: theme.divider }]}>
      {/* Delete affordance revealed on left-swipe */}
      <Animated.View
        style={[styles.deleteLayer, { backgroundColor: theme.deleteRowBg }, deleteStyle]}
        pointerEvents={isOpen ? 'auto' : 'none'}>
        <Pressable
          onPress={onDelete}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${entry.label}`}>
          <TrashIcon color={DELETE_RED} size={17} />
          <Text style={styles.deleteLabel}>Delete</Text>
        </Pressable>
      </Animated.View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.row, { backgroundColor: theme.cardBg }, rowStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.pressOverlay, pressStyle]} />
          <View style={[styles.iconTile, { backgroundColor: entry.tint }]}>
            <CategoryGlyph size={20} color={iconColor} />
          </View>
          <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
            {entry.label}
          </Text>
          <Text style={[styles.amount, { color: theme.text }]}>{entry.amountLabel}</Text>
          <View style={styles.chevron}>
            <ChevronIcon dir="right" color={theme.text} size={12} strokeWidth={1.6} />
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  clip: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
  },
  deleteLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingRight: 20,
    height: '100%',
  },
  deleteLabel: {
    color: DELETE_RED,
    fontSize: 15,
    fontFamily: font(600),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  pressOverlay: {
    backgroundColor: '#000',
    opacity: 0,
  },
  iconTile: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 15.5,
    fontFamily: font(500),
  },
  amount: {
    fontSize: 16,
    fontFamily: font(600),
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  chevron: {
    opacity: 0.3,
    marginLeft: 2,
  },
});
