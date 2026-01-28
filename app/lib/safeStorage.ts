/**
 * Safe Storage Adapter
 * 
 * Provides a fallback-safe wrapper around AsyncStorage that won't crash
 * if the native module fails to load. Uses in-memory storage as fallback.
 * 
 * CRITICAL: Uses dynamic imports only - no static native module imports.
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

let asyncStorageModule: any = null;
let loadAttempted = false;
let loadPromise: Promise<any> | null = null;

async function loadAsyncStorage(): Promise<any> {
  if (asyncStorageModule) return asyncStorageModule;
  if (loadPromise) return loadPromise;
  
  loadPromise = (async () => {
    try {
      const module = await import('@react-native-async-storage/async-storage');
      if (module?.default && typeof module.default.getItem === 'function') {
        asyncStorageModule = module.default;
        return asyncStorageModule;
      }
    } catch (e) {
      if (__DEV__) console.warn('[SafeStorage] AsyncStorage not available, using memory fallback:', e);
    }
    return null;
  })();
  
  return loadPromise;
}

function getStorageSync(): StorageAdapter {
  if (asyncStorageModule) return asyncStorageModule;
  return memoryStorageAdapter;
}

export const safeStorage: StorageAdapter = {
  getItem: async (key: string) => {
    try {
      if (!loadAttempted) {
        loadAttempted = true;
        await loadAsyncStorage();
      }
      const storage = getStorageSync();
      return await storage.getItem(key);
    } catch (e) {
      if (__DEV__) console.warn('[SafeStorage] getItem failed, using memory:', e);
      return memoryStorageAdapter.getItem(key);
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (!loadAttempted) {
        loadAttempted = true;
        await loadAsyncStorage();
      }
      const storage = getStorageSync();
      return await storage.setItem(key, value);
    } catch (e) {
      if (__DEV__) console.warn('[SafeStorage] setItem failed, using memory:', e);
      return memoryStorageAdapter.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    try {
      if (!loadAttempted) {
        loadAttempted = true;
        await loadAsyncStorage();
      }
      const storage = getStorageSync();
      return await storage.removeItem(key);
    } catch (e) {
      if (__DEV__) console.warn('[SafeStorage] removeItem failed, using memory:', e);
      return memoryStorageAdapter.removeItem(key);
    }
  },
};

export function getSafeStorage(): StorageAdapter {
  return safeStorage;
}
