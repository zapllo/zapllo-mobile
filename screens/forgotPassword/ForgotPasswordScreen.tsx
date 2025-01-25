import { View, Text, SafeAreaView, KeyboardAvoidingView, ScrollView, Image, Platform, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import InputContainer from "~/components/InputContainer";
import { Feather } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { NavigationProp } from "@react-navigation/native";

export default function ForgotPasswordScreen() {
    const [mail,setMail] = useState("");

    const isEmailValid = () => {
     
      };

    const navigation = useNavigation();


  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary ">
      <KeyboardAvoidingView
        className=" w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="h-full w-full flex-grow"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center">
            <Image
              className="h-22 mb-[5.3rem] mt-[4.6rem] w-1/2"
              source={require('~/assets/sign-in/sign_in.png')}
              resizeMode="contain"
            />
            <View className="border border-[#37384B] rounded-xl p-5 py-8 w-[90%]">
                <Text className="text-white font-bold text-2xl" >Forgot Password</Text>
                <Text className="text-[#787CA5] text-xs" style={{fontFamily:"LatoBold"}}>Enter your registered Email to receive a password reset email
                </Text>
                <InputContainer
                label="Email Address"
                value={mail}
                onChangeText={(value) => setMail(value)}
                placeholder="Enter your email"
                className="flex-1  text-sm text-[#787CA5]"
                passwordError={''}    
                />
                <TouchableOpacity 
                
                className="p-4 items-center w-[70%] my-7 bg-[#34785D] rounded-full">
                    <Text className="text-white" style={{fontFamily:"LatoBold"}}>Send Password Link</Text>
                </TouchableOpacity>

            </View>

            
            <View
            className=" mt-44 flex flex-row gap-2 items-center"
            >
              <Feather name="home" size={22} color="#fff" />
              <TouchableOpacity
              onPress={()=>navigation.goBack()}
              >
                    <Text className="text-white text-lg"  style={{fontFamily:"LatoBold"}} >
                    Back to Login
                    </Text>
            </TouchableOpacity>
            </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
