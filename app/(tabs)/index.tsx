import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Redirect } from "expo-router";

export default function TAbIndex() {
  return <Redirect href={"/(tabs)/home" as any}/>
}
