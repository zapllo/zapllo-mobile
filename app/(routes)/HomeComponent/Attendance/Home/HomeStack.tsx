import { StyleSheet, Text, View } from "react-native";
import React from "react";
import HomeScreen from "~/screens/Attendance/Home/HomeScreen";
import { createStackNavigator } from "@react-navigation/stack";


export type HomeStackParamList = {
    HomeScreen: undefined;

  };

  const Stack = createStackNavigator<HomeStackParamList>();


export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({});
