export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    pushNotifications: boolean;
  };
  analytics: {
    enabled: boolean;
    consentGiven: boolean;
    consentDate?: string;
  };
  language: string;
  currency: string;
}

export interface AppSettings {
  version: string;
  buildNumber: string;
  supportEmail: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  notifications: {
    pushNotifications: true,
  },
  analytics: {
    enabled: false,
    consentGiven: false,
  },
  language: 'en',
  currency: 'USD'
};
