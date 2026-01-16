import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Secure Storage Adapter
 * Uses native Keychain (iOS) / Keystore (Android) for sensitive data
 * Falls back to AsyncStorage for web or when SecureStore is unavailable
 *
 * This adapter implements the Storage interface required by Supabase
 */

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

/**
 * Check if SecureStore is available on this platform
 */
function isSecureStoreAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Supabase-compatible storage adapter that uses SecureStore for auth tokens
 */
export const secureStorage = {
  /**
   * Get an item from secure storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable()) {
        return await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
      }
      // Fallback to AsyncStorage for web
      return await AsyncStorage.getItem(key);
    } catch (error) {
      // SecureStore can throw if the key doesn't exist or on certain errors
      // Fall back to AsyncStorage
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    }
  },

  /**
   * Set an item in secure storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
        return;
      }
      // Fallback to AsyncStorage for web
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // If SecureStore fails (e.g., value too large), fall back to AsyncStorage
      // SecureStore has a ~2KB limit on some platforms
      await AsyncStorage.setItem(key, value);
    }
  },

  /**
   * Remove an item from secure storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
      }
      // Also remove from AsyncStorage in case it was stored there as fallback
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Ignore errors on removal
    }
  },
};

/**
 * Migrate existing auth data from AsyncStorage to SecureStore
 * Call this once on app startup to migrate existing sessions
 */
export async function migrateToSecureStorage(keys: string[]): Promise<void> {
  if (!isSecureStoreAvailable()) return;

  for (const key of keys) {
    try {
      // Check if data exists in AsyncStorage
      const asyncValue = await AsyncStorage.getItem(key);
      if (asyncValue) {
        // Check if already in SecureStore
        const secureValue = await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
        if (!secureValue) {
          // Migrate to SecureStore
          await SecureStore.setItemAsync(key, asyncValue, SECURE_STORE_OPTIONS);
        }
        // Remove from AsyncStorage after successful migration
        await AsyncStorage.removeItem(key);
      }
    } catch {
      // If migration fails for a key, continue with others
    }
  }
}
