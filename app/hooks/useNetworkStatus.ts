import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface NetworkStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

const CONNECTIVITY_CHECK_URL = 'https://clients3.google.com/generate_204';
const CHECK_TIMEOUT_MS = 5000;
const CHECK_INTERVAL_MS = 30000; // Check every 30 seconds when app is active

/**
 * Hook to detect network connectivity status.
 * Uses a lightweight connectivity check rather than native modules.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true, // Assume connected initially
    isChecking: false,
    lastChecked: null,
  });

  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const checkConnectivity = useCallback(async () => {
    if (!isMountedRef.current) return;

    setStatus((prev) => ({ ...prev, isChecking: true }));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

      const response = await fetch(CONNECTIVITY_CHECK_URL, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (isMountedRef.current) {
        setStatus({
          isConnected: response.ok || response.status === 204,
          isChecking: false,
          lastChecked: new Date(),
        });
      }
    } catch {
      if (isMountedRef.current) {
        setStatus({
          isConnected: false,
          isChecking: false,
          lastChecked: new Date(),
        });
      }
    }
  }, []);

  // Start/stop interval based on app state
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Check immediately when app becomes active
        checkConnectivity();

        // Start periodic checks
        if (!checkIntervalRef.current) {
          checkIntervalRef.current = setInterval(checkConnectivity, CHECK_INTERVAL_MS);
        }
      } else {
        // Stop periodic checks when app is backgrounded
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
    },
    [checkConnectivity]
  );

  useEffect(() => {
    isMountedRef.current = true;

    // Initial connectivity check
    checkConnectivity();

    // Start periodic checks
    checkIntervalRef.current = setInterval(checkConnectivity, CHECK_INTERVAL_MS);

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      isMountedRef.current = false;
      subscription.remove();
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkConnectivity, handleAppStateChange]);

  return status;
}

/**
 * Manually check connectivity (useful for retry buttons)
 */
export async function checkNetworkConnectivity(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const response = await fetch(CONNECTIVITY_CHECK_URL, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok || response.status === 204;
  } catch {
    return false;
  }
}
