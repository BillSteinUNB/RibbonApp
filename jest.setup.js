// Jest setup file for Expo Router tests
import 'react-native-gesture-handler/jestSetup';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: 'Stack',
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    scheme: 'ribbon',
  },
}));

// Silence console.log during tests unless debugging
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
