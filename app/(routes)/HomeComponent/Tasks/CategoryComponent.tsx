import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CategoryComponentProps {
  title: string;
  onAddPress?: () => void;
  onDeletePress?: () => void;
}

const CategoryComponent: React.FC<CategoryComponentProps> = ({
  title,
  onAddPress,
  onDeletePress
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

  const handleDeletePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsVisible(false);
    if (onDeletePress) {
      onDeletePress();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View
      className="pt-5 pb-5 items-center flex flex-row justify-between w-[90%] p-4 rounded-3xl bg-[#10122d] mb-3"
      style={{
        borderColor: isEditing ? '#815BF5' : '#37384B',
        borderWidth: 1,
      }}
    >
      {isEditing ? (
        <TextInput
          className="text-white w-[80%]"
          style={{ fontFamily: "LatoBold", color: 'white' }}
          value={editableTitle}
          onChangeText={setEditableTitle}
          autoFocus
        />
      ) : (
        <Text className="text-white text-lg w-[80%]" style={{ fontFamily: "LatoBold" }}>
          {editableTitle}
        </Text>
      )}
      <View className="flex items-center justify-center gap-3 flex-row">
        {isEditing ? (
          <TouchableOpacity onPress={handleSavePress}>
            <Image source={require("../../../../assets/Tasks/isEditing.png")} className="w-7 h-7" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleEditPress}>
            <Image source={require("../../../../assets/Tasks/addto.png")} className="w-7 h-7" />
          </TouchableOpacity>
        )}
        {!isEditing && (
          <TouchableOpacity onPress={handleDeletePress}>
            <Image source={require("../../../../assets/Tasks/deleteTwo.png")} className="w-7 h-7" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default CategoryComponent;