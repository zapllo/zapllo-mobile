
import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Platform, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileButton from "~/components/profile/ProfileButton";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { useFocusEffect, useNavigation } from "expo-router";
import { backend_Host } from "~/config";
import axios from "axios";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface NavbarProps {
  title: string;
  showProfile?: boolean;
}

const NavbarTwo: React.FC<NavbarProps> = ({ title, showProfile = false }) => {
  const navigation = useNavigation();
  const { token } = useSelector((state: RootState) => state.auth);
  const [profilePic, setProfilePic] = useState('');
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      if (showProfile) {
        handleGetProfile();
      }
    }, [showProfile])
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
      console.error('API Error:', err.response || err.message);
    }
  };

  // Platform-specific styling
  const navbarHeight = Platform.OS === 'ios' ? 44 : 56;
  const topPadding = Platform.OS === 'ios' ? 0 : insets.top;
  
  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#05071E"
      />
      <SafeAreaView 
        style={{
          backgroundColor: '#05071E',
          paddingTop: topPadding,
          ...(Platform.OS === 'ios' 
            ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }
            : { elevation: 3 })
        }}
      >
        <View 
          className="flex flex-row items-center px-4"
          style={{ 
            height: navbarHeight,
            paddingBottom: Platform.OS === 'ios' ? 16 : 10
          }}
        >
          {/* Left section - Back button */}
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            className="flex flex-row items-center"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back-sharp" size={20} color="#787CA5" />
            <Text 
              className="text-secondary text-sm" 
              style={{ fontFamily: "LatoBold" }}
            >
              Back
            </Text>
          </TouchableOpacity>
          
          {/* Middle section - Empty or flexible space */}
          <View className="flex-1" />
          
          {/* Right section - Title text */}
          <View className="flex-row items-center">
            <Text 
              className="text-xl font-semibold text-secondary mr-4"
              style={{ 
                fontFamily: "LatoBold",
                maxWidth: 200
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            
            {/* Profile button if enabled */}
            {showProfile && (
              <ProfileButton profile={profilePic} image={''} />
            )}
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default NavbarTwo;
