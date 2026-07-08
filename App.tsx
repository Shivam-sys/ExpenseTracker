/**
 * Minimal Expense Tracker — implemented from the Claude Design handoff.
 *
 * @format
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExpensesListScreen } from './src/screens/ExpensesListScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { useExpenseStore } from './src/store/expenseStore';
import { getTheme } from './src/theme/tokens';

const Stack = createNativeStackNavigator();

function App() {
  const dark = useExpenseStore(s => s.darkMode);
  const theme = getTheme(dark);

  const navTheme: NavTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme : DefaultTheme).colors,
      background: theme.pageBg,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar
            barStyle={dark ? 'light-content' : 'dark-content'}
            translucent
            backgroundColor="transparent"
          />
          <NavigationContainer theme={navTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Home" component={ExpensesListScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
