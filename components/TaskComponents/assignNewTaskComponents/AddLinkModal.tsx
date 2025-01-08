// LinkModal.tsx
import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import Modal from "react-native-modal";
import InputContainer from "~/components/InputContainer";

interface LinkModalProps {
  isLinkModalVisible: boolean;
  setLinkModalVisible: (visible: boolean) => void;
}

const AddLinkModal: React.FC<LinkModalProps> = ({
  isLinkModalVisible,
  setLinkModalVisible,
}) => {
    const [link, setLink] = React.useState("");
  return (
    <Modal
      isVisible={isLinkModalVisible}
      onBackdropPress={() => setLinkModalVisible(false)}
      style={{ margin: 0, justifyContent: "flex-end" }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View className="rounded-t-3xl bg-[#0A0D28] p-5  ">
        <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
          <Text
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "Lato-Bold" }}
          >
            Add Link
          </Text>
          <TouchableOpacity onPress={() => setLinkModalVisible(false)}>
            <Image
              source={require("../../../assets/commonAssets/cross.png")}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>
        {/* add links   */}
        <View className="flex flex-row items-center w-full relative ">
            <View className="w-[90%]">
            <InputContainer
              label="Add Link"
              value={link}
              onChangeText={(value) => setLink(value)}
              placeholder=""
              className="flex-1  text-sm text-[#787CA5]"
              passwordError={''}
            />
            </View>

            <TouchableOpacity className="h-14  w-[10%] mr-10 absolute left-[85%] bottom-2">
            <Image
            className="w-14 h-14"
            source={require("../../../assets/Tasks/delete.png")}
            />
            </TouchableOpacity>

        </View>

        <View className="flex flex-row items-center w-full relative ">
            <View className="w-[90%]">
            <InputContainer
              label="Add Link"
              value={link}
              onChangeText={(value) => setLink(value)}
              placeholder=""
              className="flex-1  text-sm text-[#787CA5]"
              passwordError={''}
            />
            </View>

            <TouchableOpacity className="h-14  w-[10%] mr-10 absolute left-[85%] bottom-2">
            <Image
            className="w-14 h-14"
            source={require("../../../assets/Tasks/add.png")}
            />
            </TouchableOpacity>

        </View>

        <View className=" w-full mt-10"> 
        <TouchableOpacity
              className={`mb-10  flex h-[4rem]  items-center justify-center rounded-full p-5 bg-[#37384B]`}>
              <Text className="text-center  font-semibold text-white"  style={{fontFamily:"Lato-Bold"}}>Add Link</Text>
        </TouchableOpacity>
        </View>
            
      </View>
    </Modal>
  );
};

export default AddLinkModal;