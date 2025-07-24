import '../global.css';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React from 'react';
import { Provider } from 'react-redux';
import { RootState, persistor, store } from '~/redux/store';
import { useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useDispatch } from 'react-redux';
import { Easing, useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '~/tamagui.config';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    PathwayExtreme: require('../assets/fonts/PathwayExtreme-VariableFont_opsz,wdth,wght.ttf'),
    LatoBold: require('../assets/fonts/Lato-Bold.ttf'),
    LatoLight: require('../assets/fonts/Lato-Light.ttf'),
    LatoRegular: require('../assets/fonts/Lato-Regular.ttf'),
    LatoThin: require('../assets/fonts/Lato-Thin.ttf'),
    LatoBlack: require('../assets/fonts/Lato-Black.ttf'),
    ...FontAwesome.font,
  });

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
      <PersistGate loading={null} persistor={persistor}>
        <RootLayoutNav />
      </PersistGate>
    </Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { token } = useSelector((state: RootState) => state.auth);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={token ? "dark" : colorScheme!}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="(routes)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(routes)/onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(routes)/login" options={{ headerShown: false }} />
            <Stack.Screen name="(routes)/forgot-PassWord" options={{ headerShown: false }} />
            <Stack.Screen name="(routes)/signup/pageOne" options={{ headerShown: false }} />
            <Stack.Screen name="(routes)/signup/pageTwo" options={{ headerShown: false }} />
          </>
        )}
      </Stack>
    </TamaguiProvider>
  );
}
