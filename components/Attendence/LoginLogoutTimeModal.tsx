import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

interface LoginLogoutTimeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (settings: LoginLogoutTimeSettings) => void;
  initialSettings?: LoginLogoutTimeSettings;
}

export interface LoginLogoutTimeSettings {
  enforceLoginTime: boolean;
  enforceLogoutTime: boolean;
  loginTime: string;
  logoutTime: string;
  allowFlexibleHours: boolean;
  graceTimeMins: number;
}

const LoginLogoutTimeModal: React.FC<LoginLogoutTimeModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialSettings = {
    enforceLoginTime: false,
    enforceLogoutTime: false,
    loginTime: '09:00',
    logoutTime: '18:00',
    allowFlexibleHours: false,
    graceTimeMins: 15,
  },
}) => {
  const [enforceLoginTime, setEnforceLoginTime] = useState(initialSettings.enforceLoginTime);
  const [enforceLogoutTime, setEnforceLogoutTime] = useState(initialSettings.enforceLogoutTime);
  const [loginTime, setLoginTime] = useState(initialSettings.loginTime);
  const [logoutTime, setLogoutTime] = useState(initialSettings.logoutTime);
  const [allowFlexibleHours, setAllowFlexibleHours] = useState(initialSettings.allowFlexibleHours);
  const [graceTimeMins, setGraceTimeMins] = useState(initialSettings.graceTimeMins);
  
  // Time picker states
  const [isLoginTimePickerVisible, setLoginTimePickerVisible] = useState(false);
  const [isLogoutTimePickerVisible, setLogoutTimePickerVisible] = useState(false);

  const showLoginTimePicker = () => {
    setLoginTimePickerVisible(true);
  };

  const hideLoginTimePicker = () => {
    setLoginTimePickerVisible(false);
  };

  const showLogoutTimePicker = () => {
    setLogoutTimePickerVisible(true);
  };

  const hideLogoutTimePicker = () => {
    setLogoutTimePickerVisible(false);
  };

  const handleLoginTimeConfirm = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    setLoginTime(formattedTime);
    hideLoginTimePicker();
  };

  const handleLogoutTimeConfirm = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;
    
    setLogoutTime(formattedTime);
    hideLogoutTimePicker();
  };

  const handleSave = () => {
    onSave({
      enforceLoginTime,
      enforceLogoutTime,
      loginTime,
      logoutTime,
      allowFlexibleHours,
      graceTimeMins,
    });
    onClose();
  };

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
          <Text className="text-white text-xl" style={{fontFamily:"LatoBold"}}>Login-Logout Time</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-[#787CA5]">Cancel</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={showLoginTimePicker}
          className="border border-[#37384B] rounded-xl p-4 mb-4"
        >
          <Text className="text-[#787CA5] mb-2" style={{fontFamily:"Lato"}}>Login Time</Text>
          <Text className="text-white" style={{fontFamily:"Lato"}}>{loginTime}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={showLogoutTimePicker}
          className="border border-[#37384B] rounded-xl p-4 mb-6"
        >
          <Text className="text-[#787CA5] mb-2" style={{fontFamily:"Lato"}}>Logout Time</Text>
          <Text className="text-white" style={{fontFamily:"Lato"}}>{logoutTime}</Text>
        </TouchableOpacity>

        {/* Time Picker Modals */}
        <DateTimePickerModal
          isVisible={isLoginTimePickerVisible}
          mode="time"
          onConfirm={handleLoginTimeConfirm}
          onCancel={hideLoginTimePicker}
          is24Hour={true}
          themeVariant="dark"
          buttonTextColorIOS="#4A65FF"
          cancelButtonColorIOS="#787CA5"
          confirmButtonColorIOS="#4A65FF"
          backgroundColor="#1d1d1d"
          textColor="#FFFFFF"
          pickerContainerStyleIOS={{backgroundColor: '#1d1d1d'}}
          
          pickerComponentStyleIOS={{backgroundColor: '#1d1d1d'}}
        />

        <DateTimePickerModal
          isVisible={isLogoutTimePickerVisible}
          mode="time"
          onConfirm={handleLogoutTimeConfirm}
          onCancel={hideLogoutTimePicker}
          is24Hour={true}
          themeVariant="dark"
          buttonTextColorIOS="#4A65FF"
          cancelButtonColorIOS="#787CA5"
          confirmButtonColorIOS="#4A65FF"
          backgroundColor="#1d1d1d"
          textColor="#FFFFFF"
          pickerContainerStyleIOS={{backgroundColor: '#1d1d1d'}}
        
          pickerComponentStyleIOS={{backgroundColor: '#1d1d1d'}}
        />

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

export default LoginLogoutTimeModal;