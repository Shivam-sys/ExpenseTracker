import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { CategoryIcon } from './CategoryIcon';
import { splitMoney } from '../lib/format';
import { Theme, font } from '../theme/tokens';

interface Props {
  amount: number;
  currency: string;
  categoryColor: string;
  iconId: string;
  theme: Theme;
}

/** Hero category badge + large live amount readout for the sheet. */
export function AmountDisplay({
  amount,
  currency,
  categoryColor,
  iconId,
  theme,
}: Props) {
  const { whole, cents } = splitMoney(amount, currency);

  return (
    <View>
      <View style={styles.heroWrap}>
        <View style={[styles.hero, { shadowColor: categoryColor }]}>
          <Svg width={64} height={64} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="heroGrad" cx="32%" cy="28%" r="80%">
                <Stop offset="0" stopColor={categoryColor} stopOpacity={1} />
                <Stop offset="1" stopColor={categoryColor} stopOpacity={0.87} />
              </RadialGradient>
            </Defs>
            <Circle cx={32} cy={32} r={32} fill="url(#heroGrad)" />
          </Svg>
          <CategoryIcon iconId={iconId} color="#fff" size={28} strokeWidth={1.6} />
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={[styles.whole, { color: theme.text }]}>{whole}</Text>
        <Text style={[styles.cents, { color: theme.textMuted5 }]}>{cents}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  hero: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.33,
    shadowRadius: 16,
    elevation: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  whole: {
    fontSize: 44,
    fontFamily: font(800),
    letterSpacing: -1.5,
    fontVariant: ['tabular-nums'],
  },
  cents: {
    fontSize: 20,
    fontFamily: font(600),
    marginTop: 9,
    marginLeft: 1,
    fontVariant: ['tabular-nums'],
  },
});
