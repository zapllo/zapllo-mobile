import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import DashboardScreen from "~/screens/Attendance/Dashboard/DashboardScreen";

export type DashboardStackParamList = {
    DashboardScreen: undefined;

  
  };
const Stack = createStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
    </Stack.Navigator>
   
  );
}

const styles = StyleSheet.create({});
