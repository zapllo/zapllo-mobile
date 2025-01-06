import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function ProfileButton() {
  return (
    <TouchableOpacity 
    className="h-14 w-14 rounded-full"
    onPress={()=>router.push("(routes)/profile" as any)}
    >
      <LinearGradient
        colors={['#815BF5', '#FC8929']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: '98%',
          height: '98%',
          borderRadius: 50, // Ensure the gradient has the same border radius
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View className="bg-white h-12 w-12 rounded-full border-4 border-primary"></View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
