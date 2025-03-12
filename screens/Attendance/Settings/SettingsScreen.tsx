import { Image, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import NavbarTwo from "~/components/navbarTwo";
import { router } from "expo-router";
import Modal from 'react-native-modal';
import ReminderModal, { ReminderSettings } from "~/components/Attendence/ReminderModal";
import LoginLogoutTimeModal, { LoginLogoutTimeSettings } from "~/components/Attendence/LoginLogoutTimeModal";
import PenaltyModal, { PenaltySettings } from "~/components/Attendence/PenaltyModal";

export default function SettingsScreen() {
  const [isReminderModalVisible, setReminderModalVisible] = useState(false);
  const [isLoginLogoutModalVisible, setLoginLogoutModalVisible] = useState(false);
  const [isPenaltyModalVisible, setPenaltyModalVisible] = useState(false);
  
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    checkInReminder: false,
    checkOutReminder: false,
    checkInTime: '09:00',
    checkOutTime: '18:00',
    dailyReportTime: '',
    timezone: '',
  });

  const [loginLogoutSettings, setLoginLogoutSettings] = useState<LoginLogoutTimeSettings>({
    enforceLoginTime: false,
    enforceLogoutTime: false,
    loginTime: '09:00',
    logoutTime: '18:00',
    allowFlexibleHours: false,
    graceTimeMins: 15,
  });

  const [penaltySettings, setPenaltySettings] = useState<PenaltySettings>({
    lateLoginsAllowed: 3,
    penaltyLeaveDeductionType: 'Half Day',
  });

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
    // Here you would implement the logic to save the reminder settings
    // For example, you might call an API or store in local storage
    console.log('Saving reminders:', settings);
  };

  const handleSaveLoginLogoutTime = (settings: LoginLogoutTimeSettings) => {
    setLoginLogoutSettings(settings);
    // Here you would implement the logic to save the login-logout settings
    // For example, you might call an API or store in local storage
    console.log('Saving login-logout times:', settings);
  };

  const handleSavePenalties = (settings: PenaltySettings) => {
    setPenaltySettings(settings);
    // Here you would implement the logic to save the penalty settings
    // For example, you might call an API or store in local storage
    console.log('Saving penalties:', settings);
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary ">
      <NavbarTwo title="Settings" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center',paddingBottom:80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-[90%] mt-8 flex gap-8">
            <View className="w-full">
              <Text className="text-[#787CA5] text-xs mb-2"style={{fontFamily:"Lato"}}>Leave Type</Text>
              <TouchableOpacity 
              onPress={()=>router.push("/(routes)/settings/AttendenceSettings/SettingItems/LeaveType")}
              className="w-full border border-[#37384B] p-4 rounded-xl flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Add Your Leave Type</Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
            </View>

            <View className="w-full">
              <Text className="text-[#787CA5] text-xs mb-2"style={{fontFamily:"Lato"}}>Attendance Settings</Text>
              <TouchableOpacity 
              onPress={()=>router.push("/(routes)/settings/AttendenceSettings/SettingItems/FaceRegistation")}
              className="w-full border border-[#37384B] p-4 rounded-t-xl flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Setup Face Registration</Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
              <TouchableOpacity 
              onPress={toggleReminderModal}
              className="w-full border-b border-x border-[#37384B] p-4 rounded-b-xl flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Setup Reminders</Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
            </View>

            <View className="w-full">
              <Text className="text-[#787CA5] text-xs mb-2"style={{fontFamily:"Lato"}}>Office Settings</Text>
              <TouchableOpacity 
                onPress={toggleLoginLogoutModal}
                className="w-full border border-[#37384B] p-4 rounded-t-xl flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Set Login-Logout Time
                </Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={togglePenaltyModal}
                className="w-full border-b border-x border-[#37384B] p-4 flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Set Penalties
                </Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
              <TouchableOpacity 
              onPress={()=>router.push("/(routes)/settings/AttendenceSettings/SettingItems/SetOfficeLocation")}               
              className="w-full border-b border-x border-[#37384B] p-4 rounded-b-xl flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Office Location

                </Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
            </View>

            <View className="w-full">
              <Text className="text-[#787CA5] text-xs mb-2"style={{fontFamily:"Lato"}}>Pay slip Settings</Text>
              <TouchableOpacity 
              onPress={()=>router.push("/(routes)/settings/AttendenceSettings/SettingItems/SetPayslip")}              
              className="w-full border border-[#37384B] p-4 rounded-xl flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Set Pay slip Details</Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
            </View>

            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
        
        {/* Modals */}
        <ReminderModal
          isVisible={isReminderModalVisible}
          onClose={toggleReminderModal}
          onSave={handleSaveReminders}
          initialSettings={reminderSettings}
        />
        
        <LoginLogoutTimeModal
          isVisible={isLoginLogoutModalVisible}
          onClose={toggleLoginLogoutModal}
          onSave={handleSaveLoginLogoutTime}
          initialSettings={loginLogoutSettings}
        />
        
        <PenaltyModal
          isVisible={isPenaltyModalVisible}
          onClose={togglePenaltyModal}
          onSave={handleSavePenalties}
          initialSettings={penaltySettings}
        />
        
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});