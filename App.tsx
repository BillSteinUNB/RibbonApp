import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Expo Router uses the app directory structure
// This file wraps the router with necessary providers

export default function App() {
  return (
    <SafeAreaProvider>
      <Slot />
    </SafeAreaProvider>
  );
}
