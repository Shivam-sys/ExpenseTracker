import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { SPARK_BARS, Theme } from '../theme/tokens';

/** The green gradient banner behind the header, with faint spark bars. */
export function HeaderGradient({ theme }: { theme: Theme }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="hdr" x1="0" y1="0" x2="0.35" y2="1">
            <Stop offset="0" stopColor={theme.headerFrom} />
            <Stop offset="1" stopColor={theme.headerTo} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#hdr)" />
      </Svg>
      <View style={styles.bars}>
        {SPARK_BARS.map((h, i) => (
          <View key={i} style={[styles.bar, { height: `${h}%` }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    opacity: 0.16,
  },
  bar: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
});
