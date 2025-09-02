import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backend_Host } from '../config';

// API Configuration
export const API_CONFIG = {
  BASE_URL: backend_Host,
  TIMEOUT: 30000,
};

// Helper functions for token management
const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');
    
    const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
      refreshToken
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Store both tokens persistently until manual logout
    await AsyncStorage.setItem('authToken', accessToken);
    if (newRefreshToken) {
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Only clear tokens if refresh fails (server-side token invalidation)
    await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
    return null;
  }
};

// Function to store tokens after login
export const storeTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      ['authToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
    console.log('Tokens stored successfully');
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

// Function to clear tokens on logout
export const clearTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
    console.log('Tokens cleared successfully');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// Function to check if user is logged in
export const isUserLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    return token !== null;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        if (newToken) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Export helper function for testing connection
export const testConnection = async () => {
  try {
    console.log('Testing connection to:', API_CONFIG.BASE_URL);
    const response = await apiClient.get('/health');
    console.log('Connection successful:', response.status);
    return true;
  } catch (error) {
    console.error('Connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
};