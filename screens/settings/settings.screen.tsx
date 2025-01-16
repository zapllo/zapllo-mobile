import { View, Text, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Image } from "react-native";
import React from "react";

import { StackNavigationProp } from "@react-navigation/stack";
import NavbarTwo from "~/components/navbarTwo";
import { useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import SettingEditableComponent from "~/components/settings/SettingEditableComponent";
import SettingEditableForNumberComponent from "~/components/settings/SettingEditableForNumberComponent";

// Define the type for your navigation
type RootStackParamList = {
  "(routes)/home/index": undefined; // Define your routes with parameters (if any)
};
type NavigationProp = StackNavigationProp<RootStackParamList, "(routes)/home/index">;


export default function SettingScreen() {
    const { isLoggedIn, token, userData } = useSelector((state: RootState) => state.auth);

    console.log(">>>>>>",userData)

  const navigation = useNavigation<NavigationProp>();
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
                title="Settings"
                onBackPress={() => navigation.navigate("(routes)/home/index")}
            />

            <View className="flex items-center w-[90%] ml-5 mr-5 mt-3  h-full mb-12 ">

            {/* company name */}
              <View className="w-full items-start gap-2">
              <Text className="text-[#787CA5] text-sm mt-2 mb-1">Support</Text>
              <Text className="text-[#787CA5] ">Company Name</Text>
              <SettingEditableComponent
              title="Zapllo Technologies PVT LTD"
              />
              
              
                {/* line */}
                <View className="h-0.5 w-full bg-[#37384B] mt-5 mb-8"></View>
              </View>


            {/* Industry */}
              <View className="w-full items-start gap-2">
              <Text className="text-[#787CA5] ">Industry</Text>
              <SettingEditableComponent
              title="Technology"
              />
                {/* line */}
                <View className="h-0.5 w-full bg-[#37384B] mt-5 mb-8"></View>
              </View>


              {/* Company Description*/}
              <View className="w-full items-start gap-2">
                <Text className="text-[#787CA5] ">Company Description</Text>
                <SettingEditableComponent
                title="Information & Technology Company"
                /> 
                {/* line */}
                <View className="h-0.5 w-full bg-[#37384B] mt-5 mb-8"></View>
              </View>


              {/* Team Size */}
              <View className="w-full items-start gap-2">
                <Text className="text-[#787CA5] ">Team Size</Text>
                <SettingEditableForNumberComponent
                title="11-12"
                />
                {/* line */}
                <View className="h-0.5 w-full bg-[#37384B] mt-5 mb-8"></View>
              </View>


              {/* supports */}
              <View className=" w-full flex flex-col gap-2 items-start">
                            
                <Text className="text-[#787CA5] text-xs">Support</Text>

                  {/* WhatsApp Integration */}
                  <View className="w-full item-start gap-4">
                  <Text className="text-[#787CA5] mt-3">WhatsApp Integration</Text>
                      <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                        <Text className="text-white text-base">Connect your WABA Number</Text>
                          <Image 
                          source={require("../../assets/commonAssets/smallGoto.png")}
                          className="w-3 h-3 mb-1"
                          />
                      </TouchableOpacity>
                      <View className="h-0.5 w-full bg-[#37384B] "></View>
                  </View>


                   {/* Task App Seeting */}
                  <View className="w-full item-start gap-4">
                  <Text className="text-[#787CA5] mt-9">Task App Seeting</Text>
                      <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                        <Text className="text-white text-base">Notifications & Reminders</Text>
                          <Image 
                          source={require("../../assets/commonAssets/smallGoto.png")}
                          className="w-3 h-3 mb-1"
                          />
                      </TouchableOpacity>
                      <View className="h-0.5 w-full bg-[#37384B] "></View>

                      <TouchableOpacity className="flex  pr-2 flex-row items-center justify-between w-full">
                        <Text className="text-white text-base">Export Tasks (Coming Soon)</Text>
                          <Image 
                          source={require("../../assets/commonAssets/smallGoto.png")}
                          className="w-3 h-3 mb-1"
                          />
                      </TouchableOpacity>
                      <View className="h-0.5 w-full bg-[#37384B] "></View>
                  </View>

  
              </View>


              
              
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>



  );
}
