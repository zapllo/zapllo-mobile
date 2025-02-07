// File: components/Navbar.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import ProfileButton from "~/components/profile/ProfileButton";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { useFocusEffect, useNavigation } from "expo-router";
import { backend_Host } from "~/config";
import axios from "axios";

interface NavbarProps {
  title: string;
}



const NavbarTwo: React.FC<NavbarProps> = ({ title}) => {
  const navigation = useNavigation();
  const { token} = useSelector((state: RootState) => state.auth);
  const [profilePic, setProfilePic] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      handleGetProfile();
    }, [])
  );

  const handleGetProfile = async () => {
    try {
      const response = await axios.get(
        `${backend_Host}/users/me`,
  
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("pljoihbihbuoi",response.data.data.profilePic)
      setProfilePic(response.data.data.profilePic);
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
    }
  };
  return (
    <View className="w-full h-20 flex flex-row justify-between p-5 items-center">
      <View className="flex h-[45px] w-[45px] bg-[#37384B] items-center justify-center rounded-full">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={24} color="#ffffff"  />
        </TouchableOpacity>
      </View>
      <Text className="text-2xl font-semibold  h-full text-[#FFFFFF]" style={{fontFamily:"LatoBold"}}>{title}</Text>
      <ProfileButton image={""} profile={profilePic} />
    </View>
  );
};

export default NavbarTwo;