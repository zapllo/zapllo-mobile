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
    
    const { accessToken } = response.data;
    await AsyncStorage.setItem('authToken', accessToken);
    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Clear tokens and redirect to login
    await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
    return null;
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