/**
 * Supabase Client - Safe Lazy Initialization
 *
 * CRITICAL: This file uses ONLY dynamic imports to prevent crashes
 * at JavaScript bundle load time on TestFlight/Production builds.
 *
 * DO NOT add static imports for:
 * - react-native-url-polyfill/auto (side-effect import)
 * - Any native modules
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { secureStorage } from './secureStorage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy initialization state
let _supabase: SupabaseClient | null = null;
let _urlPolyfillLoaded = false;
let _urlPolyfillPromise: Promise<void> | null = null;

/**
 * Ensure URL polyfill is loaded before using Supabase
 * Uses dynamic import to prevent side-effect execution at bundle load
 */
async function ensureUrlPolyfill(): Promise<void> {
  if (_urlPolyfillLoaded) return;

  if (_urlPolyfillPromise) {
    return _urlPolyfillPromise;
  }

  _urlPolyfillPromise = (async () => {
    try {
      await import('react-native-url-polyfill/auto');
      _urlPolyfillLoaded = true;
    } catch (e) {
      console.warn('[Supabase] URL polyfill load failed (non-fatal):', e);
      // Continue anyway - polyfill may not be needed on all platforms
      _urlPolyfillLoaded = true;
    }
  })();

  return _urlPolyfillPromise;
}

/**
 * Get Supabase client - ensures polyfill is loaded first
 */
async function getSupabaseClientAsync(): Promise<SupabaseClient> {
  await ensureUrlPolyfill();

  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        '[Supabase] Missing credentials. EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set.'
      );
    }

    _supabase = createClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder',
      {
        auth: {
          storage: secureStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      }
    );
  }

  return _supabase;
}

/**
 * Get Supabase client synchronously (for backward compatibility)
 * WARNING: May return placeholder client if called before polyfill loads
 */
function getSupabaseClientSync(): SupabaseClient {
  if (_supabase) {
    return _supabase;
  }

  // Create client without waiting for polyfill - risky but needed for sync access
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '[Supabase] Missing credentials. EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set.'
    );
  }

  _supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder',
    {
      auth: {
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );

  // Load polyfill in background for future calls
  ensureUrlPolyfill().catch(() => {});

  return _supabase;
}

/**
 * Export async getter for proper initialization
 */
export { getSupabaseClientAsync };

/**
 * Export a proxy that lazily initializes on first access
 * This maintains backward compatibility with existing code using `supabase.auth.xxx`
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    // Trigger polyfill load on first access
    ensureUrlPolyfill().catch(() => {});

    const client = getSupabaseClientSync();
    const value = (client as any)[prop];

    if (typeof value === 'function') {
      return value.bind(client);
    }

    return value;
  },
});
