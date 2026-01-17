/**
 * Safe Storage Adapter
 * 
 * Provides a fallback-safe wrapper around AsyncStorage that won't crash
 * if the native module fails to load. Uses in-memory storage as fallback.
 */

interface StorageAdapter {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
}

const memoryStorage: Record<string, string> = {};

const memoryStorageAdapter: StorageAdapter = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, value: string) => { memoryStorage[key] = value; },
  removeItem: (key: string) => { delete memoryStorage[key]; },
};

let asyncStorageModule: StorageAdapter | null = null;
let loadAttempted = false;

function getAsyncStorage(): StorageAdapter {
  if (loadAttempted) {
    return asyncStorageModule ?? memoryStorageAdapter;
  }

  loadAttempted = true;

  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
      asyncStorageModule = AsyncStorage;
      return AsyncStorage;
    }
  } catch (e) {
    console.warn('[SafeStorage] AsyncStorage not available, using memory fallback:', e);
  }

  return memoryStorageAdapter;
}

export const safeStorage: StorageAdapter = {
  getItem: (key: string) => {
    try {
      return getAsyncStorage().getItem(key);
    } catch (e) {
      console.warn('[SafeStorage] getItem failed, using memory:', e);
      return memoryStorageAdapter.getItem(key);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      return getAsyncStorage().setItem(key, value);
    } catch (e) {
      console.warn('[SafeStorage] setItem failed, using memory:', e);
      return memoryStorageAdapter.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    try {
      return getAsyncStorage().removeItem(key);
    } catch (e) {
      console.warn('[SafeStorage] removeItem failed, using memory:', e);
      return memoryStorageAdapter.removeItem(key);
    }
  },
};

export function getSafeStorage(): StorageAdapter {
  return safeStorage;
}
