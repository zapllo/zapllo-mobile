// AudioModal.tsx
import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import Modal from "react-native-modal";

interface AudioModalProps {
  isAudioModalVisible: boolean;
  setAudioModalVisible: (visible: boolean) => void;
}

const AudioModal: React.FC<AudioModalProps> = ({
  isAudioModalVisible,
  setAudioModalVisible,
}) => {
  return (
    <Modal
      isVisible={isAudioModalVisible}
      onBackdropPress={() => setAudioModalVisible(false)}
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
            Add Audio
          </Text>
          <TouchableOpacity onPress={() => setAudioModalVisible(false)}>
            <Image
              source={require("../../../assets/commonAssets/cross.png")}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>
        {/* Add any additional content for the audio modal here */}

                <View className="w-full flex items-center">
                    <View className="w-full border-dashed border-[#815BF5] border h-32  rounded-2xl items-center flex justify-center flex-row gap-4">
                        <Image className="w-9 h-9" source={require("../../../assets/Tasks/voice.png")}/>
                        <Text className="text-white" style={{ fontFamily:"Lato-Bold"}}>
                        Tap to record your voice note
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

export default AudioModal;