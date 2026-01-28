import * as Linking from 'expo-linking';
import { logger } from './logger';
import { ROUTES } from '../constants/routes';

/**
 * Deep linking configuration for the Ribbon app
 *
 * Supported URL schemes:
 * - ribbon://                    -> Opens home screen
 * - ribbon://recipients          -> Opens recipients list
 * - ribbon://recipients/new      -> Opens new recipient form
 * - ribbon://recipients/:id      -> Opens recipient detail
 * - ribbon://recipients/:id/edit -> Opens recipient edit form
 * - ribbon://recipients/:id/ideas -> Opens gift ideas generation
 * - ribbon://settings            -> Opens settings screen
 * - ribbon://pricing             -> Opens pricing/subscription screen
 *
 * Universal links (for web):
 * - https://ribbon.app/recipients/:id (if configured with Apple/Android App Links)
 */

// App URL scheme
export const APP_SCHEME = 'ribbon';

// Prefixes that the app can handle
export const LINKING_PREFIXES = [
  `${APP_SCHEME}://`,
  'https://ribbon.app',
  'https://*.ribbon.app',
];

/**
 * Create a deep link URL for the app
 */
export function createDeepLink(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return Linking.createURL(cleanPath);
}

/**
 * Parse a deep link URL and extract the path
 */
export function parseDeepLink(url: string): { path: string; queryParams: Record<string, string> } | null {
  try {
    const parsed = Linking.parse(url);
    return {
      path: parsed.path || '',
      queryParams: (parsed.queryParams || {}) as Record<string, string>,
    };
  } catch (error) {
    logger.error('Failed to parse deep link:', error);
    return null;
  }
}

/**
 * Get the target route from a deep link URL
 * Returns the route path that should be navigated to
 */
export function getRouteFromDeepLink(url: string): string | null {
  try {
    const parsed = parseDeepLink(url);
    if (!parsed) {
      logger.warn('Could not parse deep link:', url);
      return null;
    }

    const { path } = parsed;

    // Map URL paths to app routes
    let targetRoute = path;

    // Handle root URL -> home
    if (!path || path === '') {
      targetRoute = ROUTES.TABS.ROOT;
    }
    // Handle /recipients -> recipients tab
    else if (path === 'recipients') {
      targetRoute = ROUTES.TABS.RECIPIENTS;
    }
    // Handle /settings -> settings tab
    else if (path === 'settings') {
      targetRoute = ROUTES.TABS.SETTINGS;
    }
    // Handle /pricing -> pricing tab
    else if (path === 'pricing') {
      targetRoute = ROUTES.TABS.PRICING;
    }
    // Handle /recipients/:id -> recipient detail
    else if (path.match(/^recipients\/[^/]+$/)) {
      const id = path.split('/')[1];
      targetRoute = ROUTES.RECIPIENTS.DETAIL(id);
    }
    // Handle /recipients/:id/edit
    else if (path.match(/^recipients\/[^/]+\/edit$/)) {
      const id = path.split('/')[1];
      targetRoute = ROUTES.RECIPIENTS.EDIT(id);
    }
    // Handle /recipients/:id/ideas
    else if (path.match(/^recipients\/[^/]+\/ideas$/)) {
      const id = path.split('/')[1];
      targetRoute = ROUTES.RECIPIENTS.IDEAS(id);
    }
    // Handle /recipients/:id/results
    else if (path.match(/^recipients\/[^/]+\/results$/)) {
      const id = path.split('/')[1];
      targetRoute = ROUTES.RECIPIENTS.RESULTS(id);
    }
    // Other paths are handled directly by expo-router file-based routing

    logger.log('Deep link resolved to route:', targetRoute);

    return targetRoute;
  } catch (error) {
    logger.error('Failed to parse deep link:', error);
    return null;
  }
}

/**
 * Handle incoming deep link URL with a navigation callback
 * @param url The deep link URL
 * @param navigate Function to perform navigation (e.g., router.push)
 */
export function handleDeepLink(url: string, navigate: (route: string) => void): boolean {
  const route = getRouteFromDeepLink(url);
  if (route) {
    navigate(route);
    return true;
  }
  return false;
}

/**
 * Set up deep link listener for when app is already running
 * @param callback Function to call when a deep link is received
 */
export function setupDeepLinkListener(callback: (url: string) => void): () => void {
  const subscription = Linking.addEventListener('url', (event) => {
    logger.log('Received deep link while running:', event.url);
    callback(event.url);
  });

  return () => {
    subscription.remove();
  };
}

/**
 * Get the initial URL that launched the app (if any)
 */
export async function getInitialDeepLink(): Promise<string | null> {
  try {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      logger.log('App launched with deep link:', initialUrl);
    }
    return initialUrl;
  } catch (error) {
    logger.error('Failed to get initial URL:', error);
    return null;
  }
}

/**
 * Check if a URL can be handled by the app
 */
export function canHandleUrl(url: string): boolean {
  return LINKING_PREFIXES.some(prefix => url.startsWith(prefix));
}

/**
 * Open an external URL in the system browser
 */
export async function openExternalUrl(url: string): Promise<boolean> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (error) {
    logger.error('Failed to open external URL:', error);
    return false;
  }
}

/**
 * Generate shareable links for app content
 */
export const ShareableLinks = {
  recipient: (recipientId: string) => createDeepLink(`recipients/${recipientId}`),
  newRecipient: () => createDeepLink('recipients/new'),
  settings: () => createDeepLink('settings'),
  pricing: () => createDeepLink('pricing'),
};
