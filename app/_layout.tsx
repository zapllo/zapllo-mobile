import '../global.css';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React from 'react';
import { Provider } from 'react-redux';
import store from '~/redux/store';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PathwayExtreme:require('../assets/fonts/PathwayExtreme-VariableFont_opsz,wdth,wght.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

function RootLayoutNav() {
  const [isLoggedin, setIsLoggedin] = useState(false);

  return (
    <>
      {isLoggedin ? (
        <View></View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(routes)/login/index" />
          <Stack.Screen name="(routes)/forgot-PassWord/index" />
          <Stack.Screen name="(routes)/signup/pageOne/index" />
          <Stack.Screen name="(routes)/signup/pageTwo/index" />
          <Stack.Screen name="(routes)/home/index" />
          <Stack.Screen name="(routes)/HomeComponent/AIAssistant/index" />
          <Stack.Screen name="(routes)/HomeComponent/Attendance/index" />
          <Stack.Screen name="(routes)/HomeComponent/CRM/index" />
          <Stack.Screen name="(routes)/HomeComponent/Events/index" />
          <Stack.Screen name="(routes)/HomeComponent/Intranet/index" />
          <Stack.Screen name="(routes)/HomeComponent/Leaves/index" />
          <Stack.Screen name="(routes)/HomeComponent/Tasks/index" />
          <Stack.Screen name="(routes)/HomeComponent/Tutorials/index" />
          <Stack.Screen name="(routes)/HomeComponent/WABA/index" />
          <Stack.Screen name="(routes)/HomeComponent/Workflows/index" />
        </Stack>
      )}
    </>
  );
}
