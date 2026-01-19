/**
 * Secure Storage Adapter for Supabase Auth
 * 
 * CRITICAL: This file uses ONLY dynamic imports for native modules to prevent
 * crashes at JavaScript bundle load time on TestFlight/Production builds.
 */

import { Platform } from 'react-native';

interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

let SecureStoreModule: typeof import('expo-secure-store') | null = null;
let AsyncStorageModule: { default: any } | null = null;

async function getSecureStore() {
  if (SecureStoreModule) return SecureStoreModule;
  try {
    SecureStoreModule = await import('expo-secure-store');
    return SecureStoreModule;
  } catch (e) {
    console.warn('[SecureStorage] expo-secure-store not available:', e);
    return null;
  }
}

async function getAsyncStorage() {
  if (AsyncStorageModule) return AsyncStorageModule.default;
  try {
    AsyncStorageModule = await import('@react-native-async-storage/async-storage');
    return AsyncStorageModule.default;
  } catch (e) {
    console.warn('[SecureStorage] AsyncStorage not available:', e);
    return null;
  }
}

function isSecureStoreAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export const secureStorage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable()) {
        const SecureStore = await getSecureStore();
        if (SecureStore) {
          const value = await SecureStore.getItemAsync(key, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED,
          });
          if (value !== null) {
            return value;
          }
        }
      }
      const AsyncStorage = await getAsyncStorage();
      if (AsyncStorage) {
        return await AsyncStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn(`[SecureStorage] getItem error for "${key}":`, error);
      try {
        const AsyncStorage = await getAsyncStorage();
        if (AsyncStorage) {
          return await AsyncStorage.getItem(key);
        }
      } catch {
        // Silent fail
      }
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isSecureStoreAvailable()) {
        const SecureStore = await getSecureStore();
        if (SecureStore) {
          await SecureStore.setItemAsync(key, value, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED,
          });
          return;
        }
      }
      const AsyncStorage = await getAsyncStorage();
      if (AsyncStorage) {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn(`[SecureStorage] setItem error for "${key}":`, error);
      try {
        const AsyncStorage = await getAsyncStorage();
        if (AsyncStorage) {
          await AsyncStorage.setItem(key, value);
        }
      } catch (fallbackError) {
        console.error(`[SecureStorage] AsyncStorage fallback also failed:`, fallbackError);
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isSecureStoreAvailable()) {
        const SecureStore = await getSecureStore();
        if (SecureStore) {
          await SecureStore.deleteItemAsync(key, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED,
          });
        }
      }
    } catch {
      // Ignore SecureStore errors
    }
    try {
      const AsyncStorage = await getAsyncStorage();
      if (AsyncStorage) {
        await AsyncStorage.removeItem(key);
      }
    } catch {
      // Ignore AsyncStorage errors
    }
  },
};
