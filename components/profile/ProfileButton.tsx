import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

export default function ProfileButton() {
  return (
    <TouchableOpacity 
    className="h-[3.2rem] w-[3.2rem] rounded-full"
    onPress={()=>router.push("(routes)/profile" as any)}
    >
      <LinearGradient
        colors={['#815BF5', '#FC8929']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 55, // Ensure the gradient has the same border radius
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View className="bg-white h-12 w-12 rounded-full border-2 border-primary"></View>
      </LinearGradient>
    </TouchableOpacity>
  );
}
