import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import Modal from 'react-native-modal';

interface CategoryComponentProps {
  title: string;
  isEditing: boolean;
  onAddPress?:any;
  onUpdate?:any;
  onDeletePress?:any;
}

const CategoryComponent: React.FC<CategoryComponentProps> = ({
  title,
  isEditing: initialEditingState,
  onUpdate,
  onAddPress,
  onDeletePress,

}) => {
  const [isEditing, setIsEditing] = useState(initialEditingState);
  const [editableTitle, setEditableTitle] = useState(title);
  const [isVisible, setIsVisible] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(true);
  };

  const handleSavePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(false);

    if (onUpdate && title) {
      onUpdate(editableTitle); // Call onUpdate if an id/title exists
    } else if (onAddPress) {
      onAddPress(editableTitle); // Call onAddPress for new categories
    }
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setDeleteModal(true);
  };

  if (!isVisible) {
    return null;
  }

  const confirmDelete = () => {
    onDeletePress()
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsVisible(false);
    setDeleteModal(false);
  };

  const cancelDelete = () => {
    Haptics.selectionAsync();
    setDeleteModal(false);
  };

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
            <Image source={require("../../assets/Tasks/isEditing.png")} className="w-7 h-7" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleEditPress}>
            <Image source={require("../../assets/Tasks/addto.png")} className="w-7 h-7" />
          </TouchableOpacity>
        )}
        {!isEditing && (
          <TouchableOpacity onPress={handleDelete}>
            <Image source={require("../../assets/Tasks/deleteTwo.png")} className="w-7 h-7" />
          </TouchableOpacity>
        )}
      </View>

      <Modal
        isVisible={deleteModal}
        onBackdropPress={cancelDelete}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={{ backgroundColor: '#0A0D28', padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 55, paddingTop: 35 }}>
          <View style={{ alignItems: 'center' }}>
            <Image style={{ width: 80, height: 80, marginBottom: 20 }} source={require("../../assets/Tickit/delIcon.png")} />
            <Text style={{ color: 'white', fontSize: 24 }}>Are you sure you want to</Text>
            <Text style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>delete this ticket?</Text>
            <Text style={{ color: '#787CA5' }}>You're going to delete the "Demo"</Text>
            <Text style={{ color: '#787CA5', marginBottom: 20 }}>ticket. Are you sure?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity style={{ backgroundColor: '#37384B', padding: 15, borderRadius: 30, flex: 1, marginRight: 10 }} onPress={cancelDelete}>
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>No, Keep It.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ backgroundColor: '#EF4444', padding: 15, borderRadius: 30, flex: 1 }} onPress={confirmDelete}>
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryComponent;