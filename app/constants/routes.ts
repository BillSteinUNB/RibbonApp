/**
 * Route constants for the app
 * Centralizes all route paths to prevent hard-coding throughout the codebase
 */

export const ROUTES = {
  // Root routes
  ONBOARDING: '/onboarding' as const,

  // Tab routes
  TABS: {
    ROOT: '/(tabs)' as const,
    HOME: '/(tabs)' as const,
    RECIPIENTS: '/(tabs)/recipients' as const,
    SETTINGS: '/(tabs)/settings' as const,
    PRICING: '/(tabs)/pricing' as const,
  },

  // Recipient routes
  RECIPIENTS: {
    NEW: '/recipients/new' as const,
    DETAIL: (id: string) => `/recipients/${id}` as const,
    EDIT: (id: string) => `/recipients/${id}/edit` as const,
    IDEAS: (id: string) => `/recipients/${id}/ideas` as const,
    RESULTS: (id: string) => `/recipients/${id}/results` as const,
  },
} as const;

// Type for route params
export type RecipientRouteParams = {
  id: string;
};
