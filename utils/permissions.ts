import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface PermissionStatus {
  camera: boolean;
  location: boolean;
  microphone?: boolean;
}

export class PermissionManager {
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'This app needs camera access to capture attendance photos. Please enable camera permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => this.openAppSettings() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  static async requestLocationPermission(): Promise<boolean> {
    try {
      // Request foreground location permission
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to verify your attendance location. Please enable location permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => this.openAppSettings() }
          ]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  static async checkAllPermissions(): Promise<PermissionStatus> {
    try {
      const [cameraStatus, locationStatus] = await Promise.all([
        Camera.getCameraPermissionsAsync(),
        Location.getForegroundPermissionsAsync()
      ]);

      return {
        camera: cameraStatus.status === 'granted',
        location: locationStatus.status === 'granted'
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return {
        camera: false,
        location: false
      };
    }
  }

  static async requestAllPermissions(): Promise<PermissionStatus> {
    try {
      const [cameraGranted, locationGranted] = await Promise.all([
        this.requestCameraPermission(),
        this.requestLocationPermission()
      ]);

      return {
        camera: cameraGranted,
        location: locationGranted
      };
    } catch (error) {
      console.error('Error requesting all permissions:', error);
      return {
        camera: false,
        location: false
      };
    }
  }

  static async getCurrentLocation(options?: Location.LocationOptions) {
    try {
      // First check if location services are enabled on the device
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        throw new Error('Location services are disabled on this device. Please enable location services in your device settings.');
      }

      // Check current permission status first
      const { status: currentStatus } = await Location.getForegroundPermissionsAsync();
      
      if (currentStatus !== 'granted') {
        // Request permission if not already granted
        const hasPermission = await this.requestLocationPermission();
        if (!hasPermission) {
          throw new Error('Location permission not granted');
        }
      }

      // Use more conservative settings for production builds
      const locationOptions = {
        accuracy: Location.Accuracy.Balanced, // Changed from Highest to Balanced for better reliability
        maximumAge: 30000, // Increased to 30 seconds to allow cached location
        timeout: 20000, // Increased timeout to 20 seconds
        ...options
      };

      console.log('Requesting location with options:', locationOptions);
      
      const location = await Location.getCurrentPositionAsync(locationOptions);

      console.log('Location received:', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Provide more specific error messages for different scenarios
      if (error.message?.includes('Location request timed out')) {
        throw new Error('Location request timed out. Please ensure you have a clear view of the sky and try again.');
      } else if (error.message?.includes('Location services are disabled')) {
        throw new Error('Location services are disabled. Please enable location services in your device settings.');
      } else if (error.message?.includes('permission')) {
        throw new Error('Location permission is required for attendance. Please grant location permission in your device settings.');
      } else {
        throw new Error('Unable to get your current location. Please check your location settings and try again.');
      }
    }
  }

  private static openAppSettings() {
    if (Platform.OS === 'ios') {
      // For iOS, we can't directly open app settings, but we can guide the user
      Alert.alert(
        'Open Settings',
        'Go to Settings > Privacy & Security > Camera/Location Services to enable permissions for this app.'
      );
    } else {
      // For Android, you might want to use a library like react-native-android-open-settings
      Alert.alert(
        'Open Settings',
        'Go to Settings > Apps > Zapllo > Permissions to enable camera and location permissions.'
      );
    }
  }

  static async validatePermissionsForAttendance(): Promise<{ valid: boolean; missingPermissions: string[] }> {
    const permissions = await this.checkAllPermissions();
    const missing: string[] = [];

    if (!permissions.camera) {
      missing.push('Camera');
    }
    if (!permissions.location) {
      missing.push('Location');
    }

    return {
      valid: missing.length === 0,
      missingPermissions: missing
    };
  }
}