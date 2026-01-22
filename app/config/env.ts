/**
 * Environment Variable Loader
 * Provides type-safe access to environment variables with validation
 */

interface EnvVars {
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
  EXPO_PUBLIC_REVENUECAT_API_KEY?: string;
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
