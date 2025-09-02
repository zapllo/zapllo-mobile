import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Modal from 'react-native-modal';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';

const { width: screenWidth } = Dimensions.get('window');

interface CategoryComponentProps {
  title: string;
  isEditing: boolean;
  onAddPress?: any;
  onUpdate?: any;
  onDeletePress?: any;
}

const CategoryComponent: React.FC<CategoryComponentProps> = ({
  title,
  isEditing: initialEditingState,
  onUpdate,
  onAddPress,
  onDeletePress,
}) => {
  const { userData } = useSelector((state: RootState) => state.auth);
  const isAdmin = userData?.data?.role === 'orgAdmin' || userData?.user?.role === 'orgAdmin';
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
    onDeletePress();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setIsVisible(false);
    setDeleteModal(false);
  };

  const cancelDelete = () => {
    Haptics.selectionAsync();
    setDeleteModal(false);
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['rgba(55, 56, 75, 0.8)', 'rgba(46, 46, 70, 0.6)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: isEditing ? '#815BF5' : 'rgba(255, 255, 255, 0.1)',
          }
        ]}
      >
        <View style={styles.header}>
          <View style={styles.contentSection}>
            {isEditing ? (
              <TextInput
                style={[styles.titleInput, { fontFamily: 'LatoBold' }]}
                value={editableTitle}
                onChangeText={setEditableTitle}
                autoFocus
                placeholderTextColor="#A0A5C3"
              />
            ) : (
              <Text style={[styles.title, { fontFamily: 'LatoBold' }]}>
                {editableTitle}
              </Text>
            )}
          </View>
          
          {isAdmin && (
            <View style={styles.actionButtons}>
              {isEditing ? (
                <TouchableOpacity onPress={handleSavePress} style={styles.actionButton}>
                  <Image source={require('../../assets/Tasks/isEditing.png')} style={styles.actionIcon} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleEditPress} style={styles.actionButton}>
                  <Image source={require('../../assets/Tasks/addto.png')} style={styles.actionIcon} />
                </TouchableOpacity>
              )}
              {!isEditing && (
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                  <Image source={require('../../assets/Tasks/deleteTwo.png')} style={styles.actionIcon} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </LinearGradient>

      <Modal
        isVisible={deleteModal}
        onBackdropPress={cancelDelete}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View
          style={{
            backgroundColor: '#0A0D28',
            padding: 20,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingBottom: 55,
            paddingTop: 35,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Image
              style={{ width: 80, height: 80, marginBottom: 20 }}
              source={require('../../assets/Tickit/delIcon.png')}
            />
            <Text style={{ color: 'white', fontSize: 24 }}>Are you sure you want to</Text>
            <Text style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>delete this category?</Text>
            <Text style={{ color: '#787CA5' }}>You're going to delete the category</Text>
            <Text style={{ color: '#787CA5', marginBottom: 20 }}> Are you sure?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#37384B',
                  padding: 15,
                  borderRadius: 30,
                  flex: 1,
                  marginRight: 10,
                }}
                onPress={cancelDelete}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
                  No, Keep It.
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#EF4444', padding: 15, borderRadius: 30, flex: 1 }}
                onPress={confirmDelete}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryComponent;

const styles = StyleSheet.create({
  cardContainer: {
    width: screenWidth - 32,
    alignSelf: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleInput: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#815BF5',
    paddingBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
});
