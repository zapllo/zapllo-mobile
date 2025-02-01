import React, { useState } from "react";
import { View, Text, Image } from "react-native";
import ProfileButton from "../profile/ProfileButton";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import axios from "axios";
import { backend_Host } from "~/config";
import { useFocusEffect } from "@react-navigation/native";

interface NavbarProps {
  
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({  title }) => {
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
      <Image className="w-11 h-7 " source={require("~/assets/home/logo.png")}/>
      <Text className="text-2xl font-semibold pl-4 h-full text-[#FFFFFF]" style={{fontFamily:"LatoBold"}}>{title}</Text>
      <ProfileButton profile={profilePic} image={''} />
    </View>
  );
};

export default Navbar;