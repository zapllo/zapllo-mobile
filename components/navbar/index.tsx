import React from "react";
import { View, Text, Image } from "react-native";
import ProfileButton from "../profile/ProfileButton";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";

interface NavbarProps {
  
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({  title }) => {
  

  return (
    <View className="w-full h-20 flex flex-row justify-between p-5 items-center">
      <Image className="w-11 h-7 " source={require("~/assets/home/logo.png")}/>
      <Text className="text-2xl font-semibold pl-4 h-full text-[#FFFFFF]" style={{fontFamily:"LatoBold"}}>{title}</Text>
      <ProfileButton />
    </View>
  );
};

export default Navbar;