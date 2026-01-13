import { 
  initializeAuth, 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { app } from '../config/firebase';
import type { User, RegistrationData, AuthCredentials } from '../types/user';
import { AppError, AuthError, NetworkError } from '../types/errors';
import { errorLogger } from './errorLogger';
import { generateId, getTimestamp } from '../utils/helpers';

/**
 * Authentication Service
 * Provides methods for user authentication and session management
 */
class AuthServiceClass {
  private auth!: Auth;
  private currentUser: User | null = null;
  private authStateListeners: Array<(user: User | null) => void> = [];
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;
    
    try {
      this.auth = getAuth(app);
      
      // Set up auth state listener
      firebaseOnAuthStateChanged(this.auth, (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          this.currentUser = this.mapFirebaseUserToUser(firebaseUser);
        } else {
          this.currentUser = null;
        }
        
        // Notify all listeners
        this.authStateListeners.forEach(listener => listener(this.currentUser));
      });
      
      this.isInitialized = true;
    } catch (error) {
      errorLogger.log(error, { context: 'AuthService initialization' });
      throw new AppError('Failed to initialize authentication service');
    }
  }

  /**
   * Map Firebase user to app User model
   */
  private mapFirebaseUserToUser(firebaseUser: FirebaseUser): User {
    const metadata = firebaseUser.metadata;
    
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      createdAt: metadata.creationTime || getTimestamp(),
      trialUsesRemaining: 5, // Default trial uses for new users
      isPremium: false,
      profile: {
        name: firebaseUser.displayName || undefined,
        avatar: firebaseUser.photoURL || undefined,
      },
    };
  }

  /**
   * Sign up a new user
   */
  async signUp(data: RegistrationData): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );

      // Update display name if provided
      if (data.name) {
        await firebaseUpdateProfile(userCredential.user, {
          displayName: data.name,
        });
      }

      const user = this.mapFirebaseUserToUser(userCredential.user);
      
      // TODO: Store user data in Firestore/database
      // await this.saveUserToDatabase(user);

      return user;
    } catch (error: any) {
      this.handleAuthError(error);
      throw error; // Will never reach here due to handleAuthError
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(credentials: AuthCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );

      // TODO: Load user data from Firestore/database
      // const userData = await this.loadUserFromDatabase(userCredential.user.uid);
      
      return this.mapFirebaseUserToUser(userCredential.user);
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
      this.currentUser = null;
    } catch (error: any) {
      errorLogger.log(error, { context: 'signOut' });
      throw new AuthError('Failed to sign out');
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      this.handleAuthError(error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get current Firebase user
   */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Subscribe to auth state changes
   * Returns unsubscribe function
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: { name?: string; avatar?: string }): Promise<void> {
    const firebaseUser = this.auth.currentUser;
    if (!firebaseUser) {
      throw new AuthError('No user is currently signed in');
    }

    try {
      await firebaseUpdateProfile(firebaseUser, {
        displayName: updates.name || firebaseUser.displayName,
        photoURL: updates.avatar || firebaseUser.photoURL,
      });
      
      // Update current user object
      if (this.currentUser) {
        this.currentUser.profile = {
          ...this.currentUser.profile,
          ...updates,
        };
      }
    } catch (error: any) {
      errorLogger.log(error, { context: 'updateProfile' });
      throw new AuthError('Failed to update profile');
    }
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): never {
    const errorCode = error.code;
    let errorMessage = 'An authentication error occurred';
    let authError: AuthError;

    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/email-already-in-use':
        errorMessage = 'An account with this email already exists';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error. Please check your connection';
        authError = new NetworkError(errorMessage);
        errorLogger.log(authError, { originalError: error });
        throw authError;
      case 'auth/too-many-requests':
        errorMessage = 'Too many attempts. Please try again later';
        break;
      default:
        errorMessage = error.message || 'An unexpected error occurred';
        break;
    }

    authError = new AuthError(errorMessage);
    errorLogger.log(authError, { originalError: error, code: errorCode });
    throw authError;
  }

  /**
   * TODO: Save user data to database (Firestore)
   */
  private async saveUserToDatabase(user: User): Promise<void> {
    // Implementation when database is setup
    // const userRef = doc(db, 'users', user.id);
    // await setDoc(userRef, user);
  }

  /**
   * TODO: Load user data from database (Firestore)
   */
  private async loadUserFromDatabase(uid: string): Promise<User> {
    // Implementation when database is setup
    // const userRef = doc(db, 'users', uid);
    // const userSnap = await getDoc(userRef);
    // if (userSnap.exists()) {
    //   return userSnap.data() as User;
    // }
    // return null;
    throw new Error('Not implemented');
  }
}

// Create and export singleton instance
export const authService = new AuthServiceClass();
