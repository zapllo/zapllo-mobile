import axios from 'axios';
import { store } from '~/redux/store';
import { logOut } from '~/redux/slices/authSlice';
import TokenStorage from './tokenStorage';
import { router } from 'expo-router';

let isLoggingOut = false;

// Setup axios interceptor to handle token expiration
export const setupAxiosInterceptor = () => {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !isLoggingOut) {
        isLoggingOut = true;
        
        console.log('Token expired - logging out user');
        
        try {
          // Clear all stored data
          await TokenStorage.clearAllData();
          
          // Update Redux state
          store.dispatch(logOut());
          
          // Navigate to login
          router.replace('/(routes)/login');
          
        } catch (logoutError) {
          console.error('Error during automatic logout:', logoutError);
        } finally {
          isLoggingOut = false;
        }
      }
      
      return Promise.reject(error);
    }
  );
};