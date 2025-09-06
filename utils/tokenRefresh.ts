import axios from 'axios';
import { backend_Host } from '~/config';
import TokenStorage from './tokenStorage';
import { store } from '~/redux/store';
import { logIn, logOut, refreshToken } from '~/redux/slices/authSlice';
import { router } from 'expo-router';

class TokenRefreshManager {
  private refreshTimer: NodeJS.Timeout | null = null;
  private isRefreshing = false;

  /**
   * Start automatic token refresh
   * Refreshes token every 20 days (20 * 24 * 60 * 60 * 1000 ms)
   */
  startAutoRefresh() {
    this.stopAutoRefresh(); // Clear any existing timer
    
    // Refresh every 20 days
    const refreshInterval = 20 * 24 * 60 * 60 * 1000;
    
    this.refreshTimer = setInterval(async () => {
      await this.refreshToken();
    }, refreshInterval);

    console.log('Token auto-refresh started (every 20 days)');
  }

  /**
   * Stop automatic token refresh
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('Token auto-refresh stopped');
    }
  }

  /**
   * Refresh the authentication token
   */
  async refreshToken(): Promise<boolean> {
    if (this.isRefreshing) {
      console.log('Token refresh already in progress');
      return false;
    }

    try {
      this.isRefreshing = true;
      const currentToken = await TokenStorage.getToken();
      
      if (!currentToken) {
        console.log('No token found for refresh');
        return false;
      }

      console.log('Refreshing token...');
      
      const response = await axios.post(
        `${backend_Host}/auth/refresh-token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data.success && response.data.token) {
        const newToken = response.data.token;
        const userData = response.data.userData || await TokenStorage.getUserData();

        // Update storage
        await TokenStorage.setToken(newToken);
        if (userData) {
          await TokenStorage.setUserData(userData);
        }

        // Update Redux store
        store.dispatch(refreshToken({ token: newToken, userData }));

        console.log('Token refreshed successfully');
        return true;
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error.message);
      
      // If refresh fails, logout user
      await this.handleRefreshFailure();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Handle token refresh failure by logging out user
   */
  private async handleRefreshFailure() {
    try {
      await TokenStorage.clearAllData();
      store.dispatch(logOut());
      
      // Navigate to login screen
      router.replace('/(routes)/login');
      
      console.log('User logged out due to token refresh failure');
    } catch (error) {
      console.error('Error handling refresh failure:', error);
    }
  }

  /**
   * Check if token needs refresh (called on app startup)
   */
  async checkAndRefreshIfNeeded(): Promise<boolean> {
    try {
      const token = await TokenStorage.getToken();
      if (!token) return false;

      // Try to make a simple API call to check token validity
      const response = await axios.get(
        `${backend_Host}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      if (response.status === 200) {
        console.log('Token is still valid');
        return true;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('Token expired, attempting refresh...');
        return await this.refreshToken();
      }
      console.error('Token validation error:', error.message);
    }
    
    return false;
  }
}

export const tokenRefreshManager = new TokenRefreshManager();
export default tokenRefreshManager;