import * as Location from 'expo-location';
import { useToast } from "react-native-toast-notifications";
import { PermissionManager } from '~/utils/permissions';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, 
  TouchableWithoutFeedback, Keyboard, ScrollView, Image, Alert, 
  StyleSheet, Dimensions, Platform, ActivityIndicator, FlatList } from 'react-native';
import { Camera, CameraType, FlashMode, CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import Modal from 'react-native-modal';
import Navbar from "~/components/navbar";
import { RootState } from "~/redux/store";
import { useSelector } from "react-redux";
import * as Haptics from 'expo-haptics';
import * as Brightness from 'expo-brightness';
import { Entypo, FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import FaceRegistrationModal from '~/components/Attendence/FaceRegistrationModal';
import RegularizationModal from '~/components/Attendence/RegularizationModal';
import RegularizationDetailsModal from '~/components/Attendence/RegularizationDetailsModa';
import LottieView from 'lottie-react-native';
import CustomSplashScreen from '~/components/CustomSplashScreen';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';

// Define the TimelineEvent type with userId
type TimelineEvent = {
  type: 'login' | 'logout' | 'break_started' | 'break_ended';
  time: string;
  location: string;
  userId: string; // Add userId to track events per user
  timestamp: number; // Add timestamp for sorting and calculations
};

// Define interface for login entries
interface LoginEntry {
  _id: string;
  userId: {
    _id: string; // Add _id to userId type
    firstName: string;
    lastName: string;
    reportingManager: {
      firstName: string;
      lastName: string;
    };
  };
  lat: number;
  lng: number;
  timestamp: string;
  action: "login" | "logout" | "regularization" | "break_started" | "break_ended";
  approvalStatus?: "Pending" | "Approved" | "Rejected";
  loginTime: string;
  logoutTime: string;
  remarks: string;
  notes?: string;
}

export default function HomeScreen() {
  const toast = useToast();
  const screenWidth = Dimensions.get('window').width;
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front'); // Default to front camera
  const [modalVisible, setModalVisible] = useState(false);
  const [isModalOpening, setIsModalOpening] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Office');
  const [flash, setFlash] = useState<FlashMode>("off");
  const [cameraTorch, setCameraTorch] = React.useState<boolean>(false);
  const cameraRef = useRef<Camera>(null);
  const [originalBrightness, setOriginalBrightness] = useState<number | null>(null);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginTime, setLoginTime] = useState<string | null>(null);
  const { userData } = useSelector((state: RootState) => state.auth);
  const userId = userData?.data?._id || "anonymous";
  const [loginEntries, setLoginEntries] = useState<LoginEntry[]>([]); // Add loginEntries state here
  
  // Break tracking states
  const [isBreakOpen, setIsOnBreakOpen] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [currentBreakDuration, setCurrentBreakDuration] = useState(0); // in seconds
  const [totalBreakTime, setTotalBreakTime] = useState(0); // in seconds
  const [breakHistory, setBreakHistory] = useState<{start: Date, end: Date, duration: number}[]>([]);
  const [breakModalVisible, setBreakModalVisible] = useState(false);
  const breakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [actionType, setActionType] = useState<'login' | 'logout' | 'break_started' | 'break_ended' | null>(null);

  // Face registration states
  const [hasRegisteredFaces, setHasRegisteredFaces] = useState(false);
  const [isFaceRegistrationApproved, setIsFaceRegistrationApproved] = useState(false);
  const [isFaceRegistrationModalOpen, setIsFaceRegistrationModalOpen] = useState(false);
  const [faceRegistrationStatus, setFaceRegistrationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [isFaceRegistrationRejected, setIsFaceRegistrationRejected] = useState(false);
  const [isFaceRegistrationPending, setIsFaceRegistrationPending] = useState(false);
  const [isRegularizationModalOpen, setIsRegularizationModalOpen] = useState(false);
  const [regularizationEntries, setRegularizationEntries] = useState<any[]>([]);
  const [selectedRegularization, setSelectedRegularization] = useState<any>(null);
  const [isRegularizationDetailsModalOpen, setIsRegularizationDetailsModalOpen] = useState(false);
  const [showGeofencingSplashModal, setShowGeofencingSplashModal] = useState(false);
  const [recentLoginTime, setRecentLoginTime] = useState<string | null>(null);
  const [recentLogoutTime, setRecentLogoutTime] = useState<string | null>(null);
  const [totalHoursWorked, setTotalHoursWorked] = useState<string>("--:--");
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [showFaceNotMatchedModal, setShowFaceNotMatchedModal] = useState(false);
  const [showWfhPermissionAlert, setShowWfhPermissionAlert] = useState(false);
  const [hasRequestedPermissions, setHasRequestedPermissions] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  

  

  // Add this function to calculate total hours worked
  const calculateTotalHoursWorked = useCallback(() => {
    // If either login or logout time is missing, we can't calculate
    if (!recentLoginTime) {
      setTotalHoursWorked("--:--");
      return;
    }
  
    try {
      // Parse the time strings to create Date objects
      const today = new Date();
      const [loginHour, loginMinute] = recentLoginTime.match(/(\d+):(\d+)/)?.slice(1).map(Number) || [];
      
      // Check if we have valid login time components
      if (isNaN(loginHour) || isNaN(loginMinute)) {
        setTotalHoursWorked("--:--");
        return;
      }
      
      // Create Date object for login time
      const loginDate = new Date(today);
      loginDate.setHours(loginHour);
      loginDate.setMinutes(loginMinute);
      
      // Handle PM times (12-hour format)
      if (recentLoginTime.toLowerCase().includes('pm') && loginHour !== 12) {
        loginDate.setHours(loginHour + 12);
      }
      if (recentLoginTime.toLowerCase().includes('am') && loginHour === 12) {
        loginDate.setHours(0);
      }
      
      let endDate;
      
      // If we have logout time, use it as the end time
      if (recentLogoutTime) {
        const [logoutHour, logoutMinute] = recentLogoutTime.match(/(\d+):(\d+)/)?.slice(1).map(Number) || [];
        
        // Check if we have valid logout time components
        if (!isNaN(logoutHour) && !isNaN(logoutMinute)) {
          endDate = new Date(today);
          endDate.setHours(logoutHour);
          endDate.setMinutes(logoutMinute);
          
          // Handle PM times (12-hour format)
          if (recentLogoutTime.toLowerCase().includes('pm') && logoutHour !== 12) {
            endDate.setHours(logoutHour + 12);
          }
          if (recentLogoutTime.toLowerCase().includes('am') && logoutHour === 12) {
            endDate.setHours(0);
          }
        }
      } else if (isLoggedIn) {
        // If user is still logged in, use current time as end time
        endDate = new Date();
      } else {
        // If no logout time and not logged in, we can't calculate
        setTotalHoursWorked("--:--");
        return;
      }
      
      // Calculate the difference in milliseconds
      let diffMs = endDate.getTime() - loginDate.getTime();
      
      // If the result is negative, it means logout was on the next day
      if (diffMs < 0) {
        endDate.setDate(endDate.getDate() + 1);
        diffMs = endDate.getTime() - loginDate.getTime();
      }
      
      // Subtract break time (convert seconds to milliseconds)
      const breakTimeMs = (totalBreakTime + (isBreakOpen ? currentBreakDuration : 0)) * 1000;
      diffMs = Math.max(0, diffMs - breakTimeMs);
      
      // Convert to hours and minutes
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      // Format the result
      const formattedHours = String(diffHrs).padStart(2, '0');
      const formattedMinutes = String(diffMins).padStart(2, '0');
      
      setTotalHoursWorked(`${formattedHours}:${formattedMinutes}`);
    } catch (error) {
      console.error('Error calculating total hours:', error);
      setTotalHoursWorked("--:--");
    }
  }, [recentLoginTime, recentLogoutTime, isLoggedIn, totalBreakTime, isBreakOpen, currentBreakDuration]);

  // Geofencing states
  const [orgData, setOrgData] = useState<{
    location: { lat: number; lng: number };
    allowGeofencing: boolean;
    geofenceRadius: number;
  } | null>(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState<boolean | null>(null);

  // Add these additional state variables after other state declarations
  const [timelineFilter, setTimelineFilter] = useState('Today');
  const [filteredTimelineEvents, setFilteredTimelineEvents] = useState<TimelineEvent[]>([]);
  const timeFilterOptions = ['Today', 'Yesterday', 'This Week', 'Last Week', 'This Month', 'Last Month', 'All Time'];
  
  // Add state for custom date range modal
  const [isCustomDateRangeModalOpen, setIsCustomDateRangeModalOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{startDate: Date, endDate: Date}>({
    startDate: new Date(),
    endDate: new Date()
  });

  // Add this function to fetch organization data including geofencing settings
  const fetchOrgData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('https://zapllo.com/api/organization/getById', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setOrgData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    }
  };

  // Function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) ** 2 +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Check if user is within geofence
  const checkGeofenceStatus = useCallback(() => {
    if (!location || !orgData || !orgData.allowGeofencing) {
      setIsWithinGeofence(null);
      return;
    }
  
    const distance = calculateDistance(
      location.lat,
      location.lng,
      orgData.location.lat,
      orgData.location.lng
    );
  
    // Set isWithinGeofence to true if distance is less than or equal to geofenceRadius
    const withinGeofence = distance <= orgData.geofenceRadius;
    setIsWithinGeofence(withinGeofence);
    
    // Log for debugging
    console.log('Geofence check:', {
      userLocation: location,
      officeLocation: orgData.location,
      distance,
      radius: orgData.geofenceRadius,
      isWithin: withinGeofence
    });
  }, [location, orgData]);

  useEffect(() => {
    if (modalVisible && location && orgData) {
      // Re-check geofence status when modal opens
      checkGeofenceStatus();
    }
  }, [modalVisible, location, orgData, checkGeofenceStatus]);

  // Add this function to fetch regularization entries
  const fetchRegularizationEntries = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('https://zapllo.com/api/regularization-entries', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.entries) {
          setRegularizationEntries(data.entries);
        }
      }
    } catch (error) {
      console.error('Error fetching regularization entries:', error);
    }
  };

  // Check and request permissions on first attendance screen visit
  const checkAndRequestPermissions = async () => {
    try {
      const permissionsRequested = await AsyncStorage.getItem(`attendancePermissionsRequested_${userId}`);
      
      if (!permissionsRequested) {
        // First time opening attendance screen - silently check permissions
        const currentPermissions = await PermissionManager.checkAllPermissions();
        
        if (currentPermissions.camera && currentPermissions.location) {
          // Permissions already granted, mark as requested
          await AsyncStorage.setItem(`attendancePermissionsRequested_${userId}`, 'true');
        }
        setHasRequestedPermissions(true);
      } else {
        setHasRequestedPermissions(true);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };



  // Update the useEffect that loads data
  useEffect(() => {
    const loadData = async () => {
      try {
        // First check and request permissions if needed
        await checkAndRequestPermissions();
        
        // Then check login status which will also fetch login entries
        await checkLoginStatus();
        
        // Then load break data
        await loadBreakData();
        
        // Load timeline events
        await loadTimelineEvents();
        
        // Fetch regularization entries
        await fetchRegularizationEntries();
        
        // Fetch organization data
        await fetchOrgData();
        
        // Set up periodic refresh of login status
        const refreshInterval = setInterval(async () => {
          await checkLoginStatus();
        }, 60000); // Refresh every minute
        
        return () => {
          clearInterval(refreshInterval);
          // Also clear break timer if it exists
          if (breakTimerRef.current) {
            clearInterval(breakTimerRef.current);
            breakTimerRef.current = null;
          }
        };
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadData();
  }, [userId]);

  // Update geofence status whenever location or orgData changes
  useEffect(() => {
    checkGeofenceStatus();
  }, [location, orgData, checkGeofenceStatus]);

  // Add this function to handle regularization success
  const handleRegularizationSuccess = () => {
    fetchRegularizationEntries();

  };
  useEffect(() => {
    const loadFaceRegistrationStatus = async () => {
      try {
        // Try to load face registration status from AsyncStorage first
        const storedStatus = await AsyncStorage.getItem(`faceRegistrationStatus_${userId}`);
        
        if (storedStatus) {
          console.log("Loaded stored face registration status:", storedStatus);
          
          // Update state based on stored status
          if (storedStatus === 'approved') {
            setFaceRegistrationStatus('approved');
            setIsFaceRegistrationApproved(true);
            setHasRegisteredFaces(true);
            setIsFaceRegistrationPending(false);
            setIsFaceRegistrationRejected(false);
          } else if (storedStatus === 'pending') {
            setFaceRegistrationStatus('pending');
            setIsFaceRegistrationPending(true);
            setIsFaceRegistrationRejected(false);
            setIsFaceRegistrationApproved(false);
            setHasRegisteredFaces(false);
          } else if (storedStatus === 'rejected') {
            setFaceRegistrationStatus('rejected');
            setIsFaceRegistrationRejected(true);
            setIsFaceRegistrationPending(false);
            setIsFaceRegistrationApproved(false);
            setHasRegisteredFaces(false);
          }
        }
        
        // Then check with the server for the latest status
        // This will update the state if the server status is different
        await checkLoginStatus();
      } catch (error) {
        console.error('Error loading face registration status:', error);
        // If there's an error, still try to get the latest status from the server
        await checkLoginStatus();
      }
    };
    
    if (userId) {
      loadFaceRegistrationStatus();
    }
  }, [userId]);
  // Add this function to handle viewing regularization details
  const handleViewRegularizationDetails = (regularization: any) => {
    setSelectedRegularization(regularization);
    setIsRegularizationDetailsModalOpen(true);
  };

// Function to check login status
const checkLoginStatus = async () => {
  try {
    // Fetch login entries to determine current state
    const response = await fetch('https://zapllo.com/api/loginEntries', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userData?.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch login entries');
    }

    const data = await response.json();
    if (!data.entries || !Array.isArray(data.entries)) {
      resetLoginState();
      return;
    }

    // Sort entries by timestamp in descending order
    const sortedEntries = data.entries.sort((a: LoginEntry, b: LoginEntry) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Get today's entries
    const today = new Date();
    const todayEntries = sortedEntries.filter((entry: LoginEntry) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.getDate() === today.getDate() &&
             entryDate.getMonth() === today.getMonth() &&
             entryDate.getFullYear() === today.getFullYear();
    });

    if (todayEntries.length === 0) {
      resetLoginState();
    } else {
      // Get the most recent entry for today
      const latestEntry = todayEntries[0];

      // Find most recent login and logout of the day
      const loginEntries = todayEntries.filter(entry => entry.action === 'login');
      const logoutEntries = todayEntries.filter(entry => entry.action === 'logout');
      
      // Get most recent login time (first in the sorted array since it's descending)
      if (loginEntries.length > 0) {
        const recentLogin = loginEntries[0];
        const recentLoginTimeStr = new Date(recentLogin.timestamp).toLocaleTimeString([], {
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        });
        setRecentLoginTime(recentLoginTimeStr);
      }
      
      // Get most recent logout time
      if (logoutEntries.length > 0) {
        const recentLogout = logoutEntries[0];
        const recentLogoutTimeStr = new Date(recentLogout.timestamp).toLocaleTimeString([], {
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        });
        setRecentLogoutTime(recentLogoutTimeStr);
      }

      // Update login state based on latest entry
      if (latestEntry.action === 'login') {
        setIsLoggedIn(true);
        setIsOnBreakOpen(false);
        const loginTime = new Date(latestEntry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setLoginTime(loginTime);
      } else if (latestEntry.action === 'logout') {
        setIsLoggedIn(false);
        setIsOnBreakOpen(false);
        setLoginTime(null);
      } else if (latestEntry.action === 'break_started') {
        setIsLoggedIn(true);
        setIsOnBreakOpen(true);
        const breakStartTime = new Date(latestEntry.timestamp);
        setBreakStartTime(breakStartTime);
        startBreakTimer(breakStartTime);
      } else if (latestEntry.action === 'break_ended') {
        setIsLoggedIn(true);
        setIsOnBreakOpen(false);
        setBreakStartTime(null);
        if (breakTimerRef.current) {
          clearInterval(breakTimerRef.current);
          breakTimerRef.current = null;
        }
      }
    }

    // Calculate total hours worked after updating login/logout times
    calculateTotalHoursWorked();

    // Check face registration status - this should be done regardless of login entries
    try {
      const faceRegistrationResponse = await fetch('https://zapllo.com/api/face-registration-request', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userData?.token}`
        }
      });

      if (faceRegistrationResponse.ok) {
        const faceData = await faceRegistrationResponse.json();
        
        if (faceData.success && faceData.requests && faceData.requests.length > 0) {
          const userRequests = faceData.requests.filter(
            (request: any) => request.userId._id === userId
          );
          
          if (userRequests.length > 0) {
            userRequests.sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            
            const latestRequest = userRequests[0];
            const status = latestRequest.status;
            
            console.log("Face registration status:", status);
            setFaceRegistrationStatus(status);
            
            if (status === 'approved') {
              setIsFaceRegistrationApproved(true);
              setHasRegisteredFaces(true);
              setIsFaceRegistrationPending(false);
              setIsFaceRegistrationRejected(false);
              
              // Store the approved status in AsyncStorage for persistence
              await AsyncStorage.setItem(`faceRegistrationStatus_${userId}`, 'approved');
            } else if (status === 'pending') {
              setIsFaceRegistrationPending(true);
              setIsFaceRegistrationRejected(false);
              setIsFaceRegistrationApproved(false);
              setHasRegisteredFaces(false);
              
              // Store the pending status in AsyncStorage
              await AsyncStorage.setItem(`faceRegistrationStatus_${userId}`, 'pending');
            } else if (status === 'rejected') {
              setIsFaceRegistrationRejected(true);
              setIsFaceRegistrationPending(false);
              setIsFaceRegistrationApproved(false);
              setHasRegisteredFaces(false);
              
              // Store the rejected status in AsyncStorage
              await AsyncStorage.setItem(`faceRegistrationStatus_${userId}`, 'rejected');
            }
          } else {
            // No requests found for this user
            setFaceRegistrationStatus('none');
            setHasRegisteredFaces(false);
            setIsFaceRegistrationApproved(false);
            setIsFaceRegistrationPending(false);
            setIsFaceRegistrationRejected(false);
            await AsyncStorage.removeItem(`faceRegistrationStatus_${userId}`);
          }
        } else {
          // No requests found at all
          setFaceRegistrationStatus('none');
          setHasRegisteredFaces(false);
          setIsFaceRegistrationApproved(false);
          setIsFaceRegistrationPending(false);
          setIsFaceRegistrationRejected(false);
          await AsyncStorage.removeItem(`faceRegistrationStatus_${userId}`);
        }
      }
    } catch (error) {
      console.error('Error checking face registration status:', error);
    }

  } catch (error) {
    console.error('Error checking login status:', error);
    resetLoginState();
  }
};
// Update the useEffect to recalculate hours when break status changes
useEffect(() => {
  calculateTotalHoursWorked();
}, [
  recentLoginTime, 
  recentLogoutTime, 
  isLoggedIn, 
  totalBreakTime, 
  isBreakOpen, 
  currentBreakDuration, 
  calculateTotalHoursWorked
]);

  const resetLoginState = () => {
    setIsLoggedIn(false);
    setIsOnBreakOpen(false);
    setBreakStartTime(null);
    setLoginTime(null);
    setRecentLoginTime(null);
    setRecentLogoutTime(null);
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
      breakTimerRef.current = null;
    }
  };

  const handleFaceRegistration = () => {
    setIsFaceRegistrationModalOpen(true);
  };

  const handleFaceRegistrationSuccess = async () => {
    try {
      // Update the face registration status to pending
      setFaceRegistrationStatus('pending');
      setIsFaceRegistrationPending(true);
      setIsFaceRegistrationRejected(false);
      setIsFaceRegistrationApproved(false);
      setHasRegisteredFaces(false);
      
      // Store the updated status in AsyncStorage
      await AsyncStorage.setItem(`faceRegistrationStatus_${userId}`, 'pending');
      
      // Show success message
      Alert.alert(
        "Success",
        "Face registration request submitted successfully and is pending approval."
      );
      
      // Refresh the face registration status from the server
      // This is important to ensure we have the latest status
      setTimeout(async () => {
        await checkLoginStatus();
      }, 1000);
    } catch (error) {
      console.error('Error handling face registration success:', error);
      Alert.alert(
        "Error",
        "There was a problem updating your face registration status. Please try again."
      );
    }
  };

  useEffect(() => {
    checkLoginStatus(); 
  }, []);

  // Load timeline events from AsyncStorage
  const loadTimelineEvents = async () => {
    try {
      const response = await fetch('https://zapllo.com/api/loginEntries', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userData?.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.entries) {
          // Sort entries by timestamp in descending order (newest first)
          const sortedEntries = data.entries.sort((a: LoginEntry, b: LoginEntry) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLoginEntries(sortedEntries);
          
          // Convert LoginEntry to TimelineEvent format
          const timelineEvents = sortedEntries.map((entry: LoginEntry) => ({
            type: entry.action as 'login' | 'logout' | 'break_started' | 'break_ended',
            time: new Date(entry.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }),
            location: entry.action === 'regularization' ? 'Regularization' : 'Office',
            userId: entry.userId?._id || 'anonymous',
            timestamp: new Date(entry.timestamp).getTime()
          }));
          
          setTimelineEvents(timelineEvents);
          setFilteredTimelineEvents(filterTimelineEvents(timelineFilter));
        }
      } else {
        console.error('Failed to fetch timeline events');
      }
    } catch (error) {
      console.error('Error loading timeline events:', error);
    }
  };

  // Load timeline events on component mount
const fetchLocationWithHighAccuracy = async (): Promise<{ lat: number; lng: number } | null> => {
    try {
      setIsLocationLoading(true);

      console.log('Getting current location with high accuracy...');
      const locationData = await PermissionManager.getCurrentLocation({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 0
      });

      console.log('Location fetched with high accuracy:', locationData);
      setLocation(locationData);

      // Optionally update geofence immediately
      if (orgData && orgData.allowGeofencing) {
        setTimeout(() => {
          checkGeofenceStatus();
        }, 100);
      }

      return locationData;
    } catch (error) {
      console.error('Error fetching location:', error);
      Alert.alert(
        'Error',
        'Failed to get your location. Please check your location settings and ensure location permissions are granted.'
      );
      return null;
    } finally {
      setIsLocationLoading(false);
    }
  };
  // Reset camera state when modal closes
  const resetCameraState = useCallback(() => {
    setIsScanning(false);
    setScanComplete(false);
    setErrorMessage(null);
    setFlash("off");
    setIsFlashOn(false);
    setCameraTorch(false);
    setIsModalOpening(false);
    setIsCameraReady(false);
  }, []);

// Add this useEffect to check camera initialization when the modal opens
  useEffect(() => {
    if (modalVisible) {
      // Reset camera state first
      resetCameraState();
    } else {
      // Reset camera state when modal closes
      resetCameraState();
    }
  }, [modalVisible, resetCameraState]);
  
  // Update the useEffect that handles modal visibility to use the new function
  useEffect(() => {
    if (modalVisible) {
      (async () => {
        // Get permission to change brightness (iOS only)
        if (Platform.OS === 'ios') {
          const { status } = await Brightness.requestPermissionsAsync();
          if (status !== 'granted') {
            console.log('Brightness permission not granted');
          }
        }
    
        // Save original brightness
        try {
          const brightness = await Brightness.getBrightnessAsync();
          setOriginalBrightness(brightness);
        } catch (error) {
          console.error('Failed to get brightness:', error);
        }
    
        // Get location with high accuracy
        await fetchLocationWithHighAccuracy();
      })();
    } else {
      // Restore original brightness when modal closes
      if (originalBrightness !== null) {
        (async () => {
          try {
            await Brightness.setBrightnessAsync(originalBrightness);
          } catch (error) {
            console.error('Failed to restore brightness:', error);
          }
        })();
      }
    }
  }, [modalVisible]);

  // Add this function to handle adding events to the timeline
  const addTimelineEvent = async (type: 'login' | 'logout' | 'break_started' | 'break_ended') => {
    const currentTime = new Date();
    const newEvent: TimelineEvent = {
      type,
      time: currentTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      location: selectedOption === 'Home' ? 'Work From Home' : 'Work From Office',
      userId: userId || 'anonymous',
      timestamp: currentTime.getTime()
    };

    try {
      const response = await fetch('https://zapllo.com/api/loginEntries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userData?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEvent)
      });

      if (response.ok) {
        // Update timeline events in state
        setTimelineEvents(prevEvents => {
          const updatedEvents = [newEvent, ...prevEvents];
          return updatedEvents.sort((a, b) => b.timestamp - a.timestamp);
        });
        
        // Refresh filtered events
        setFilteredTimelineEvents(prevFiltered => {
          const updatedFiltered = [newEvent, ...prevFiltered];
          return filterTimelineEvents(timelineFilter);
        });
      }
    } catch (error) {
      console.error('Error adding timeline event:', error);
    }
  };
  
// Update the handleLoginPress function to better handle camera permissions
const handleLoginPress = async () => {
  // Add heavy haptic feedback when login button is pressed
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  
  // If user is trying to log out while on break, show alert
  if (isLoggedIn && isBreakOpen) {
    Alert.alert(
      "End Break First",
      "Please end your break before logging out.",
      [
        {
          text: "End Break & Logout",
          onPress: async () => {
            // First end the break
            await handleEndBreak();
            // Then proceed with logout
            proceedWithLoginLogout();
          },
          style: "default"
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
    return;
  }
  
  // If not on break or logging in, proceed normally
  proceedWithLoginLogout();
};
  
const proceedWithLoginLogout = async () => {
  if (isModalOpening || modalVisible) return;
  
  if (!hasRegisteredFaces) {
    toast.show("Please register your face first", {
      type: "warning",
      placement: "bottom",
      duration: 3000,
    });
    setIsFaceRegistrationModalOpen(true);
    return;
  }
  
  if (!isFaceRegistrationApproved) {
    toast.show("Your face registration is pending admin approval", {
      type: "warning",
      placement: "bottom",
      duration: 3000,
    });
    return;
  }
  
  // Check permissions before proceeding
  const currentPermissions = await PermissionManager.checkAllPermissions();
  let isFirstTimePermission = false;
  
  if (!currentPermissions.camera || !currentPermissions.location) {
    const firstTimeRequested = await AsyncStorage.getItem(`attendancePermissionsRequested_${userId}`);
    if (!firstTimeRequested) {
      isFirstTimePermission = true;
      // First time - directly request permissions
      const permissions = await PermissionManager.requestAllPermissions();
      await AsyncStorage.setItem(`attendancePermissionsRequested_${userId}`, 'true');
      if (!permissions.camera || !permissions.location) {
        toast.show("Camera and location permissions are required for attendance features.", {
          type: "warning",
          placement: "bottom",
          duration: 3000,
        });
        return;
      }
    } else {
      // Not first time - directly request again
      const permissions = await PermissionManager.requestAllPermissions();
      if (!permissions.camera || !permissions.location) {
        toast.show("Camera and location permissions are required for attendance features.", {
          type: "warning",
          placement: "bottom",
          duration: 3000,
        });
        return;
      }
    }
  }
  
  setIsModalOpening(true);
  resetCameraState();
  
  try {
    await fetchLocationWithHighAccuracy();
    setActionType(isLoggedIn ? 'logout' : 'login');
    
    // For first time permission, wait longer before opening camera
    if (isFirstTimePermission) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setModalVisible(true);
    
  } catch (error) {
    console.error('Error opening camera:', error);
    setShowGeofencingSplashModal(true);
  } finally {
    setTimeout(() => setIsModalOpening(false), 300);
  }
};

  const handleEndBreak = async () => {
    // Only proceed if user is on break
    if (!isBreakOpen || !breakStartTime) return;
    
    const now = new Date();
    const breakDuration = currentBreakDuration;
    
    // Stop the timer
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
      breakTimerRef.current = null;
    }
    
    // Update break history
    const newBreakHistory = [...breakHistory];
    if (breakStartTime) {
      newBreakHistory.push({
        start: breakStartTime,
        end: now,
        duration: breakDuration
      });
    }
    
    // Update total break time
    const newTotalBreakTime = totalBreakTime + breakDuration;
    
    // Reset current break state
    setIsOnBreakOpen(false);
    setBreakStartTime(null);
    setCurrentBreakDuration(0);
    
    // Update state with new history and total time
    setBreakHistory(newBreakHistory);
    setTotalBreakTime(newTotalBreakTime);
    addTimelineEvent('break_ended');
    
    // Save updated break data to session
    saveBreakDataToSession(
      false,
      null,
      newBreakHistory,
      newTotalBreakTime
    );
    
   
  };
  

  const handleStartEndBreak = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  
    if (!isLoggedIn) {
      toast.show("You need to be logged in to manage breaks", {
        type: "warning",
        placement: "bottom",
        duration: 3000,
      });
      return;
    }
  
    // Check if user has registered faces and if registration is approved
    if (!hasRegisteredFaces) {
      toast.show("Please register your face first", {
        type: "warning",
        placement: "bottom",
        duration: 3000,
      });
      setIsFaceRegistrationModalOpen(true);
      return;
    }
    
    // Check if face registration is approved
    if (!isFaceRegistrationApproved) {
      toast.show("Your face registration is pending admin approval", {
        type: "warning",
        placement: "bottom",
        duration: 3000,
      });
      return;
    }
    
    // Check permissions before proceeding
    const currentPermissions = await PermissionManager.checkAllPermissions();
    let isFirstTimePermission = false;
    
    if (!currentPermissions.camera || !currentPermissions.location) {
      const firstTimeRequested = await AsyncStorage.getItem(`attendancePermissionsRequested_${userId}`);
      if (!firstTimeRequested) {
        isFirstTimePermission = true;
        // First time - directly request permissions
        const permissions = await PermissionManager.requestAllPermissions();
        await AsyncStorage.setItem(`attendancePermissionsRequested_${userId}`, 'true');
        if (!permissions.camera || !permissions.location) {
          toast.show("Camera and location permissions are required for break features.", {
            type: "warning",
            placement: "bottom",
            duration: 3000,
          });
          return;
        }
      } else {
        // Not first time - directly request again
        const permissions = await PermissionManager.requestAllPermissions();
        if (!permissions.camera || !permissions.location) {
          toast.show("Camera and location permissions are required for attendance features.", {
            type: "warning",
            placement: "bottom",
            duration: 3000,
          });
          return;
        }
      }
    }
    
    // Fetch fresh location data before proceeding
    await fetchLocationWithHighAccuracy();
    
    // Check if user is within geofence (skip for Work From Home)
    if (orgData?.allowGeofencing && !isWithinGeofence && selectedOption !== 'Home') {
      // Show the geofencing splash screen without opening the camera modal
      setShowGeofencingSplashModal(true);
      
      // Haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    if (isModalOpening || modalVisible) return;
    
    setActionType(isBreakOpen ? 'break_ended' : 'break_started');
    setIsModalOpening(true);
    resetCameraState();
  
    try {
      // For first time permission, wait longer before opening camera
      if (isFirstTimePermission) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      setModalVisible(true);
    } catch (error) {
      console.error('Error opening camera for break:', error);
      setShowGeofencingSplashModal(true);
    } finally {
      setTimeout(() => setIsModalOpening(false), 300);
    }
  };
    
  const toggleCameraFacing = () => {
    // Reset flash state when switching cameras
    setIsFlashOn(false);
    setFlash("off");
    setCameraTorch(false);
    
    // If we were using screen brightness for front camera, restore it
    if (facing === 'front' && originalBrightness !== null) {
      (async () => {
        try {
          await Brightness.setBrightnessAsync(originalBrightness);
        } catch (error) {
          console.error('Failed to restore brightness:', error);
        }
      })();
    }
    
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleOptionPress = (option: string) => {
    // If trying to select Home option but doesn't have permission
    if (option === 'Home' && !userData?.data?.workFromHomeAllowed) {
      // Show the permission alert
      setShowWfhPermissionAlert(true);
      
      // Hide it after 2 seconds
      setTimeout(() => {
        setShowWfhPermissionAlert(false);
      }, 2000);
      
      // Provide haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Don't change the selected option
      return;
    }
    
    // Otherwise proceed normally
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // Break functionality
const startBreakTimer = (startTime: Date) => {
  // Clear any existing timer
  if (breakTimerRef.current) {
    clearInterval(breakTimerRef.current);
  }
  
  // Start a new timer that updates every second
  breakTimerRef.current = setInterval(() => {
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    setCurrentBreakDuration(elapsedSeconds);
    
    // Recalculate total hours every 15 seconds during break
    if (elapsedSeconds % 15 === 0) {
      calculateTotalHoursWorked();
    }
  }, 1000);
};

const saveBreakDataToSession = async (
  isBreakOpen: boolean, 
  breakStartTime: Date | null, 
  history: {start: Date, end: Date, duration: number}[], 
  totalTime: number
) => {
  try {
    const breakData = {
      isBreakOpen,
      breakStartTime: breakStartTime ? breakStartTime.toISOString() : null,
      history: history.map(item => ({
        start: item.start.toISOString(),
        end: item.end.toISOString(),
        duration: item.duration
      })),
      totalTime
    };

    // Save to AsyncStorage instead of API
    await AsyncStorage.setItem(`breakData_${userId}`, JSON.stringify(breakData));
    console.log('Break data saved to AsyncStorage');
  } catch (error) {
    console.error('Error saving break data:', error);
  }
};

const loadBreakData = async () => {
  try {
    // Load from AsyncStorage instead of API
    const storedData = await AsyncStorage.getItem(`breakData_${userId}`);
    
    if (storedData) {
      const data = JSON.parse(storedData);
      
      setIsOnBreakOpen(data.isBreakOpen);
      
      if (data.breakStartTime) {
        const startTime = new Date(data.breakStartTime);
        setBreakStartTime(startTime);
        
        if (data.isBreakOpen) {
          startBreakTimer(startTime);
        }
      }
      
      if (data.history) {
        const loadedHistory = data.history.map((item: any) => ({
          start: new Date(item.start),
          end: new Date(item.end),
          duration: item.duration
        }));
        
        setBreakHistory(loadedHistory);
      }
      
      setTotalBreakTime(data.totalTime || 0);
    }
  } catch (error) {
    console.error('Error loading break data:', error);
  }
};
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Load break data on component mount
useEffect(() => {
  const loadData = async () => {
    await checkLoginStatus();
    await loadBreakData();
    await loadTimelineEvents();
  };
  
  loadData();
}, []);

// Clean up break timer when component unmounts
useEffect(() => {
  return () => {
    if (breakTimerRef.current) {
      clearInterval(breakTimerRef.current);
    }
  };
}, []);

// Update break timer when break state changes
useEffect(() => {
  if (isBreakOpen && breakStartTime) {
    startBreakTimer(breakStartTime);
  } else if (!isBreakOpen && breakTimerRef.current) {
    clearInterval(breakTimerRef.current);
    breakTimerRef.current = null;
  }
}, [isBreakOpen, breakStartTime]);




// Fix for capturePhoto function - only the break-related part needs to be updated

const capturePhoto = async () => {
  const token = await AsyncStorage.getItem('authToken');
  if (cameraRef.current && !isScanning && location) {
    try {
      setIsScanning(true);
      setErrorMessage(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Check if user is within geofence before proceeding
      // Skip this check if user selected "Work From Home"
      if (orgData?.allowGeofencing && !isWithinGeofence && selectedOption !== 'Home') {
        // Close the modal and show the geofencing splash screen
        setIsScanning(false);
        setModalVisible(false);
        setShowGeofencingSplashModal(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      
      // Upload the photo
      const formData = new FormData();
      const imageUri = photo.uri;
      const filename = imageUri.split('/').pop() || 'photo.jpg';
      formData.append('files', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      } as any);
      
      const uploadResponse = await fetch('https://zapllo.com/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.fileUrls[0];
      
      // Determine which API endpoint to call based on action type
      let apiEndpoint = 'https://zapllo.com/api/face-login';
      let requestBody = {
        imageUrl,
        lat: location.lat,
        lng: location.lng,
        action: actionType,
        workFromHome: selectedOption === 'Home',
        userId,
      };
      
      // Make the API request
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
      
      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        setScanComplete(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Update state based on action type
        if (actionType === 'login') {
          setIsLoggedIn(true);
          const currentTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          setLoginTime(currentTime);
          await AsyncStorage.setItem(`loginTime_${userId}`, currentTime);
          addTimelineEvent('login');
        } else if (actionType === 'logout') {
          setIsLoggedIn(false);
          setLoginTime(null);
          await AsyncStorage.removeItem(`loginTime_${userId}`);
          addTimelineEvent('logout');
        } else if (actionType === 'break_started') {
          const now = new Date();
          setIsOnBreakOpen(true);
          setBreakStartTime(now);
          startBreakTimer(now);
          addTimelineEvent('break_started');
          
          // Save break data to session
          saveBreakDataToSession(
            true,
            now,
            breakHistory,
            totalBreakTime
          );
        } else if (actionType === 'break_ended') {
          const now = new Date();
          const breakDuration = currentBreakDuration;
          
          // Stop the timer
          if (breakTimerRef.current) {
            clearInterval(breakTimerRef.current);
            breakTimerRef.current = null;
          }
          
          // Update break history
          const newBreakHistory = [...breakHistory];
          if (breakStartTime) {
            newBreakHistory.push({
              start: breakStartTime,
              end: now,
              duration: breakDuration
            });
          }
          
          // Update total break time
          const newTotalBreakTime = totalBreakTime + breakDuration;
          
          // Reset current break state
          setIsOnBreakOpen(false);
          setBreakStartTime(null);
          setCurrentBreakDuration(0);
          
          // Update state with new history and total time
          setBreakHistory(newBreakHistory);
          setTotalBreakTime(newTotalBreakTime);
          addTimelineEvent('break_ended');
          
          // Save updated break data to session
          saveBreakDataToSession(
            false,
            null,
            newBreakHistory,
            newTotalBreakTime
          );
        }
        

        
        setTimeout(() => {
          setModalVisible(false);
          resetCameraState();
        }, 1500);
        
        // Refresh login entries after successful action
        await checkLoginStatus();
      } else {
        handleApiError(responseData);
      }
    } catch (error: any) {
      console.error('Error in face verification process:', error);
      setErrorMessage(error.message || 'An error occurred during the process');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsScanning(false);
    }
  } else if (!location) {
    Alert.alert('Location Required', 'Location is required for attendance. Please enable location services.');
    setIsScanning(false);
    setModalVisible(false);
  }
};

  // Helper function to handle API errors

  const handleApiError = (data: any) => {
    if (data.error === 'You are outside the allowed geofencing area.') {
      // First close the camera modal
      setIsScanning(false);
      
      // Close modal first, then show splash screen
      setModalVisible(false);
      
      // Use setTimeout to ensure modal is fully closed before showing splash
      setTimeout(() => {
        console.log('Showing geofencing splash modal');
        setShowGeofencingSplashModal(true);
      }, 500);
      
      // Haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (
      data.error === 'No matching face found. Please ensure you are facing the camera clearly and retry.' || 
      data.error === 'Face not recognized' || 
      data.error?.includes('face not matched') || 
      data.error?.includes('No matching face')
    ) {
      console.log('Face not matched error detected:', data.error);
      
      // First reset scanning state
      setIsScanning(false);
      
      // Store the error message in a ref to access it after modal closes
      const errorMessage = data.error;
      
      // Close the camera modal
      setModalVisible(false);
      
      // Use a longer timeout to ensure modal is fully closed
      setTimeout(() => {
        // Now show the face not matched modal
        console.log('About to show face not matched modal');
        setShowFaceNotMatchedModal(true);
        
        // Log for debugging
        console.log('Face not matched modal should be visible now');
      }, 800);
      
      // Haptic feedback for error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setErrorMessage(data.error || 'Face recognition failed.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsScanning(false);
    }
  };
  
  // Add this useEffect to monitor modal state changes
  useEffect(() => {
    console.log('Modal visible state changed to:', modalVisible);
    
    // If modal just closed and we have a face not matched error pending
    if (!modalVisible && !showFaceNotMatchedModal) {
      // Check if we need to show face not matched modal after a delay
      setTimeout(() => {
        console.log('Checking if face not matched modal should be shown');
      }, 300);
    }
  }, [modalVisible]);
  
  // Add this useEffect to monitor face not matched modal state
  useEffect(() => {
    console.log('Face not matched modal state changed to:', showFaceNotMatchedModal);
  }, [showFaceNotMatchedModal]);
  
  
  // 4. Update the capturePhoto function's geofencing check
  // Inside capturePhoto function, update this section:
  if (orgData?.allowGeofencing && !isWithinGeofence && selectedOption !== 'Home') {
    // Close the modal and show the geofencing splash screen
    setIsScanning(false);
    setModalVisible(false);
    
    // Show the geofencing splash modal with a slight delay
    setTimeout(() => {
      setShowGeofencingSplashModal(true);
    }, 300);
    
    // Haptic feedback for error
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    return;
  }
  
  // Update the capturePhoto function's geofencing check
  if (orgData?.allowGeofencing && !isWithinGeofence && selectedOption !== 'Home') {
    // Close the modal and show the geofencing splash modal
    setIsScanning(false);
    setModalVisible(false);
    
    // Show the geofencing splash modal
    setShowGeofencingSplashModal(true);
    
    // Haptic feedback for error
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    return;
  }
  
  

  
  // Reset action type when modal closes
  useEffect(() => {
    if (!modalVisible) {
      setActionType(null);
    }
  }, [modalVisible]);

  // Enhanced flash toggle that works differently based on camera facing
  const toggleFlash = useCallback(async () => {
    setIsFlashOn(!isFlashOn);
    
    if (facing === 'back') {
      // For back camera, toggle torch
      setFlash(current => current === "off" ? "on" : "off");
      setCameraTorch(!cameraTorch);
    } else {
      // For front camera, adjust screen brightness
      try {
        if (!isFlashOn) {
          // Save current brightness if not already saved
          if (originalBrightness === null) {
            const brightness = await Brightness.getBrightnessAsync();
            setOriginalBrightness(brightness);
          }
          // Set to maximum brightness
          await Brightness.setBrightnessAsync(1);
        } else {
          // Restore original brightness
          if (originalBrightness !== null) {
            await Brightness.setBrightnessAsync(originalBrightness);
          }
        }
      } catch (error) {
        console.error('Failed to adjust brightness:', error);
      }
    }
  }, [facing, isFlashOn, cameraTorch, originalBrightness]);

  // Clear timeline events for the current day
  const clearTodayTimelineEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    setTimelineEvents(prevEvents => 
      prevEvents.filter(event => {
        const eventDate = new Date(event.timestamp);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() !== today.getTime();
      })
    );
    
    setFilteredTimelineEvents(prevFiltered =>
      prevFiltered.filter(event => {
        const eventDate = new Date(event.timestamp);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() !== today.getTime();
      })
    );
  };

  // Add this function to filter timeline events based on selected time range
  const filterTimelineEvents = useCallback((filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Get the first day of this week (Sunday)
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    // Get the first day of last week
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    
    // Get the first day of this month
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get the first day of last month
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const filtered = timelineEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
      
      switch(filter) {
        case 'Today':
          return eventDay.getTime() === today.getTime();
        case 'Yesterday':
          return eventDay.getTime() === yesterday.getTime();
        case 'This Week':
          return eventDay >= thisWeekStart && eventDay <= today;
        case 'Last Week':
          return eventDay >= lastWeekStart && eventDay <= lastWeekEnd;
        case 'This Month':
          return eventDay >= thisMonthStart && eventDay <= today;
        case 'Last Month':
          return eventDay >= lastMonthStart && eventDay <= lastMonthEnd;
        case 'Custom Range':
          return eventDate >= customDateRange.startDate && eventDate <= customDateRange.endDate;
        case 'All Time':
          return true;
        default:
          return eventDay.getTime() === today.getTime();
      }
    });
    
    // Sort filtered events by timestamp (newest first)
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }, [timelineEvents, customDateRange]);

  // Add this effect to update filtered events when timeline filter changes
  useEffect(() => {
    setFilteredTimelineEvents(filterTimelineEvents(timelineFilter));
  }, [timelineFilter, timelineEvents, filterTimelineEvents]);

  // Add this function to handle custom date range selection
  const handleApplyCustomDateRange = (startDate: Date, endDate: Date) => {
    setCustomDateRange({ startDate, endDate });
    setTimelineFilter('Custom Range');
    
    // Filter events based on custom date range
    const filtered = timelineEvents.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
    
    // Sort filtered events by timestamp (newest first)
    setFilteredTimelineEvents(filtered.sort((a, b) => b.timestamp - a.timestamp));
  };

  return (
    <View style={{ flex: 1 }}>
     
    <SafeAreaView className="h-full flex-1 bg-primary">
      <Navbar title="Attendance" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 ,alignItems:"center"}}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            
            >
            <View 
              style={{
                alignItems: 'center',
                display: 'flex',
                marginTop: 56,
                marginBottom: 30,
                paddingBottom: 40,
                borderRadius: 24,
                width: '92%',
                height: 472, 
                backgroundColor: 'rgba(27, 23, 57, 0.6)', 
                // Properly nest shadowOffset in the style object
                shadowColor: 'rgba(0, 0, 0, 0.8)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.9,
                shadowRadius: 15,
                borderWidth: 1,
                borderColor: 'rgba(48, 41, 86, 0.7)',
                borderStyle: 'solid',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Inner shadow overlay for depth effect */}
              <View 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: 'rgba(0, 0, 0, 0.2)',
                backgroundColor: 'transparent',
                // Properly nest shadowOffset in the style object
                shadowColor: 'rgba(0, 0, 0, 0.5)',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 5,
              }}
            />


              
              <View className={`w-full items-center flex flex-col ${isLoggedIn ? "pt-12" : "pt-20 pb-7"} `}>
                <Text className="text-white text-3xl" style={{fontFamily:"LatoBold"}}>
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Text>
                <Text className="text-[#5e5656] mb-8" style={{fontFamily:"LatoBold"}}>
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    weekday: 'long'
                  })}
                </Text>
                
           
                                {/* login/logout button */}
                {/* Inside your return statement, update the login button section */}
            
                {!hasRegisteredFaces || isFaceRegistrationRejected || isFaceRegistrationPending ? (
  <LinearGradient
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    colors={
      isFaceRegistrationRejected 
        ? ["#FF5252", "#B71C1C"] 
        : isFaceRegistrationPending 
          ? ["#e2d761", "#ebcf2d"] 
          : ["#ec9068", "#924d1b"]
    }
    style={[styles.gradientBorderOne, { opacity: 0.9 }]} 
  >
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      colors={[
        "#0A0D28", 
        isFaceRegistrationRejected 
          ? "#D32F2F" 
          : isFaceRegistrationPending 
            ? "#ffd000" 
            : "#cb7144"
      ]}  
      style={styles.gradientBorderTwo}              
    >
      <TouchableOpacity
        className="w-52 h-52 rounded-full items-center"
        onPress={
          isFaceRegistrationPending 
            ? () => {} 
            : handleFaceRegistration
        }
        disabled={isFaceRegistrationPending}
        style={styles.buttonTouchable}
        activeOpacity={0.8}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={["#0A0D28", "#383951"]}
          style={styles.gradientButton}
        >
          <View style={styles.buttonContent}>
            {isFaceRegistrationRejected ? (
              <View style={styles.iconContainer}>
                <MaterialIcons name="face-retouching-off" size={48} color="#FF5252" />
                <View style={styles.iconShadow} />
              </View>
            ) : isFaceRegistrationPending ? (
              <View style={styles.iconContainer}>
                <MaterialIcons name="hourglass-top" size={48} color="#FFD54F" />
                <View style={styles.iconShadow} />
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="face-recognition" size={48} color="#de8b62" />
              </View>
            )}
            
            <View style={styles.textContainer}>
              <Text 
                style={{
                  fontFamily: "LatoBold",
                  color: "white",
                  textAlign: "center",
                  marginTop: 4
                }}
              >
                {isFaceRegistrationRejected 
                  ? "Registration Failed" 
                  : isFaceRegistrationPending 
                    ? "Verification Pending" 
                    : "Register Face"
                }
              </Text>
              
              {isFaceRegistrationRejected && (
                <Text 
                  style={{
                    fontFamily: "LatoRegular",
                    fontSize: 11,
                    color: "#FFCDD2",
                    textAlign: "center",
                    marginTop: 2
                  }}
                >
                  Tap to try again
                </Text>
              )}
              
              {isFaceRegistrationPending && (
                <Text 
                  style={{
                    fontFamily: "LatoRegular",
                    fontSize: 11,
                    color: "#FFF9C4",
                    textAlign: "center",
                    marginTop: 4
                  }}
                >
                  Admin review in progress
                </Text>
              )}
              
              {!isFaceRegistrationRejected && !isFaceRegistrationPending && (
                <Text 
                  style={{
                    fontFamily: "LatoRegular",
                    fontSize: 12,
                    color: "#e7c29f",
                    textAlign: "center",
                    marginTop: 4
                  }}
                >
                  Tap to start
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>                  
  </LinearGradient>
) : (
  <LinearGradient
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    colors={isLoggedIn ? ["#d75d5d", "#400b0b"] : ["#5d5479", "#1a226d"]}
    style={styles.gradientBorderOne} 
  >
    <LinearGradient
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      colors={["#0A0D28", isLoggedIn ? "#c63d3d" : "#9079d4"]}  
      style={styles.gradientBorderTwo}              
    >
      <TouchableOpacity
        className="w-52 h-52 rounded-full items-center"
        onPress={handleLoginPress}
        style={styles.buttonTouchable}
      >
        <LinearGradient
          start={{ x: 0, y:1 }}
          end={{ x: 0, y: 0 }}
          colors={["#0A0D28", "#383951"]}
          style={styles.gradientButton}
        >
          <View style={styles.buttonContent}>
            <View style={styles.iconContainer}>
              <Image 
                style={{objectFit:"scale-down", }} 
                className="h-20 w-24" 
                source={
                  isLoggedIn 
                    ? require("../../../assets/Attendence/tapLOgout.png")
                    : require("../../../assets/Attendence/tap.png")
                }
              />
            </View>
            
            <View style={[styles.textContainer,{marginBottom:10}]}>
              <Text className="text-white text-lg" style={{fontFamily:"LatoBold"}}>
                {isLoggedIn ? "Log out" : "Log in"}
              </Text>
              
              <Text 
                className={isLoggedIn ? "text-red-300 text-xs" : "text-purple-300 text-xs "} 
                style={{fontFamily:"LatoRegular"}}
              >
                {isLoggedIn ? "End your workday" : "Start your workday"}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>                  
  </LinearGradient>
)}
               
                </View>

                {/* Modal for Camera */}
                <Modal
                  isVisible={modalVisible}
                  style={{ margin: 0, justifyContent: 'flex-end' }}
                  animationIn="slideInUp"
                  animationOut="slideOutDown"
                  onBackdropPress={() => {
                    if (!isScanning && !isModalOpening) {
                      setModalVisible(false);
                    }
                  }}
                >
                  <View className="rounded-t-3xl bg-[#060924] h-[95%]">
                    {cameraPermission?.granted && modalVisible && (
                      <View style={styles.cameraContainer}>
                        {!isCameraReady && (
                          <View style={[styles.camera, { backgroundColor: '#060924', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: 'white', fontSize: 16 }}>Initializing camera...</Text>
                          </View>
                        )}
                        <CameraView 
                          ref={cameraRef}
                          style={[styles.camera, { opacity: isCameraReady ? 1 : 0 }]} 
                          facing={facing}
                          flash={facing === 'back' ? flash : 'off'}
                          enableTorch={facing === 'back' ? cameraTorch : false}
                          onCameraReady={() => {
                            console.log('Camera is ready');
                            setTimeout(() => setIsCameraReady(true), 500);
                          }}
                        >
                          <View className="absolute p-5 flex w-full flex-row items-center justify-between">
                            <Image 
                              className="h-8 w-48" 
                              source={require("../../../assets/Attendence/cameraAiZapllo.png")}
                            />
                            <TouchableOpacity 
                              onPress={() => {
                                if (!isScanning && !isModalOpening) {
                                  setModalVisible(false);
                                }
                              }}
                              disabled={isScanning || isModalOpening}
                            >
                              <Image 
                                source={require('../../../assets/commonAssets/cross.png')} 
                                className="h-8 w-8" 
                                style={{ opacity: isScanning ? 0.5 : 1 }}
                              />
                            </TouchableOpacity>
                          </View>  
                          
                          {location && (
                            <View 
                              className={`flex items-center gap-2 flex-row absolute bottom-0 right-0 p-2 rounded-tl-xl ${isWithinGeofence ? "bg-[rgba(33,225,158,0.6)]" : "bg-[rgba(225,33,33,0.6)]"}`}
                            >
                              <Image 
                                className="w-6 h-6" 
                                source={require("../../../assets/Attendence/office.png")}
                              />
                              <Text 
                                className="text-white text-xs" 
                                style={{fontFamily:"LatoBold"}}
                              >
                                {isWithinGeofence ? "You are in office reach" : "You are outside office reach"}
                              </Text>
                            </View>
                          )}

                          {/* Scanning overlay */}
                          {isScanning && (
                            <View style={styles.scanningOverlay}>
                              {scanComplete ? (
                                  <LottieView
                                  source={require('../../../assets/Animation/scanning-succesfull.json')}
                                  autoPlay
                                  loop
                                  style={{ width: 300, height: 300 }}
                                />
                              ) : errorMessage ? (
                                <View style={styles.errorContainer}>
                                    <LottieView
                                    source={require('../../../assets/Animation/error.json')}
                                    autoPlay
                                    loop
                                    style={{ width: 250, height: 300 }}
                                  />
                                  <Text className=' text-red-500'>{errorMessage}</Text>
                                  <TouchableOpacity 
                                    style={styles.retryButton}
                                    onPress={() => {
                                      setIsScanning(false);
                                      setErrorMessage(null);
                                    }}
                                  >
                                    
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <View style={styles.scanningContainer}>
                                  <LottieView
                                    source={require('../../../assets/Animation/face-scanning.json')}
                                    autoPlay
                                    loop
                                    style={{ width: 250, height: 300 }}
                                  />
                                
                                </View>
                              )}
                            </View>
                          )}
                          
                 
                        </CameraView>
                      </View>
                    )}
                    
                    {location && (
                      <View className="w-full items-start flex flex-col gap-2 ml-5 mt-2">
                        <Text className="text-white" style={{fontFamily:"LatoBold"}}>
                          {isLoggedIn ? "Logout" : "Login"} at {new Date().toLocaleTimeString()}
                        </Text>
                        <Text className="text-white text-xs" style={{fontFamily:"LatoBold"}}>
                          Lat: {location.lat.toFixed(6)}
                        </Text>
                        <Text className="text-xs text-white" style={{fontFamily:"LatoBold"}}>
                          Long: {location.lng.toFixed(6)}
                        </Text>
                      </View>
                    )}

                    <View className="w-full items-center flex flex-row justify-center gap-12 mb-3">
                      <TouchableOpacity 
                        className="bg-[#223072] justify-center h-12 w-12 rounded-full items-center flex"
                        onPress={toggleFlash}
                        disabled={isScanning}
                      >
                        <Ionicons 
                          name={isFlashOn ? "flash-outline" : "flash-off-outline"} 
                          size={30} 
                          color={isScanning ? "#666" : "white"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={capturePhoto}
                        disabled={isScanning}
                      >
                        <MaterialIcons 
                          name="radio-button-on" 
                          size={80} 
                          color={isScanning ? "#666" : "white"}
                        />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={toggleCameraFacing}
                        className="bg-[#223072] justify-center h-12 w-12 rounded-full items-center flex"
                        disabled={isScanning}
                      >
                        <Ionicons 
                          name="camera-reverse-outline" 
                          size={30} 
                          color={isScanning ? "#666" : "white"}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="items-center border border-[#676B93] w-[95%] px-1.5 py-1.5 rounded-full mb-5 ml-3">
  <View className="w-full flex flex-row items-center justify-between">
    <TouchableOpacity
      className="w-1/2 items-center"
      onPress={() => handleOptionPress('Office')}
      disabled={isScanning}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={selectedOption === 'Office' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
        style={styles.tablet}
      >
        <Text 
          className={`text-sm ${selectedOption === 'Office' ? 'text-white' : 'text-[#676B93]'}`} 
          style={{ fontFamily: "LatoBold" }}
        >
          Office
        </Text>
      </LinearGradient>
    </TouchableOpacity>
    
    <TouchableOpacity
      className="w-1/2 items-center"
      onPress={() => handleOptionPress('Home')}
      disabled={isScanning}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={selectedOption === 'Home' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
        style={[
          styles.tablet,
          !userData?.data?.workFromHomeAllowed && { opacity: 0.5 }
        ]}
      >
        <Text 
          className={`text-sm ${selectedOption === 'Home' ? 'text-white' : 'text-[#676B93]'}`} 
          style={{ fontFamily: "LatoBold" }}
        >
          Work From Home
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  </View>
</View>
                  </View>
                </Modal>


                {/* Take a break button */} 
                {/* Take a break button */} 
                {isLoggedIn && (
                  <TouchableOpacity
                    className="flex h-[3.8rem] mt-4 items-center text-center w-[70%] shadow-2xl shadow-[#f7d472] border-2 justify-center rounded-full"
                    onPress={handleStartEndBreak}
                    style={{ overflow: 'hidden' }}
                  >
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      colors={isBreakOpen ? ["#e63916", "#f77272"] : ["#e6af16", "#f7d472"]}
                      style={styles.gradient}
                    >
                      <MaterialIcons 
                        name={isBreakOpen ? "timer-off" : "free-breakfast"} 
                        size={25} 
                        color="#10122d" 
                        style={{ marginRight: 8 }} 
                      />
                      <Text className="text-primary text-sm" style={{fontFamily:"LatoBold"}}>
                        {isBreakOpen ? `End Break (${formatDuration(currentBreakDuration)})` : "Take a Break"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}



     

            </View>

            <TouchableOpacity 
              style={styles.regularizationButton}
              onPress={() => setIsRegularizationModalOpen(true)}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={["#ac97ec", "#5729fc"]}
                style={styles.gradientBorders}
              >
                <View className='bg-primary rounded-full p-4 px-7 flex items-center flex-row gap-3'>
                  <FontAwesome name='keyboard-o' color={"white"} size={20}/>
                  <Text className='text-white text-sm' style={{fontFamily:"LatoBold"}}>
                    Apply Regularization
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>




            <RegularizationModal
            isVisible={isRegularizationModalOpen}
            onClose={() => setIsRegularizationModalOpen(false)}
            onSuccess={handleRegularizationSuccess}
          />

          {selectedRegularization && (
            <RegularizationDetailsModal
              isVisible={isRegularizationDetailsModalOpen}
              onClose={() => setIsRegularizationDetailsModalOpen(false)}
              regularization={selectedRegularization}
            />
          )}
        
            
            <View className="bg-[#272945] h-full w-full rounded-t-3xl flex items-center p-5 pb-16">
              <Text className="text-white p-2 text-xl w-full" style={{fontFamily:"LatoBold"}}>
                {timelineFilter === 'Today' ? "Today's Logs" : 
                 timelineFilter === 'Yesterday' ? "Yesterday's Logs" : 
                 `${timelineFilter} Logs`}
              </Text>
              
              {/* Timeline filter scroll bar */}
              <View className="w-full mb-4">
                <FlatList
                  data={[...timeFilterOptions, 'Custom']}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        if (item === 'Custom') {
                          setIsCustomDateRangeModalOpen(true);
                        } else {
                          setTimelineFilter(item);
                        }
                      }}
                      className={`mr-3 py-2 px-4 rounded-full ${
                        (timelineFilter === item || (timelineFilter === 'Custom Range' && item === 'Custom')) 
                        ? 'bg-[#FC8929]' : 'bg-[#1D1F3A]'
                      }`}
                    >
                      <Text
                        className={`${
                          (timelineFilter === item || (timelineFilter === 'Custom Range' && item === 'Custom')) 
                          ? 'text-white' : 'text-[#787CA5]'
                        }`}
                        style={{ fontFamily: "LatoBold" }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item}
                  contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 4 }}
                />
              </View>
              
              <View className="m-6 mt-4 flex items-center justify-around flex-row w-full">
  <View className="w-1/3 flex flex-col gap-3 items-center">
    <Image className="w-8 h-8" source={require("../../../assets/Attendence/clockWhite.png")}/>
    <Text 
      className={`text-[#FC8929] font-bold ${screenWidth < 300 ? "text-2xl" : "text-xl"}`}
      style={{fontFamily:"LatoBold"}}
    >
      {recentLoginTime || "--:--"}
    </Text>
    <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock In</Text>
  </View>

  <View className="w-1/3 flex flex-col gap-3 items-center">
    <Image 
      className="w-8 h-8" 
      source={require("../../../assets/Attendence/clockGray.png")}
      style={{ opacity: recentLogoutTime ? 1 : 0.5 }}
    />
    <Text 
      className={`text-[#e63916] font-bold ${screenWidth < 300 ? "text-2xl" : "text-xl"}`} 
      style={{fontFamily:"LatoBold"}}
    >
      {recentLogoutTime || "--:--"}
    </Text>
    <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock Out</Text>
  </View>

  <View className="w-1/3 flex flex-col gap-3 items-center">
  <Image className="w-8 h-8" source={require("../../../assets/Attendence/hours.png")}/>
  <Text 
    className={`text-[#f7d472] font-bold ${screenWidth < 300 ? "text-2xl" : "text-xl"}`} 
    style={{fontFamily:"LatoBold"}}
  >
        {isBreakOpen 
      ? `${new Date(breakStartTime?.getTime() || 0).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
      : "--:--"}
  </Text>
  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>
    Break
  </Text>

</View>

</View>

              <View className="flex flex-col items-start w-[90%]  mb-9 ">
              {filteredTimelineEvents.length > 0 ? (
                filteredTimelineEvents.map((event, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <View className="h-20 w-0.5 bg-[#FC8929] ml-5"></View>}
                    
                    <View className="h-14 flex flex-row gap-2 items-center justify-center relative">
                      <Image
                        className="w-12 h-52 mt-4 object-scale-down"
                        source={
                          event.type === 'login' 
                            ? require("../../../assets/Attendence/right.png")
                            : event.type === 'logout'
                            ? require("../../../assets/Attendence/chaeckOut.png")
                            : event.type === 'break_started'
                            ? require("../../../assets/Attendence/breakStart.png")
                            : require("../../../assets/Attendence/breakEnd.png")
                        }
                      />
                      <View className="flex flex-col items-start">
                        <View className="flex flex-row gap-2 items-center">
                          <Text className="text-white text-lg">{event.time}</Text>
                          {event.type === 'break_started' && isBreakOpen && (
                            <LinearGradient
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}                      
                              colors={['#815BF5', '#FC8929']}
                              style={styles.gradientBorder}
                            >
                              <View className="bg-[#040614] items-center rounded-xl p-1">
                                <Text className="text-white">On Break</Text>
                              </View>
                            </LinearGradient>
                          )}
                        </View>
                        <Text className="text-[#787CA5] text-sm">
                          {event.type === 'login' 
                            ? 'Login'
                            : event.type === 'logout'
                            ? 'Check Out'
                            : event.type === 'break_started'
                            ? 'Break Started'
                            : 'Break Ended'
                          } - {event.location}
                        </Text>
                      </View>
                    </View>
                  </React.Fragment>
                ))
              ) : (
                <View className="flex items-center justify-center w-full">
                  <Image
                    source={require('../../../assets/Animation/not found.gif')}
                    style={{ width: 200, height: 200 }}
                    resizeMode="contain"
                  />
                  <Text className="text-[#787CA5] text-center w-full">
                    No activity logged for {timelineFilter.toLowerCase()}
                  </Text>
                </View>
              )}
                    </View>
            </View>             
        
          </ScrollView>
        </TouchableWithoutFeedback>
        <FaceRegistrationModal
          isVisible={isFaceRegistrationModalOpen}
          onClose={() => setIsFaceRegistrationModalOpen(false)}
          onSuccess={handleFaceRegistrationSuccess}
        />

        {/* Add CustomDateRangeModal */}
        <CustomDateRangeModal
          isVisible={isCustomDateRangeModalOpen}
          onClose={() => setIsCustomDateRangeModalOpen(false)}
          onApply={handleApplyCustomDateRange}
          initialStartDate={customDateRange.startDate}
          initialEndDate={customDateRange.endDate}
        />
      </KeyboardAvoidingView>

      <CustomSplashScreen
          visible={showGeofencingSplashModal}
          lottieSource={require('../../../assets/Animation/notInLocation.json')}
          mainText="Location Error"
          subtitle="You are outside the allowed Geo-Fencing Area. Please raise a regularization request."
          onComplete={() => {
            console.log('Splash animation completed');
          }}
          onDismiss={() => {
            setShowGeofencingSplashModal(false);
          }}
          duration={4000}
          gradientColors={["#05071E", "#0A0D28"]}
          textGradientColors={["#FF5252", "#FF7B7B"]}
          condition={{
            type: 'location',
            status: false,
            failureAnimation: require('../../../assets/Animation/notInLocation.json')
          }}
        />
        <CustomSplashScreen
  visible={isLocationLoading && !modalVisible}
  lottieSource={require('../../../assets/Animation/notInLocation.json')}
  mainText="Getting Your Location"
  subtitle="Please wait while we determine your position. This helps us verify your attendance location."
  onComplete={() => {
    console.log('Location loading animation completed');
  }}
  onDismiss={() => {
    setIsLocationLoading(false);
  }}
  duration={10000} // Longer duration since we'll manually dismiss it when location is ready
  gradientColors={["#05071E", "#0A0D28"]}
  textGradientColors={["#815BF5", "#FC8929"]}
  condition={{
    type: 'location',
    status: true,
    successAnimation: require('../../../assets/Animation/notInLocation.json')
  }}
/>

<CustomSplashScreen
  visible={showFaceNotMatchedModal}
  lottieSource={require('../../../assets/Animation/error.json')}
  mainText="Face Not Recognized"
  subtitle="We couldn't verify your identity. Please ensure good lighting, remove any face coverings, and try again."
  onComplete={() => {
    console.log('Face not matched animation completed');
  }}
  onDismiss={() => {
    console.log('Face not matched modal dismissed');
    setShowFaceNotMatchedModal(false);
  }}
  duration={4000}
  gradientColors={["#05071E", "#0A0D28"]}
  textGradientColors={["#FF5252", "#FF7B7B"]}
  condition={{
    type: 'custom',
    status: false,
    failureAnimation: require('../../../assets/Animation/error.json')
  }}
/>

   

      
    </SafeAreaView>
    </View>
    
  );
}


const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 10,
    padding: 1,
  },
  gradientBorderOne: {
    borderRadius: 1000,
    width: 228,
    height: 228,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  
  gradientBorderTwo: {
    borderRadius: 1000,
    width: 202,
    height: 202,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  
  gradientButton: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  
  buttonTouchable: {
    width: 180,
    height: 180,
    borderRadius: 1000,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  
  buttonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  iconShadow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.2)',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    zIndex: -1,
  },
  
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cameraContainer: {
    display:"flex",
    justifyContent: 'center',
    
    height:"65%",
    borderRadius:100,
  },
  camera: {
    flex: 1,
    
    
  },

  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
  },
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width:"100%",
    display:"flex",
    alignItems:"center",
  },
  scanningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  
  scanningContainer: {
    width: '80%',
    backgroundColor: 'transparent',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  
  scanCompleteContainer: {
    width: '80%',
    backgroundColor: '#0A0D28',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#21E19E',
    shadowColor: '#21E19E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  
  scanningImage: {
    width: 320,
    height: 320,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  
  scanCompleteImage: {
    width: 100,
    height: 100,
    marginBottom: 15,
    resizeMode: 'contain',
  },
  
  scanningText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'LatoBold',
    marginTop: 5,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#060924',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'LatoBold',
  },
  subText: {
    fontSize: 16,
    color: '#9DA3B4',
    marginBottom: 30,
  },

  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 50, // To match the rounded-full class
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  regularizationButton: {
    borderRadius: 8,
    overflow: 'hidden',
   
    marginBottom:25,
  },
  gradientBorders: {
    padding: 2, // This determines border thickness
    borderRadius: 1000,
  },
  buttonInner: {
    backgroundColor: 'white', // Or any background color you prefer
    borderRadius: 6, // Slightly smaller than the outer radius
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  
  loadingContainer: {
    width: '80%',
    backgroundColor: 'rgba(10, 13, 40, 0.85)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FC8929',
    shadowColor: '#FC8929',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'LatoBold',
    marginTop: 15,
    textAlign: 'center',
  },
  loadingSubText: {
    color: '#9DA3B4',
    fontSize: 14,
    fontFamily: 'LatoRegular',
    marginTop: 8,
    textAlign: 'center',
  },
  

});

  