import { router, useNavigation } from "expo-router";
import React from "react";
import { Image, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import Modal from "react-native-modal";

interface AllTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const AllTaskModalScreen: React.FC<AllTaskModalProps> = ({ isVisible, onClose }) => {
  const navigation = useNavigation();

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <View className="rounded-t-3xl bg-[#0A0D28] p-5 ">
        <View className="mb-10 mt-2 flex w-full flex-row items-center justify-between">
          <Text
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "LatoBold" }}
          >
            More
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Image
              source={require("../../assets/commonAssets/cross.png")}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>

        <View className="flex items-center flex-row justify-around mb-20 mt-2">
          <View className="flex flex-col items-center gap-2">
            <TouchableOpacity onPress={() => handleNavigation("/(routes)/all-tasks")}>
              <Image className="w-16 h-16" source={require("../../assets/More/AllTAsk.png")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigation("/(routes)/all-tasks")}>
              <Text className="text-white" style={{ fontFamily: "LatoBold" }}>All Tasks</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-col items-center gap-2">
            <TouchableOpacity onPress={() => handleNavigation("/(routes)/my-team")}>
              <Image className="w-16 h-16" source={require("../../assets/More/myTeam.png")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigation("/(routes)/my-team")}>
              <Text className="text-white" style={{ fontFamily: "LatoBold" }}>My Team</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-col items-center gap-2">
            <TouchableOpacity onPress={() => handleNavigation("/(routes)/categories")}>
              <Image className="w-16 h-16" source={require("../../assets/More/categories.png")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigation("/(routes)/categories")}>
              <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Categories</Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-col items-center gap-2">
            <TouchableOpacity onPress={() => handleNavigation("/(routes)/settings")}>
              <Image className="w-16 h-16" source={require("../../assets/More/settings.png")} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigation("/(routes)/settings")}>
              <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AllTaskModalScreen;