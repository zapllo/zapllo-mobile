import { router, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import Modal from "react-native-modal";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface AllAttendenceScreen {
  isVisible: boolean;
  onClose: () => void;
}

const AllAttendenceScreen: React.FC<AllAttendenceScreen> = ({ isVisible, onClose }) => {
  const navigation = useNavigation();
  const { userData } = useSelector((state: RootState) => state.auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user role from API
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('https://zapllo.com/api/users/organization');
        const data = await response.json();
        
        if (data.message === "Users fetched successfully") {
          // Find current user by matching with userData from Redux
          const currentUserId = userData?.data?._id || userData?.user?._id;
          const currentUser = data.data.find(user => user._id === currentUserId);
          
          if (currentUser) {
            setIsAdmin(currentUser.isAdmin || currentUser.role === 'orgAdmin');
          } else {
            // Fallback to Redux data if user not found in API response
            setIsAdmin(userData?.data?.role === "orgAdmin" || userData?.user?.role === "orgAdmin");
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Fallback to Redux data if API fails
        setIsAdmin(userData?.data?.role === "orgAdmin" || userData?.user?.role === "orgAdmin");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
  }, [userData]);

  const handleNavigation = (route: string, isAdminOnly: boolean = false) => {
    if (isAdminOnly && !isAdmin) {
      // Trigger heavy haptic feedback for access denied
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        "Access Denied", 
        "Only admins can access this section.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    
    // Trigger light haptic feedback for successful navigation
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    router.push(route);
  };

  const handleAccessDenied = () => {
    if (!isAdmin) {
      // Trigger heavy haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      Alert.alert(
        "Access Denied", 
        "Only admins can access this section.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    }
  };

  return (
    <Modal
      isVisible={isAdmin ?isVisible : false}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <BlurView intensity={15} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View className="bg-transparent">
          <View className="flex items-end flex-col gap-5 justify-around mb-10 mr-7">

            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity 
                onPress={() => isAdmin 
                  ? handleNavigation("/app/(routes)/HomeComponent/Attendance/AllAttendence", true)
                  : handleAccessDenied()
                }
              >
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>All Attendance</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => isAdmin 
                  ? handleNavigation("/(routes)/HomeComponent/Attendance/AllAttendence", true)
                  : handleAccessDenied()
                }
              >
                <Image className="w-16 h-16" source={require("../../../assets/Attendence/AllAttendence.png")} />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity 
                onPress={() => isAdmin 
                  ? handleNavigation("/(routes)/settings/AttendenceSettings", true)
                  : handleAccessDenied()
                }
              >
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => isAdmin 
                  ? handleNavigation("/(routes)/settings/AttendenceSettings", true)
                  : handleAccessDenied()
                }
              >
                <Image className="w-16 h-16" source={require("../../../assets/Attendence/settings.png")} />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row items-center gap-2 mb-1">
              <TouchableOpacity onPress={onClose}>
                <Image className="w-14 h-14 rounded-full mr-1" source={require("../../../assets/Tasks/cross.png")} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default AllAttendenceScreen;