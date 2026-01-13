import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Expo Router uses the app directory structure
// This file just wraps the router with necessary providers

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
