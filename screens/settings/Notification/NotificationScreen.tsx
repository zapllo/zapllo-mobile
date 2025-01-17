import { View, Text, KeyboardAvoidingView, Platform, Touchable, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import NavbarTwo from "~/components/navbarTwo";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from "@react-navigation/stack";
import ToggleSwitch from "~/components/ToggleSwitch";
import { Image } from "react-native";
import WeeklyButtons from "~/components/WeeklyButtons";
import GradientButton from "~/components/GradientButton";

export default function NotificationScreen() {

    const [isSwitchOn, setIsSwitchOn] = useState(false);

    const handleToggle = (newState: boolean) => {
      setIsSwitchOn(newState);
    };
  const navigation = useNavigation<StackNavigationProp<any>>();
  return (
    <SafeAreaView className="bg-[#05071E] h-full w-full">
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
    >
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        >
            {/* Navbar */}
            <NavbarTwo
                title="Notification"
                onBackPress={() => navigation.goBack()}
            />
      <View className="flex items-center flex-col w-full justify-center mb-12 mt-7">
        <ToggleSwitch
          isOn={isSwitchOn}
          onToggle={handleToggle}
          title="Email Notification"
        />
        <View className="h-0.5 w-[90%] bg-[#37384B] mt-5 mb-5"></View>
        <ToggleSwitch
          isOn={isSwitchOn}
          onToggle={handleToggle}
          title="Whats App Notification"
        />
        <View className="h-0.5 w-[90%] bg-[#37384B] mt-5 mb-5"></View>

        <View className="  flex flex-row justify-between items-center w-[90%]">
          <Text className="text-white">Daily Reminder Time</Text>
          <TouchableOpacity>
          <Image className="w-9 h-9" source={require("../../../assets/settings/reminder.png")}/>
          </TouchableOpacity>
        </View>


        <View className="h-0.5 w-[90%] bg-[#37384B] mt-5 mb-5"></View>

          <ToggleSwitch
          isOn={isSwitchOn}
          onToggle={handleToggle}
          title="Email Reminders"
        />
        <View className="h-0.5 w-[90%] bg-[#37384B] mt-5 mb-5"></View>
          <ToggleSwitch
          isOn={isSwitchOn}
          onToggle={handleToggle}
          title="Whats App Reminders"
        />
        <View className="h-0.5 w-[90%] bg-[#37384B] mt-5 mb-5"></View>

        {/* week ofs*/}
        
          <WeeklyButtons/>
          <GradientButton
          title="Save Setting"
          imageSource={""}
          />
        
      </View>

        </ScrollView>
        </KeyboardAvoidingView>
        </SafeAreaView>

  );
}
