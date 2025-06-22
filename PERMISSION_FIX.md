# 🔧 Quick Permission Fix

## The Issue
You're getting `Camera.requestCameraPermissionsAsync is not a function` because of an import issue.

## ✅ Quick Fix

Replace all instances of `PermissionManager.requestCameraPermission()` in your HomeScreen.tsx with:

```typescript
// Replace this:
const cameraPermissionGranted = await PermissionManager.requestCameraPermission();

// With this:
const { status } = await Camera.requestCameraPermissionsAsync();
const cameraPermissionGranted = status === 'granted';
```

## 🔍 Find and Replace

In your `screens/Attendance/Home/HomeScreen.tsx` file:

### 1. Remove the PermissionManager import:
```typescript
// Remove this line:
import { PermissionManager } from '~/utils/permissions';
```

### 2. Replace camera permission calls:

**Find:**
```typescript
const cameraPermissionGranted = await PermissionManager.requestCameraPermission();
if (!cameraPermissionGranted) {
  setShowGeofencingSplashModal(true);
  return;
}
```

**Replace with:**
```typescript
try {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Camera Permission Required',
      'This app needs camera access to capture attendance photos. Please enable camera permission in your device settings.'
    );
    setShowGeofencingSplashModal(true);
    return;
  }
} catch (error) {
  console.error('Error requesting camera permission:', error);
  setShowGeofencingSplashModal(true);
  return;
}
```

### 3. Replace location permission calls:

**Find:**
```typescript
const locationData = await PermissionManager.getCurrentLocation({
  accuracy: Location.Accuracy.Highest,
  maximumAge: 0
});
```

**Replace with:**
```typescript
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  Alert.alert('Permission Denied', 'Location permission is required for attendance.');
  setIsLocationLoading(false);
  return;
}

const locationData = await Location.getCurrentPositionAsync({
  accuracy: Location.Accuracy.Highest,
  maximumAge: 0
});

const location = {
  lat: locationData.coords.latitude,
  lng: locationData.coords.longitude
};
```

## 🚀 Alternative: Use the Working Pattern from Your Existing Code

Your HomeScreen already has working camera permission code! Look for this pattern in your file:

```typescript
// This pattern already works in your code:
if (!cameraPermission?.granted) {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Camera permission not granted');
  }
}
```

Just use this same pattern instead of the PermissionManager calls.

## ✅ Quick Test

After making these changes:

1. Remove the PermissionManager import
2. Replace the permission calls with direct Camera API calls
3. Test the app - it should work immediately

The Camera API is working correctly in your existing code, so this fix will resolve the issue instantly.