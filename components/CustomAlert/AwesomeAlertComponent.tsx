import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';

interface AwesomeAlertComponentProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'loading';
  onClose?: () => void;
}

const AwesomeAlertComponent: React.FC<AwesomeAlertComponentProps> = ({ visible, message, type = 'success', onClose }) => {
  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#4CAF50' };
      case 'error':
        return { backgroundColor: '#F44336' };
      case 'loading':
        return { backgroundColor: '#FFC107' };
      default:
        return { backgroundColor: '#2196F3' };
    }
  };

  return (
    <View style={styles.container}>
      <AwesomeAlert
        show={visible}
        showProgress={type === 'loading'}
        title={type.charAt(0).toUpperCase() + type.slice(1)}
        message={message}
        closeOnTouchOutside={true}
        closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={type !== 'loading'}
        confirmText="Close"
        confirmButtonColor="#DD6B55"
        onConfirmPressed={onClose}
        contentContainerStyle={[styles.alertContainer, getAlertStyle()]}
        titleStyle={styles.title}
        messageStyle={styles.message}
        confirmButtonTextStyle={styles.confirmButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    borderRadius: 10,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  message: {
    fontSize: 16,
    color: 'white',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AwesomeAlertComponent; 