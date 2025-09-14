import { store } from '~/redux/store';
import { logoutWithStorage } from '~/redux/slices/authSlice';
import { router } from 'expo-router';

/**
 * Centralized logout utility
 * Handles complete logout process including AsyncStorage cleanup
 */
export const performLogout = async () => {
  try {
    // Dispatch logout action with AsyncStorage cleanup
    await store.dispatch(logoutWithStorage());
    
    console.log('User logged out successfully');
    
    // Navigate to login screen
    router.replace('/(routes)/login');
  } catch (error) {
    console.error('Error during logout:', error);
    // Even if there's an error, still navigate to login
    router.replace('/(routes)/login');
  }
};

/**
 * Check if user is authenticated
 * Can be used in components to verify auth state
 */
export const isUserAuthenticated = (): boolean => {
  const state = store.getState();
  return state.auth.isLoggedIn && !!state.auth.token;
};

/**
 * Get current user data
 * Returns null if user is not authenticated
 */
export const getCurrentUser = () => {
  const state = store.getState();
  return state.auth.isLoggedIn ? state.auth.userData : null;
};