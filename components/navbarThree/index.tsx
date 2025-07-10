import React, { useState, useEffect } from "react";
import { View, Text, Image, Platform, StatusBar, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ProfileButton from "../profile/ProfileButton";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import axios from "axios";
import { backend_Host } from "~/config";
import { useFocusEffect } from "@react-navigation/native";

interface NavbarThreeProps {
  title: string;
}

const NavbarThree: React.FC<NavbarThreeProps> = ({ title }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [profilePic, setProfilePic] = useState('');
  const insets = useSafeAreaInsets();
  
  // Platform-specific styling
  const platformStyles = {
    navbarHeight: Platform.OS === 'ios' ? 44 : 56,
    shadowProps: Platform.OS === 'ios' 
      ? { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 }
      : { elevation: 4 }
  };

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
      setProfilePic(response.data.data.profilePic);
    } catch (err: any) {
      console.error('Profile fetch error:', err.response || err.message);
    }
  };

  return (
    <SafeAreaView >
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#05071E" 
        
      />
      <View 
        className="w-full flex flex-row justify-between items-center px-4"
        style={{
          height: platformStyles.navbarHeight,
          paddingTop: Platform.OS === 'android' ? insets.top +5 : 0,
          ...platformStyles.shadowProps
        }}
      >
        <Image 
          className="w-11 h-7" 
          source={require("~/assets/home/logo.png")}
          resizeMode="contain"
        />
        
        <Text 
          className="text-xl font-semibold text-white"
          style={{ 
            fontFamily: "LatoBold",
            textAlign: 'center',
          
          }}
        >
          {title}
        </Text>
        
        <ProfileButton profile={profilePic} image={''} />
      </View>
    </SafeAreaView>
  );
};

export default NavbarThree;