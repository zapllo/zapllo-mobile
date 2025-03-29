import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, Image, ActivityIndicator, Alert, Platform, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import CustomDropdown from '../customDropDown';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { Fontisto } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

interface ReminderModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (reminderSettings: ReminderSettings) => void;
  onFetchSettings?: (reminderSettings: ReminderSettings) => void;
  initialSettings?: ReminderSettings;
}

export interface ReminderSettings {
  dailyReportEnabled: boolean;
  dailyReportTime: string;
  timezone: string;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  isVisible,
  onClose,
  onSave,
  onFetchSettings,
  initialSettings = {
    dailyReportEnabled: false,
    dailyReportTime: '',
    timezone: 'UTC',
  },
}) => {
  const [dailyReportEnabled, setDailyReportEnabled] = useState(initialSettings.dailyReportEnabled);
  const [dailyReportTime, setDailyReportTime] = useState(initialSettings.dailyReportTime);
  const [timezone, setTimezone] = useState(initialSettings.timezone);
  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(false);
  
  // Get auth token from Redux store
  const { token } = useSelector((state: RootState) => state.auth);
  
  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Create a Date object for the time picker
  const getTimePickerDate = () => {
    if (dailyReportTime) {
      const [hours, minutes] = dailyReportTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return date;
    }
    return new Date();
  };
  
  const [timePickerDate, setTimePickerDate] = useState(getTimePickerDate());

  // Fetch organization data when modal opens
  useEffect(() => {
    if (isVisible) {
      fetchOrganizationData();
    }
  }, [isVisible]);

  const fetchOrganizationData = async () => {
    try {
      setFetchingSettings(true);
      
      const response = await axios.get('https://zapllo.com/api/organization/getById', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.data) {
        const orgData = response.data.data;
        
        // Create updated settings object based on organization data
        const updatedSettings: ReminderSettings = {
          dailyReportEnabled: orgData.dailyReportEnabled || initialSettings.dailyReportEnabled,
          dailyReportTime: orgData.dailyReportTime || initialSettings.dailyReportTime,
          timezone: orgData.timezone || initialSettings.timezone
        };
        
        // Update local state
        setDailyReportEnabled(updatedSettings.dailyReportEnabled);
        setDailyReportTime(updatedSettings.dailyReportTime);
        setTimezone(updatedSettings.timezone);
        
        // Update time picker date
        if (updatedSettings.dailyReportTime) {
          const [hours, minutes] = updatedSettings.dailyReportTime.split(':').map(Number);
          const date = new Date();
          date.setHours(hours);
          date.setMinutes(minutes);
          setTimePickerDate(date);
        }
        
        // Notify parent component of fetched settings
        if (onFetchSettings) {
          onFetchSettings(updatedSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
    } finally {
      setFetchingSettings(false);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    
    if (selectedDate) {
      setTimePickerDate(selectedDate);
      
      // Format the time as HH:MM
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      
      setDailyReportTime(formattedTime);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare the data for the API
      const reminderData = {
        dailyReportEnabled,
        dailyReportTime: dailyReportTime || null,
        timezone: timezone || 'UTC'
      };
      
      // Make the API call
      const response = await axios.post(
        'https://zapllo.com/api/organization/reminder-settings',
        reminderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Create updated settings object
        const updatedSettings: ReminderSettings = {
          dailyReportEnabled,
          dailyReportTime,
          timezone,
        };
        
        // Show success alert
        Alert.alert(
          'Success',
          'Reminder settings updated successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Call the onSave callback with the updated settings
                onSave(updatedSettings);
                
                // Close the modal
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save reminder settings');
      }
    } catch (error) {
      console.error('Error saving reminder settings:', error);
      Alert.alert(
        'Error',
        'Failed to save reminder settings. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Format time for display
  const getFormattedTime = () => {
    if (!dailyReportTime) return 'No time set yet';
    
    try {
      // Create a date object with the time
      const [hours, minutes] = dailyReportTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      
      // Format the time
      return format(date, 'hh:mm a');
    } catch (error) {
      return dailyReportTime;
    }
  };

  // Sample timezone data for the dropdown
  const timezoneData = [
    { label: 'UTC (GMT)', value: 'UTC' },
    { label: 'America/New_York (EST/EDT)', value: 'America/New_York' },
    { label: 'America/Los_Angeles (PST/PDT)', value: 'America/Los_Angeles' },
    { label: 'Europe/London (GMT/BST)', value: 'Europe/London' },
    { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
    { label: 'Australia/Sydney (AEST/AEDT)', value: 'Australia/Sydney' },
  ];

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View className="bg-[#1E1F2E] rounded-t-3xl p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-xl" style={{fontFamily:"LatoBold"}}>Reminders</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-[#787CA5]">Cancel</Text>
          </TouchableOpacity>
        </View>

        {fetchingSettings ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator color="#4A65FF" size="large" />
            <Text className="text-white mt-4">Loading settings...</Text>
          </View>
        ) : (
          <>
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white" style={{fontFamily:"Lato"}}>Daily Attendance Report</Text>
                <Switch
                  value={dailyReportEnabled}
                  onValueChange={setDailyReportEnabled}
                  trackColor={{ false: "#37384B", true: "#4A65FF" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Daily Report Time */}
            <View className="mb-6">
              <Text className="text-white mb-2" style={{fontFamily:"Lato"}}>Daily Attendance Report Time</Text>
              <TouchableOpacity 
                className="border border-[#37384B] bg-primary justify-center rounded-lg items-center flex p-3 flex-row gap-3"
                onPress={() => setShowTimePicker(!showTimePicker)}
              >
                <Fontisto name="clock" size={18} color="#5f6191" />
                <Text className="text-white text-sm">{getFormattedTime()}</Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={timePickerDate}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleTimeChange}
                    textColor="white"
                  />
                </View>
              )}
            </View>

            {/* Timezone dropdown */}
            <View className="mb-6 w-[100%]">
              <Text className="text-white" style={{fontFamily:"Lato"}}>TimeZone</Text>
              <CustomDropdown
                placeholder='Select TimeZone'
                data={timezoneData}
                selectedValue={timezone}
                onSelect={(value) => setTimezone(value)}
              />
            </View>

            <TouchableOpacity 
              onPress={handleSave}
              className="bg-[#4A65FF] py-4 rounded-xl"
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-white text-center" style={{fontFamily:"LatoBold"}}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    width: '100%',
    backgroundColor: Platform.OS === 'ios' ? '#0f0f12' : 'transparent',
    borderRadius: 8,
    marginTop: 8
  }
});

export default ReminderModal;