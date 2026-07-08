import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Theme, font } from '../theme/tokens';

/** Friendly empty state shown when there are zero expenses. */
export function EmptyState({ theme }: { theme: Theme }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: theme.border }]}>
        <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="12"
            r="8.5"
            stroke={theme.textMuted45}
            strokeWidth={1.5}
          />
          <Path
            d="M8.5 13.5c.8.9 2 1.4 3.5 1.4s2.7-.5 3.5-1.4"
            stroke={theme.textMuted45}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <Circle cx="9.3" cy="10" r="1" fill={theme.textMuted45} />
          <Circle cx="14.7" cy="10" r="1" fill={theme.textMuted45} />
        </Svg>
      </View>
      <Text style={[styles.title, { color: theme.textMuted55 }]}>
        Nothing spent yet — good start.
      </Text>
      <Text style={[styles.subtitle, { color: theme.textMuted45 }]}>
        Tap + below to log one.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontFamily: font(600),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    fontFamily: font(400),
    marginTop: 4,
    textAlign: 'center',
  },
});
