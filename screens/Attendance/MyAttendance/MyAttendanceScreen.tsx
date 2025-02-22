import { StyleSheet, Text, View,SafeAreaView,KeyboardAvoidingView, Keyboard } from "react-native";
import React from "react";
import { ScrollView } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import Navbar from "~/components/navbar";
import GradientButton from "~/components/GradientButton";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function MyAttendanceScreen() {
  return (
    <SafeAreaView className="h-full flex-1 bg-primary ">
      <Navbar title="My Attendance" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center',paddingBottom:80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className=" items-start w-[90%] mt-7 mb-8">
              <Text className="text-[#787CA5] text-2xl">You're Logged In</Text>
              <Text className="text-white text-lg ">3:30 min</Text>
            </View>

            <GradientButton
            title="Log Out"
            imageSource={""}
            />

            <View className="flex flex-col items-start  w-[90%] mt-11">
                <View className="h-14 flex flex-row gap-2 items-center justify-center relative">
                      <Image
                      className="w-12 h-52 mt-4 object-scale-down"
                      source={require("../../../assets/Attendence/right.png")}
                      />
                    <View className="flex flex-col items-start">
                      <Text className="text-white text-lg">8.30 AM</Text>
                      <Text className="text-[#787CA5] text-sm">Login - Work From Office</Text>
                    </View>
                </View> 

                <View className="h-20 w-0.5 bg-[#37384B] ml-5"></View>

                <View className="h-14 flex flex-row gap-2 items-center justify-center relative">
                  <Image
                  className="w-12 h-52 mt-4 object-scale-down"
                  source={require("../../../assets/Attendence/breakStart.png")}
                  />
                 <View className="flex flex-col items-start">
                  <Text className="text-white text-lg">1:25 PM</Text>
                  <Text className="text-[#787CA5] text-sm">Break Started - Work From Office</Text>
                 </View>
                </View>    
                

                <View className="h-20 w-0.5 bg-[#37384B] ml-5"></View>
                
                <View className="h-14 flex flex-row gap-2 items-center justify-center relative">
                  <Image
                  className="w-12 h-52 mt-4 object-scale-down"
                  source={require("../../../assets/Attendence/breakEnd.png")}
                  />
                 <View className="flex flex-col items-start">


                    <View className="flex flex-row gap-2 items-center">
                      <Text className="text-white text-lg">8.30 AM</Text>
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}                      
                        colors={['#815BF5', '#FC8929']}
                        style={styles.gradientBorder}
                      >
                        <View className="bg-[#0A0D28] items-center rounded-xl p-1">
                          <Text className="text-white">On Break</Text>
                        </View>
                      </LinearGradient>
                    </View>
                 
                  
                  <Text className="text-[#787CA5] text-sm">Break Ended - Work From Office</Text>
                 </View>
                </View>    

                <View className="h-20 w-0.5 bg-[#37384B] ml-5"></View>
                
                <View className="h-14 flex flex-row gap-2 items-center justify-center relative">
                  <Image
                  className="w-12 h-52 mt-4 object-scale-down"
                  source={require("../../../assets/Attendence/chaeckOut.png")}
                  />
                 <View className="flex flex-col items-start">
                  <Text className="text-white text-lg">8.30 AM</Text>
                  <Text className="text-[#787CA5] text-sm">Check Out - Work From Office</Text>
                 </View>
                </View>    
        
            </View>







            
              

            
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: 10,
    padding: 1 ,
  },
});
