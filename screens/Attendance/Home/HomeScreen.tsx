import { Image, Keyboard, KeyboardAvoidingView, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View,Dimensions } from "react-native";
import React from "react";
import Navbar from "~/components/navbar";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const screenWidth = Dimensions.get('window').width;
  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <Navbar title="Attendance" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View className=" w-full items-center flex gap-8 mt-14 mb-20 ">
                <Text className="text-white text-3xl"style={{fontFamily:"LatoBold"}}>10:00 AM</Text>
                <Text className="text-white mb-8"style={{fontFamily:"LatoBold"}}>Jan 22, 2025 - Wednesday</Text>
                <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    colors={["#815BF5", "#3F16BD"]}
                    style={styles.gradientBorderOne} 
                                  
                >
                  <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      colors={["#3F16BD", "#815BF5"]}  
                      style={styles.gradientBorderTwo}              
                  >
                    <TouchableOpacity
                    className=" w-52 h-52 rounded-full items-center"
                    >
                        <LinearGradient
                        start={{ x: 0, y:0 }}
                        end={{ x: 1, y: 0 }}
                        colors={["#0A0D28", "#37384B"]}
                        style={styles.gradientButton}
                        >
                            <Image style={{objectFit:"scale-down"}} className="h-28 w-32" source={require("../../../assets/Attendence/tap.png")}/>
                            <Text className="text-white text-lg" style={{fontFamily:"LatoBold"}}>Log Out</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                  
                  </LinearGradient>                  

                </LinearGradient>



            </View>
            <View className="bg-[#10122d] h-full rounded-t-3xl flex items-center p-5 pb-16 ">
               <Text className="text-white p-2 text-xl w-full" style={{fontFamily:"LatoBold"}}>Today’s Logs</Text>
              <View className=" m-6 mt-8 flex items-center  justify-around flex-row  w-full">

                <View className=" w-1/3 flex flex-col gap-3 items-center ">
                  <Image className="w-8 h-8" source={require("../../../assets/Attendence/clockWhite.png")}/>
                  <Text className={`text-white  font-bold ${
                    screenWidth < 300 ? "text-2xl" : "text-xl"
                  }`}style={{fontFamily:"LatoBold"}} >09:00 AM</Text>
                  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock In</Text>
                </View>

                <View className="w-1/3  flex flex-col gap-3 items-center ">
                  <Image className="w-8 h-8" source={require("../../../assets/Attendence/clockGray.png")}/>
                  <Text className={`text-white  font-bold ${
                    screenWidth < 300 ? "text-2xl" : "text-xl"
                  }`} style={{fontFamily:"LatoBold"}}>--:--</Text>
                  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock Out</Text>
                </View>

                <View className="w-1/3  flex flex-col gap-3 items-center ">
                  <Image className="w-8 h-8" source={require("../../../assets/Attendence/hours.png")}/>
                  <Text 
                  
                  className={`text-white  font-bold ${
                    screenWidth < 300 ? "text-2xl" : "text-xl"
                  }`} style={{fontFamily:"LatoBold"}}>--:--</Text>
                  <Text className="text-[#787CA5] text-sm" style={{fontFamily:"LatoBold"}}>Clock Out</Text>
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
  gradientBorderOne:{
    borderRadius: 1000,
    width:228,
    height:228,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    
  },
  gradientBorderTwo:{
    borderRadius: 1000,
    width:202,
    height:202,
    display:"flex",
    alignItems:"center",
    justifyContent:"center"
    
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    borderRadius: 1000,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    gap:"3",
    
  },
  
});
