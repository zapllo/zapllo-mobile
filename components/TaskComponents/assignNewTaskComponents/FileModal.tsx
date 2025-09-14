import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import Modal from 'react-native-modal';
import * as DocumentPicker from 'expo-document-picker';

interface FileModalProps {
  isFileModalVisible: boolean;
  setFileModalVisible: (visible: boolean) => void;
  attachments: any;
  setAttachments: any;
}

const FileModal: React.FC<FileModalProps> = ({ isFileModalVisible, setFileModalVisible ,attachments,setAttachments}) => {
  const [fileNames, setFileNames] = useState<string[]>([]); // Store file names for display

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      console.log('Document Picker Result: ', result);

      if (result.canceled) {
        console.log('Document selection cancelled.');
      } else if (result.assets && result.assets.length > 0) {
        const { name, uri } = result.assets[0];

        // Update URIs in attachments state
        setAttachments((prev) => {
          const updated = [...prev, uri];
          console.log('Updated Attachments URIs: ', updated);
          return updated;
        });

        // Update file names in fileNames state
        setFileNames((prev) => {
          const updated = [...prev, name];
          console.log('Updated File Names: ', updated);
          return updated;
        });
      }
    } catch (err) {
      console.error('Error picking document: ', err);
    }
  };

  const handleSaveAttachments = () => {
    console.log('Current Attachments URIs: ', attachments);
    console.log('Current File Names: ', fileNames);
    if (attachments.length > 0) {
      Alert.alert('Success', 'Files have been successfully uploaded.');
      setFileModalVisible(false);
    } else {
      Alert.alert('No Files', 'Please select a file before uploading.');
    }
  };

  // Check if there are any files uploaded to enable button color change
  const hasUploadedFiles = attachments.length > 0;

  console.log('Attachments State: ', attachments);
  console.log('File Names State: ', fileNames);

  return (
    <Modal
      isVisible={isFileModalVisible}
      onBackdropPress={() => setFileModalVisible(false)}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <View className="rounded-t-3xl bg-[#0A0D28] p-5">
        <View className="mb-10 mt-2 flex w-full flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
            Add File
          </Text>
          <TouchableOpacity onPress={() => setFileModalVisible(false)}>
            <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
          </TouchableOpacity>
        </View>
        <View className="flex w-full items-center">
          <TouchableOpacity
            onPress={handleFileSelect}
            className="flex h-32 w-full flex-row items-center justify-center gap-4 rounded-2xl border border-dashed border-[#815BF5]">
            {fileNames.length > 0 ? (
              <Text className="text-xl text-white" style={{ fontFamily: 'LatoBold' }}>
                {fileNames[fileNames.length - 1]} {/* Display the last file name */}
              </Text>
            ) : (
              <>
                <Image
                  className="h-9 w-9"
                  source={require('../../../assets/Tasks/selectImage.png')}
                />
                <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                  Click to upload your document
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        {attachments.length > 0 && (
          <View>
            {attachments.map((uri, index) => (
              <View key={index} className="mt-5">
                <Text className="text-lg text-white text-center" style={{ fontFamily: 'LatoBold' }}>
                 {fileNames[index]}
                </Text>
                
              </View>
            ))}
          </View>
        )}
        <View className="mt-16 w-full">
          <TouchableOpacity
            onPress={handleSaveAttachments}
            className={`mb-10 flex h-[4rem] items-center justify-center rounded-full p-5 ${
              hasUploadedFiles ? 'bg-[#815BF5]' : 'bg-[#37384B]'
            }`}>
            <Text
              className="text-center font-semibold text-white"
              style={{ fontFamily: 'LatoBold' }}>
              Upload Documents
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default FileModal;
