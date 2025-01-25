import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import Modal from 'react-native-modal';
import InputContainer from '~/components/InputContainer';

interface LinkModalProps {
  isLinkModalVisible: boolean;
  setLinkModalVisible: (visible: boolean) => void;
  links: string[];
  setLinks: any;
}

const AddLinkModal: React.FC<LinkModalProps> = ({
  isLinkModalVisible,
  setLinkModalVisible,
  links,
  setLinks,
}) => {
  const [linkInputs, setLinkInputs] = useState<string[]>(['']);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const addLinkInput = () => {
    setLinkInputs((prevInputs) => [...prevInputs, '']);
  };

  const removeLinkInput = (index: number) => {
    const updatedInputs = [...linkInputs];
    updatedInputs.splice(index, 1);
    setLinkInputs(updatedInputs);
  };

  const addLink = () => {
    linkInputs.forEach((link) => {
      if (link.trim()) {
        setLinks((prevLinks) => [...prevLinks, link.trim()]);
      }
    });
    setLinkInputs(['']);
    setLinkModalVisible(false);
  };

  const deleteLink = (index: number) => {
    const updatedLinks = [...links];
    updatedLinks.splice(index, 1);
    setLinks(updatedLinks);
  };

  return (
    <Modal
      isVisible={isLinkModalVisible}
      onBackdropPress={() => setLinkModalVisible(false)}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View className="rounded-t-3xl bg-[#0A0D28] p-5">
          <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
            <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
              Add Link
            </Text>
            <TouchableOpacity onPress={() => setLinkModalVisible(false)}>
              <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
            </TouchableOpacity>
          </View>
          <View className="mt-5">
            <FlatList
              data={links}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View key={index} className="relative mb-4 flex w-full flex-row items-center">
                  <View className="w-[90%]">
                    <InputContainer
                      label={`Added Link ${index + 1}`}
                      value={item}
                      onChangeText={() => {}}
                      placeholder={''}
                      className="flex-1 text-sm text-[#787CA5]"
                      passwordError={""}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteLink(index)}
                    className="absolute bottom-2 right-0 h-14 w-14">
                    <Image
                      className="h-14 w-14"
                      source={require('../../../assets/Tasks/delete.png')}
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
          {linkInputs.map((link, index) => (
            <View key={index} className="relative mb-4 flex w-full flex-row items-center">
              <View className="w-[90%]">
                <InputContainer
                  label={`Add Link ${index + 1}`}
                  passwordError={""}
                  value={link}
                  onChangeText={(value) => {
                    const updatedInputs = [...linkInputs];
                    updatedInputs[index] = value;
                    setLinkInputs(updatedInputs);
                  }}
                  placeholder="Enter a link"
                  className="flex-1 text-sm text-[#787CA5]"
                />
              </View>

              {index === linkInputs.length - 1 ? (
                <TouchableOpacity
                  onPress={addLinkInput}
                  className="absolute bottom-2 right-0 h-14 w-14">
                  <Image className="h-14 w-14" source={require('../../../assets/Tasks/add.png')} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => removeLinkInput(index)}
                  className="absolute bottom-2 right-0 h-14 w-14">
                  <Image className="h-14 w-14" source={require('../../../assets/Tasks/delete.png')} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {!isKeyboardVisible && (
            <View className="mt-10 w-full">
              <TouchableOpacity
                className="mb-10 flex h-[4rem] items-center justify-center rounded-full bg-[#37384B] p-5"
                onPress={addLink}>
                <Text
                  className="text-center font-semibold text-white"
                  style={{ fontFamily: 'LatoBold' }}>
                  Add Link
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddLinkModal;