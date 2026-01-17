/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and biometric authentication
 * 
 * CRITICAL: No static imports of native modules - uses dynamic imports.
 */

import { AppError } from '../types/errors';
import { errorLogger } from './errorLogger';
import { storage } from './storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

type LocalAuthModule = typeof import('expo-local-authentication');

let LocalAuthenticationModule: LocalAuthModule | null = null;

async function getLocalAuthentication(): Promise<LocalAuthModule | null> {
  if (LocalAuthenticationModule) return LocalAuthenticationModule;
  try {
    LocalAuthenticationModule = await import('expo-local-authentication');
    return LocalAuthenticationModule;
  } catch (e) {
    console.warn('[BiometricAuth] expo-local-authentication not available:', e);
    return null;
  }
}

class BiometricAuthService {
  private isAvailableCache: boolean | null = null;
  private isEnabled: boolean = false;

  async checkAvailability(): Promise<boolean> {
    try {
      const LocalAuthentication = await getLocalAuthentication();
      if (!LocalAuthentication) return false;
      
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      const isAvailable = hasHardware && isEnrolled && supportedTypes.length > 0;
      this.isAvailableCache = isAvailable;
      
      return isAvailable;
    } catch (error) {
      errorLogger.log(error, { context: 'checkBiometricAvailability' });
      return false;
    }
  }

  async getAuthenticationType(): Promise<string | null> {
    try {
      if (this.isAvailableCache === null) {
        await this.checkAvailability();
      }

      if (!this.isAvailableCache) {
        return null;
      }

      const LocalAuthentication = await getLocalAuthentication();
      if (!LocalAuthentication) return null;
      
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Biometric';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      } else {
        return 'Biometric';
      }
    } catch (error) {
      errorLogger.log(error, { context: 'getAuthenticationType' });
      return null;
    }
  }

  async authenticate(promptMessage: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      const LocalAuthentication = await getLocalAuthentication();
      if (!LocalAuthentication) return false;
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error: any) {
      if (error.code === 'USER_CANCEL' || error.code === 'NOT_ENROLLED') {
        return false;
      }

      errorLogger.log(error, { context: 'biometricAuthenticate' });
      throw new AppError('Biometric authentication failed');
    }
  }

  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await storage.getItem<boolean>(STORAGE_KEYS.AUTH_TOKEN + '_biometric_enabled');
      this.isEnabled = enabled ?? false;
      return this.isEnabled;
    } catch (error) {
      errorLogger.log(error, { context: 'isBiometricEnabled' });
      return false;
    }
  }

  async enableBiometric(): Promise<boolean> {
    try {
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        throw new AppError('Biometric authentication is not available');
      }

      const authenticated = await this.authenticate('Enable biometric login?');
      if (!authenticated) {
        return false;
      }

      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN + '_biometric_enabled', true);
      this.isEnabled = true;

      return true;
    } catch (error) {
      errorLogger.log(error, { context: 'enableBiometric' });
      throw error;
    }
  }

  async disableBiometric(): Promise<void> {
    try {
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN + '_biometric_enabled', false);
      this.isEnabled = false;
    } catch (error) {
      errorLogger.log(error, { context: 'disableBiometric' });
      throw new AppError('Failed to disable biometric authentication');
    }
  }

  async getAuthenticationTypeName(): Promise<string> {
    const type = await this.getAuthenticationType();
    return type || 'Biometric';
  }
}

export const biometricAuthService = new BiometricAuthService();
