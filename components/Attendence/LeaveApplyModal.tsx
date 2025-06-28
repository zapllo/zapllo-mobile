import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

interface LeaveType {
  _id: string;
  leaveType: string;
  allotedLeaves: number;
  userLeaveBalance: number;
}

interface LeaveDetails {
  totalAllotedLeaves: number;
  userLeaveBalance: number;
}

interface LeaveApplyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  leaveTypes: LeaveType[];
  leaveDetails: { [key: string]: LeaveDetails };
}

export default function LeaveApplyModal({ 
  isVisible, 
  onClose, 
  onSuccess,
  leaveTypes = [],
  leaveDetails = {}
}: LeaveApplyModalProps) {
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const scrollViewRef = useRef<ScrollView>(null);

  // Apply Leave Form State
  const [applyLeaveForm, setApplyLeaveForm] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    reason: '',
    attachments: [] as any[],
    dayType: 'Full Day', // Default to Full Day
    leaveDays: [] as Array<{
      date: string;
      unit: 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter';
      status: 'Pending' | 'Approved' | 'Rejected';
    }>,
  });

  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [showLeaveTypeDropdown, setShowLeaveTypeDropdown] = useState(false);
  const [isFromDatePickerVisible, setIsFromDatePickerVisible] = useState(false);
  const [isToDatePickerVisible, setIsToDatePickerVisible] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(new Date());
  const [tempToDate, setTempToDate] = useState(new Date());
  const [openDropdownDate, setOpenDropdownDate] = useState<string>('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Day type options
  const dayTypeOptions = [
    'Full Day',
    '1st Half',
    '2nd Half',
    '1st Quarter',
    '2nd Quarter',
    '3rd Quarter',
    '4th Quarter'
  ];

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
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

  const handleAttachmentPicker = async () => {
    Alert.alert(
      "Select Attachment",
      "Choose how you want to add an attachment",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera permission is required to take photos');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
              const newAttachment = {
                uri: result.assets[0].uri,
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
              };
              setApplyLeaveForm(prev => ({
                ...prev,
                attachments: [...prev.attachments, newAttachment]
              }));
            }
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Gallery permission is required to select photos');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
              const newAttachment = {
                uri: result.assets[0].uri,
                name: `image_${Date.now()}.jpg`,
                type: 'image/jpeg',
              };
              setApplyLeaveForm(prev => ({
                ...prev,
                attachments: [...prev.attachments, newAttachment]
              }));
            }
          }
        },
        {
          text: "Document",
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
              });

              if (!result.canceled && result.assets[0]) {
                const newAttachment = {
                  uri: result.assets[0].uri,
                  name: result.assets[0].name,
                  type: result.assets[0].mimeType || 'application/octet-stream',
                };
                setApplyLeaveForm(prev => ({
                  ...prev,
                  attachments: [...prev.attachments, newAttachment]
                }));
              }
            } catch (error) {
              console.error('Error picking document:', error);
              Alert.alert('Error', 'Failed to pick document');
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const removeAttachment = (index: number) => {
    setApplyLeaveForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const resetApplyLeaveForm = () => {
    setApplyLeaveForm({
      leaveTypeId: '',
      fromDate: '',
      toDate: '',
      reason: '',
      attachments: [],
      dayType: 'Full Day',
      leaveDays: [],
    });
    setShowLeaveTypeDropdown(false);
    setIsFromDatePickerVisible(false);
    setIsToDatePickerVisible(false);
    setTempFromDate(new Date());
    setTempToDate(new Date());
    setOpenDropdownDate('');
  };

  const handleCloseModal = () => {
    Keyboard.dismiss();
    onClose();
    setOpenDropdownDate('');
    setTimeout(() => {
      resetApplyLeaveForm();
    }, 300);
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Date picker handlers
  const handleFromDateSelect = () => {
    dismissKeyboard();
    setTempFromDate(applyLeaveForm.fromDate ? new Date(applyLeaveForm.fromDate) : new Date());
    setIsFromDatePickerVisible(true);
  };

  const handleToDateSelect = () => {
    dismissKeyboard();
    setTempToDate(applyLeaveForm.toDate ? new Date(applyLeaveForm.toDate) : new Date());
    setIsToDatePickerVisible(true);
  };

  const confirmIOSFromDateSelection = () => {
    const formattedDate = tempFromDate.toISOString().split('T')[0];
    setApplyLeaveForm(prev => {
      const newForm = { ...prev, fromDate: formattedDate };
      if (newForm.toDate) {
        setTimeout(() => updateLeaveDays(formattedDate, newForm.toDate), 100);
      }
      return newForm;
    });
    setIsFromDatePickerVisible(false);
  };

  const confirmIOSToDateSelection = () => {
    const formattedDate = tempToDate.toISOString().split('T')[0];
    setApplyLeaveForm(prev => {
      const newForm = { ...prev, toDate: formattedDate };
      if (newForm.fromDate) {
        setTimeout(() => updateLeaveDays(newForm.fromDate, formattedDate), 100);
      }
      return newForm;
    });
    setIsToDatePickerVisible(false);
  };

  const cancelFromDateSelection = () => {
    setIsFromDatePickerVisible(false);
  };

  const cancelToDateSelection = () => {
    setIsToDatePickerVisible(false);
  };

  const handleFromDateConfirm = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setApplyLeaveForm(prev => {
      const newForm = { ...prev, fromDate: formattedDate };
      if (newForm.toDate) {
        setTimeout(() => updateLeaveDays(formattedDate, newForm.toDate), 100);
      }
      return newForm;
    });
    setIsFromDatePickerVisible(false);
  };

  const handleToDateConfirm = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    setApplyLeaveForm(prev => {
      const newForm = { ...prev, toDate: formattedDate };
      if (newForm.fromDate) {
        setTimeout(() => updateLeaveDays(newForm.fromDate, formattedDate), 100);
      }
      return newForm;
    });
    setIsToDatePickerVisible(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Generate dates between from and to date
  const generateDatesBetween = (fromDate: string, toDate: string) => {
    const dates = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date).toISOString().split('T')[0]);
    }
    return dates;
  };

  // Update leave days when dates change
  const updateLeaveDays = (fromDate: string, toDate: string) => {
    if (fromDate && toDate) {
      const dates = generateDatesBetween(fromDate, toDate);
      const newLeaveDays = dates.map(date => {
        const existingDay = applyLeaveForm.leaveDays.find(day => day.date === date);
        return existingDay || {
          date,
          unit: applyLeaveForm.dayType as 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter',
          status: 'Pending' as 'Pending' | 'Approved' | 'Rejected' // Add status field like in web version
        };
      });

      setApplyLeaveForm(prev => ({
        ...prev,
        leaveDays: newLeaveDays
      }));
    }
  };

  // Update day type for a specific date
  const updateDayTypeForDate = (date: string, unit: string) => {
    setApplyLeaveForm(prev => ({
      ...prev,
      leaveDays: prev.leaveDays.map(day =>
        day.date === date
          ? { 
              ...day, 
              unit: unit as 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter',
              status: day.status || 'Pending' // Preserve existing status or default to Pending
            }
          : day
      )
    }));
  };

  const handleSubmitLeave = async () => {
    // Validation
    if (!applyLeaveForm.leaveTypeId) {
      Alert.alert('Error', 'Please select a leave type');
      return;
    }

    if (!applyLeaveForm.fromDate) {
      Alert.alert('Error', 'Please select from date');
      return;
    }

    if (!applyLeaveForm.toDate) {
      Alert.alert('Error', 'Please select to date');
      return;
    }

    if (!applyLeaveForm.reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for leave');
      return;
    }

    // Check if user has enough leave balance
    const leaveDetail = leaveDetails[applyLeaveForm.leaveTypeId];
    const availableBalance = leaveDetail?.userLeaveBalance || 0;
    const requestedDays = applyLeaveForm.leaveDays.length;
    
    if (requestedDays > availableBalance) {
      Alert.alert(
        'Insufficient Leave Balance', 
        `You are requesting ${requestedDays} day(s) but only have ${availableBalance} day(s) available.`
      );
      return;
    }

    console.log('Starting leave submission...');
    console.log('Backend Host:', backend_Host);
    console.log('Token available:', !!token);
    console.log('Form data:', {
      leaveTypeId: applyLeaveForm.leaveTypeId,
      fromDate: applyLeaveForm.fromDate,
      toDate: applyLeaveForm.toDate,
      reason: applyLeaveForm.reason,
      leaveDaysCount: applyLeaveForm.leaveDays.length
    });

    setIsSubmittingLeave(true);

    try {
      // First, upload attachments if any
      let attachmentUrls: string[] = [];
      if (applyLeaveForm.attachments.length > 0) {
        for (const attachment of applyLeaveForm.attachments) {
          try {
            const formData = new FormData();
            formData.append('file', {
              uri: attachment.uri,
              name: attachment.name,
              type: attachment.type,
            } as any);

            const uploadResponse = await axios.post(`${backend_Host}/api/upload`, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000
            });

            if (uploadResponse.data && (uploadResponse.data.url || uploadResponse.data.fileUrls)) {
              // Handle both possible response formats
              if (uploadResponse.data.fileUrls && Array.isArray(uploadResponse.data.fileUrls)) {
                attachmentUrls.push(...uploadResponse.data.fileUrls);
              } else if (uploadResponse.data.url) {
                attachmentUrls.push(uploadResponse.data.url);
              }
            }
          } catch (uploadError) {
            console.error('Error uploading attachment:', uploadError);
          }
        }
      }

      // Ensure leaveDays is properly formatted
      if (applyLeaveForm.leaveDays.length === 0) {
        Alert.alert('Error', 'No leave days found. Please select valid dates.');
        return;
      }

      // Prepare the leave request data - matching web version format exactly
      const leaveRequestData = {
        leaveType: applyLeaveForm.leaveTypeId, // Changed from leaveTypeId to leaveType to match web
        fromDate: applyLeaveForm.fromDate,
        toDate: applyLeaveForm.toDate,
        leaveReason: applyLeaveForm.reason, // This matches web version
        attachment: attachmentUrls, // Changed from attachments to attachment to match web
        audioUrl: null, // Add audioUrl field to match web version
        leaveDays: applyLeaveForm.leaveDays, // This should already have the correct structure
      };

      console.log('Submitting leave request data:', JSON.stringify(leaveRequestData, null, 2));
      console.log('API endpoint:', `${backend_Host}/leaves`); // Changed to match web version

      const response = await axios.post(`${backend_Host}/leaves`, leaveRequestData, { // Changed endpoint to match web
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      });

      console.log('API Response:', response.data);
      console.log('Response Status:', response.status);

      if (response.data.success || response.status === 200 || response.status === 201) {
        Alert.alert(
          'Success',
          'Leave request submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                handleCloseModal();
                onSuccess?.();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit leave request');
      }
    } catch (error: any) {
      console.error('Error submitting leave:', error);
      
      let errorMessage = 'Failed to submit leave request';
      if (error.response) {
        // Server responded with error status
        console.error('Response error status:', error.response.status);
                console.error('Response error data:', error.response.data);
        console.error('Response error headers:', error.response.headers);
        
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid request data. Please check your input.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to apply for leave.';
        } else if (error.response.status === 404) {
          errorMessage = 'Leave service not found. Please contact support.';
        } else if (error.response.status === 409) {
          errorMessage = error.response.data?.message || 'Leave request conflicts with existing data.';
        } else if (error.response.status === 422) {
          errorMessage = error.response.data?.message || 'Invalid leave data provided.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.response.status === 503) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('Request error:', error.request);
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        // Something else happened
        console.error('Error message:', error.message);
        errorMessage = error.message || 'An unexpected error occurred';
      }

      Alert.alert('Submit Leave Failed', errorMessage);
    } finally {
      setIsSubmittingLeave(false);
    }
  };
return (
    <>
    {/* Apply Leave Modal */}
      <Modal
        isVisible={isVisible}
        onBackdropPress={() => {
          Keyboard.dismiss();
          handleCloseModal();
        }}
        style={styles.bottomModal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.5}
        avoidKeyboard={true}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <View style={styles.applyLeaveModalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Apply for Leave</Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                >
                  <Text style={styles.closeButtonIcon}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalScrollView}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                bounces={false}
              >
                {/* Subtitle */}
                <Text style={styles.modalSubtitle}>
                  Fill out the form below to submit your leave request
                </Text>

                {/* Leave Type Selection */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Leave Type</Text>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowLeaveTypeDropdown(!showLeaveTypeDropdown)}
                  >
                    <Text style={[
                      styles.dropdownButtonText,
                      !applyLeaveForm.leaveTypeId && styles.placeholderText
                    ]}>
                      {applyLeaveForm.leaveTypeId
                        ? leaveTypes.find(type => type._id === applyLeaveForm.leaveTypeId)?.leaveType || 'Select Leave Type'
                        : 'Select Leave Type'
                      }
                    </Text>
                    <Text style={styles.dropdownArrow}>▼</Text>
                  </TouchableOpacity>

                  {showLeaveTypeDropdown && (
                    <View style={styles.dropdownMenu}>
                      <ScrollView
                        style={styles.dropdownScrollView}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                      >
                        {leaveTypes.map((leaveType, index) => {
                          const leaveDetail = leaveDetails[leaveType._id];
                          const remainingBalance = leaveDetail?.userLeaveBalance || 0;
                          const isLastItem = index === leaveTypes.length - 1;
                          return (
                            <TouchableOpacity
                              key={leaveType._id}
                              style={[
                                styles.dropdownItem,
                                isLastItem && styles.dropdownItemLast
                              ]}
                              onPress={() => {
                                setApplyLeaveForm(prev => ({ ...prev, leaveTypeId: leaveType._id }));
                                setShowLeaveTypeDropdown(false);
                              }}
                            >
                              <View style={styles.dropdownItemContent}>
                                <Text style={styles.dropdownItemText}>{leaveType.leaveType}</Text>
                                <Text style={styles.dropdownItemBalance}>
                                  Balance: {remainingBalance} days
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Leave Balance Display - Show when leave type is selected */}
                {applyLeaveForm.leaveTypeId && (
                  <View style={styles.formGroup}>
                    <View style={styles.leaveBalanceContainer}>
                      {(() => {
                        const selectedLeaveType = leaveTypes.find(type => type._id === applyLeaveForm.leaveTypeId);
                        const leaveDetail = leaveDetails[applyLeaveForm.leaveTypeId];
                        const totalAllotted = leaveDetail?.totalAllotedLeaves || selectedLeaveType?.allotedLeaves || 0;
                        const available = leaveDetail?.userLeaveBalance || 0;
                        const used = totalAllotted - available;
                        
                        return (
                          <>
                            <Text style={styles.leaveBalanceTitle}>
                              {selectedLeaveType?.leaveType} Balance
                            </Text>
                            <View style={styles.leaveBalanceRow}>
                              <View style={styles.leaveBalanceItem}>
                                <Text style={styles.leaveBalanceLabel}>Used:</Text>
                                <Text style={styles.leaveBalanceValue}>{used} days</Text>
                              </View>
                              <View style={styles.leaveBalanceItem}>
                                <Text style={styles.leaveBalanceLabel}>Available:</Text>
                                <Text style={[styles.leaveBalanceValue, styles.availableBalance]}>
                                  {available} days
                                </Text>
                              </View>
                            </View>
                          </>
                        );
                      })()}
                    </View>
                  </View>
                )}


                {/* Date Selection */}
                <View style={styles.dateRow}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.formLabel}>From Date</Text>
                    <TouchableOpacity
                      style={[
                        styles.dateInput,
                        applyLeaveForm.fromDate && styles.activeInputContainer
                      ]}
                      onPress={handleFromDateSelect}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dateInputText,
                        !applyLeaveForm.fromDate && styles.placeholderText,
                        applyLeaveForm.fromDate && styles.selectedText
                      ]}>
                        {formatDate(applyLeaveForm.fromDate)}
                      </Text>
                      <Text style={styles.calendarIcon}>📅</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.formLabel}>To Date</Text>
                    <TouchableOpacity
                      style={[
                        styles.dateInput,
                        applyLeaveForm.toDate && styles.activeInputContainer
                      ]}
                      onPress={handleToDateSelect}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dateInputText,
                        !applyLeaveForm.toDate && styles.placeholderText,
                        applyLeaveForm.toDate && styles.selectedText
                      ]}>
                        {formatDate(applyLeaveForm.toDate)}
                      </Text>
                      <Text style={styles.calendarIcon}>📅</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Requested vs Available Days Display */}
                {applyLeaveForm.leaveTypeId && applyLeaveForm.fromDate && applyLeaveForm.toDate && applyLeaveForm.leaveDays.length > 0 && (
                  <View style={styles.formGroup}>
                    <View style={styles.requestSummaryContainer}>
                      {(() => {
                        const leaveDetail = leaveDetails[applyLeaveForm.leaveTypeId];
                        const availableBalance = leaveDetail?.userLeaveBalance || 0;
                        const requestedDays = applyLeaveForm.leaveDays.length;
                        const isExceeding = requestedDays > availableBalance;
                        
                        return (
                          <>
                            <Text style={styles.requestSummaryTitle}>Leave Request Summary</Text>
                            <View style={styles.requestSummaryRow}>
                              <View style={styles.requestSummaryItem}>
                                <Text style={styles.requestSummaryLabel}>Requested:</Text>
                                <Text style={[
                                  styles.requestSummaryValue, 
                                  isExceeding && styles.exceedingValue
                                ]}>
                                  {requestedDays} day(s)
                                </Text>
                              </View>
                              <View style={styles.requestSummaryItem}>
                                <Text style={styles.requestSummaryLabel}>Available:</Text>
                                <Text style={[styles.requestSummaryValue, styles.availableValue]}>
                                  {availableBalance} day(s)
                                </Text>
                              </View>
                            </View>
                            {isExceeding && (
                              <Text style={styles.warningText}>
                                ⚠️ You are requesting more days than available
                              </Text>
                            )}
                          </>
                        );
                      })()}
                    </View>
                  </View>
                )}

                {/* Date-wise Day Type Selection */}
                {applyLeaveForm.fromDate && applyLeaveForm.toDate && applyLeaveForm.leaveDays.length > 0 && (
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Customize Day Type for Each Date</Text>
                    <Text style={styles.formSubLabel}>
                      Select the day type for each date in your leave period
                    </Text>
                    <View style={styles.dateWiseContainer}>
                      {applyLeaveForm.leaveDays.map((leaveDay, index) => (
                        <View key={index} style={styles.dateWiseItem}>
                          <View style={styles.dateWiseHeader}>
                            <Text style={styles.dateWiseDate}>
                              {new Date(leaveDay.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Text>
                          </View>

                          {/* Day Type Dropdown for this date */}
                          <TouchableOpacity
                            style={styles.dateWiseDropdownButton}
                            onPress={() => {
                              setOpenDropdownDate(openDropdownDate === leaveDay.date ? '' : leaveDay.date);
                            }}
                          >
                            <Text style={styles.dateWiseDropdownText}>
                              {leaveDay.unit}
                            </Text>
                            <Text style={styles.dateWiseDropdownArrow}>
                              {openDropdownDate === leaveDay.date ? '▲' : '▼'}
                            </Text>
                          </TouchableOpacity>

                          {/* Dropdown Menu */}
                          {openDropdownDate === leaveDay.date && (
                            <View style={styles.dateWiseDropdownMenu}>
                              {dayTypeOptions.map((dayType) => (
                                <TouchableOpacity
                                  key={dayType}
                                  style={[
                                    styles.dateWiseDropdownItem,
                                    leaveDay.unit === dayType && styles.dateWiseDropdownItemSelected
                                  ]}
                                  onPress={() => {
                                    updateDayTypeForDate(leaveDay.date, dayType);
                                    setOpenDropdownDate('');
                                  }}
                                >
                                  <View style={styles.dateWiseDropdownItemContent}>
                                    <Text style={[
                                      styles.dateWiseDropdownItemText,
                                      leaveDay.unit === dayType && styles.dateWiseDropdownItemTextSelected
                                    ]}>
                                      {dayType}
                                    </Text>
                                    {leaveDay.unit === dayType && (
                                      <Text style={styles.dateWiseDropdownItemCheck}>✓</Text>
                                    )}
                                  </View>
                                  <Text style={[
                                    styles.dateWiseDropdownItemDescription,
                                    leaveDay.unit === dayType && styles.dateWiseDropdownItemDescriptionSelected
                                  ]}>
                                    {dayType === 'Full Day' && 'Complete day off'}
                                    {dayType === '1st Half' && 'Morning half'}
                                    {dayType === '2nd Half' && 'Evening half'}
                                    {dayType === '1st Quarter' && 'First quarter'}
                                    {dayType === '2nd Quarter' && 'Second quarter'}
                                    {dayType === '3rd Quarter' && 'Third quarter'}
                                    {dayType === '4th Quarter' && 'Fourth quarter'}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Reason for Leave */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Reason for Leave</Text>
                  <TextInput
                    style={[
                      styles.textAreaInput,
                      applyLeaveForm.reason.length > 0 && styles.activeTextAreaInput
                    ]}
                    placeholder="Enter your reason for leave..."
                    placeholderTextColor="#787CA5"
                    value={applyLeaveForm.reason}
                    onChangeText={(text) => setApplyLeaveForm(prev => ({ ...prev, reason: text }))}
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                {/* Attachments */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Attachments</Text>
                  <TouchableOpacity
                    style={styles.attachmentButton}
                    onPress={handleAttachmentPicker}
                  >
                    <Text style={styles.attachmentButtonIcon}>📎</Text>
                    <Text style={styles.attachmentButtonText}>Add Attachment</Text>
                  </TouchableOpacity>

                  {/* Display selected attachments */}
                  {applyLeaveForm.attachments.length > 0 && (
                    <View style={styles.attachmentsList}>
                      {applyLeaveForm.attachments.map((attachment, index) => (
                        <View key={index} style={styles.attachmentItem}>
                          <Text style={styles.attachmentName} numberOfLines={1}>
                            {attachment.name}
                          </Text>
                          <TouchableOpacity
                            style={styles.removeAttachmentButton}
                            onPress={() => removeAttachment(index)}
                          >
                            <Text style={styles.removeAttachmentText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.submitButton, isSubmittingLeave && styles.submitButtonDisabled]}
                    onPress={handleSubmitLeave}
                    disabled={isSubmittingLeave}
                  >
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      colors={['#6f40f0','#8963f2']}
                      style={styles.submitButtonGradient}
                    >
                      {isSubmittingLeave ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitButtonText}>Submit Leave Request</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>

                {/* From Date Picker Modal */}
      {Platform.OS === 'ios' ? (
        <Modal
          isVisible={isFromDatePickerVisible}
          onBackdropPress={cancelFromDateSelection}
          style={{ justifyContent: 'flex-end', margin: 0 }}
          backdropOpacity={0.5}
          animationIn="slideInUp"
          animationOut="slideOutDown"
        >
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={cancelFromDateSelection}>
                <Text style={styles.datePickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmIOSFromDateSelection}>
                <Text style={styles.datePickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempFromDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => date && setTempFromDate(date)}
              style={styles.datePicker}
              minimumDate={new Date()}
            />
          </View>
        </Modal>
      ) : (
        <Modal
          isVisible={isFromDatePickerVisible}
          onBackdropPress={cancelFromDateSelection}
          style={{ margin: 20, justifyContent: 'center' }}
          backdropOpacity={0.5}
        >
          <View style={[styles.datePickerContainer, { padding: 20, alignItems: 'center', borderRadius: 12 }]}>
            <Text style={{ color: 'white', fontSize: 18, marginBottom: 20, fontFamily: 'LatoBold' }}>Select From Date</Text>
            <DateTimePicker
              value={tempFromDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  handleFromDateConfirm(selectedDate);
                }
              }}
              textColor="white"
              minimumDate={new Date()}
            />
            <TouchableOpacity 
              onPress={cancelFromDateSelection}
              style={styles.androidCancelButton}
            >
              <Text style={styles.androidCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* To Date Picker Modal */}
      {Platform.OS === 'ios' ? (
        <Modal
          isVisible={isToDatePickerVisible}
          onBackdropPress={cancelToDateSelection}
          style={{ justifyContent: 'flex-end', margin: 0 }}
          backdropOpacity={0.5}
          animationIn="slideInUp"
          animationOut="slideOutDown"
        >
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={cancelToDateSelection}>
                <Text style={styles.datePickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmIOSToDateSelection}>
                <Text style={styles.datePickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempToDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => date && setTempToDate(date)}
              style={styles.datePicker}
              minimumDate={applyLeaveForm.fromDate ? new Date(applyLeaveForm.fromDate) : new Date()}
            />
          </View>
        </Modal>
      ) : (
        <Modal
          isVisible={isToDatePickerVisible}
          onBackdropPress={cancelToDateSelection}
          style={{ margin: 20, justifyContent: 'center' }}
          backdropOpacity={0.5}
        >
          <View style={[styles.datePickerContainer, { padding: 20, alignItems: 'center', borderRadius: 12 }]}>
            <Text style={{ color: 'white', fontSize: 18, marginBottom: 20, fontFamily: 'LatoBold' }}>Select To Date</Text>
            <DateTimePicker
              value={tempToDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  handleToDateConfirm(selectedDate);
                }
              }}
              textColor="white"
              minimumDate={applyLeaveForm.fromDate ? new Date(applyLeaveForm.fromDate) : new Date()}
            />
            <TouchableOpacity 
              onPress={cancelToDateSelection}
              style={styles.androidCancelButton}
            >
              <Text style={styles.androidCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  applyLeaveModalContent: {
    backgroundColor: '#0B0D29',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '80%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'LatoBold',
  },
  closeButtonIcon: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
  },
  modalScrollView: {
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    lineHeight: 20,
  },
  formGroup: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'LatoBold',
  },
  formSubLabel: {
    fontSize: 12,
    color: '#787CA5',
    marginBottom: 12,
    lineHeight: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
  },
  dropdownButtonText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
    fontFamily: 'LatoRegular',
  },
  placeholderText: {
    color: '#787CA5',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#787CA5',
    marginLeft: 8,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    backgroundColor: '#0B0D29',
    marginTop: 4,
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownScrollView: {
    maxHeight: 250,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemContent: {
    flexDirection: 'column',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 2,
    fontFamily: 'LatoRegular',
  },
  dropdownItemBalance: {
    fontSize: 12,
    color: '#787CA5',
  },
  dateRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
  },
  activeInputContainer: {
    borderColor: '#815BF5',
    backgroundColor: 'rgba(129, 91, 245, 0.1)',
  },
  dateInputText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
    fontFamily: 'LatoRegular',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  calendarIcon: {
    fontSize: 16,
    marginLeft: 8,
    color: '#787CA5',
  },
  dateWiseContainer: {
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
  },
  dateWiseItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
    position: 'relative',
  },
  dateWiseHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(39, 41, 69, 0.4)',
  },
  dateWiseDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'LatoBold',
  },
  dateWiseDropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateWiseDropdownText: {
    fontSize: 15,
    color: '#fff',
    flex: 1,
    fontFamily: 'LatoRegular',
  },
  dateWiseDropdownArrow: {
    fontSize: 12,
    color: '#787CA5',
    marginLeft: 8,
  },
  dateWiseDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#0B0D29',
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    marginTop: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dateWiseDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
  },
  dateWiseDropdownItemSelected: {
    backgroundColor: 'rgba(129, 91, 245, 0.1)',
  },
  dateWiseDropdownItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateWiseDropdownItemText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'LatoRegular',
  },
  dateWiseDropdownItemTextSelected: {
    color: '#815BF5',
    fontFamily: 'LatoBold',
  },
  dateWiseDropdownItemCheck: {
    fontSize: 14,
    color: '#815BF5',
    fontWeight: 'bold',
  },
  dateWiseDropdownItemDescription: {
    fontSize: 12,
    color: '#787CA5',
    lineHeight: 16,
  },
  dateWiseDropdownItemDescriptionSelected: {
    color: '#815BF5',
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#fff',
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'LatoRegular',
  },
  activeTextAreaInput: {
    borderColor: '#815BF5',
    backgroundColor: 'rgba(129, 91, 245, 0.1)',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    paddingVertical: 14,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
    borderStyle: 'dashed',
  },
  attachmentButtonIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#787CA5',
  },
  attachmentButtonText: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  attachmentsList: {
    marginTop: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 41, 69, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentName: {
    fontSize: 13,
    color: '#fff',
    flex: 1,
    marginRight: 8,
    fontFamily: 'LatoRegular',
  },
  removeAttachmentButton: {
    padding: 4,
  },
  removeAttachmentText: {
    fontSize: 14,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  modalButtons: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  submitButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  },
  leaveBalanceContainer: {
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    padding: 16,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
  },
  leaveBalanceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'LatoBold',
  },
  leaveBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leaveBalanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  leaveBalanceLabel: {
    fontSize: 12,
    color: '#787CA5',
    marginBottom: 4,
    fontFamily: 'LatoRegular',
  },
  leaveBalanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'LatoBold',
  },
  availableBalance: {
    color: '#815BF5',
  },
  requestSummaryContainer: {
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    padding: 16,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
  },
  requestSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    fontFamily: 'LatoBold',
  },
  requestSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  requestSummaryLabel: {
    fontSize: 12,
    color: '#787CA5',
    marginBottom: 4,
    fontFamily: 'LatoRegular',
  },
  requestSummaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'LatoBold',
  },
  availableValue: {
    color: '#815BF5',
  },
  exceedingValue: {
    color: '#ff4444',
  },
  warningText: {
    fontSize: 12,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'LatoRegular',
  },
});
