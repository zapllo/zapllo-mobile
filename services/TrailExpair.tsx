import axios from 'axios';
import { backend_Host } from '~/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
interface TrialStatus {
  isExpired: boolean;
  trialExpiresDate: string | null;
  subscriptionExpiresDate: string | null;
  lastChecked: number;
}

// Format date for display
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const optionsDate: Intl.DateTimeFormatOptions = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  };
  
  return new Intl.DateTimeFormat('en-GB', optionsDate).format(date);
};

// Check if trial has expired
export const checkTrialStatus = async (token: string | null): Promise<TrialStatus> => {
  // Default status
  const defaultStatus: TrialStatus = {
    isExpired: false,
    trialExpiresDate: null,
    subscriptionExpiresDate: null,
    lastChecked: Date.now()
  };
  
  try {
    // If no token, can't check trial status
    if (!token) {
      console.error("No auth token found for trial status check");
      return defaultStatus;
    }
    
    // Fetch organization data to check trial status
    const response = await axios.get(`${backend_Host}/organization/getById`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      timeout: 10000
    });
    
    if (response.data && response.data.data) {
      const orgData = response.data.data;
      const today = new Date();
      
      // Parse dates
      const trialExpires = orgData.trialExpires ? new Date(orgData.trialExpires) : null;
      const subscriptionExpires = orgData.subscriptionExpires ? new Date(orgData.subscriptionExpires) : null;
      
      // Check if trial has expired and subscription is not active
      const isTrialExpired = trialExpires ? trialExpires < today : false;
      const isSubscriptionActive = subscriptionExpires ? subscriptionExpires > today : false;
      
      // Trial is considered expired if trial period is over AND subscription is not active
      const isExpired = isTrialExpired && !isSubscriptionActive;
      
      const status: TrialStatus = {
        isExpired,
        trialExpiresDate: orgData.trialExpires,
        subscriptionExpiresDate: orgData.subscriptionExpires,
        lastChecked: Date.now()
      };
      
      // Cache the result
      await AsyncStorage.setItem('@trial_status', JSON.stringify(status));
      
      return status;
    }
    
    return defaultStatus;
  } catch (error) {
    console.error('Error checking trial status:', error);
    
    // If there's an error, try to use cached status
    try {
      const cachedStatusStr = await AsyncStorage.getItem('@trial_status');
      if (cachedStatusStr) {
        return JSON.parse(cachedStatusStr);
      }
    } catch (cacheError) {
      console.error('Error reading cached trial status:', cacheError);
    }
    
    return defaultStatus;
  }
};

// Check if user is logging in after 7+ days
export const isLoginAfterSevenDays = async (): Promise<boolean> => {
  try {
    const lastLoginStr = await AsyncStorage.getItem('@last_login_time');
    if (!lastLoginStr) {
      // First login, store current time
      await AsyncStorage.setItem('@last_login_time', Date.now().toString());
      return false;
    }
    
    const lastLogin = parseInt(lastLoginStr, 10);
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    
    // Check if it's been more than 7 days
    const isAfterSevenDays = now - lastLogin > sevenDaysInMs;
    
    // Update last login time
    await AsyncStorage.setItem('@last_login_time', now.toString());
    
    return isAfterSevenDays;
  } catch (error) {
    console.error('Error checking login time:', error);
    return false;
  }
};

// Clear cached trial status (useful after logout)
export const clearTrialStatusCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('@trial_status');
  } catch (error) {
    console.error('Error clearing trial status cache:', error);
  }
};