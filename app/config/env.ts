/**
 * Environment Variable Loader
 * Provides type-safe access to environment variables with validation
 */

/**
 * Environment interface
 */
interface EnvVars {
  EXPO_PUBLIC_API_KEY?: string;
  EXPO_PUBLIC_AI_API_KEY?: string;
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
  EXPO_PUBLIC_FIREBASE_API_KEY?: string;
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
  EXPO_PUBLIC_FIREBASE_APP_ID?: string;
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
  EXPO_PUBLIC_ANALYTICS_ID?: string;
  EXPO_PUBLIC_REVENUECAT_API_KEY?: string;
}

/**
 * Get environment variable with optional validation
 */
export function getEnvVar(name: keyof EnvVars): string | undefined {
  const value = process.env[name];

  if (!value && isEnvVarRequired(name)) {
    throw new Error(`Required environment variable ${name} is not set`);
  }

  return value;
}

/**
 * Check if environment variable is required
 */
function isEnvVarRequired(name: keyof EnvVars): boolean {
  const requiredVars: (keyof EnvVars)[] = [
    'EXPO_PUBLIC_AI_API_KEY',
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ];

  return requiredVars.includes(name);
}

/**
 * Get all environment variables
 */
export function getAllEnvVars(): EnvVars {
  return process.env as unknown as EnvVars;
}

/**
 * Validate all required environment variables
 */
export function validateEnvVars(): { valid: boolean; missing: string[] } {
  const requiredVars: (keyof EnvVars)[] = [
    'EXPO_PUBLIC_AI_API_KEY',
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing: string[] = [];

  for (const varName of requiredVars) {
    if (!getEnvVar(varName)) {
      missing.push(varName);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return __DEV__;
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return !__DEV__;
}

/**
 * Get current environment name
 */
export function getEnvironmentName(): 'development' | 'production' {
  return isDevelopment() ? 'development' : 'production';
}

/**
 * RevenueCat Configuration
 */
export const REVENUECAT_CONFIG = {
  // Use environment variable if available, otherwise use test key
  apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || 'test_DFHjpUvPJPbWkARVGuQSDQRSmEB',
  entitlementId: 'Ribbon Pro',
  // Product identifiers matching RevenueCat dashboard configuration
  products: {
    weekly: 'weekly',
    monthly: 'monthly',
    yearly: 'yearly',
    consumable: 'consumable',
  },
} as const;
