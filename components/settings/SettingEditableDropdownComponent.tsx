import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SettingEditableDropdownComponentProps {
  title: string;
  onSave?: (value: string) => void;
  fieldName: string;
  options: Array<{ label: string; value: string }>;
}

const SettingEditableDropdownComponent: React.FC<SettingEditableDropdownComponentProps> = ({
  title,
  onSave,
  fieldName,
  options
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(title);

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsModalVisible(true);
  };

  const handleOptionSelect = (option: { label: string; value: string }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedValue(option.label);
    setIsModalVisible(false);
    if (onSave) {
      onSave(option.value);
    }
  };

  return (
    <View className="flex w-full flex-row justify-between items-center">
      <Text className="text-white w-[80%]" style={{ fontFamily: "LatoBold" }}>
        {selectedValue || 'N/A'}
      </Text>
      <TouchableOpacity onPress={handleEditPress}>
        <Image 
          source={require("../../assets/Tasks/addto.png")} 
          className="w-4 h-4"
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View className="w-[80%] bg-[#0A0D28] rounded-2xl overflow-hidden">
            <Text className="text-[#787CA5] text-sm p-4 border-b border-[#37384B]">
              Select {fieldName}
            </Text>
            <ScrollView className="max-h-[300px]">
              {options.map((option, index) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => handleOptionSelect(option)}
                  className={`p-4 border-b border-[#37384B] ${
                    index === options.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <Text className="text-white text-base">
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default SettingEditableDropdownComponent; 