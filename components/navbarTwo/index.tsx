// File: components/Navbar.tsx

import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import ProfileButton from "~/components/profile/ProfileButton";

interface NavbarProps {
  title: string;
  onBackPress: () => any;
}

const NavbarTwo: React.FC<NavbarProps> = ({ title, onBackPress }) => {
  return (
    <View className="w-full h-20 flex flex-row justify-between p-5 items-center">
      <View className="flex h-14 w-14 bg-[#37384B] items-center justify-center rounded-full">
        <TouchableOpacity onPress={onBackPress}>
          <AntDesign name="arrowleft" size={24} color="#ffffff"  />
        </TouchableOpacity>
      </View>
      <Text className="text-2xl font-semibold  h-full text-[#FFFFFF]" style={{fontFamily:"LatoBold"}}>{title}</Text>
      <ProfileButton />
    </View>
  );
};

export default NavbarTwo;