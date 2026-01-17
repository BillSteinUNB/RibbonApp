/**
 * Sentry initialization - guarded to avoid native launch crashes in TestFlight
 * Use safe wrappers so a native Sentry failure never blocks app startup.
 * 
 * IMPORTANT: This file uses ONLY dynamic require() for @sentry/react-native
 * to prevent crashes at JavaScript bundle load time. The native Sentry module
 * is also disabled (enableNative: false) to avoid native initialization crashes.
 */

type Breadcrumb = {
  category?: string;
  message?: string;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
};

interface SentrySafeApi {
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
  captureException: (error: unknown) => void;
  wrap: <T>(component: T) => T;
}

const SentrySafe: SentrySafeApi = {
  addBreadcrumb: () => {},
  captureException: (error) => {
    // Fallback: log to console if Sentry isn't available
    console.warn('[Sentry Fallback] captureException:', error);
  },
  wrap: (component) => component,
};

let isInitialized = false;
let initAttempted = false;

export function initSentry(): void {
  if (isInitialized || initAttempted) return;
  initAttempted = true;

  try {
    // Double-wrapped require for maximum safety
    let SentryModule: typeof import('@sentry/react-native') | null = null;
    
    try {
      SentryModule = require('@sentry/react-native');
    } catch (requireError) {
      console.warn('[Sentry] Native module not available, using fallback:', requireError);
      return;
    }

    if (!SentryModule || typeof SentryModule.init !== 'function') {
      console.warn('[Sentry] Module loaded but init function not found');
      return;
    }

    // Initialize with ALL native features disabled
    SentryModule.init({
      dsn: 'https://b71131849b83863eb53d60386a1a7823@o4510722439774208.ingest.us.sentry.io/4510722440757248',
      debug: false,
      tracesSampleRate: 0,
      enableNative: false,
      enableNativeCrashHandling: false,
      enableAutoSessionTracking: false,
      enableAutoPerformanceTracing: false,
    });

    // Only override safe methods if init succeeded
    const Sentry = SentryModule;

    SentrySafe.addBreadcrumb = (breadcrumb) => {
      try {
        Sentry.addBreadcrumb(breadcrumb as any);
      } catch {
        // Silent fail
      }
    };

    SentrySafe.captureException = (error) => {
      try {
        Sentry.captureException(error as any);
      } catch {
        console.warn('[Sentry Fallback] captureException failed:', error);
      }
    };

    SentrySafe.wrap = (component) => {
      try {
        return Sentry.wrap(component as any) as any;
      } catch {
        return component;
      }
    };

    isInitialized = true;
    console.log('[Sentry] Initialized successfully (native disabled)');
  } catch (error) {
    console.warn('[Sentry] Initialization failed, using fallback:', error);
    isInitialized = false;
  }
}

export { SentrySafe as Sentry };
