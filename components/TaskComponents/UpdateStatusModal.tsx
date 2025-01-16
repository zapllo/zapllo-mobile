import React from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import Modal from 'react-native-modal';

interface MainModalProps {
  isVisible: boolean;
  onClose: () => void;
  onMoveToProgress: () => void;
}

const MainModal: React.FC<MainModalProps> = ({ isVisible, onClose, onMoveToProgress }) => (
  <Modal
    isVisible={isVisible}
    onBackdropPress={null as any}
    style={{ margin: 0, justifyContent: 'flex-end' }}
    animationIn="slideInUp"
    animationOut="slideOutDown">
    <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-20">
      <View className="mb-14 mt-2 flex w-full flex-row items-center justify-between">
        <Text className="text-xl font-semibold text-white">Task Progress</Text>
        <TouchableOpacity onPress={onClose}>
          <Image source={require('~/assets/commonAssets/cross.png')} className="h-8 w-8" />
        </TouchableOpacity>
      </View>

      <View className="flex flex-col gap-5">
        <TouchableOpacity
          onPress={onMoveToProgress}
          className="items-center rounded-full bg-[#A914DD] p-4">
          <Text className="text-base font-medium text-white">Move to Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onMoveToProgress}
          className="items-center rounded-full bg-[#007B5B] p-4">
          <Text className="text-base font-medium text-white">Move to Completed</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

interface ProgressModalProps {
  isVisible: boolean;
  onClose: () => void;
  description: string;
  setDescription: (text: string) => void;
  keyboardHeight: number;
  attachments: (string | null)[];
  handleFileSelect: (index: number) => void;
  updateTask: () => void;
}

const ProgressModal: React.FC<ProgressModalProps> = ({
  isVisible,
  onClose,
  description,
  setDescription,
  keyboardHeight,
  attachments,
  handleFileSelect,
  updateTask,
}) => (
  <Modal
    isVisible={isVisible}
    onBackdropPress={null as any}
    style={{ margin: 0, justifyContent: 'flex-end' }}
    animationIn="slideInUp"
    animationOut="slideOutDown"
    useNativeDriver={false}>
    <View
      className="rounded-t-3xl bg-[#0A0D28] p-5 pb-20"
      style={{ marginBottom: keyboardHeight }}>
      <View className="mb-6 mt-2 flex w-full flex-row items-center justify-between">
        <Text className="text-xl font-semibold text-white">In Progress</Text>
        <TouchableOpacity onPress={onClose}>
          <Image source={require('~/assets/commonAssets/cross.png')} className="h-8 w-8" />
        </TouchableOpacity>
      </View>

      <View
        className="mb-8 rounded-2xl border border-[#37384B] pl-6 pr-6"
        style={{ height: 150, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
        <TextInput
          multiline
          className="text-white"
          value={description}
          onChangeText={setDescription}
          placeholder="Description"
          placeholderTextColor="#787CA5"
          style={{ textAlignVertical: 'top', paddingTop: 11, width: '100%', paddingBottom: 11 }}
        />
      </View>

      <View className="w-full ">
        <View className=" flex w-full flex-row items-center gap-2">
          <Image source={require('~/assets/commonAssets/fileLogo.png')} className="h-6 w-5" />
          <Text className="text-sm text-[#787CA5]">Files</Text>
        </View>

        <View className=" flex w-full flex-row items-center justify-center gap-5 pl-5 pt-1">
          {['0', '1', '2'].map((index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleFileSelect(Number(index))}
              className="flex h-24 w-24 items-center justify-center rounded-lg border border-[#37384B]">
              {attachments[Number(index)] ? (
                <Image
                  source={{ uri: attachments[Number(index)] }}
                  className="h-24 w-24 rounded-lg"
                />
              ) : (
                <Image
                  source={require('~/assets/commonAssets/fileUploadContainer.png')}
                  className="h-24 w-24"
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={updateTask}
        className=" mt-10 h-16 w-full items-center justify-center rounded-full bg-[#37384B]">
        <Text className=" text-xl text-white">Update Task</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

export { MainModal, ProgressModal };