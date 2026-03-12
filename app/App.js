
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View, Text, StyleSheet } from 'react-native';

import { TranslateScreen } from './src/screens/TranslateScreen';
import { HistoryScreen }   from './src/screens/HistoryScreen';
import { SettingsScreen }  from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICON = { Translate: '🧤', History: '📋', Settings: '⚙️' };

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#080c14" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#3a7bd5',
            tabBarInactiveTintColor: '#2a4060',
            tabBarLabelStyle: styles.tabLabel,
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 18, opacity: color === '#3a7bd5' ? 1 : 0.4 }}>
                {TAB_ICON[route.name]}
              </Text>
            ),
          })}
        >
          <Tab.Screen name="Translate" component={TranslateScreen} />
          <Tab.Screen name="History"   component={HistoryScreen} />
          <Tab.Screen name="Settings"  component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#080c14',
    borderTopColor: '#1a2a40',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Courier New',
    letterSpacing: 1,
  },
});
