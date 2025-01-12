import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import * as DocumentPicker from "expo-document-picker";

interface FileModalProps {
  isFileModalVisible: boolean;
  setFileModalVisible: (visible: boolean) => void;
}

const FileModal: React.FC<FileModalProps> = ({
  isFileModalVisible,
  setFileModalVisible,
}) => {
  const [attachments, setAttachments] = useState<{ name: string; uri: string }[]>(
    []
  );

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });

      console.log("Document Picker Result: ", result);

      if (result.canceled) {
        console.log("Document selection cancelled.");
      } else if (result.assets && result.assets.length > 0) {
        // Extract the name and uri from the first asset
        const { name, uri } = result.assets[0];

        setAttachments((prev) => {
          const updated = [...prev, { name, uri }];
          console.log("Updated Attachments: ", updated);
          return updated;
        });
      }
    } catch (err) {
      console.error("Error picking document: ", err);
    }
  };

  // Monitor `attachments` state changes
  React.useEffect(() => {
    console.log("Attachments state updated: ", attachments);
  }, [attachments]);

  const handleSaveAttachments = () => {
    console.log("Current Attachments: ", attachments);
    if (attachments.length > 0) {
      console.log("Attachments saved:", attachments);
      Alert.alert("Success", "Files have been successfully uploaded.");
      setFileModalVisible(false);
    } else {
      Alert.alert("No Files", "Please select a file before uploading.");
    }
  };

  console.log(">>>>>",attachments)

  return (
    <Modal
      isVisible={isFileModalVisible}
      onBackdropPress={() => setFileModalVisible(false)}
      style={{ margin: 0, justifyContent: "flex-end" }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View className="rounded-t-3xl bg-[#0A0D28] p-5">
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
          <TouchableOpacity
            onPress={handleFileSelect}
            className="w-full border-dashed border-[#815BF5] border h-32 rounded-2xl items-center flex justify-center flex-row gap-4"
          >
            {attachments.length > 0 ? (
              <Text className="text-white" style={{ fontFamily: "Lato-Bold" }}>
                {attachments[attachments.length - 1].name}
              </Text>
            ) : (
              <>
                <Image
                  className="w-9 h-9"
                  source={require("../../../assets/Tasks/selectImage.png")}
                />
                <Text className="text-white" style={{ fontFamily: "Lato-Bold" }}>
                  Click to upload your document
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="w-full mt-16">
          <TouchableOpacity
            onPress={handleSaveAttachments}
            className="mb-10 flex h-[4rem] items-center justify-center rounded-full p-5 bg-[#37384B]"
          >
            <Text
              className="text-center font-semibold text-white"
              style={{ fontFamily: "Lato-Bold" }}
            >
              Upload Documents
            </Text>
          </TouchableOpacity>
        </View>

        {attachments.length > 0 && (
          <View>
            <Text className="text-white" style={{ fontFamily: "Lato-Bold" }}>
              Selected Files:
            </Text>
            {attachments.map((attachment, index) => (
              <Text key={index} className="text-white">
                {attachment.name}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

export default FileModal;
