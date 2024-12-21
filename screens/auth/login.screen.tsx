import React, { useState } from "react";
import { Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, View, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
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
    <SafeAreaView style={{width:"100%",height:"100%"}} className="bg-primary h-full w-full items-center flex-1">
      <KeyboardAvoidingView className="w-full" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView 
            className="w-full h-full"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
        >
          <View className="items-center h-full w-full">
            <Image className="h-20 w-1/2 mt-16 mb-20" source={require("~/assets/sign-in/sign_in.png")} resizeMode="contain" />

            <View className="flex items-center flex-row gap-2 justify-center">
              <Image style={{ height: 25 }} source={require("~/assets/sign-in/teamsLogo.png")} resizeMode="contain" />
              <Text className="text-center text-xl text-white">Zapllo Teams</Text>
            </View>

            <InputContainer
              label="Email Address"
              value={userInfo.email}
              onChangeText={(value) => setUserInfo({ ...userInfo, email: value })}
              placeholder="Email Address"
              style={styles.inputSome}
            />
            
            <View className="relative items-center w-full">
              <InputContainer
                label="Password"
                value={userInfo.password}
                onChangeText={handlePasswordValidation}
                placeholder="**********"
                secureTextEntry={!isPasswordVisible}
                style={styles.inputSome}
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
                <View className="flex flex-row gap-2 justify-start w-[82%]  mb-10">
                  <Entypo name="cross" size={18} color={"red"}/>
                  <Text style={{color:"red",fontSize:10}}>
                    {error.password}
                  </Text>
                </View>
              )
            }

            <TouchableOpacity 
              style={{alignSelf:"flex-end", marginRight:"5%",marginTop:7}}
              onPress={()=>router.push("forgot-password" as any)}
            >
              <Text className="text-white font-thin text-sm">Forgot password?</Text>
            </TouchableOpacity>



            <TouchableOpacity
              className={`p-2.5 mt-16 rounded-full w-11/12 h-14 items-center flex justify-center ${isFormValid ? "bg-[#815BF5]" : "bg-[#37384B]"}`}
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

            <View className="w-[90%]">
              <Checkbox
                text="By clicking continue, you agree to our Terms of Service and Privacy Policy."
                isChecked={isChecked}
                onPress={() => setIsChecked(!isChecked)}
                containerStyle={styles.checkBox}
              />
            </View>

            <View style={{display:"flex",flexDirection:"row", gap:2, justifyContent:"flex-end",marginTop:40,alignItems:"center"}}>
              <Text className="text-white font-extralight">Not a</Text>
              <GradientText text="Zapllonian"/>
              <Text className=" text-white font-extralight">? </Text>
              <TouchableOpacity onPress={()=> router.push("/(routes)/signup/pageOne" as any)}>
                <Text className=" text-white ">Register Here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  latoRegularText: {
    fontFamily: 'Lato-Regular',
  },
  latoBoldText: {
    fontFamily: 'Lato-Bold',
  },
  teams:{
    display:"flex",
    flexDirection:"row",
    gap:5,
    alignItems:"center",
    marginBottom:17,
  },
  input:{
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 25,
    
    borderRadius: 35,
    width:"90%",
    height:57,
    position:"relative"
  },
  baseName:{
    color:"white",
    position:"absolute",
    top:-9,
    left:25,
    backgroundColor:"#05071E",
    paddingRight:5,
    paddingLeft:5,
    fontSize:10,
    fontWeight:200
  },
  inputSome:{
    flex:1,
    padding:8,
    color:"#787CA5",
    fontSize:12
  },
  visibleIcon: {
    position: 'absolute',
    right: 30,
    top: 39,
  },
  checkBox:{
    height:100,
    marginBottom:30
  }
})