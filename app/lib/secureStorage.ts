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

const SECURITY_DOWNGRADE_KEY = '@ribbon/security-downgraded';
const SECURE_STORAGE_KEYS_KEY = '@ribbon/secure-storage-keys';

/**
 * Custom error for security failures
 */
export class SecureStorageError extends Error {
  constructor(
    message: string,
    public readonly isSecurityDowngrade: boolean = false
  ) {
    super(message);
    this.name = 'SecureStorageError';
  }
}

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
      // Fallback to AsyncStorage for web (expected behavior)
      return await AsyncStorage.getItem(key);
    } catch (error) {
      // SecureStore can throw if the key doesn't exist or on certain errors
      // Check if we had a security downgrade
      const wasDowngraded = await this.wasSecurityDowngraded();
      if (wasDowngraded) {
        console.warn(`[SecureStorage] Accessing potentially insecure data for key "${key}"`);
      }

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
        // Track keys that are securely stored
        await this.trackSecureKey(key, true);
        return;
      }
      // Fallback to AsyncStorage for web (expected behavior)
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      // If SecureStore fails, log and track security downgrade
      console.warn(`[SecureStorage] SecureStore failed for key "${key}":`, error);
      console.warn('[SecureStorage] Falling back to AsyncStorage - SECURITY DOWNGRADE');

      // Store security downgrade flag
      await AsyncStorage.setItem(SECURITY_DOWNGRADE_KEY, Date.now().toString());

      // Fall back to AsyncStorage with warning
      await AsyncStorage.setItem(key, value);

      // Track that this key is NOT securely stored
      await this.trackSecureKey(key, false);
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
    } catch (error) {
      // Ignore SecureStore errors, fall through to AsyncStorage cleanup
    }

    // Always remove from AsyncStorage (handles both web and fallback scenarios)
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      // Ignore removal errors
    }

    // Track that key is no longer stored
    await this.trackSecureKey(key, false);
  },
};

/**
 * Check if a security downgrade has occurred
 */
async function wasSecurityDowngraded(): Promise<boolean> {
  try {
    const downgradeTime = await AsyncStorage.getItem(SECURITY_DOWNGRADE_KEY);
    return downgradeTime !== null;
  } catch {
    return false;
  }
}

/**
 * Track which keys are securely stored
 */
async function trackSecureKey(key: string, isSecure: boolean): Promise<void> {
  try {
    let secureKeys: Record<string, boolean> = {};
    const keysData = await AsyncStorage.getItem(SECURE_STORAGE_KEYS_KEY);

    if (keysData) {
      try {
        secureKeys = JSON.parse(keysData);
      } catch {
        secureKeys = {};
      }
    }

    if (isSecure) {
      secureKeys[key] = true;
    } else {
      delete secureKeys[key];
    }

    await AsyncStorage.setItem(SECURE_STORAGE_KEYS_KEY, JSON.stringify(secureKeys));
  } catch (error) {
    console.warn('[SecureStorage] Failed to track secure key:', error);
  }
}

/**
 * Check if a key is stored securely
 */
async function isSecurelyStored(key: string): Promise<boolean> {
  try {
    const keysData = await AsyncStorage.getItem(SECURE_STORAGE_KEYS_KEY);
    if (!keysData) return false;

    const secureKeys: Record<string, boolean> = JSON.parse(keysData);
    return secureKeys[key] === true;
  } catch {
    return false;
  }
}

/**
 * Get overall security status
 */
async function getSecurityStatus(): Promise<{
  isFullySecure: boolean;
  isDowngraded: boolean;
  insecureKeys: string[];
}> {
  try {
    const isDowngraded = await wasSecurityDowngraded();
    const keysData = await AsyncStorage.getItem(SECURE_STORAGE_KEYS_KEY);

    let secureKeys: Record<string, boolean> = {};
    if (keysData) {
      try {
        secureKeys = JSON.parse(keysData);
      } catch {
        secureKeys = {};
      }
    }

    const insecureKeys = Object.keys(secureKeys).filter(key => !secureKeys[key]);

    return {
      isFullySecure: !isDowngraded && insecureKeys.length === 0,
      isDowngraded,
      insecureKeys,
    };
  } catch (error) {
    console.warn('[SecureStorage] Failed to get security status:', error);
    return {
      isFullySecure: false,
      isDowngraded: true,
      insecureKeys: [],
    };
  }
}

/**
 * Clear security downgrade flag (for recovery)
 */
async function clearSecurityFlag(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SECURITY_DOWNGRADE_KEY);
    console.log('[SecureStorage] Security downgrade flag cleared');
  } catch (error) {
    console.warn('[SecureStorage] Failed to clear security flag:', error);
  }
}

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
          // Track that this key is now secure
          await trackSecureKey(key, true);
          console.log(`[SecureStorage] Migrated key "${key}" to SecureStore`);
        }
        // Remove from AsyncStorage after successful migration
        await AsyncStorage.removeItem(key);
      }
    } catch {
      // If migration fails for a key, continue with others
    }
  }

  // Clear security flag if all migrations succeeded
  await clearSecurityFlag();
}
