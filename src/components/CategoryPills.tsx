import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  CategoryDef,
  DURATIONS,
  EASE,
  Theme,
  font,
  hexToRgba,
} from '../theme/tokens';
import { iconFor } from '../theme/categories';

interface Props {
  categories: CategoryDef[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddPress: () => void;
  theme: Theme;
}

export function CategoryPills({
  categories,
  selectedId,
  onSelect,
  onAddPress,
  theme,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onAddPress}
        style={styles.addBtn}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Add category">
        <Text style={[styles.addBtnText, { color: theme.textMuted55 }]}>
          + Add category
        </Text>
      </Pressable>

      <View style={styles.rowWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          {categories.map(cat => (
            <Pill
              key={cat.id}
              cat={cat}
              selected={cat.id === selectedId}
              theme={theme}
              onPress={() => onSelect(cat.id)}
            />
          ))}
        </ScrollView>

        {/* Right-edge fade mask signalling more content */}
        <View style={styles.fade} pointerEvents="none">
          <Svg width="28" height="100%">
            <Defs>
              <LinearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={theme.scrollFadeTo} stopOpacity={0} />
                <Stop offset="1" stopColor={theme.scrollFadeTo} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="28" height="100%" fill="url(#fade)" />
          </Svg>
        </View>
      </View>
    </View>
  );
}

function Pill({
  cat,
  selected,
  theme,
  onPress,
}: {
  cat: CategoryDef;
  selected: boolean;
  theme: Theme;
  onPress: () => void;
}) {
  const sel = useSharedValue(selected ? 1 : 0);
  const scale = useSharedValue(1);

  const CategoryGlyph = iconFor(cat.icon);
  const iconColor = cat.color;
  const activeBg = hexToRgba(cat.color, theme.dark ? 0.24 : 0.12);
  const inactiveBorder = theme.dark ? theme.border : cat.border;

  useEffect(() => {
    sel.value = withTiming(selected ? 1 : 0, {
      duration: DURATIONS.pill,
      easing: EASE,
    });
    if (selected) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 75, easing: EASE }),
        withTiming(1, { duration: 75, easing: EASE }),
      );
    }
  }, [selected, sel, scale]);

  const pillStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      sel.value,
      [0, 1],
      [theme.chipInactiveBg, activeBg],
    ),
    borderColor: interpolateColor(
      sel.value,
      [0, 1],
      [inactiveBorder, cat.color],
    ),
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.hit}>
      <Animated.View style={[styles.pill, pillStyle]}>
        <CategoryGlyph size={16} color={iconColor} />
        <Text
          style={[styles.pillLabel, { color: theme.text }]}
          numberOfLines={1}>
          {cat.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 6,
  },
  addBtn: {
    alignSelf: 'flex-end',
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  addBtnText: {
    fontSize: 13.5,
    fontFamily: font(500),
  },
  rowWrap: {
    position: 'relative',
  },
  fade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 6,
    width: 28,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingBottom: 6,
    paddingTop: 2,
  },
  hit: {
    minHeight: 44, // ≥44px tap target even though the visual pill is smaller
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pillLabel: {
    fontSize: 13.5,
    fontFamily: font(500),
    maxWidth: 140,
  },
});
