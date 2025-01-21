import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { useNavigation } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function BillingScreen() {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('teams');

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <SafeAreaView className="h-full w-full flex-1 bg-[#05071E] ">
      <ScrollView
        className="h-full w-full flex-grow "
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        {/* Navbar */}
        <NavbarTwo
          title="Billing"
          onBackPress={() => navigation.goBack()}
        />

        <View className="w-full my-6">
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={["#815BF5", "#FC8929"]}
            className="w-full"
          >
            <View className="w-full flex flex-row items-center my-4 justify-center gap-4">
              <Text className="text-white text-lg" style={{ fontFamily: "LatoBold" }}>Connect with our team</Text>
              <TouchableOpacity className="bg-white rounded-3xl p-2 px-5">
                <Text className="text-black text-xs" style={{ fontFamily: "LatoBold" }}>Connect Now</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View className="w-full items-center mt-2">
          <View className="p-5 border border-[#37384B] rounded-3xl w-[90%]">
            <View className="flex flex-row justify-between items-center mb-6">
              <Image className="h-12 w-12" source={require("../../../assets/Billing/walet.png")} />
              <TouchableOpacity className="bg-[#815BF5] rounded-full">
                <Text className="text-white text-sm py-2 px-5 " style={{ fontFamily: "LatoBold" }}>Recharge Now</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-white text-2xl font-bold" style={{ fontFamily: "LatoBold" }}>₹15,937.55</Text>
              <Text className="text-[13px] text-[#787CA5]">Current Balance</Text>
            </View>
          </View>

          {/* Toggle between Teams and Plans */}
          <View className="items-center border border-[#676B93] w-[70%] px-1.5 py-1.5 rounded-full mt-9">
            <View className="w-full flex flex-row items-center justify-between">
              <TouchableOpacity
                className="w-1/2 items-center"
                onPress={() => handleOptionPress('teams')}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={selectedOption === 'teams' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                  style={styles.tablet}
                >
                  <Text className={`text-sm  ${selectedOption === 'teams' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Zapllo Teams</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-1/2 items-center"
                onPress={() => handleOptionPress('plans')}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={selectedOption === 'plans' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                  style={styles.tablet}
                >
                  <Text className={`text-sm  ${selectedOption === 'plans' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Zapllo Plans</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View className=" w-[90%] bg-[#0A0D28] p-6 rounded-3xl mt-10 mb-32">
            <Text className="text-white mb-7"style={{ fontFamily: "LatoBold" }}>Zapllo tasks</Text>
          <View className="flex flex-row items-end gap-3">
            <Text className="text-white text-5xl"style={{ fontFamily: "LatoBold" }}>₹1999
            </Text>
            <Text className="text-[#676B93] pb-1"style={{ fontFamily: "LatoBold" }}> / per user per year
            </Text>
          </View>
          <Text className="text-white mt-7 "style={{ fontFamily: "LatoBold" }}>Manage your Tasks like a pro
          </Text>
          <TouchableOpacity className="w-full my-9 rounded-full py-4 items-center justify-center border border-[#A485FF]">
            <Text className="text-white " style={{ fontFamily: "LatoBold" }}>Subscribe</Text>
          </TouchableOpacity>

          <View className="w-full bg-[#424882] h-0.5 mb-9"></View>

          <View className="w-full flex flex-col gap-8">
            <Text className="text-white my-2 " style={{ fontFamily: "LatoBold" }}>Task Delegation App</Text>
            <View className="flex items-center flex-row gap-2">
              <Image className="w-6 h-6" source={require("../../../assets/Billing/right.png")}/>
              <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Delegate Unlimited Tasks</Text>
            </View>
            <View className="flex items-center flex-row gap-2">
              <Image className="w-6 h-6" source={require("../../../assets/Billing/right.png")}/>
              <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Team Performance Report</Text>
            </View>
            <View className="flex items-center flex-row gap-2">
              <Image className="w-6 h-6" source={require("../../../assets/Billing/right.png")}/>
              <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Links Management for Your Team</Text>
            </View>
            <View className="flex items-center flex-row gap-2">
              <Image className="w-6 h-6" source={require("../../../assets/Billing/right.png")}/>
              <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Email Notification</Text>
            </View>
            <View className="flex items-center flex-row gap-2">
              <Image className="w-6 h-6" source={require("../../../assets/Billing/right.png")}/>
              <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Whats App Notification</Text>
            </View>
          </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});