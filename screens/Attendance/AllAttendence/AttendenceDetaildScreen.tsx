import { Image, Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import React from "react";
import NavbarTwo from "~/components/navbarTwo";
import { KeyboardAvoidingView } from "react-native";

export default function AttendenceDetaildScreen() {
  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Attendance Details" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-[90%] mt-8 flex">
                <View className="w-full items-center">
                    <Text className="text-white text-lg mb-5">Subhodeep Banerjee</Text>
                </View>
                <View className="flex flex-col items-center w-full gap-6">
                  <View className="border border-[#37384B] rounded-2xl shadow-md w-full flex flex-col p-5">
                    <Text className="text-white mb-5">Tue, February 04</Text>
                    <View className="flex flex-row justify-between gap-2 items-center">
                      <View className="flex flex-col gap-1 items-center">
                        <View className="flex items-center flex-row gap-3">
                          <Image source={require("../../../assets/Attendence/loginLogout.png")} className=" h-7 w-7" />
                          <Text className="text-white text-sm mr-20">Log In</Text>
                        </View>
                       
                        <Text className="text-white font-bold">09:20 AM</Text>
                        <Text className="text-white font-bold text-xs">Total hours 8hr 29min</Text>
                      </View>
                      <View className="flex flex-col gap-1 items-center">
                        <View className="flex items-center flex-row gap-3">
                          <Image source={require("../../../assets/Attendence/loginLogout.png")} className=" h-7 w-7" />
                          <Text className="text-white text-sm mr-20">Log out</Text>
                        </View>
                       
                        <Text className="text-white font-bold">09:20 AM</Text>
                        <Text className="text-white font-bold text-xs">Overtime <Text className="text-[#06D6A0]"> 29 min</Text></Text>
                      </View>
                    </View>

                  </View>

                  <View className="border border-[#37384B] rounded-2xl shadow-md w-full flex flex-col p-5">
                    <Text className="text-white mb-5">Tue, February 03</Text>
                    <View className="flex flex-row justify-between gap-2 items-center">
                      <View className="flex flex-col gap-1 items-center">
                        <View className="flex items-center flex-row gap-3">
                          <Image source={require("../../../assets/Attendence/loginLogout.png")} className=" h-7 w-7" />
                          <Text className="text-white text-sm mr-20">Log In</Text>
                        </View>
                       
                        <Text className="text-white font-bold">09:20 AM</Text>
                        <Text className="text-white font-bold text-xs">Total hours <Text className="text-[#F97520]">6hr 30min</Text></Text>
                      </View>
                      <View className="flex flex-col gap-1 items-center">
                        <View className="flex items-center flex-row gap-3">
                          <Image source={require("../../../assets/Attendence/loginLogout.png")} className=" h-7 w-7" />
                          <Text className="text-white text-sm mr-20">Log out</Text>
                        </View>
                       
                        <Text className="text-white font-bold">09:20 AM</Text>
                        <Text className="text-white font-bold text-xs">Overtime NA</Text>
                      </View>
                    </View>

                  </View>

                  <View className="border border-[#37384B] rounded-2xl shadow-md w-full flex flex-col p-5">
                    <Text className="text-white mb-5">Tue, February 03</Text>
                    <View className="flex flex-row justify-between gap-2 items-center">
                      <View className="flex flex-col gap-1 items-center">
                        <View className="flex items-center flex-row gap-3">
                          <Image source={require("../../../assets/Attendence/loginLogout.png")} className=" h-7 w-7" />
                          <Text className="text-white text-sm mr-20">Log In</Text>
                        </View>
                       
                        <Text className="text-white font-bold">09:20 AM</Text>
                        <Text className="text-white font-bold text-xs">Total hours <Text className="text-[#EF4444]">3hr 30min</Text></Text>
                      </View>
                      <View className="flex flex-col gap-1 items-center">
                        <View className="flex items-center flex-row gap-3">
                          <Image source={require("../../../assets/Attendence/loginLogout.png")} className=" h-7 w-7" />
                          <Text className="text-white text-sm mr-20">Log out</Text>
                        </View>
                       
                        <Text className="text-white font-bold">09:20 AM</Text>
                        <Text className="text-white font-bold text-xs">Overtime NA</Text>
                      </View>
                    </View>

                  </View>
                </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
