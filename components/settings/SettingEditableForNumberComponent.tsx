import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SettingEditableForNumberComponentProps {
  title: string | number;
  onSave?: (value: number) => void;
  fieldName: string;
}

const TEAM_SIZE_OPTIONS = [
  { label: '1-10', value: 10 },
  { label: '11-20', value: 20 },
  { label: '21-30', value: 30 },
  { label: '31-50', value: 50 },
  { label: '51+', value: 51 }
];

const SettingEditableForNumberComponent: React.FC<SettingEditableForNumberComponentProps> = ({
  title,
  onSave,
  fieldName
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(title.toString());

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsModalVisible(true);
  };

  const handleOptionSelect = (option: { label: string; value: number }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedValue(option.label);
    setIsModalVisible(false);
    if (onSave) {
      onSave(option.value);
    }
  };

  // Function to get display value
  const getDisplayValue = (value: string | number) => {
    if (value === 'N/A') return 'N/A';
    const numValue = typeof value === 'number' ? value : parseInt(value);
    
    for (const option of TEAM_SIZE_OPTIONS) {
      if (numValue <= option.value) {
        return option.label;
      }
    }
    return '51+';
  };

  return (
    <View className="flex w-full flex-row justify-between items-center">
      <Text className="text-white w-[80%]" style={{ fontFamily: "LatoBold" }}>
        {getDisplayValue(selectedValue)}
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
              Select Team Size
            </Text>
            <ScrollView className="max-h-[300px]">
              {TEAM_SIZE_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={option.label}
                  onPress={() => handleOptionSelect(option)}
                  className={`p-4 border-b border-[#37384B] ${
                    index === TEAM_SIZE_OPTIONS.length - 1 ? 'border-b-0' : ''
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

export default SettingEditableForNumberComponent;