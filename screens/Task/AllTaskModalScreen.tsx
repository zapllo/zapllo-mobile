import { router, useNavigation } from "expo-router";
import React from "react";
import { Alert, Image, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import Modal from "react-native-modal";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { BlurView } from 'expo-blur';

interface AllTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AllTaskModalScreen: React.FC<AllTaskModalProps> = ({ isVisible, onClose }) => {
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
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/all-task", true)}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>All Tasks</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/all-task", true)}>
                <Image className="w-16 h-16" source={require("../../assets/More/AllTAsk.png")} />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/my-team")}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>My Team</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/my-team")}>
                <Image className="w-16 h-16" source={require("../../assets/More/myTeam.png")} />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/categories")}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Categories</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/categories")}>
                <Image className="w-16 h-16" source={require("../../assets/More/categories.png")} />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/settings", true)}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/settings", true)}>
                <Image className="w-16 h-16" source={require("../../assets/More/settings.png")} />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row items-center gap-2 mb-1">
              <TouchableOpacity onPress={onClose}>
                <Image className="w-16 h-11" source={require("../../assets/Tasks/cross.png")} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default AllTaskModalScreen;