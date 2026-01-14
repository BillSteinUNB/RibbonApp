import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, STORAGE_VERSION } from '../constants/storageKeys';

import { logger } from '../utils/logger';

export class StorageError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Type-safe storage service with error handling
 */
class StorageService {
  private static instance: StorageService;

  private constructor() {
    this.initializeStorage();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize storage and check version for migrations
   */
  private async initializeStorage(): Promise<void> {
    try {
      const currentVersion = await this.getItem<string>(STORAGE_KEYS.STORAGE_VERSION);
      
      if (currentVersion !== STORAGE_VERSION) {
        // Run migrations if version has changed
        await this.runMigrations(currentVersion);
        await this.setItem(STORAGE_KEYS.STORAGE_VERSION, STORAGE_VERSION);
      }
    } catch (error) {
      logger.warn('Failed to initialize storage:', error);
    }
  }

  /**
   * Run storage migrations when schema version changes
   */
  private async runMigrations(fromVersion: string | null): Promise<void> {
    logger.log('Running storage migrations from:', fromVersion);
    
    // Add migration logic here as needed
    // Example: if (!fromVersion) { /* first install setup */ }
    
    try {
      // Clear any deprecated keys
      await this.clearDeprecatedKeys();
    } catch (error) {
      logger.warn('Migration failed:', error);
    }
  }

  /**
   * Clear deprecated storage keys
   */
  private async clearDeprecatedKeys(): Promise<void> {
    const deprecatedKeys: string[] = [];
    
    for (const key of deprecatedKeys) {
      try {
        await this.removeItem(key);
      } catch (error) {
        logger.warn(`Failed to clear deprecated key ${key}:`, error);
      }
    }
  }

  /**
   * Get an item from storage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue !== null) {
        return JSON.parse(jsonValue) as T;
      }
      return null;
    } catch (error) {
      throw new StorageError(`Failed to get item for key: ${key}`, error as Error);
    }
  }

  /**
   * Set an item in storage
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      throw new StorageError(`Failed to set item for key: ${key}`, error as Error);
    }
  }

  /**
   * Remove an item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(`Failed to remove item for key: ${key}`, error as Error);
    }
  }

  /**
   * Get multiple items from storage
   */
  async getItems<T>(keys: string[]): Promise<Map<string, T>> {
    try {
      const items = await AsyncStorage.multiGet(keys);
      const result = new Map<string, T>();
      
      items.forEach(([key, value]) => {
        if (value !== null) {
          result.set(key, JSON.parse(value) as T);
        }
      });
      
      return result;
    } catch (error) {
      throw new StorageError('Failed to get multiple items', error as Error);
    }
  }

  /**
   * Set multiple items in storage
   */
  async setItems<T>(entries: Map<string, T>): Promise<void> {
    try {
      const keyValuePairPairs: [string, string][] = [];
      
      entries.forEach((value, key) => {
        keyValuePairPairs.push([key, JSON.stringify(value)]);
      });
      
      await AsyncStorage.multiSet(keyValuePairPairs);
    } catch (error) {
      throw new StorageError('Failed to set multiple items', error as Error);
    }
  }

  /**
   * Clear all stored data (use with caution)
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new StorageError('Failed to clear storage', error as Error);
    }
  }

  /**
   * Get all keys from storage
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      throw new StorageError('Failed to get all keys', error as Error);
    }
  }

  /**
   * Remove multiple items from storage
   */
  async removeItems(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      throw new StorageError('Failed to remove multiple items', error as Error);
    }
  }

  /**
   * Check if a key exists in storage
   */
  async hasKey(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      throw new StorageError(`Failed to check key existence: ${key}`, error as Error);
    }
  }

  /**
   * Get storage size (estimated)
   */
  async getStorageSize(): Promise<{ keys: number; approxSizeMb: number }> {
    try {
      const keys = await this.getAllKeys();
      const items = await AsyncStorage.multiGet(keys);
      
      let totalSize = 0;
      items.forEach(([key, value]) => {
        if (value) {
          totalSize += key.length + value.length;
        }
      });
      
      return {
        keys: keys.length,
        approxSizeMb: totalSize / (1024 * 1024),
      };
    } catch (error) {
      throw new StorageError('Failed to calculate storage size', error as Error);
    }
  }
}

// Export singleton instance
export const storage = StorageService.getInstance();
