import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';

interface LoginLogoutTimeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (settings: LoginLogoutTimeSettings) => void;
  onFetchSettings?: (settings: LoginLogoutTimeSettings) => void;
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
  onFetchSettings,
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
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(false);
  
  // Get auth token from Redux store
  const { token } = useSelector((state: RootState) => state.auth);
  
  // Time picker states
  const [isLoginTimePickerVisible, setLoginTimePickerVisible] = useState(false);
  const [isLogoutTimePickerVisible, setLogoutTimePickerVisible] = useState(false);

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
        const updatedSettings: LoginLogoutTimeSettings = {
          enforceLoginTime: orgData.enforceLoginTime || initialSettings.enforceLoginTime,
          enforceLogoutTime: orgData.enforceLogoutTime || initialSettings.enforceLogoutTime,
          loginTime: orgData.loginTime || initialSettings.loginTime,
          logoutTime: orgData.logoutTime || initialSettings.logoutTime,
          allowFlexibleHours: orgData.allowFlexibleHours || initialSettings.allowFlexibleHours,
          graceTimeMins: orgData.graceTimeMins || initialSettings.graceTimeMins
        };
        
        // Update local state
        setLoginTime(updatedSettings.loginTime);
        setLogoutTime(updatedSettings.logoutTime);
        setEnforceLoginTime(updatedSettings.enforceLoginTime);
        setEnforceLogoutTime(updatedSettings.enforceLogoutTime);
        setAllowFlexibleHours(updatedSettings.allowFlexibleHours);
        setGraceTimeMins(updatedSettings.graceTimeMins);
        
        // Notify parent component of fetched settings
        if (onFetchSettings) {
          onFetchSettings(updatedSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching organization data:', error);
      Alert.alert('Error', 'Failed to fetch organization data. Please try again later.');
    } finally {
      setFetchingSettings(false);
    }
  };

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

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare data for saving
      const loginLogoutData = {
        loginTime,
        logoutTime,
        enforceLoginTime,
        enforceLogoutTime,
        allowFlexibleHours,
        graceTimeMins
      };
      
      // Make API call to save login/logout settings
      const response = await axios.post(
        'https://zapllo.com/api/organization/login-logout-time',
        loginLogoutData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Create updated settings object
        const updatedSettings: LoginLogoutTimeSettings = {
          enforceLoginTime,
          enforceLogoutTime,
          loginTime,
          logoutTime,
          allowFlexibleHours,
          graceTimeMins
        };
        
        // Show success alert
        Alert.alert(
          'Success',
          'Login-Logout time settings updated successfully!',
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
        Alert.alert('Error', response.data.message || 'Failed to save login-logout time settings');
      }
    } catch (error) {
      console.error('Error saving login-logout time settings:', error);
      Alert.alert(
        'Error',
        'Failed to save login-logout time settings. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
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

        {fetchingSettings ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator color="#4A65FF" size="large" />
            <Text className="text-white mt-4">Loading settings...</Text>
          </View>
        ) : (
          <>
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

export default LoginLogoutTimeModal;