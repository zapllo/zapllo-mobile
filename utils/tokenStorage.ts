import AsyncStorage from '@react-native-async-storage/async-storage';

// Token storage keys
const TOKEN_KEY = '@auth_token';
const USER_DATA_KEY = '@user_data';
const ONBOARDING_KEY = '@has_completed_onboarding';
const LOGIN_KEY = '@has_completed_login';

export interface UserData {
  data: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organization: string;
    profilePic?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Token Storage Utility
 * Provides consistent token management across the app using AsyncStorage
 */
export class TokenStorage {
  
  /**
   * Store authentication token
   */
  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('Token stored successfully');
    } catch (error) {
      console.error('Error storing token:', error);
      throw error;
    }
  }

  /**
   * Retrieve authentication token
   */
  static async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  }

  /**
   * Store user data
   */
  static async setUserData(userData: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
      console.log('User data stored successfully');
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  }

  /**
   * Retrieve user data
   */
  static async getUserData(): Promise<UserData | null> {
    try {
      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (userDataString) {
        return JSON.parse(userDataString);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return null;
    }
  }

  /**
   * Store both token and user data (for login)
   */
  static async setAuthData(token: string, userData: UserData): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
      ]);
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  }

  /**
   * Retrieve both token and user data
   */
  static async getAuthData(): Promise<{ token: string | null; userData: UserData | null }> {
    try {
      const [token, userDataString] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY)
      ]);

      let userData: UserData | null = null;
      if (userDataString) {
        try {
          userData = JSON.parse(userDataString);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
        }
      }

      return { token, userData };
    } catch (error) {
      console.error('Error retrieving auth data:', error);
      return { token: null, userData: null };
    }
  }

  /**
   * Clear all authentication data
   */
  static async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY)
      ]);
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  /**
   * Set onboarding completion status
   */
  static async setOnboardingCompleted(completed: boolean = true): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, completed.toString());
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  }

  /**
   * Check if onboarding is completed
   */
  static async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  /**
   * Set login completion status
   */
  static async setLoginCompleted(completed: boolean = true): Promise<void> {
    try {
      await AsyncStorage.setItem(LOGIN_KEY, completed.toString());
    } catch (error) {
      console.error('Error setting login status:', error);
      throw error;
    }
  }

  /**
   * Check if login is completed
   */
  static async hasCompletedLogin(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(LOGIN_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  /**
   * Clear all app data (for complete logout)
   */
  static async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY),
        AsyncStorage.removeItem(LOGIN_KEY)
        // Note: We don't clear onboarding status on logout
      ]);
      console.log('All auth data cleared successfully');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  /**
   * Get all stored keys (for debugging)
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => 
        key.startsWith('@auth_') || 
        key.startsWith('@user_') || 
        key.startsWith('@has_completed_')
      );
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Debug: Print all stored auth data
   */
  static async debugPrintAuthData(): Promise<void> {
    try {
      const { token, userData } = await this.getAuthData();
      const hasOnboarding = await this.hasCompletedOnboarding();
      const hasLogin = await this.hasCompletedLogin();
      
      console.log('=== AUTH DEBUG INFO ===');
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('User data exists:', !!userData);
      console.log('User ID:', userData?.data?._id || 'null');
      console.log('User email:', userData?.data?.email || 'null');
      console.log('Has completed onboarding:', hasOnboarding);
      console.log('Has completed login:', hasLogin);
      console.log('=====================');
    } catch (error) {
      console.error('Error in debug print:', error);
    }
  }
}

export default TokenStorage;