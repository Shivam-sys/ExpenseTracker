import React, { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronIcon } from '../components/CategoryIcon';
import { Toggle } from '../components/Toggle';
import {
  CurrencyPickerSheet,
  CurrencyPickerHandle,
} from '../sheets/CurrencyPickerSheet';
import { useExpenseStore } from '../store/expenseStore';
import { useTheme } from '../theme/useTheme';
import { DELETE_RED, font } from '../theme/tokens';

export function ProfileScreen({ navigation }: { navigation: any }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const currency = useExpenseStore(s => s.currency);
  const darkMode = useExpenseStore(s => s.darkMode);
  const toggleDarkMode = useExpenseStore(s => s.toggleDarkMode);
  const currencyRef = useRef<CurrencyPickerHandle>(null);

  return (
    <View style={[styles.screen, { backgroundColor: theme.pageBg, paddingTop: insets.top + 18 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: theme.closeBtnBg }]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <ChevronIcon dir="left" color={theme.text} size={14} strokeWidth={1.8} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
      </View>

      <View style={styles.identity}>
        <View style={[styles.bigAvatar, { backgroundColor: theme.avatarBg }]}>
          <Text style={styles.bigAvatarText}>SK</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>Shivam K</Text>
        <Text style={[styles.email, { color: theme.textMuted45 }]}>shivam@example.com</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[styles.sectionLabel, { color: theme.textMuted5 }]}>Settings</Text>
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
          ]}>
          <Pressable
            onPress={() => currencyRef.current?.present()}
            style={[styles.settingRow, { borderBottomColor: theme.divider, borderBottomWidth: 1 }]}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Currency</Text>
            <View style={styles.settingValue}>
              <Text style={[styles.settingValueText, { color: theme.textMuted5 }]}>
                {currency}
              </Text>
              <ChevronIcon dir="right" color={theme.text} size={12} />
            </View>
          </Pressable>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Dark mode</Text>
            <Toggle value={darkMode} onChange={toggleDarkMode} offColor={theme.border} />
          </View>
        </View>

        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.logout, { backgroundColor: theme.cardBg }]}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>

      <CurrencyPickerSheet ref={currencyRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 22,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: font(700),
    letterSpacing: -0.3,
  },
  identity: {
    alignItems: 'center',
    paddingTop: 22,
    paddingHorizontal: 20,
  },
  bigAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAvatarText: {
    color: '#f8f5ef',
    fontSize: 24,
    fontFamily: font(600),
  },
  name: {
    fontSize: 19,
    fontFamily: font(700),
    marginTop: 12,
  },
  email: {
    fontSize: 13.5,
    fontFamily: font(400),
    marginTop: 2,
  },
  body: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 12.5,
    fontFamily: font(600),
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLabel: {
    fontSize: 15.5,
    fontFamily: font(500),
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValueText: {
    fontSize: 14.5,
    fontFamily: font(500),
  },
  logout: {
    marginTop: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(201,74,63,.25)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15.5,
    fontFamily: font(600),
    color: DELETE_RED,
  },
});
