import React, { useState } from "react";
import { Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import InputContainer from "~/components/InputContainer";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { GradientText } from "~/components/GradientText";
import Checkbox from "~/components/Checkbox";

export default function Loginscreen() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
  });
  const [required, setRequired] = useState("");
  const [error, setError] = useState({
    password: "",
  });
  const [isChecked, setIsChecked] = useState(false);

  const handlePasswordValidation = (value: string) => {
    const password = value;
    const passwordSpecialCharecter = /(?=.*[!@#$&*])/;
    const passwordOneNumber = /(?=.*[0-9])/;
    const passwordSixValue = /(?=.{6,})/;

    if (!passwordSpecialCharecter.test(password)) {
      setError({
        ...error,
        password: "Write at least one special character"
      });
      setUserInfo({ ...userInfo, password: "" });

    } else if (!passwordOneNumber.test(password)) {
      setError({
        ...error,
        password: "Write at least one number"
      });
      setUserInfo({ ...userInfo, password: "" });
    } else if (!passwordSixValue.test(password)) {
      setError({
        ...error,
        password: "Write at least 6 characters"
      });
      setUserInfo({ ...userInfo, password: "" });
    } else {
      setError({
        ...error,
        password: ""
      });
    }
    setUserInfo({ ...userInfo, password: value })
  };

  const isEmailValid = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = isEmailValid(userInfo.email) && !error.password && isChecked;
  const handleSignIn = () => {
    // Sign-in logic here
  }

  return (
    <SafeAreaView className="w-full h-full bg-primary items-center flex-1">
      <KeyboardAvoidingView className="w-full" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView 
            className="w-full h-full flex-grow"
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        >
          <View className="items-center h-full w-full">
            <Image className="h-20 w-1/2 mt-16 mb-20" source={require("~/assets/sign-in/sign_in.png")} resizeMode="contain" />

            <View className="flex items-center mb-3 flex-row gap-2 ">
              <Image className="h-9" source={require("~/assets/sign-in/teamsLogo.png")} resizeMode="contain" />
              <Text className="text-center text-xl text-white mt-2">Zapllo Teams</Text>
            </View>

            <InputContainer
              label="Email Address"
              value={userInfo.email}
              onChangeText={(value) => setUserInfo({ ...userInfo, email: value })}
              placeholder="Email Address"
              className=" p-2.5  rounded-full w-11/12 h-14 text-[#787CA5] text-sm"
            />
            
            <View className="relative items-center w-full">
              <InputContainer
                label="Password"
                value={userInfo.password}
                onChangeText={handlePasswordValidation}
                placeholder="**********"
                secureTextEntry={!isPasswordVisible}
                className="  p-2.5  rounded-full w-11/12 h-14 text-[#787CA5] text-sm"
              />
            
              <TouchableOpacity
                className="absolute top-12 right-10"
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                {isPasswordVisible ? (
                  <Ionicons name="eye-off-outline" size={23} color={"#FFFFFF"} />
                ) : (
                  <Ionicons name="eye-outline" size={23} color={"#FFFFFF"} />
                )}
              </TouchableOpacity>
            </View>
            
            {
              error.password && (
                <View className="flex flex-row gap-2 justify-start w-[82%] mb-10">
                  <Entypo name="cross" size={18} color={"red"}/>
                  <Text className="text-red-500 text-xs">
                    {error.password}
                  </Text>
                </View>
              )
            }

            <TouchableOpacity 
              className="self-end mr-5 mt-2"
              onPress={()=>router.push("/(routes)/forgot-PassWord" as any)}
            >
              <Text className="text-white font-thin text-sm ">Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`p-2.5 mt-16 mb-7 rounded-full w-11/12 h-16 items-center flex justify-center ${isFormValid ? "bg-[#815BF5]" : "bg-[#37384B]"}`}
              onPress={()=> router.push("(routes)/home" as any )}
            >
              {
                buttonSpinner ? (
                  <ActivityIndicator size="small" color={"white"} />
                ) : (
                  <Text className="text-white text-center text-sm">
                    Login
                  </Text>
                )
              }
            </TouchableOpacity>

            <View className="w-[90%] mb-14">
              <Checkbox
                text="By clicking continue, you agree to our Terms of Service and Privacy Policy."
                isChecked={isChecked}
                onPress={() => setIsChecked(!isChecked)}
                
              />
            </View>

            <View className="flex flex-row justify-end mt-10 items-center">
              <Text className="text-white font-extralight mr-1">Not a</Text>
              <GradientText text="Zapllonian"/>
              <Text className="text-white font-extralight ">? </Text>
              <TouchableOpacity onPress={()=> router.push("/(routes)/signup/pageOne" as any)}>
                <Text className="text-white font-semibold">Register Here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}