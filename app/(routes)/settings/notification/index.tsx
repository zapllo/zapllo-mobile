import { StyleSheet, Text, View } from "react-native";
import React from "react";
import NotificationScreen from "~/screens/settings/Notification/NotificationScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Notification() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NotificationScreen/>
    </GestureHandlerRootView>
   
  );
}

const styles = StyleSheet.create({});
