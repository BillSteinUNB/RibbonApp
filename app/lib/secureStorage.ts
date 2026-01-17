import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

function isSecureStoreAvailable(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * Supabase-compatible storage adapter that uses SecureStore for auth tokens
 * Simplified version without security tracking to avoid crashes
 */
export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable()) {
        const value = await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
        if (value !== null) {
          return value;
        }
      }
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn(`[SecureStorage] getItem error for "${key}":`, error);
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
        return;
      }
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn(`[SecureStorage] setItem error for "${key}":`, error);
      // Fallback to AsyncStorage
      try {
        await AsyncStorage.setItem(key, value);
      } catch (fallbackError) {
        console.error(`[SecureStorage] AsyncStorage fallback also failed:`, fallbackError);
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
      }
    } catch {
      // Ignore SecureStore errors
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore AsyncStorage errors
    }
  },
};
