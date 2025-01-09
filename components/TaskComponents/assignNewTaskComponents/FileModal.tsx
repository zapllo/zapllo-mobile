// FileModal.tsx
import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import Modal from "react-native-modal";

interface FileModalProps {
  isFileModalVisible: boolean;
  setFileModalVisible: (visible: boolean) => void;
}

const FileModal: React.FC<FileModalProps> = ({
  isFileModalVisible,
  setFileModalVisible,
}) => {
  return (
    <Modal
      isVisible={isFileModalVisible}
      onBackdropPress={() => setFileModalVisible(false)}
      style={{ margin: 0, justifyContent: "flex-end" }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View className="rounded-t-3xl bg-[#0A0D28] p-5 ">
        <View className="mb-10 mt-2 flex w-full flex-row items-center justify-between">
          <Text
            className="text-2xl font-semibold text-white"
            style={{ fontFamily: "Lato-Bold" }}
          >
           Add File
          </Text>
          <TouchableOpacity onPress={() => setFileModalVisible(false)}>
            <Image
              source={require("../../../assets/commonAssets/cross.png")}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>
        <View className="w-full flex items-center">
            <View className="w-full border-dashed border-[#815BF5] border h-32  rounded-2xl items-center flex justify-center flex-row gap-4">
                <Image className="w-9 h-9" source={require("../../../assets/Tasks/selectImage.png")}/>
                <Text className="text-white" style={{ fontFamily:"Lato-Bold"}}>
                Click to upload your document
                </Text>
            </View>
        </View>


        <View className=" w-full mt-16 "> 
        <TouchableOpacity
              className={`mb-10  flex h-[4rem]  items-center justify-center rounded-full p-5 bg-[#37384B]`}>
              <Text className="text-center  font-semibold text-white"  style={{fontFamily:"Lato-Bold"}}>Upload Documents</Text>
        </TouchableOpacity>
        </View>        

      </View>
    </Modal>
  );
};

export default FileModal;