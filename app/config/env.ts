/**
 * Environment Variable Loader
 * Provides type-safe access to environment variables with validation
 */

interface EnvVars {
  EXPO_PUBLIC_API_KEY?: string;
  EXPO_PUBLIC_AI_API_URL?: string;
  EXPO_PUBLIC_AI_API_KEY?: string;
  EXPO_PUBLIC_REVENUECAT_API_KEY?: string;
  EXPO_PUBLIC_FIREBASE_API_KEY?: string;
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
  EXPO_PUBLIC_FIREBASE_APP_ID?: string;
  EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID?: string;
  EXPO_PUBLIC_ANALYTICS_ID?: string;
}

export function getEnvVar(name: keyof EnvVars): string | undefined {
  const value = process.env[name];

  if (!value && isEnvVarRequired(name)) {
    throw new Error(`Required environment variable ${name} is not set`);
  }

  return value;
}

function isEnvVarRequired(name: keyof EnvVars): boolean {
  const requiredVars: (keyof EnvVars)[] = [];

  return requiredVars.includes(name);
}

export function getAllEnvVars(): EnvVars {
  return process.env as unknown as EnvVars;
}

export function validateEnvVars(): { valid: boolean; missing: string[] } {
  const requiredVars: (keyof EnvVars)[] = [];

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

export function isDevelopment(): boolean {
  return __DEV__;
}

export function isProduction(): boolean {
  return !__DEV__;
}

export function getEnvironmentName(): 'development' | 'production' {
  return isDevelopment() ? 'development' : 'production';
}
