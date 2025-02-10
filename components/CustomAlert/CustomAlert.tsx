import React, { FC } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';

interface CustomAlertProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'loading';
  onClose?: () => void;
}

const CustomAlert: FC<CustomAlertProps> = ({ visible, message, type = 'success', onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={24} color="white" />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color="white" />;
      case 'loading':
        return <ActivityIndicator size="large" color="#0A0D28" />;
      default:
        return <Ionicons name="information-circle" size={24} color="#0A0D28" />;
    }
  };

  return (
    <Modal
      isVisible={visible}
      backdropColor="rgba(0,0,0,0.4)"
      backdropOpacity={1}
      animationIn="fadeIn"
      animationOut="fadeOut"
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      statusBarTranslucent={true}
      deviceHeight={Platform.OS === 'ios' ? undefined : null}
      style={{ 
        margin: 0,
        zIndex: 9999,
        elevation: 9999
      }}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.alertContainer, Platform.OS === 'android' && styles.androidShadow]}>
          <View style={styles.iconContainer}>{getIcon()}</View>
         {message && <Text style={styles.messageText}>{message}</Text>}
          <View style={styles.divider} />
          {type !== 'loading' && (
            <Pressable style={styles.closeButton} onPress={onClose} disabled={!onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: '#201e1e',
    padding: 5,
    paddingTop: 25,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
    }),
  },
  iconContainer: {
    marginBottom: 12,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'Lato-Regular',
    color: 'white',
  },
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: '#3a3a3d',
    marginTop: 7,
    marginBottom: 7,
  },
  closeButton: {
    padding: 2,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#7164a9',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
  },
  androidShadow: {
    elevation: 5,
    shadowColor: '#000',
  },
});

export default CustomAlert;