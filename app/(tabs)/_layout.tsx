import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, Settings, Crown } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.bgSecondary,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accentPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      {/* @ts-expect-error expo-router Tabs.Screen type issue */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Home size={size} color={color} />,
        }}
      />
      {/* @ts-expect-error expo-router Tabs.Screen type issue */}
      <Tabs.Screen
        name="recipients"
        options={{
          title: 'Recipients',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Users size={size} color={color} />,
        }}
      />
      {/* @ts-expect-error expo-router Tabs.Screen type issue */}
      <Tabs.Screen
        name="pricing"
        options={{
          title: 'Premium',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Crown size={size} color={color} />,
        }}
      />
      {/* @ts-expect-error expo-router Tabs.Screen type issue */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
