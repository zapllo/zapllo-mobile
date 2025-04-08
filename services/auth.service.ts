import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api.config';

const AUTH_TOKEN_KEY = '@ZaplloMobile:auth_token';
const REFRESH_TOKEN_KEY = '@ZaplloMobile:refresh_token';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const AuthService = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await apiClient.post('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data;
    
    await this.setTokens(accessToken, refreshToken);
    return { accessToken, refreshToken };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  },

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return null;

      const response = await apiClient.post('/auth/refresh', { refreshToken });
      const { accessToken, newRefreshToken } = response.data;
      
      await this.setTokens(accessToken, newRefreshToken);
      return accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearTokens();
      return null;
    }
  },

  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, accessToken],
      [REFRESH_TOKEN_KEY, refreshToken],
    ]);
  },

  async clearTokens(): Promise<void> {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },
}; 