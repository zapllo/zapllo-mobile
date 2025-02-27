import { router, useNavigation } from "expo-router";
import React from "react";
import { Alert, Image, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import Modal from "react-native-modal";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { BlurView } from 'expo-blur';
interface AllAttendenceScreen {
    isVisible: boolean;
    onClose: () => void;
  }

const AllAttendenceScreen: React.FC<AllAttendenceScreen> = ({ isVisible, onClose }) => {
    const navigation = useNavigation();
    const { userData } = useSelector((state: RootState) => state.auth);
  
    const isAdmin = userData?.data?.role === "orgAdmin" || userData?.user?.role === "orgAdmin";
  
    const handleNavigation = (route: string, isAdminOnly: boolean = false) => {
      if (isAdminOnly && !isAdmin) {
        Alert.alert("Access Denied", "Only admins can access this section.");
        return;
      }
      onClose();
      router.push(route);
    };
  
    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        style={{ justifyContent: "flex-end", margin: 0 }}
      >
        <BlurView intensity={15} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View className="bg-transparent">
            <View className="flex items-end flex-col gap-5 justify-around mb-10 mr-7">

            <View className="flex flex-row items-center gap-2">
                <TouchableOpacity onPress={() => handleNavigation("/app/(routes)/HomeComponent/Attendance/AllAttendence", true)}>
                  <Text className="text-white" style={{ fontFamily: "LatoBold" }}>All Attendance</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/HomeComponent/Attendance/AllAttendence", true)}>
                  <Image className="w-16 h-16" source={require("../../../assets/Attendence/AllAttendence.png")} />
                </TouchableOpacity>
              </View>

              <View className="flex flex-row items-center gap-2">
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/settings/AttendenceSettings", true)}>
                  <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/settings/AttendenceSettings", true)}>
                  <Image className="w-16 h-16" source={require("../../../assets/Attendence/settings.png")} />
                </TouchableOpacity>
              </View>
  
              <View className="flex flex-row items-center gap-2 mb-1">
                <TouchableOpacity onPress={onClose}>
                  <Image className="w-16 h-11" source={require("../../../assets/Tasks/cross.png")} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </Modal>
    );
  };

  export default AllAttendenceScreen;

