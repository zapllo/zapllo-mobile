import { Image, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import NavbarTwo from "~/components/navbarTwo";
import { router } from "expo-router";
import Modal from 'react-native-modal';
import ReminderModal, { ReminderSettings } from "~/components/Attendence/ReminderModal";
import LoginLogoutTimeModal, { LoginLogoutTimeSettings } from "~/components/Attendence/LoginLogoutTimeModal";
import PenaltyModal, { PenaltySettings } from "~/components/Attendence/PenaltyModal";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { format } from "date-fns";

export default function SettingsScreen() {
  const [isReminderModalVisible, setReminderModalVisible] = useState(false);
  const [isLoginLogoutModalVisible, setLoginLogoutModalVisible] = useState(false);
  const [isPenaltyModalVisible, setPenaltyModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get auth token from Redux store
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    dailyReportEnabled: false,
    dailyReportTime: '',
    timezone: 'UTC',
  });

  const [loginLogoutSettings, setLoginLogoutSettings] = useState<LoginLogoutTimeSettings>({
    enforceLoginTime: false,
    enforceLogoutTime: false,
    loginTime: '00:00',
    logoutTime: '00:00',
    allowFlexibleHours: false,
    graceTimeMins: 15,
  });

  const [penaltySettings, setPenaltySettings] = useState<PenaltySettings>({
    lateLoginsAllowed: 3,
    penaltyLeaveDeductionType: 'Half Day',
    penaltyOption: 'leave',
    penaltySalaryAmount: 0
  });

  // Fetch organization settings when component mounts
  useEffect(() => {
    fetchOrganizationSettings();
  }, []);

  const fetchOrganizationSettings = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.get('https://zapllo.com/api/organization/getById', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.data) {
        const orgData = response.data.data;
        
        // Update login/logout settings
        setLoginLogoutSettings({
          ...loginLogoutSettings,
          loginTime: orgData.loginTime || '09:00',
          logoutTime: orgData.logoutTime || '18:00',
          enforceLoginTime: orgData.enforceLoginTime || false,
          enforceLogoutTime: orgData.enforceLogoutTime || false,
          allowFlexibleHours: orgData.allowFlexibleHours || false,
          graceTimeMins: orgData.graceTimeMins || 15
        });
        
        // Update reminder settings
        setReminderSettings({
          dailyReportEnabled: orgData.dailyReportEnabled || false,
          dailyReportTime: orgData.dailyReportTime || '',
          timezone: orgData.timezone || 'UTC'
        });
        
        // Update penalty settings
        setPenaltySettings({
          lateLoginsAllowed: orgData.lateLoginThreshold || 3,
          penaltyLeaveDeductionType: orgData.penaltyLeaveType || 'Half Day',
          penaltyOption: orgData.penaltyOption || 'leave',
          penaltySalaryAmount: orgData.penaltySalaryAmount || 0
        });
      }
    } catch (error) {
      console.error('Error fetching organization settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReminderModal = () => {
    setReminderModalVisible(!isReminderModalVisible);
  };

  const toggleLoginLogoutModal = () => {
    setLoginLogoutModalVisible(!isLoginLogoutModalVisible);
  };

  const togglePenaltyModal = () => {
    setPenaltyModalVisible(!isPenaltyModalVisible);
  };

  const handleSaveReminders = (settings: ReminderSettings) => {
    setReminderSettings(settings);
    // Settings are saved in the modal component via API
    console.log('Saving reminders:', settings);
  };

  // Function to handle fetched settings from the modal
  const handleFetchedReminderSettings = (settings: ReminderSettings) => {
    setReminderSettings(settings);
    console.log('Fetched reminder settings:', settings);
  };

  const handleSaveLoginLogoutTime = (settings: LoginLogoutTimeSettings) => {
    setLoginLogoutSettings(settings);
    // Settings are saved in the modal component via API
    console.log('Saving login-logout times:', settings);
  };

  const handleFetchedLoginLogoutSettings = (settings: LoginLogoutTimeSettings) => {
    setLoginLogoutSettings(settings);
    console.log('Fetched login-logout settings:', settings);
  };

  const handleSavePenalties = (settings: PenaltySettings) => {
    setPenaltySettings(settings);
    // Settings are saved in the modal component via API
    console.log('Saving penalties:', settings);
  };

  const handleFetchedPenaltySettings = (settings: PenaltySettings) => {
    setPenaltySettings(settings);
    console.log('Fetched penalty settings:', settings);
  };

  // Format time for display (12-hour format)
  const formatTimeFor12Hour = (time: string) => {
    if (!time) return '';
    
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      
      return format(date, 'hh:mm a');
    } catch (error) {
      return time;
    }
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary ">
      <NavbarTwo title="Settings" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#815BF5" />
              <Text className="text-white mt-4">Loading settings...</Text>
            </View>
          ) : (
            <ScrollView 
              contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="w-[90%] mt-8 flex gap-8">
                <View className="w-full">
                  <Text className="text-[#787CA5] text-xs mb-2" style={{fontFamily:"Lato"}}>Leave Type</Text>
                  <TouchableOpacity 
                    onPress={()=>router.push("/(routes)/settings/AttendenceSettings/SettingItems/LeaveType")}
                    className="w-full border border-[#37384B] p-4 rounded-xl flex flex-row items-center justify-between">
                    <Text className="text-white" style={{fontFamily:"LatoBold"}}>Add Your Leave Type</Text>
                    <Image
                      source={require("../../../assets/Attendence/sideClick.png")}
                      className="w-3 h-3 mt-1"
                    />
                  </TouchableOpacity>
                </View>

                <View className="w-full">
                  <Text className="text-[#787CA5] text-xs mb-2" style={{fontFamily:"Lato"}}>Attendance Settings</Text>
                  <TouchableOpacity 
                    onPress={()=>router.push("/(routes)/settings/AttendenceSettings/SettingItems/FaceRegistation")}
                    className="w-full border border-[#37384B] p-4 rounded-t-xl flex flex-row items-center justify-between">
                    <Text className="text-white" style={{fontFamily:"LatoBold"}}>Setup Face Registration</Text>
                    <Image
                      source={require("../../../assets/Attendence/sideClick.png")}
                      className="w-3 h-3 mt-1"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={toggleReminderModal}
                    className="w-full border-b border-x border-[#37384B] p-4 rounded-b-xl flex flex-row items-center justify-between">
                    <View>
                      <Text className="text-white" style={{fontFamily:"LatoBold"}}>Setup Reminders</Text>
                      {reminderSettings.dailyReportEnabled && reminderSettings.dailyReportTime && (
                        <Text className="text-[#787CA5] text-xs">
                          Daily Report: {formatTimeFor12Hour(reminderSettings.dailyReportTime)}
                        </Text>
                      )}
                    </View>
                    <Image
                      source={require("../../../assets/Attendence/sideClick.png")}
                      className="w-3 h-3 mt-1"
                    />
                  </TouchableOpacity>
                </View>

                <View className="w-full">
                  <Text className="text-[#787CA5] text-xs mb-2" style={{fontFamily:"Lato"}}>Office Settings</Text>
                  <TouchableOpacity 
                    onPress={toggleLoginLogoutModal}
                    className="w-full border border-[#37384B] p-4 rounded-t-xl flex flex-row items-center justify-between">
                    <View>
                      <Text className="text-white" style={{fontFamily:"LatoBold"}}>Set Login-Logout Time</Text>
                      {loginLogoutSettings.loginTime && loginLogoutSettings.logoutTime && (
                        <Text className="text-[#787CA5] text-xs">
                          Login: {formatTimeFor12Hour(loginLogoutSettings.loginTime)} | Logout: {formatTimeFor12Hour(loginLogoutSettings.logoutTime)}
                        </Text>
                      )}
                    </View>
                    <Image
                      source={require("../../../assets/Attendence/sideClick.png")}
                      className="w-3 h-3 mt-1"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={togglePenaltyModal}
                    className="w-full border-b border-x border-[#37384B] p-4 flex flex-row items-center justify-between">
                    <View>
                      <Text className="text-white" style={{fontFamily:"LatoBold"}}>Set Penalties</Text>
                      <Text className="text-[#787CA5] text-xs">
                        Late logins allowed: {penaltySettings.lateLoginsAllowed}
                      </Text>
                    </View>
                    <Image
                      source={require("../../../assets/Attendence/sideClick.png")}
                      className="w-3 h-3 mt-1"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={()=>router.push("/(routes)/settings/AttendenceSettings/SettingItems/SetOfficeLocation")}               
                    className="w-full border-b border-x border-[#37384B] p-4 rounded-b-xl flex flex-row items-center justify-between">
                    <Text className="text-white" style={{fontFamily:"LatoBold"}}>Office Location</Text>
                    <Image
                      source={require("../../../assets/Attendence/sideClick.png")}
                      className="w-3 h-3 mt-1"
                    />
                  </TouchableOpacity>
                </View>

                <View className="w-full">
                  <Text className="text-[#787CA5] text-xs mb-2" style={{fontFamily:"Lato"}}>Pay slip Settings</Text>
                  <TouchableOpacity 
                    onPress={()=>router.push("/(routes)/settings/AttendenceSettings/SettingItems/SetPayslip")}              
                    className="w-full border border-[#37384B] p-4 rounded-xl flex flex-row items-center justify-between">
                    <Text className="text-white" style={{fontFamily:"LatoBold"}}>Set Pay slip Details</Text>
                    <Image
                      source={require("../../../assets/Attendence/sideClick.png")}
                      className="w-3 h-3 mt-1"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </TouchableWithoutFeedback>
        
        {/* Modals */}
        <ReminderModal
          isVisible={isReminderModalVisible}
          onClose={toggleReminderModal}
          onSave={handleSaveReminders}
          onFetchSettings={handleFetchedReminderSettings}
          initialSettings={reminderSettings}
        />
        
        <LoginLogoutTimeModal
          isVisible={isLoginLogoutModalVisible}
          onClose={toggleLoginLogoutModal}
          onSave={handleSaveLoginLogoutTime}
          onFetchSettings={handleFetchedLoginLogoutSettings}
          initialSettings={loginLogoutSettings}
        />
        
        <PenaltyModal
          isVisible={isPenaltyModalVisible}
          onClose={togglePenaltyModal}
          onSave={handleSavePenalties}
          onFetchSettings={handleFetchedPenaltySettings}
          initialSettings={penaltySettings}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
