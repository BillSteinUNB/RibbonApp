import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>
        <Stack.Screen name="(auth)/sign-up" />
        <Stack.Screen name="(auth)/sign-in" />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="recipients/new" options={{
          presentation: 'modal',
        }} />
        <Stack.Screen name="recipients/[id]" />
        <Stack.Screen name="recipients/[id]/ideas" />
      </Stack>
    </AuthProvider>
  );
}
