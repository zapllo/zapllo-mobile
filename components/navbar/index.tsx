import React from "react";
import { View, Text, Image } from "react-native";
import ProfileButton from "../profile/ProfileButton";

interface NavbarProps {
  
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({  title }) => {
  return (
    <View className="w-full h-20 flex flex-row justify-between p-5 items-center">
      <Image className="w-7 h-7 " source={require("~/assets/home/logo.png")}/>
      <Text className="text-2xl font-semibold pl-4 h-full text-[#FFFFFF]">{title}</Text>
      <ProfileButton />
    </View>
  );
};

export default Navbar;