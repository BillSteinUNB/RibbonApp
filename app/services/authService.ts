import { supabase } from '../lib/supabase';
import { AppError } from '../types/errors';
import { logger } from '../utils/logger';
import { errorLogger } from './errorLogger';

export const authService = {
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw new AppError(error.message);
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new AppError(error.message);
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AppError(error.message);
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new AppError(error.message);
  },

  /**
   * Validate current session on app startup
   * Checks token expiration and forces re-auth if needed
   * @returns {isValid: boolean, needsReauth: boolean}
   */
  async validateSession(): Promise<{ isValid: boolean; needsReauth: boolean; user?: import('@supabase/supabase-js').User }> {
    try {
      logger.log('[AuthService] Validating session...');

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('[AuthService] Session validation failed:', error);
        return { isValid: false, needsReauth: true };
      }

      // No session exists
      if (!session) {
        logger.log('[AuthService] No active session');
        return { isValid: false, needsReauth: false };
      }

      // Check if session is expired
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);

      if (expiresAt && expiresAt < now) {
        logger.warn('[AuthService] Session expired, needs re-authentication');
        return { isValid: false, needsReauth: true };
      }

      // Session is valid, get user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        logger.warn('[AuthService] Session valid but no user found');
        return { isValid: false, needsReauth: true };
      }

      logger.log('[AuthService] Session valid for user:', user.email);
      return { isValid: true, needsReauth: false, user };
    } catch (error) {
      errorLogger.log(error, { context: 'validateSession' });
      logger.error('[AuthService] Session validation error:', error);
      return { isValid: false, needsReauth: true };
    }
  },

  /**
   * Refresh session token
   * Called periodically to keep session alive
   */
  async refreshSession(): Promise<boolean> {
    try {
      logger.log('[AuthService] Refreshing session...');

      const { data: { session }, error } = await supabase.auth.refreshSession();

      if (error) {
        logger.error('[AuthService] Session refresh failed:', error);
        return false;
      }

      if (!session) {
        logger.warn('[AuthService] No session after refresh');
        return false;
      }

      logger.log('[AuthService] Session refreshed successfully');
      return true;
    } catch (error) {
      errorLogger.log(error, { context: 'refreshSession' });
      logger.error('[AuthService] Session refresh error:', error);
      return false;
    }
  },

  /**
   * Check if user is authenticated (quick check)
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session && session.expires_at! > Math.floor(Date.now() / 1000);
    } catch (error) {
      logger.error('[AuthService] isAuthenticated check failed:', error);
      return false;
    }
  }
};
