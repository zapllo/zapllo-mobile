import { View, Text, SafeAreaView, KeyboardAvoidingView, ScrollView, Image, Platform, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import InputContainer from "~/components/InputContainer";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";

export default function ChangePassWordScreen() {
    const [currentPassword,setCurrentPassword] = useState("");
    const [newPassword,setNewPassword] = useState("");
    const [error, setError] = useState<string>('');
    const navigation = useNavigation();

      const [isPasswordTouched, setIsPasswordTouched] = useState<boolean>(false);

      const handlePasswordValidation = (value: string) => {
        const passwordOneNumber = /(?=.*[0-9])/;
        const passwordSixValue = /(?=.{6,})/;
    
      if (!passwordOneNumber.test(value)) {
          setError('Write at least one number');
        } else if (!passwordSixValue.test(value)) {
          setError('Write at least 6 characters');
        } else {
          setError('');
        }
        setNewPassword(value)
        setIsPasswordTouched(true);   
      };

      

   
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
            <View className="w-full m-4 ">
             <TouchableOpacity 
             onPress={() => navigation.goBack()}
             className='w-10 ml-4 h-9 justify-start flex items-start'>
                <Image resizeMode="contain" className='w-full h-full' source={require("~/assets/sign-in/back.png")}/>
              </TouchableOpacity>
            </View>
            <Image
              className="h-22 mb-20 mt-5 w-1/2"
              source={require('~/assets/sign-in/sign_in.png')}
              resizeMode="contain"
            />
            <View className="border border-[#37384B] rounded-xl p-5 py-8 w-[90%]">
                <Text className="text-white font-bold text-2xl" >Change Your Password
                </Text>
         
                <InputContainer
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={()=>setCurrentPassword}
                  placeholder="**********"
                  className="flex-1  text-[#787CA5]"
                  passwordError={error}
                />

                <InputContainer
                  label="New Password"
                  value={newPassword}
                  onChangeText={handlePasswordValidation}
                  placeholder="**********"
                  className="flex-1  text-[#787CA5]"
                  passwordError={error}
                />

              {isPasswordTouched && (
                <>
                  {error ? (
                    <View className="ml-8 mt-2 flex-row self-start items-center">
                      <Ionicons name="close-circle" size={16} color="#EE4848" />
                      <Text className="font-pathwayExtreme ml-1 self-start text-sm text-red-500" style={{fontFamily:"Lato-Light"}}>
                        {error}
                      </Text>
                    </View>
                  ) : (
                    <View className="ml-8 mt-2 flex-row self-start items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#80ED99" />
                      <Text className="font-pathwayExtreme ml-1 self-start text-sm text-green-500" style={{fontFamily:"Lato-Light"}}>
                        Password is valid!
                      </Text>
                    </View>
                  )}
                </>
              )}
                <TouchableOpacity 
                className="p-4 items-center w-[70%] my-7 bg-[#34785D] rounded-full">
                    <Text className="text-white" style={{fontFamily:"LatoBold"}}>Change Password</Text>
                </TouchableOpacity>

            </View>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
