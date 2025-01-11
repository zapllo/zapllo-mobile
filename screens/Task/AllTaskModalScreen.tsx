import { useNavigation } from "expo-router";
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

  const handleSettingsPress = () => {
    onClose(); 
    // navigation.navigate('settings');
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <View className="rounded-t-3xl bg-[#0A0D28] p-5">
        <View className="mb-10 mt-2 flex w-full flex-row items-center justify-between">
          <Text
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "Lato-Bold" }}
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

        <View className="flex items-center flex-row justify-around mb-6">
          <View className="flex flex-col items-center gap-2">
            <TouchableOpacity>
              <Image className="w-16 h-16" source={require("../../assets/More/image.png")} />
            </TouchableOpacity>
            <TouchableOpacity><Text className="text-white" style={{ fontFamily: "Lato-bold" }}>All Tasks</Text></TouchableOpacity>
          </View>

          <View className="flex flex-col items-center gap-2">
            <TouchableOpacity>
              <Image className="w-16 h-16" source={require("../../assets/More/image.png")} />
            </TouchableOpacity>
            <TouchableOpacity><Text className="text-white" style={{ fontFamily: "Lato-bold" }}>My Team</Text></TouchableOpacity>
          </View>

          <View className="flex flex-col items-center gap-2">
            <TouchableOpacity>
              <Image className="w-16 h-16" source={require("../../assets/More/image.png")} />
            </TouchableOpacity>
            <TouchableOpacity><Text className="text-white" style={{ fontFamily: "Lato-bold" }}>Categories</Text></TouchableOpacity>
          </View>

          <View
            className="flex flex-col items-center gap-2"
            
          >
            <TouchableOpacity
            onPress={handleSettingsPress}
            >
              <Image className="w-16 h-16" source={require("../../assets/More/image.png")} />
            </TouchableOpacity>
            <TouchableOpacity
            onPress={handleSettingsPress}
            ><Text className="text-white" style={{ fontFamily: "Lato-bold" }}>Settings</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AllTaskModalScreen;