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
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        maximumAge: 10000, // 10 seconds
        timeout: 15000, // 15 seconds timeout
        ...options
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
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