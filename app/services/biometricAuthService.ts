import * as LocalAuthentication from 'expo-local-authentication';
import { AppError } from '../types/errors';
import { errorLogger } from './errorLogger';
import { storage } from './storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and biometric authentication
 */
class BiometricAuthService {
  private isAvailableCache: boolean | null = null;
  private isEnabled: boolean = false;

  /**
   * Check if biometric authentication is available on the device
   */
  async checkAvailability(): Promise<boolean> {
    try {
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

  /**
   * Get the type of biometric authentication supported
   */
  async getAuthenticationType(): Promise<string | null> {
    try {
      if (this.isAvailableCache === null) {
        await this.checkAvailability();
      }

      if (!this.isAvailableCache) {
        return null;
      }

      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      // Return the first supported type
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

  /**
   * Authenticate user with biometrics
   */
  async authenticate(promptMessage: string = 'Authenticate to continue'): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error: any) {
      // User cancelled or authentication failed
      if (error.code === 'USER_CANCEL' || error.code === 'NOT_ENROLLED') {
        return false;
      }

      errorLogger.log(error, { context: 'biometricAuthenticate' });
      throw new AppError('Biometric authentication failed');
    }
  }

  /**
   * Check if user has enabled biometric authentication
   */
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

  /**
   * Enable biometric authentication for the user
   */
  async enableBiometric(): Promise<boolean> {
    try {
      // First, verify biometric is available
      const isAvailable = await this.checkAvailability();
      if (!isAvailable) {
        throw new AppError('Biometric authentication is not available');
      }

      // Prompt user to authenticate to confirm they want to enable biometrics
      const authenticated = await this.authenticate('Enable biometric login?');
      if (!authenticated) {
        return false;
      }

      // Save preference
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN + '_biometric_enabled', true);
      this.isEnabled = true;

      return true;
    } catch (error) {
      errorLogger.log(error, { context: 'enableBiometric' });
      throw error;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<void> {
    try {
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN + '_biometric_enabled', false);
      this.isEnabled = false;
    } catch (error) {
      errorLogger.log(error, { context: 'disableBiometric' });
      throw new AppError('Failed to disable biometric authentication');
    }
  }

  /**
   * Get user-friendly authentication type name
   */
  async getAuthenticationTypeName(): Promise<string> {
    const type = await this.getAuthenticationType();
    return type || 'Biometric';
  }
}

// Export singleton instance
export const biometricAuthService = new BiometricAuthService();
