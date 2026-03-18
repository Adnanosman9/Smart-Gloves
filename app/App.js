import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Text, StyleSheet } from 'react-native';

import { TranslateScreen } from './src/screens/TranslateScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();
const ICONS = { Translate: '🧤', History: '📋' };

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#080c14" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: styles.tab,
            tabBarActiveTintColor: '#3a7bd5',
            tabBarInactiveTintColor: '#2a4060',
            tabBarLabelStyle: styles.label,
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 18, opacity: color === '#3a7bd5' ? 1 : 0.4 }}>
                {ICONS[route.name]}
              </Text>
            ),
          })}
        >
          <Tab.Screen name="Translate" component={TranslateScreen} />
          <Tab.Screen name="History" component={HistoryScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tab: {
    backgroundColor: '#080c14',
    borderTopColor: '#1a2a40',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
  },
  label: {
    fontSize: 10,
    fontFamily: 'Courier New',
    letterSpacing: 1,
  },
});
