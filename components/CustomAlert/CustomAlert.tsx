import React, { FC } from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native'
import Modal from 'react-native-modal'
import { Ionicons } from '@expo/vector-icons'

interface CustomAlertProps {
  visible: boolean
  message: string
  type?: 'success' | 'error' | 'loading'
  onClose?: () => void
}

const CustomAlert: FC<CustomAlertProps> = ({ visible, message, type = 'success', onClose }) => {
  // Alert colors based on type
  const getAlertColors = () => {
    switch (type) {
      case 'success':
        return { iconColor: '#4CAF50', bgColor: '#1B1F2C', btnColor: '#4CAF50' }
      case 'error':
        return { iconColor: '#FF4C4C', bgColor: '#2B1F1F', btnColor: '#FF4C4C' }
      case 'loading':
        return { iconColor: '#7D42FA', bgColor: '#1F1B2C', btnColor: '#4E4C67' }
      default:
        return { iconColor: '#DDE1EB', bgColor: '#1B1F2C', btnColor: '#37384B' }
    }
  }

  const { iconColor, bgColor, btnColor } = getAlertColors()

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={40} color={iconColor} />
      case 'error':
        return <Ionicons name="close-circle" size={40} color={iconColor} />
      case 'loading':
        return <ActivityIndicator size="large" color={iconColor} />
      default:
        return <Ionicons name="information-circle" size={40} color={iconColor} />
    }
  }

  return (
    <Modal
      isVisible={visible}
      backdropColor="rgba(0,0,0,0.5)"
      backdropOpacity={1}
      animationIn="zoomIn"
      animationOut="zoomOut"
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      statusBarTranslucent={true}
      deviceHeight={Platform.OS === 'ios' ? undefined : null}
      style={{ margin: 0, zIndex: 9999, elevation: 9999 }}
    >
      <View style={[styles.alertContainer, { backgroundColor: bgColor }]}>
        {/* Icon */}
        <View style={styles.iconContainer}>{getIcon()}</View>

        {/* Message */}
        <Text style={styles.messageText}>{message}</Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Close Button (Not shown if loading) */}
        {type !== 'loading' && (
          <Pressable
            style={[styles.closeButton, { backgroundColor: btnColor }]}
            onPress={onClose}
            disabled={!onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  alertContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6, // For Android shadow
  },
  iconContainer: {
    marginBottom: 12,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'Lato-Regular',
    color: 'white',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#3a3a3d',
    marginVertical: 8,
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Lato-Bold',
  },
})

export default CustomAlert
