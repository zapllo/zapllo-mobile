import { Image, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { KeyboardAvoidingView } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import NavbarTwo from "~/components/navbarTwo";
import { router } from "expo-router";

export default function SettingsScreen() {
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
              <TouchableOpacity className="w-full border-b border-x border-[#37384B] p-4 rounded-b-xl flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Setup Reminders</Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
            </View>

            <View className="w-full">
              <Text className="text-[#787CA5] text-xs mb-2"style={{fontFamily:"Lato"}}>Leave Type</Text>
              <TouchableOpacity className="w-full border border-[#37384B] p-4 rounded-t-xl flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Add Your Leave Type</Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
              <TouchableOpacity className="w-full border-b border-x border-[#37384B] p-4 rounded-b-xl flex flex-row items-center justify-between">
                <Text className="text-white"style={{fontFamily:"LatoBold"}}>Add Your Leave Type</Text>
                  <Image
                  source={require("../../../assets/Attendence/sideClick.png")}
                  className="w-3 h-3 \mt-1"
                  />
              </TouchableOpacity>
            </View>

            <View className="w-full">
              <Text className="text-[#787CA5] text-xs mb-2"style={{fontFamily:"Lato"}}>Pay slip Settings</Text>
              <TouchableOpacity className="w-full border border-[#37384B] p-4 rounded-xl flex flex-row items-center justify-between">
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
