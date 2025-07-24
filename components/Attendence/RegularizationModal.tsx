import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  Alert, 
  Platform, 
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { backend_Host } from '~/config';
import CustomSplashScreen from '../CustomSplashScreen';

interface RegularizationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RegularizationModal: React.FC<RegularizationModalProps> = ({ isVisible, onClose, onSuccess }) => {

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isLoginTimePickerVisible, setLoginTimePickerVisible] = useState(false);
  const [isLogoutTimePickerVisible, setLogoutTimePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const [loginTime, setLoginTime] = useState<Date | null>(null);
  const [tempLoginTime, setTempLoginTime] = useState(new Date());
  const [logoutTime, setLogoutTime] = useState<Date | null>(null);
  const [tempLogoutTime, setTempLogoutTime] = useState(new Date());
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Scroll to the remarks input when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const cancelDateSelection = () => {
    setDatePickerVisible(false);
  };

  const confirmIOSDateSelection = () => {
    setSelectedDate(tempSelectedDate);
    setDatePickerVisible(false);
  };

  const cancelLoginTimeSelection = () => {
    setLoginTimePickerVisible(false);
  };

  const confirmIOSLoginTimeSelection = () => {
    setLoginTime(tempLoginTime);
    setLoginTimePickerVisible(false);
  };

  const cancelLogoutTimeSelection = () => {
    setLogoutTimePickerVisible(false);
  };

  const confirmIOSLogoutTimeSelection = () => {
    setLogoutTime(tempLogoutTime);
    setLogoutTimePickerVisible(false);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
  };

  const handleLoginTimeConfirm = (time: Date) => {
    setLoginTime(time);
    setLoginTimePickerVisible(false);
  };

  const handleLogoutTimeConfirm = (time: Date) => {
    setLogoutTime(time);
    setLogoutTimePickerVisible(false);
  };

  const resetForm = () => {
    setSelectedDate(null);
    setLoginTime(null);
    setLogoutTime(null);
    setRemarks('');
  };

  const handleSplashComplete = () => {
    setShowSuccessSplash(false);
    onSuccess();
    onClose();
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!selectedDate || !loginTime || !logoutTime || !remarks.trim()) {
      Alert.alert("Validation Error", "Please fill in all fields");

      return;
    }

    // Validate that logout time is after login time
    if (logoutTime && loginTime && logoutTime.getTime() <= loginTime.getTime()) {
      Alert.alert("Validation Error", "Logout time must be after login time");

      return;
    }

    try {
      setIsSubmitting(true);
      
      // Get auth token from SecureStore (consistent with login storage)
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Format date and times for API
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const formattedLoginTime = loginTime.toTimeString().split(' ')[0].substring(0, 5);
      const formattedLogoutTime = logoutTime.toTimeString().split(' ')[0].substring(0, 5);

      const requestBody = {
        date: formattedDate,
        loginTime: formattedLoginTime,
        logoutTime: formattedLogoutTime,
        remarks: remarks
      };

      console.log('Submitting regularization request:', {
        endpoint: `${backend_Host}/regularize`,
        body: requestBody,
        hasToken: !!token
      });

      // Make API request using consistent backend_Host
      const response = await fetch(`${backend_Host}/regularize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        resetForm();
        setShowSuccessSplash(true);
      } else {
        throw new Error(data.message || 'Failed to submit regularization request');
      }
    } catch (error: any) {
      console.error('Error submitting regularization:', error);
      const errorMessage = error.message || "An error occurred while submitting regularization request";
      Alert.alert("Error", errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      onBackdropPress={() => {
        Keyboard.dismiss();
        onClose();
      }}
      avoidKeyboard={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Apply Regularization</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              ref={scrollViewRef}
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Section Title */}
              <Text style={styles.sectionTitle}>Select Date & Time</Text>
              
              {/* Date Picker */}
              <TouchableOpacity 
                style={[styles.inputContainer, selectedDate ? styles.activeInputContainer : null]}
                onPress={() => {
                  dismissKeyboard();
                  setTempSelectedDate(selectedDate || new Date());
                  setDatePickerVisible(true);
                }}
              >
                <MaterialIcons name="calendar-today" size={22} color={selectedDate ? '#815BF5' : '#787CA5'} style={styles.inputIcon} />
                <Text style={[styles.inputText, selectedDate ? styles.selectedText : styles.placeholderText]}>
                  {selectedDate ? formatDate(selectedDate) : "Select Date"}
                </Text>
              </TouchableOpacity>

              {/* Login Time Picker */}
              <TouchableOpacity 
                style={[styles.inputContainer, loginTime ? styles.activeInputContainer : null]}
                onPress={() => {
                  dismissKeyboard();
                  setTempLoginTime(loginTime || new Date());
                  setLoginTimePickerVisible(true);
                }}
              >
                <MaterialIcons name="access-time" size={22} color={loginTime ? '#815BF5' : '#787CA5'} style={styles.inputIcon} />
                <Text style={[styles.inputText, loginTime ? styles.selectedText : styles.placeholderText]}>
                  {loginTime ? `Login Time: ${formatTime(loginTime)}` : "Select Login Time"}
                </Text>
              </TouchableOpacity>

              {/* Logout Time Picker */}
              <TouchableOpacity 
                style={[styles.inputContainer, logoutTime ? styles.activeInputContainer : null]}
                onPress={() => {
                  dismissKeyboard();
                  setTempLogoutTime(logoutTime || new Date());
                  setLogoutTimePickerVisible(true);
                }}
              >
                <MaterialIcons name="access-time" size={22} color={logoutTime ? '#815BF5' : '#787CA5'} style={styles.inputIcon} />
                <Text style={[styles.inputText, logoutTime ? styles.selectedText : styles.placeholderText]}>
                  {logoutTime ? `Logout Time: ${formatTime(logoutTime)}` : "Select Logout Time"}
                </Text>
              </TouchableOpacity>

              {/* Remarks Input */}
              <View style={styles.remarksContainer}>
                <Text style={styles.sectionTitle}>Reason for Regularization</Text>
                <TextInput
                  style={[styles.remarksInput, remarks.length > 0 && styles.activeRemarksInput]}
                  placeholder="Enter reason for regularization"
                  placeholderTextColor="#787CA5"
                  multiline
                  numberOfLines={4}
                  value={remarks}
                  onChangeText={setRemarks}
                />
              </View>

              {/* Done button when keyboard is visible */}
              {keyboardVisible && (
                <TouchableOpacity 
                  style={styles.doneButton}
                  onPress={dismissKeyboard}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={["#5E3AD7", "#815BF5"]}
                    style={styles.doneGradient}
                  >
                    <Text style={styles.doneButtonText}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Submit Button - hidden when keyboard is visible */}
              {!keyboardVisible && (
                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={['#6f40f0','#8963f2']}
                    style={styles.gradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.submitButtonText}>Submit Request</Text>
                        <FontAwesome name="arrow-right" size={16} color="#fff" style={styles.submitIcon} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
              
              {/* Extra space at bottom */}
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Date Picker Modal */}
            {Platform.OS === 'ios' ? (
              <Modal
                isVisible={isDatePickerVisible}
                onBackdropPress={cancelDateSelection}
                style={{ justifyContent: 'flex-end', margin: 0 }}
                backdropOpacity={0.5}
                animationIn="slideInUp"
                animationOut="slideOutDown"
              >
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={cancelDateSelection}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmIOSDateSelection}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempSelectedDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => date && setTempSelectedDate(date)}
                    style={styles.datePicker}
                    maximumDate={new Date()}
                  />
                </View>
              </Modal>
            ) : (
              <Modal
                isVisible={isDatePickerVisible}
                onBackdropPress={cancelDateSelection}
                style={{ margin: 20, justifyContent: 'center' }}
                backdropOpacity={0.5}
              >
                <View style={[styles.datePickerContainer, { padding: 20, alignItems: 'center', borderRadius: 12 }]}>
                  <Text style={{ color: 'white', fontSize: 18, marginBottom: 20, fontFamily: 'LatoBold' }}>Select Date</Text>
                  <DateTimePicker
                    value={tempSelectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setSelectedDate(selectedDate);
                        setDatePickerVisible(false);
                      }
                    }}
                    textColor="white"
                    maximumDate={new Date()}
                  />
                  <TouchableOpacity 
                    onPress={cancelDateSelection}
                    style={styles.androidCancelButton}
                  >
                    <Text style={styles.androidCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            )}

            {/* Login Time Picker Modal */}
            {Platform.OS === 'ios' ? (
              <Modal
                isVisible={isLoginTimePickerVisible}
                onBackdropPress={cancelLoginTimeSelection}
                style={{ justifyContent: 'flex-end', margin: 0 }}
                backdropOpacity={0.5}
                animationIn="slideInUp"
                animationOut="slideOutDown"
              >
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={cancelLoginTimeSelection}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmIOSLoginTimeSelection}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempLoginTime}
                    mode="time"
                    display="spinner"
                    onChange={(event, time) => time && setTempLoginTime(time)}
                    style={styles.datePicker}
                  />
                </View>
              </Modal>
            ) : (
              <Modal
                isVisible={isLoginTimePickerVisible}
                onBackdropPress={cancelLoginTimeSelection}
                style={{ margin: 20, justifyContent: 'center' }}
                backdropOpacity={0.5}
              >
                <View style={[styles.datePickerContainer, { padding: 20, alignItems: 'center', borderRadius: 12 }]}>
                  <Text style={{ color: 'white', fontSize: 18, marginBottom: 20, fontFamily: 'LatoBold' }}>Select Login Time</Text>
                  <DateTimePicker
                    value={tempLoginTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) {
                        setLoginTime(selectedTime);
                        setLoginTimePickerVisible(false);
                      }
                    }}
                    textColor="white"
                  />
                  <TouchableOpacity 
                    onPress={cancelLoginTimeSelection}
                    style={styles.androidCancelButton}
                  >
                    <Text style={styles.androidCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            )}

            {/* Logout Time Picker Modal */}
            {Platform.OS === 'ios' ? (
              <Modal
                isVisible={isLogoutTimePickerVisible}
                onBackdropPress={cancelLogoutTimeSelection}
                style={{ justifyContent: 'flex-end', margin: 0 }}
                backdropOpacity={0.5}
                animationIn="slideInUp"
                animationOut="slideOutDown"
              >
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={cancelLogoutTimeSelection}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmIOSLogoutTimeSelection}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempLogoutTime}
                    mode="time"
                    display="spinner"
                    onChange={(event, time) => time && setTempLogoutTime(time)}
                    style={styles.datePicker}
                  />
                </View>
              </Modal>
            ) : (
              <Modal
                isVisible={isLogoutTimePickerVisible}
                onBackdropPress={cancelLogoutTimeSelection}
                style={{ margin: 20, justifyContent: 'center' }}
                backdropOpacity={0.5}
              >
                <View style={[styles.datePickerContainer, { padding: 20, alignItems: 'center', borderRadius: 12 }]}>
                  <Text style={{ color: 'white', fontSize: 18, marginBottom: 20, fontFamily: 'LatoBold' }}>Select Logout Time</Text>
                  <DateTimePicker
                    value={tempLogoutTime}
                    mode="time"
                    display="default"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) {
                        setLogoutTime(selectedTime);
                        setLogoutTimePickerVisible(false);
                      }
                    }}
                    textColor="white"
                  />
                  <TouchableOpacity 
                    onPress={cancelLogoutTimeSelection}
                    style={styles.androidCancelButton}
                  >
                    <Text style={styles.androidCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Success Splash Screen */}
      <CustomSplashScreen
        visible={showSuccessSplash}
        lottieSource={require('../../assets/Animation/success.json')}
        mainText="Request Submitted Successfully!"
        subtitle="Your regularization request has been submitted and is pending approval."
        onComplete={handleSplashComplete}
        onDismiss={handleSplashComplete}
        duration={3000}
        gradientColors={["#05071E", "#0A0D28"]}
        textGradientColors={["#815BF5", "#FC8929"]}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0B0D29',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'LatoBold',
  },
  closeButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'LatoBold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    marginBottom: 16,
    padding: 14,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
  },
  activeInputContainer: {
    borderColor: '#815BF5',
    backgroundColor: 'rgba(129, 91, 245, 0.1)',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'LatoRegular',
  },
  selectedText: {
    color: '#fff',
    fontFamily: 'LatoBold',
  },
  placeholderText: {
    color: '#787CA5',
  },
  remarksContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  remarksLabel: {
    color: '#787CA5',
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'LatoRegular',
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    textAlignVertical: 'top',
    minHeight: 120,
    fontFamily: 'LatoRegular',
    fontSize: 15,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
  },
  activeRemarksInput: {
    borderColor: '#815BF5',
    backgroundColor: 'rgba(129, 91, 245, 0.1)',
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
    shadowColor: "#815BF5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'LatoBold',
    marginRight: 8,
  },
  submitIcon: {
    marginLeft: 8,
  },
  datePickerContainer: {
    backgroundColor: '#0B0D29',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
  },
  datePickerCancel: {
    color: '#FC8929',
    fontSize: 16,
    fontFamily: 'LatoRegular',
    padding: 4,
  },
  datePickerDone: {
    color: '#815BF5',
    fontSize: 16,
    fontFamily: 'LatoBold',
    padding: 4,
  },
  datePicker: {
    backgroundColor: '#0B0D29',
    height: 200,
  },
  doneButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
  },
  doneGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'LatoBold',
  },
  androidCancelButton: {
    marginTop: 20, 
    padding: 12, 
    backgroundColor: '#37384B', 
    borderRadius: 10,
    paddingHorizontal: 30,
  },
  androidCancelText: {
    color: 'white', 
    fontFamily: 'LatoBold',
    fontSize: 15
  }
});

export default RegularizationModal;