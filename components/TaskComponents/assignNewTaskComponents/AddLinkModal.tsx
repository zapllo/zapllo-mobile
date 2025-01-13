import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useState } from 'react';
import Modal from 'react-native-modal';
import InputContainer from '~/components/InputContainer';

interface LinkModalProps {
  isLinkModalVisible: boolean;
  setLinkModalVisible: (visible: boolean) => void;
  links: string[];
  setLinks: (links: string[]) => void;
}

const AddLinkModal: React.FC<LinkModalProps> = ({
  isLinkModalVisible,
  setLinkModalVisible,
  links,
  setLinks,
}) => {
  const [linkInputs, setLinkInputs] = useState<string[]>(['']); // Start with one input box

  // Add a new input field at the bottom
  const addLinkInput = () => {
    setLinkInputs((prevInputs) => [...prevInputs, '']);
  };

  // Remove a link input field
  const removeLinkInput = (index: number) => {
    const updatedInputs = [...linkInputs];
    updatedInputs.splice(index, 1);
    setLinkInputs(updatedInputs);
  };

  // Add a new link
  const addLink = () => {
    linkInputs.forEach((link) => {
      if (link.trim()) {
        setLinks((prevLinks) => [...prevLinks, link.trim()]);
      }
    });
    setLinkInputs(['']); // Reset input fields after adding
    setLinkModalVisible(false); // Close modal
  };

  // Delete a link
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
        
      <View className="rounded-t-3xl bg-[#0A0D28] p-5">
        <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
          <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'Lato-Bold' }}>
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

            {/* Add/Delete icon */}
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

        {/* Show added links */}

        <View className="mt-10 w-full">
          <TouchableOpacity
            className="mb-10 flex h-[4rem] items-center justify-center rounded-full bg-[#37384B] p-5"
            onPress={addLink} // Add links when clicked
          >
            <Text
              className="text-center font-semibold text-white"
              style={{ fontFamily: 'Lato-Bold' }}>
              Add Link
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddLinkModal;
