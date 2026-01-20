import { Tabs } from 'expo-router';
import { COLORS } from '../constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.accentPrimary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      {/* @ts-expect-error expo-router Tabs.Screen type issue */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      {/* @ts-expect-error expo-router Tabs.Screen type issue */}
      <Tabs.Screen
        name="recipients"
        options={{
          title: 'Recipients',
        }}
      />
      {/* @ts-expect-error expo-router Tabs.Screen type issue */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
      {/* @ts-expect-error expo-router Tabs.Screen type issue */}
      <Tabs.Screen
        name="pricing"
        options={{
          title: 'Premium',
        }}
      />
    </Tabs>
  );
}
