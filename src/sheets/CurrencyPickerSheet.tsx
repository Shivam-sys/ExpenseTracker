import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  useBottomSheetTimingConfigs,
} from '@gorhom/bottom-sheet';
import Svg, { Circle, Path } from 'react-native-svg';
import { useExpenseStore } from '../store/expenseStore';
import { CURRENCIES } from '../store/types';
import { useTheme } from '../theme/useTheme';
import { BRAND, DURATIONS, EASE, font } from '../theme/tokens';

export interface CurrencyPickerHandle {
  present: () => void;
}

export const CurrencyPickerSheet = forwardRef<CurrencyPickerHandle>((_p, ref) => {
  const modalRef = useRef<BottomSheetModal>(null);
  const theme = useTheme();
  const currency = useExpenseStore(s => s.currency);
  const setCurrency = useExpenseStore(s => s.setCurrency);

  const timingConfig = useBottomSheetTimingConfigs({
    duration: DURATIONS.sheet,
    easing: EASE,
  });

  useImperativeHandle(ref, () => ({
    present: () => modalRef.current?.present(),
  }));

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.35}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      animationConfigs={timingConfig}
      backgroundStyle={{ backgroundColor: theme.sheetBg, borderRadius: 26 }}
      handleIndicatorStyle={{ backgroundColor: theme.handleColor, width: 36, height: 4 }}>
      <BottomSheetView style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Currency</Text>
        {CURRENCIES.map(cur => {
          const selected = cur.code === currency;
          return (
            <Pressable
              key={cur.code}
              onPress={() => {
                setCurrency(cur.code);
                modalRef.current?.dismiss();
              }}
              style={[styles.row, { borderBottomColor: theme.divider }]}>
              <View style={[styles.symbolTile, { backgroundColor: theme.border }]}>
                <Text style={[styles.symbol, { color: theme.text }]}>{cur.symbol}</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.name, { color: theme.text }]}>{cur.name}</Text>
                <Text style={[styles.code, { color: theme.textMuted45 }]}>{cur.code}</Text>
              </View>
              {selected && (
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx="12" cy="12" r="10" fill={BRAND} />
                  <Path
                    d="M7 12.5l3 3 7-7"
                    stroke="#fff"
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </Pressable>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingBottom: 30,
    paddingTop: 2,
  },
  title: {
    fontSize: 18,
    fontFamily: font(700),
    textAlign: 'center',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
  },
  symbolTile: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontSize: 15,
    fontFamily: font(600),
  },
  rowText: {
    flex: 1,
  },
  name: {
    fontSize: 15.5,
    fontFamily: font(500),
  },
  code: {
    fontSize: 12.5,
    fontFamily: font(400),
  },
});
