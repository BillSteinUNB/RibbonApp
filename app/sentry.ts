/**
 * Sentry initialization - MUST be imported first in _layout.tsx
 * This file should have NO other imports that could crash
 */
import * as Sentry from '@sentry/react-native';

// Initialize with safe defaults
try {
  Sentry.init({
    dsn: 'https://b71131849b83863eb53d60386a1a7823@o4510722439774208.ingest.us.sentry.io/4510722440757248',
    debug: true, // Always debug to see issues
    tracesSampleRate: 0.5,
    // Disable native features that might cause issues
    enableNative: false, // Disable native crash reporting initially
    enableNativeCrashHandling: false,
    enableAutoSessionTracking: false,
    enableAutoPerformanceTracing: false,
  });
  console.log('[Sentry] Initialized successfully');
} catch (error) {
  console.error('[Sentry] Failed to initialize:', error);
}

export { Sentry };
