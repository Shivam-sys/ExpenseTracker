import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderGradient } from '../components/HeaderGradient';
import { ExpenseRow } from '../components/ExpenseRow';
import { EmptyState } from '../components/EmptyState';
import { Fab } from '../components/Fab';
import {
  AddExpenseSheet,
  AddExpenseSheetHandle,
} from '../sheets/AddExpenseSheet';
import { useExpenses } from '../hooks/useExpenses';
import { useTheme } from '../theme/useTheme';
import { splitMoney, money } from '../lib/format';
import { BRAND, DELETE_RED, font } from '../theme/tokens';

export function ExpensesListScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<AddExpenseSheetHandle>(null);
  const {
    dayGroups,
    monthTotal,
    todayTotal,
    currency,
    isEmpty,
    deleteExpense,
    isLoading,
    loadFailed,
    isOffline,
    restoredLabel,
    retryLoad,
  } = useExpenses();

  const today = splitMoney(todayTotal, currency);

  return (
    <View style={[styles.screen, { backgroundColor: theme.pageBg }]}>
      {/* ── Gradient hero header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <HeaderGradient theme={theme} />
        <View style={styles.headerRow}>
          <Text style={styles.title}>Expenses</Text>
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatar}
            accessibilityRole="button"
            accessibilityLabel="Open profile">
            <Text style={styles.avatarText}>SK</Text>
          </Pressable>
        </View>

        <View style={styles.spendBlock}>
          <Text style={styles.spendLabel}>TODAY'S SPEND</Text>
          <View style={styles.spendAmount}>
            <Text style={styles.spendWhole}>{today.whole}</Text>
            <Text style={styles.spendCents}>{today.cents}</Text>
          </View>
          <Text style={styles.monthLine}>
            This month{' '}
            <Text style={styles.monthValue}>{money(monthTotal, currency)}</Text>
          </Text>
        </View>
      </View>

      {/* ── List card overlapping the header ── */}
      <View
        style={[
          styles.listCard,
          { backgroundColor: theme.pageBg, shadowColor: '#000' },
        ]}>
        <ScrollView
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}>
          {loadFailed && (
            <View
              style={[
                styles.retryBanner,
                { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
              ]}>
              <Text style={[styles.retryText, { color: theme.textMuted55 }]}>
                Couldn't load expenses.
              </Text>
              <Pressable onPress={retryLoad} hitSlop={8}>
                <Text style={styles.retryAction}>Retry</Text>
              </Pressable>
            </View>
          )}
          {isLoading && isEmpty ? (
            <View style={styles.loading}>
              <ActivityIndicator color={BRAND} />
            </View>
          ) : isEmpty ? (
            !loadFailed && <EmptyState theme={theme} />
          ) : (
            dayGroups.map(group => (
              <View key={group.offset}>
                <Text style={[styles.groupLabel, { color: theme.textMuted45 }]}>
                  {group.label}
                </Text>
                <View
                  style={[
                    styles.groupCard,
                    {
                      backgroundColor: theme.cardBg,
                      borderColor: theme.cardBorder,
                    },
                  ]}>
                  {group.entries.map(entry => (
                    <ExpenseRow
                      key={entry.id}
                      entry={entry}
                      theme={theme}
                      onPress={() => sheetRef.current?.presentEdit(entry)}
                      onDelete={() => deleteExpense(entry.id)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {isOffline && (
        <View style={[styles.offlinePill, { top: insets.top + 8 }]}>
          <View style={styles.offlineDot} />
          <Text style={styles.offlineText}>Offline</Text>
        </View>
      )}

      {restoredLabel != null && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[
            styles.restoredToast,
            {
              bottom: insets.bottom + 100,
              backgroundColor: theme.cardBg,
              borderColor: theme.cardBorder,
            },
          ]}>
          <Text style={[styles.restoredText, { color: theme.text }]}>
            "{restoredLabel}" restored — delete failed
          </Text>
        </Animated.View>
      )}

      <Fab onPress={() => sheetRef.current?.presentAdd()} />

      <AddExpenseSheet ref={sheetRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 22,
    paddingBottom: 52,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontFamily: font(700),
    letterSpacing: -0.3,
    color: '#fff',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,.14)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgb(5, 69, 9)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,                // real depth instead of a glow
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: font(600),
  },
  spendBlock: {
    marginTop: 26,
  },
  spendLabel: {
    fontSize: 11.5,
    fontFamily: font(600),
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,.55)',
  },
  spendAmount: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
  },
  spendWhole: {
    fontSize: 64,
    fontFamily: font(800),
    letterSpacing: -1.5,
    lineHeight: 72,
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  spendCents: {
    fontSize: 22,
    fontFamily: font(600),
    color: 'rgba(255,255,255,.65)',
    marginTop: -4,
    marginLeft: 2,
    fontVariant: ['tabular-nums'],
  },
  monthLine: {
    fontSize: 13,
    fontFamily: font(500),
    color: 'rgba(255,255,255,.55)',
    marginTop: 10,
  },
  monthValue: {
    color: '#fff',
    fontFamily: font(600),
    fontVariant: ['tabular-nums'],
  },
  listCard: {
    flex: 1,
    marginTop: -26,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.12,
    shadowRadius: 26,
    elevation: 12,
  },
  listContent: {
    padding: 20,
  },
  groupLabel: {
    fontSize: 13,
    fontFamily: font(600),
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  groupCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 30,
  },
  loading: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  retryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  retryText: {
    fontSize: 13.5,
    fontFamily: font(500),
  },
  retryAction: {
    fontSize: 13.5,
    fontFamily: font(600),
    color: BRAND,
  },
  offlinePill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(20,18,15,.75)',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    zIndex: 20,
  },
  offlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: DELETE_RED,
  },
  offlineText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: font(600),
  },
  restoredToast: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 16,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  restoredText: {
    fontSize: 13,
    fontFamily: font(500),
  },
});
