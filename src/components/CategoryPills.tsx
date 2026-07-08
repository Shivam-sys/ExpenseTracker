import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  BRAND,
  CategoryDef,
  DURATIONS,
  EASE,
  Theme,
  font,
  hexToRgba,
} from '../theme/tokens';

interface Props {
  categories: CategoryDef[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddCategory: (label: string) => void;
  theme: Theme;
}

export function CategoryPills({
  categories,
  selectedId,
  onSelect,
  onAddCategory,
  theme,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setName('');
    setAdding(false);
  };

  return (
    <View style={styles.wrap}>
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

        {adding ? (
          <View
            style={[
              styles.addInputWrap,
              { backgroundColor: theme.inputBg, borderColor: theme.border },
            ]}>
            <TextInput
              value={name}
              onChangeText={setName}
              onSubmitEditing={save}
              placeholder="New category"
              placeholderTextColor={theme.textMuted45}
              autoFocus
              style={[styles.addInput, { color: theme.text }]}
            />
            <Pressable
              onPress={save}
              style={[
                styles.saveBtn,
                { backgroundColor: name.trim() ? BRAND : theme.border },
              ]}>
              <Text style={styles.saveTick}>✓</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setAdding(true)}
            style={[styles.newChip, { borderColor: theme.dashedBorder }]}>
            <Text style={[styles.newPlus, { color: theme.textMuted55 }]}>+</Text>
            <Text style={[styles.newLabel, { color: theme.textMuted55 }]}>New</Text>
          </Pressable>
        )}
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
        <View style={[styles.dot, { backgroundColor: cat.color }]} />
        <Text style={[styles.pillLabel, { color: theme.text }]}>{cat.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    marginTop: 14,
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
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillLabel: {
    fontSize: 13.5,
    fontFamily: font(500),
  },
  newChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    paddingVertical: 6,
    paddingHorizontal: 12,
    minHeight: 44,
    marginLeft: 4,
    alignSelf: 'center',
  },
  newPlus: {
    fontSize: 15,
    fontFamily: font(600),
    lineHeight: 18,
  },
  newLabel: {
    fontSize: 13.5,
    fontFamily: font(500),
  },
  addInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    paddingLeft: 12,
    paddingRight: 6,
    minHeight: 44,
    marginLeft: 4,
    alignSelf: 'center',
  },
  addInput: {
    width: 104,
    fontSize: 13.5,
    fontFamily: font(500),
    padding: 0,
  },
  saveBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTick: {
    color: '#fff',
    fontSize: 13,
  },
});
