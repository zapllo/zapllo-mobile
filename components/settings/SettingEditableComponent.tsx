import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SettingEditableComponentProps {
  title: string;
  onSave?: (value: string) => void;
  fieldName: string;
}

const SettingEditableComponent: React.FC<SettingEditableComponentProps> = ({
  title,
  onSave,
  fieldName
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(true);
  };

  const handleSavePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(false);
    if (onSave && editableTitle !== title) {
      onSave(editableTitle);
    }
  };

  return (
    <View className="flex w-full flex-row justify-between items-center">
      {isEditing ? (
        <>
          <TextInput
            className="text-white w-[80%]"
            style={{ fontFamily: "LatoBold", color: 'white' }}
            value={editableTitle}
            onChangeText={setEditableTitle}
            autoFocus
            placeholder={`Enter ${fieldName}`}
            placeholderTextColor="#787CA5"
          />
          <TouchableOpacity onPress={handleSavePress}>
            <Text className="text-[#4A72FF]">Save</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text className="text-white w-[80%]" style={{ fontFamily: "LatoBold" }}>
            {editableTitle}
          </Text>
          <TouchableOpacity onPress={handleEditPress}>
            <Image 
              source={require("../../assets/Tasks/addto.png")} 
              className="w-4 h-4"
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default SettingEditableComponent;