import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image,  Platform } from "react-native";
import React, { useState, useEffect } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { useNavigation } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { KeyboardAvoidingView } from "react-native";
import InputContainer from "~/components/InputContainer";
import Modal from 'react-native-modal';

export default function BillingScreen() {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('teams');
  const [modalVisible, setModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('5000');
  const [paymentDetailsVisible, setPaymentDetailsVisible] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [gstAmount, setGstAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [messageVisible, setMessageVisible] = useState(false);

  useEffect(() => {
    const amount = parseFloat(rechargeAmount) || 0;
    const gst = amount * 0.18;
    setGstAmount(gst);
    setTotalAmount(amount + gst);
  }, [rechargeAmount]);

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleNextPress = () => {
    const amount = parseFloat(rechargeAmount) || 0;
    if (amount < 5000) {
      setMessageVisible(true);
      setTimeout(() => {
        setMessageVisible(false);
      }, 4000);
    } else {
      setModalVisible(false);
      setTimeout(() => {
        setPaymentDetailsVisible(true);
      }, 700);
    }
  };

  const handleBackPress = () => {
    setPaymentDetailsVisible(false);
    setTimeout(() => {
      setModalVisible(true);
    }, 700);
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
              <TouchableOpacity className="bg-[#815BF5] rounded-full" onPress={() => setModalVisible(true)}>
                <Text className="text-white text-sm py-2 px-5 " style={{ fontFamily: "LatoBold" }}>Recharge Now</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-white text-2xl font-bold" style={{ fontFamily: "LatoBold" }}>₹15,937.55</Text>
              <Text className="text-[13px] text-[#787CA5]">Current Balance</Text>
            </View>
          </View>

          {/* Modal for Recharge */}
          <Modal
            animationIn="slideInUp"
            animationOut="slideOutDown"
            isVisible={modalVisible}
            onBackdropPress={() => setModalVisible(false)}
            style={{ margin: 0, justifyContent: 'flex-end' }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1, justifyContent: 'flex-end' }}>
              <View className="rounded-t-3xl bg-[#0A0D28] p-5">
                <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
                  <Text className="text-xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>Recharge Wallet</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
                  </TouchableOpacity>
                </View>

                <InputContainer
                  label="Amount"
                  value={rechargeAmount}
                  onChangeText={setRechargeAmount}
                  keyboardType="numeric"
                  passwordError={false}
                />
                 <Text className="text-white text-xs ml-5 mb-5"style={{ fontFamily: 'LatoLight' }}>Recharge Amount (minimum ₹5000)</Text>    
                 <TouchableOpacity className="w-full items-center bg-[#017A5B] p-4 rounded-full mb-4" onPress={handleNextPress}>
                  <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>Next</Text>
                  </TouchableOpacity>           
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Modal for Payment Details */}
          <Modal
            animationIn="slideInUp"
            animationOut="slideOutDown"
            isVisible={paymentDetailsVisible}
            onBackdropPress={() => setPaymentDetailsVisible(false)}
            style={{ margin: 0, justifyContent: 'flex-end' }}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1, justifyContent: 'flex-end' }}>
              <View className="rounded-t-3xl bg-[#0A0D28] p-5">
                <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
                  <Text className="text-xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>Payment Details</Text>
            
                </View>
                <View className="flex gap-3 mb-3 mt-5"> 
                  <Text className="text-white text-sm" style={{ fontFamily: 'Lato' }}>Amount (excluding GST) = INR {parseFloat(rechargeAmount).toFixed(2)}</Text>
                  <Text className="text-white text-sm" style={{ fontFamily: 'Lato' }}>GST (18%) = INR {gstAmount.toFixed(2)}</Text>
                  <Text className="text-white text-sm" style={{ fontFamily: 'Lato' }}>Total Amount (including GST) = INR {totalAmount.toFixed(2)}</Text>
                </View>
                <InputContainer
                  label="Enter GST Number(Optional):"
                  value={gstNumber}
                  onChangeText={setGstNumber}
                  keyboardType="default"
                  passwordError={false}
                />
                <View className="flex items-center  gap-5 flex-row justify-center mt-8 mb-4">
                  <TouchableOpacity className="bg-[#6b7280] p-4 w-1/3 rounded-md items-center" onPress={handleBackPress}>
                    <Text className="text-white text-sm " style={{ fontFamily: 'LatoBold' }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="bg-[#017A5B] p-4 rounded-md items-center w-1/2">
                    <Text className="text-white text-sm " style={{ fontFamily: 'LatoBold' }}>Proceed to Payment</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>

          {/* Message Modal for Minimum Amount */}
          <Modal
            isVisible={messageVisible}
            animationIn="fadeIn"
            animationOut="fadeOut"
            backdropOpacity={0.3}
            style={{ justifyContent: 'flex-start', margin: 0 }}
          >
            <View style={styles.messageModal}>
              <Text style={styles.messageText}>Recharge amount must be at least: ₹5000</Text>
            </View>
          </Modal>

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
  messageModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  messageText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
});