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
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { Easing, useColorScheme } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import tamaguiConfig from '~/tamagui.config';

// export { ErrorBoundary } from 'expo-router';

// export const unstable_settings = {
//   initialRouteName: '(tabs)',
// };

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
  const Stack = createStackNavigator();



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

  // Add this transition configuration
  const globalTransitionConfig = {
    transitionSpec: {
      open: {
        animation: 'timing',
        config: {
          duration: 300,
          easing: Easing.inOut(Easing.ease)
        }
      },
      close: {
        animation: 'timing',
        config: {
          duration: 300,
          easing: Easing.inOut(Easing.ease)
        }
      }
    },
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
  };
  const { token } = useSelector((state: RootState) => state.auth);
  console.log("iiiiiiiisssss", token)

  return (
    <>
      {token ? (
        <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
          <Stack screenOptions={{ headerShown: false, ...globalTransitionConfig }}>
            <Stack.Screen name="(routes)/home/index" />
            <Stack.Screen name="(routes)/HomeComponent/AIAssistant/index" />
            <Stack.Screen name="(routes)/HomeComponent/Attendance/index" />
            <Stack.Screen name="(routes)/HomeComponent/CRM/index" />
            <Stack.Screen name="(routes)/HomeComponent/Events/index" />
            <Stack.Screen name="(routes)/HomeComponent/Intranet/index" />
            <Stack.Screen name="(routes)/HomeComponent/Leaves/index" />
            <Stack.Screen name="(routes)/HomeComponent/Tasks/index" />
            <Stack.Screen name="(routes)/HomeComponent/Tutorials/index" />
            <Stack.Screen name="(routes)/HomeComponent/TutorialDetail/index" />
            <Stack.Screen name="(routes)/HomeComponent/WABA/index" />
            <Stack.Screen name="(routes)/HomeComponent/Workflows/index" />
            <Stack.Screen name="(routes)/profile/index" />
            <Stack.Screen name="(routes)/settings/index" />
            <Stack.Screen name="(routes)/HomeComponent/Tasks/AssignTaskScreen" />
            <Stack.Screen name="(routes)/HomeComponent/Tasks/TaskCategories" />
            <Stack.Screen name="(routes)/HomeComponent/Tasks/AllTaskScreen" />
          </Stack>
        </TamaguiProvider>
      ) : (
        <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
          <Stack screenOptions={{ headerShown: false, ...globalTransitionConfig }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(routes)/login/index" />
            <Stack.Screen name="(routes)/forgot-PassWord/index" />
            <Stack.Screen name="(routes)/signup/pageOne/index" />
            <Stack.Screen name="(routes)/signup/pageTwo/index" />
          </Stack>
        </TamaguiProvider>
      )}
    </>
  );
}
