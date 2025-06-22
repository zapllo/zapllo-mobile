m # TestFlight Setup Guide - Camera & Location Permissions Fix

## Issues Identified & Fixed

Your app was experiencing camera and location permission glitches in TestFlight because:

1. **Missing iOS Permission Descriptions** - Required for App Store submission
2. **Missing Expo Plugins Configuration** - Essential for native functionality
3. **Incomplete Android Permissions** - Missing location permissions
4. **Inadequate Permission Handling** - Not robust enough for production builds

## ✅ Changes Made

### 1. Updated `app.json` Configuration

#### Added iOS Permission Descriptions:
```json
"infoPlist": {
  "NSCameraUsageDescription": "This app needs access to camera to capture attendance photos for verification purposes.",
  "NSMicrophoneUsageDescription": "This app needs access to microphone for audio recording features.",
  "NSLocationWhenInUseUsageDescription": "This app needs access to your location to verify your attendance location and enable geofencing features.",
  "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs access to your location to verify your attendance location and enable geofencing features.",
  "NSPhotoLibraryUsageDescription": "This app needs access to photo library to save and manage attendance photos."
}
```

#### Added Required Expo Plugins:
```json
"plugins": [
  "expo-router",
  [
    "expo-camera",
    {
      "cameraPermission": "Allow Zapllo to access your camera to capture attendance photos for verification purposes."
    }
  ],
  [
    "expo-location",
    {
      "locationAlwaysAndWhenInUsePermission": "Allow Zapllo to use your location to verify your attendance location and enable geofencing features.",
      "locationAlwaysPermission": "Allow Zapllo to use your location to verify your attendance location and enable geofencing features.",
      "locationWhenInUsePermission": "Allow Zapllo to use your location to verify your attendance location and enable geofencing features.",
      "isIosBackgroundLocationEnabled": false
    }
  ],
  [
    "expo-image-picker",
    {
      "photosPermission": "The app accesses your photos to let you share them with your attendance records."
    }
  ]
]
```

#### Updated Android Permissions:
```json
"permissions": [
  "android.permission.RECORD_AUDIO",
  "android.permission.CAMERA",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.FOREGROUND_SERVICE"
]
```

### 2. Created Robust Permission Manager (`utils/permissions.ts`)

- Centralized permission handling
- Better error messages and user guidance
- Proper fallback mechanisms
- Production-ready permission requests

### 3. Updated HomeScreen Component

- Integrated new permission manager
- Improved error handling
- Better user feedback for permission issues

### 4. Added EAS Build Configuration (`eas.json`)

- Proper build configurations for different environments
- Optimized settings for TestFlight builds

## 🚀 Next Steps to Deploy

### Step 1: Clean and Rebuild

```bash
# Clear Expo cache
npx expo install --fix

# Clear node modules and reinstall
rm -rf node_modules
npm install

# Clear Metro cache
npx expo start --clear
```

### Step 2: Prebuild for Native Changes

```bash
# This is CRITICAL - you must prebuild after changing app.json
npx expo prebuild --clean

# If you have custom native code, use:
npx expo prebuild --clean --platform ios
```

### Step 3: Test Locally First

```bash
# Test on iOS simulator
npx expo run:ios

# Test on physical device
npx expo run:ios --device
```

### Step 4: Build for TestFlight

```bash
# Install EAS CLI if not already installed
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for TestFlight
eas build --platform ios --profile production

# Or build for internal testing first
eas build --platform ios --profile preview
```

### Step 5: Submit to TestFlight

```bash
# Submit to App Store Connect
eas submit --platform ios --profile production
```

## 🔧 Additional Recommendations

### 1. Update Your Build Process

Always run these commands after changing `app.json`:
```bash
npx expo prebuild --clean
npx expo run:ios
```

### 2. Test Permission Flow

Before submitting to TestFlight, test:
- Camera permission request on first launch
- Location permission request on first launch
- Permission denial scenarios
- App behavior when permissions are revoked in Settings

### 3. Monitor Crash Reports

In App Store Connect, monitor:
- TestFlight feedback
- Crash reports related to permissions
- User feedback about camera/location issues

### 4. Version Management

Update your app version in `app.json` before each TestFlight build:
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

## 🐛 Troubleshooting

### If Camera Still Doesn't Work in TestFlight:

1. **Check Build Logs**: Look for permission-related errors in EAS build logs
2. **Verify Prebuild**: Ensure `npx expo prebuild --clean` was run after app.json changes
3. **Test on Physical Device**: Always test on a real device, not just simulator
4. **Check iOS Settings**: Verify permissions are properly requested in device Settings

### If Location Still Doesn't Work:

1. **Check Location Services**: Ensure device has location services enabled
2. **Test Different Accuracy Levels**: Try different location accuracy settings
3. **Check Network**: Location services may require internet connection
4. **Verify Geofencing Logic**: Test geofencing calculations with known coordinates

### Common Issues:

- **"Permission denied" errors**: Usually means prebuild wasn't run after app.json changes
- **Camera not initializing**: Often related to missing camera permissions in Info.plist
- **Location timeout**: May need to increase timeout values in location requests

## 📱 Testing Checklist

Before submitting to TestFlight:

- [ ] App requests camera permission on first use
- [ ] App requests location permission on first use
- [ ] Camera opens and captures photos successfully
- [ ] Location is detected accurately
- [ ] Geofencing works correctly
- [ ] App handles permission denials gracefully
- [ ] No crashes when permissions are revoked in Settings
- [ ] All permission descriptions are user-friendly and accurate

## 🔄 Continuous Integration

For future updates, always:

1. Test locally on physical device
2. Build preview version first
3. Test preview thoroughly
4. Only then build production version
5. Submit to TestFlight
6. Test TestFlight build before releasing

This comprehensive setup should resolve all camera and location permission issues in your TestFlight builds!