import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SettingEditableComponentProps {
  title: string;
  onAddPress?: () => void;
  onDeletePress?: () => void;
}

const SettingEditableComponent: React.FC<SettingEditableComponentProps> = ({
  title
 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);
  const [isVisible, setIsVisible] = useState(true);

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(true);
  };

  const handleSavePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(false);
    // Optionally, you can call a function to save the updated title
  };



  if (!isVisible) {
    return null;
  }

  return (
    <View
      className="flex w-full flex-row justify-between"
    >
      {isEditing ? (
        <TextInput
          className="text-white w-[90%]"
          style={{ fontFamily: "LatoBold", color: 'white' }}
          value={editableTitle}
          onChangeText={setEditableTitle}
          autoFocus
        />
      ) : (
        <Text className="text-white text- w-[100%]" style={{ fontFamily: "LatoBold" }}>
          {editableTitle}
        </Text>
      )}
   
    </View>
  );
};

export default SettingEditableComponent;