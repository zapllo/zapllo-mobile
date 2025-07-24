import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';

interface CustomDeleteModalProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  cancelText?: string;
  confirmText?: string;
}

const CustomDeleteModal: React.FC<CustomDeleteModalProps> = ({
  visible,
  title = "Are you sure you want to",
  subtitle = "delete this item?",
  itemName,
  onCancel,
  onConfirm,
  isDeleting = false,
  cancelText = "No, Keep It.",
  confirmText = "Delete",
}) => {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onCancel}
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
          <Text style={{ color: 'white', fontSize: 24, fontFamily: 'LatoBold' }}>{title}</Text>
          <Text style={{ color: 'white', fontSize: 24, marginBottom: 10, fontFamily: 'LatoBold' }}>{subtitle}</Text>
          <Text style={{ color: '#787CA5', fontFamily: 'LatoRegular' }}>You're going to delete</Text>
          <Text style={{ color: '#787CA5', marginBottom: 20, fontFamily: 'LatoRegular' }}>"{itemName}". Are you sure?</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#37384B',
                padding: 15,
                borderRadius: 30,
                flex: 1,
                marginRight: 10,
              }}
              onPress={onCancel}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#EF4444', padding: 15, borderRadius: 30, flex: 1 }}
              onPress={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomDeleteModal;