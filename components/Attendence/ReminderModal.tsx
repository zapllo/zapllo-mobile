import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Image } from 'react-native';
import Modal from 'react-native-modal';
import CustomDropdown from '../customDropDown';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface ReminderModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (reminderSettings: ReminderSettings) => void;
  initialSettings?: ReminderSettings;
}

export interface ReminderSettings {
  checkInReminder: boolean;
  checkOutReminder: boolean;
  checkInTime: string;
  checkOutTime: string;
  dailyReportTime: string;
  timezone: string;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialSettings = {
    checkInReminder: false,
    checkOutReminder: false,
    checkInTime: '09:00',
    checkOutTime: '18:00',
    dailyReportTime: '',
    timezone: '',
  },
}) => {
  const [checkInReminder, setCheckInReminder] = useState(initialSettings.checkInReminder);
  const [checkOutReminder, setCheckOutReminder] = useState(initialSettings.checkOutReminder);
  const [checkInTime, setCheckInTime] = useState(initialSettings.checkInTime);
  const [checkOutTime, setCheckOutTime] = useState(initialSettings.checkOutTime);
  const [dailyReportTime, setDailyReportTime] = useState(initialSettings.dailyReportTime);
  const [timezone, setTimezone] = useState(initialSettings.timezone);
  
  // Time picker state
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  const showTimePicker = () => {
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisible(false);
  };

  const handleTimeConfirm = (date: Date) => {
    // Format the time as HH:MM
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    setDailyReportTime(formattedTime);
    hideTimePicker();
  };

  const handleSave = () => {
    onSave({
      checkInReminder,
      checkOutReminder,
      checkInTime,
      checkOutTime,
      dailyReportTime,
      timezone,
    });
    onClose();
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

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white" style={{fontFamily:"Lato"}}>Daily Attendance Report</Text>
            <Switch
              value={checkInReminder}
              onValueChange={setCheckInReminder}
              trackColor={{ false: "#37384B", true: "#4A65FF" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-white" style={{fontFamily:"Lato"}}>Daily Attendance Report Time</Text>
              <Text className='text-sm text-[#787CA5]'>
                {dailyReportTime ? dailyReportTime : 'No time set yet'}
              </Text>
            </View>
            <TouchableOpacity onPress={showTimePicker}>
              <Image source={require("../../assets/Attendence/reminder.png")} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Picker Modal */}
        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          onConfirm={handleTimeConfirm}
          onCancel={hideTimePicker}
          is24Hour={true}
          themeVariant="dark"
          buttonTextColorIOS="#4A65FF"
        display="default"
          confirmButtonColorIOS="#4A65FF"
          backgroundColor="#1d1d1d"
          textColor="#FFFFFF"
          pickerContainerStyleIOS={{backgroundColor: '#1d1d1d'}}
          
          pickerComponentStyleIOS={{backgroundColor: '#1d1d1d'}}
        />

        {/* Timezone dropdown */}
        <View className="mb-6">
          <Text className="text-white mb-2" style={{fontFamily:"Lato"}}>TimeZone</Text>
          <CustomDropdown
            placeholder='Select TimeZone'
            data={timezoneData}
            selectedValue={timezone}
            onSelect={(item) => setTimezone(item.value)}
          />
        </View>

        <TouchableOpacity 
          onPress={handleSave}
          className="bg-[#4A65FF] py-4 rounded-xl"
        >
          <Text className="text-white text-center" style={{fontFamily:"LatoBold"}}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ReminderModal;