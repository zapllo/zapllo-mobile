import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, Image, Platform, Linking, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { router, useNavigation } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { KeyboardAvoidingView } from "react-native";
import InputContainer from "~/components/InputContainer";
import Modal from 'react-native-modal';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { WebView } from 'react-native-webview';
import CustomDropdown from "~/components/customDropDown";
import { AntDesign } from "@expo/vector-icons";

const planFeatures: Record<string, string[]> = {
  "Zapllo Tasks": [
    "Delegate Unlimited Tasks",
    "Team Performance Reports",
    "Links Management for Your Team",
    "Email Notifications",
    "WhatsApp Notifications",
  ],
  "Money Saver Bundle": [
    "Includes Zapllo Tasks + Payroll",
    "Automated Salary Processing",
    "Attendance & Leave Management",
    "Email Notifications",
    "WhatsApp Notifications",
  ],
};



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
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [subscribeModalVisible, setSubscribeModalVisible] = useState(false);
  const [addUsersModalVisible, setAddUsersModalVisible] = useState(false);
  const [paymentDetailedSubscriptionModalVisible, setPaymentDetailedSubscriptionModalVisible] = useState(false);
  const [paymentDetailsAddUsersModalVisible, setPaymentDetailsAddUsersModalVisible] = useState(false);
  const [totalUsers, setTotalUsers] = useState(5);
  const [showBackendView, setShowBackendView] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.userData);
  const [subscribedPlan, setSubscribedPlan] = useState('');
  const [subscribedUserCount, setSubscribedUserCount] = useState(0);
  const [renewsOn, setRenewsOn] = useState('');
  const [additionalUsers, setAdditionalUsers] = useState(5);
  const [selectedPlanForUsers, setSelectedPlanForUsers] = useState('');
  const [selectedPlanForSubscription, setSelectedPlanForSubscription] = useState('');
  const [paymentBack, setpaymentBack] = useState(false);
  


  const handleAddUsers = () => {
    setSelectedPlanForUsers(subscribedPlan); // Keep the existing subscribed plan
    setAddUsersModalVisible(true);
  };



  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        const response = await axios.get('https://zapllo.com/api/organization/getById');
        if (response.data.data) {
          setSubscribedPlan(response.data.data.subscribedPlan);
          setSubscribedUserCount(response.data.data.subscribedUserCount);
          setRenewsOn(response.data.data.subscriptionExpires);
        }
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      }
    };

    fetchSubscriptionDetails();
  }, []);

  const totalUsersOptions = Array.from({ length: 20 }, (_, i) => ({
    label: `${(i + 1) * 5}`,
    value: (i + 1) * 5,
  }));

  useEffect(() => {
    const amount = parseFloat(rechargeAmount) || 0;
    const gst = amount * 0.18;
    setGstAmount(gst);
    setTotalAmount(amount + gst);
  }, [rechargeAmount]);

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (option === 'teams') {
      setShowBackendView(true);
    } else {
      setShowBackendView(false);
    }
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

  const handleSubscribe = (planName: string) => {
    setSelectedPlanForSubscription(planName); // Only store for the subscription modal
    setSubscribeModalVisible(true);
  };


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    const getOrdinalSuffix = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };


  const handleSubscribedNext = () => {
    
    setSubscribeModalVisible(false);
    setTimeout(() => {
      setPaymentDetailedSubscriptionModalVisible(true);
    }, 700);
  };

  const handleUserModal = ()=>{
    setAddUsersModalVisible(false);
    setTimeout(() => {
      setPaymentDetailsAddUsersModalVisible(true);
    }, 700);
  }

  const handleBackPress = () => {
    setPaymentDetailsVisible(false);
    setTimeout(() => {
      setModalVisible(true);
    }, 700);
  };

  const handleBackPressForSubscription = () => {
    setPaymentDetailedSubscriptionModalVisible(false);
    setTimeout(() => {
      setSubscribeModalVisible(true);
    }, 700);
  };

  const handleBackPressAddUsersModalSubscription = () => {
    setPaymentDetailsAddUsersModalVisible(false);
    setTimeout(() => {
      setAddUsersModalVisible(true);
    }, 700);
  };

  const handlePayment = async () => {
    try {
      setPaymentDetailsVisible(false);

      const orderData = {
        amount: Math.round(totalAmount * 100), // Total amount including GST in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`, // Generate unique receipt ID
        notes: {
          customer: `${currentUser?.firstName} ${currentUser?.lastName}`,
          email: currentUser?.email,
        },
      };

      // Create order
      const response = await axios.post('https://zapllo.com/api/create-order', orderData);

      if (response.data.orderId) {
        const paymentUrl = `https://zapllo.com/payment?orderId=${response.data.orderId}&amount=${orderData.amount}`;
        setPaymentUrl(paymentUrl);
        setShowWebView(true);
      } else {
        throw new Error('Order ID not found in the response');
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert("Error", "There was an issue processing your payment. Please try again.");
    }
  };



  const handlePaymentForSubscription = async () => {
    try {
      setPaymentDetailedSubscriptionModalVisible(false);

      const subscriptionCost = totalUsers * 1999; // Cost for the selected number of users
      const gst = subscriptionCost * 0.18; // Calculate GST
      const totalPayable = subscriptionCost + gst; // Total amount including GST

      const orderData = {
        amount: Math.round(totalPayable * 100), // Total amount including GST in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`, // Generate unique receipt ID
        notes: {
          customer: `${currentUser?.firstName} ${currentUser?.lastName}`,
          email: currentUser?.email,
        },
      };

      const response = await axios.post('https://zapllo.com/api/create-order', orderData);

      if (response.data.orderId) {
        const paymentUrl = `https://zapllo.com/payment?orderId=${response.data.orderId}&amount=${orderData.amount}`;
        setPaymentUrl(paymentUrl);
        setShowWebView(true);
      } else {
        throw new Error('Order ID not found in the response');
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert("Error", "There was an issue processing your payment. Please try again.");
    }
  };


  const handlePaymentForAddUserSubscription = async () => {
    try {
      setPaymentDetailsAddUsersModalVisible(false);

      const subscriptionCost = additionalUsers * 2999; // Cost for the selected number of users
      const gst = subscriptionCost * 0.18; // Calculate GST
      const totalPayable = subscriptionCost + gst; // Total amount including GST

      const orderData = {
        amount: Math.round(totalPayable * 100), // Total amount including GST in paise
        currency: 'INR',
        receipt: `order_${Date.now()}`, // Generate unique receipt ID
        notes: {
          customer: `${currentUser?.firstName} ${currentUser?.lastName}`,
          email: currentUser?.email,
        },
      };

      const response = await axios.post('https://zapllo.com/api/create-order', orderData);

      if (response.data.orderId) {
        const paymentUrl = `https://zapllo.com/payment?orderId=${response.data.orderId}&amount=${orderData.amount}`;
        setPaymentUrl(paymentUrl);
        setShowWebView(true);
      } else {
        throw new Error('Order ID not found in the response');
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert("Error", "There was an issue processing your payment. Please try again.");
    }
  };


  return (
    <SafeAreaView className="h-full w-full flex-1 bg-[#05071E] ">
     {showWebView ? (
      <SafeAreaView style={{flex:1}} className=" relative h-full w-full flex-1 bg-[#05071E] ">
      <View className="flex absolute z-20 left-4 top-1 h-[45px] w-[45px] bg-[#05071E] items-center justify-center rounded-full">
        <TouchableOpacity onPress={() => setpaymentBack(true)}>
          <AntDesign name="arrowleft" size={24} color="#ffffff"  />
        </TouchableOpacity>
      </View>
      
        <WebView
          source={{ html: `
            <!DOCTYPE html>
            <html>
              <head>
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
              </head>
              <body>
                <script>
                  var options = {
                    "key": ${process.env.RAZOR_PAY_LIVE_KEY}, 
                    "amount": "${totalAmount * 100}", // Amount in paise
                    "currency": "INR",
                    "name": "Zapllo",
                    "description": "Payment for Recharge",
                    "order_id": "${paymentUrl.split('orderId=')[1].split('&')[0]}", // Extract order ID from URL
                    "handler": function (response) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', response: response }));
                    },
                    "theme": {
                      "color": "#04061E"
                    }
                  };
                  var rzp1 = new Razorpay(options);
                  rzp1.open();
                </script>
              </body>
            </html>
          ` }}
         
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.status === 'success') {
              Alert.alert("Payment Successful", "Your payment has been processed successfully.", [
                { text: "OK", onPress: () => router.push("/(routes)/profile/billing") },
              ]);
              setShowWebView(false);
            } else {
              Alert.alert("Payment Failed", "There was an issue processing your payment.");
              setShowWebView(false);
            }
          }}
          onNavigationStateChange={(navState) => {
            if (navState.canGoBack) {
              setShowWebView(false);
            }
          }}
        />

          <Modal
            isVisible={paymentBack}
            onBackdropPress={() => setpaymentBack(false)}
            style={{ margin: 0, justifyContent: 'flex-end' }}
            animationIn="slideInUp"
            animationOut="slideOutDown">
            <View className="mb-10 mt-2 flex w-full flex-col items-center justify-center">
              <View className=" mb-2 w-[95%]  items-center rounded-2xl bg-[#14173b] p-4 ">
                <TouchableOpacity
                onPress={() => setpaymentBack(false)}
                  
                  className="w-full items-center rounded-2xl  ">
                  <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                    Stay here
                  </Text>
                </TouchableOpacity>
                
              </View>

              <TouchableOpacity
                className=" mt-3 w-[95%] items-center rounded-2xl bg-[#14173b] p-3 "
                onPress={() => router.back()}>
                <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                  Back to Zapllo
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>        
      </SafeAreaView>

      ) : (
        <ScrollView
          className="h-full w-full flex-grow "
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <NavbarTwo
            title="Billing"
            
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
                <TouchableOpacity 
                  className="bg-white rounded-3xl p-2 px-5"
                  onPress={() => Linking.openURL('https://api.whatsapp.com/send/?phone=%2B918910748670&text=Hello%2C+I+would+like+to+connect.&type=phone_number&app_absent=0')}
                >
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
                <Text className="text-white text-2xl font-bold" style={{ fontFamily: "LatoBold" }}>₹{currentBalance.toFixed(2)}</Text>
                <Text className="text-[13px] text-[#787CA5]">Current Balance</Text>
              </View>
            </View>
            {/* Modal for  recharge */}
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
                    backgroundColor="#0A0D28"
                  />
                  <Text className="text-white text-xs ml-5 mb-5" style={{ fontFamily: 'LatoLight' }}>Recharge Amount (minimum ₹5000)</Text>
                  <TouchableOpacity className="w-full items-center bg-[#017A5B] p-4 rounded-full mb-4" onPress={handleNextPress}>
                    <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>Next</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </Modal>

            {/* Modal for Payment Details for recharge */}
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
                    backgroundColor="#0A0D28"
                  />
                  <View className="flex items-center gap-5 flex-row justify-center mt-8 mb-4">
                    <TouchableOpacity
                      className="bg-[#6b7280] p-4 w-1/3 rounded-md items-center"
                      onPress={handleBackPress}
                    >
                      <Text className="text-white text-sm" style={{ fontFamily: 'LatoBold' }}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="bg-[#017A5B] p-4 rounded-md items-center w-1/2"
                      onPress={handlePayment}
                    >
                      <Text className="text-white text-sm" style={{ fontFamily: 'LatoBold' }}>Proceed to Payment</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </Modal>

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

            {selectedOption === 'teams' ? (
              <View className="w-full items-center mt-2">
                {["Zapllo Tasks", "Money Saver Bundle"].map((planName) => (
                  planName === "Money Saver Bundle" ? (
                    <LinearGradient
                      key={planName}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      colors={["#815BF5", "#FC8929"]}
                      style={{
                        width: '90%',
                        borderRadius: 24,
                        marginTop: 40,
                        marginBottom: 16,
                        padding: 3,
                      }}
                    >
                      <View
                        style={{
                          width: '100%',
                          padding: 24,
                          borderRadius: 21,
                          backgroundColor: subscribedPlan === planName ? "#000000" : "#0A0D28"
                        }}
                      >
                        <Text className="text-white text-lg font-bold mb-7">{planName}</Text>
                        <View className="flex flex-row items-end gap-3">
                          <Text className="text-white text-5xl">
                            ₹{planName === "Zapllo Tasks" ? "1999" : "2999"}
                          </Text>
                          <Text className="text-[#676B93] pb-1 text-sm"> / per user per year</Text>
                        </View>

                        {/* Feature List */}
                        <View className="w-full flex flex-col gap-4 mt-4">
                          {planFeatures[planName].map((feature: string, index: number) => (
                            <View key={index} className="flex flex-row items-center gap-2">
                              <Image className="w-6 h-6" source={require("../../../assets/Billing/right.png")} />
                              <Text className="text-white">{feature}</Text>
                            </View>
                          ))}
                        </View>

                        {subscribedPlan === planName ? (
                          <View>
                            <Text className="text-white mt-4">Subscribed Users: {subscribedUserCount}</Text>
                            <Text className="text-white mt-2">Renews On: {formatDate(renewsOn)}</Text>
                            <TouchableOpacity
                              className="w-full my-9 rounded-full py-4 items-center border border-[#A485FF]"
                              onPress={handleAddUsers} // Add users to existing subscription
                            >
                              <Text className="text-white">Add Users</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            className="w-full my-9 rounded-full py-4 items-center border border-[#A485FF]"
                            onPress={() => handleSubscribe(planName)} // Subscribe to a new plan
                          >
                            <Text className="text-white">Subscribe</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </LinearGradient>
                  ) : (
                    <View
                      key={planName}
                      className={`w-[90%] p-6 rounded-3xl mt-10 mb-4 ${subscribedPlan === planName ? "bg-black" : "bg-[#0A0D28]"
                        }`}
                    >
                      <Text className="text-white text-lg font-bold mb-7">{planName}</Text>
                      <View className="flex flex-row items-end gap-3">
                        <Text className="text-white text-5xl">
                          ₹{planName === "Zapllo Tasks" ? "1999" : "2999"}
                        </Text>
                        <Text className="text-[#676B93] pb-1 text-sm"> / per user per year</Text>
                      </View>

                      {/* Feature List */}
                      <View className="w-full flex flex-col gap-4 mt-4">
                        {planFeatures[planName].map((feature: string, index: number) => (
                          <View key={index} className="flex flex-row items-center gap-2">
                            <Image className="w-6 h-6" source={require("../../../assets/Billing/right.png")} />
                            <Text className="text-white">{feature}</Text>
                          </View>
                        ))}
                      </View>

                      {subscribedPlan === planName ? (
                        <View>
                          <Text className="text-white mt-4">Subscribed Users: {subscribedUserCount}</Text>
                          <Text className="text-white mt-2">Renews On: {formatDate(renewsOn)}</Text>
                          <TouchableOpacity
                            className="w-full my-9 rounded-full py-4 items-center border border-[#A485FF]"
                            onPress={handleAddUsers} // Add users to existing subscription
                          >
                            <Text className="text-white">Add Users</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          className="w-full my-9 rounded-full py-4 items-center border border-[#A485FF]"
                          onPress={() => handleSubscribe(planName)} // Subscribe to a new plan
                        >
                          <Text className="text-white">Subscribe</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )
                ))}
              </View>
            ) : (
              <View className="w-[90%] shadow-xl bg-[#0A0D28] p-6 rounded-3xl mt-10 mb-32">
              <Text className="text-white mb-7" style={{ fontFamily: "LatoBold" }}>Zapllo CRM</Text>
              <View className="flex flex-row items-end gap-3">
                <Text className="text-white text-5xl" style={{ fontFamily: "LatoBold" }}>₹2999</Text>
                <Text className="text-[#676B93] text-sm pb-1" style={{ fontFamily: "LatoBold" }}>  / per user per year</Text>
              </View>
              <Text className="text-white mt-7" style={{ fontFamily: "LatoBold" }}>Manage your Tasks like a pro</Text>
              <TouchableOpacity className="w-full my-9 rounded-full py-4 items-center justify-center border border-[#A485FF]" >
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>coming soon</Text>
              </TouchableOpacity>
              <View className="w-full bg-[#424882] h-0.5 "></View>
            </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal for MONEY SAVER 2999*/}
      <Modal
              isVisible={addUsersModalVisible}
              onBackdropPress={() => setAddUsersModalVisible(false)}
              animationIn="fadeIn"
              animationOut="fadeOut"
              backdropOpacity={0.3}
              style={{ justifyContent: "flex-start", margin: 0 }}
            >
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end" }}>
                <View className="rounded-t-3xl bg-[#0A0D28] p-5">
                  <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
                    <Text className="text-xl font-semibold text-white">
                      Add Users to {selectedPlanForUsers}
                    </Text>
                    <TouchableOpacity onPress={() => setAddUsersModalVisible(false)}>
                      <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
                    </TouchableOpacity>
                  </View>

                  {/* Display correct user count updates */}
                  <Text className="text-white text-sm mb-4">
                    You had <Text className="font-bold">{subscribedUserCount}</Text> users, adding
                    <Text className="font-bold"> {additionalUsers}</Text> more will result in
                    <Text className="font-bold"> {subscribedUserCount + additionalUsers}</Text>.
                  </Text>
                  <Text className="text-white text-sm mb-4">
                    Payment will be for <Text className="font-bold">{additionalUsers}</Text> new users.
                  </Text>

                  {/* Dropdown to select additional users */}
                  <CustomDropdown
                    data={totalUsersOptions}
                    placeholder="Select Additional Users"
                    selectedValue={additionalUsers}
                    onSelect={(value) => setAdditionalUsers(value)}
                  />

                  <TouchableOpacity className="w-full items-center bg-[#017A5B] p-4 rounded-full mt-5 mb-5" onPress={handleUserModal}>
                    <Text className="text-white">Next</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
      </Modal>
      {/* 2999 subscicpction details */}
      <Modal
        isVisible={paymentDetailsAddUsersModalVisible}
        onBackdropPress={() => setPaymentDetailsAddUsersModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.3}
        style={{ justifyContent: 'flex-start', margin: 0 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View className="rounded-t-3xl bg-[#0A0D28] p-5">
            <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                Payment Details
              </Text>
              <TouchableOpacity onPress={() => setPaymentDetailsAddUsersModalVisible(false)}>
                <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-col mt-3">
              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                Amount (excluding GST) = ₹{(additionalUsers * 2999).toFixed(2)}
              </Text>

              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                Total Discount Applicable = ₹0
              </Text>

              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                Payable (excluding GST) = ₹{(additionalUsers * 2999).toFixed(2)}
              </Text>

              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                GST (18%) = ₹{((additionalUsers * 2999) * 0.18).toFixed(2)}
              </Text>

              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                Total Payable = ₹{((additionalUsers * 2999) + (additionalUsers * 2999 * 0.18)).toFixed(2)}
              </Text>
            </View>

            <InputContainer
              label="Enter GST Number(Optional):"
              value={gstNumber}
              onChangeText={setGstNumber}
              keyboardType="default"
              passwordError={false}
              backgroundColor="#0A0D28"
            />
            <View className="flex items-center gap-5 flex-row justify-center mt-8 mb-4">
              <TouchableOpacity
                className="bg-[#6b7280] p-4 w-1/3 rounded-md items-center"
                onPress={handleBackPressAddUsersModalSubscription}
              >
                <Text className="text-white text-sm" style={{ fontFamily: 'LatoBold' }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#017A5B] p-4 rounded-md items-center w-1/2"
                onPress={handlePaymentForAddUserSubscription}
              >
                <Text className="text-white text-sm" style={{ fontFamily: 'LatoBold' }}>Proceed to Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Modal for 1999 subscicpction*/}
      <Modal
        isVisible={subscribeModalVisible}
        onBackdropPress={() => setSubscribeModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.3}
        style={{ justifyContent: 'flex-start', margin: 0 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View className="rounded-t-3xl bg-[#0A0D28] p-5">
            <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                Zapllo Tasks Plan
              </Text>
              <TouchableOpacity onPress={() => setSubscribeModalVisible(false)}>
                <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
              </TouchableOpacity>
            </View>

            <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
              This plan costs ₹1999 per user per year.
            </Text>

            <CustomDropdown
              data={totalUsersOptions}
              placeholder="Select Total Users"
              selectedValue={totalUsers}
              onSelect={(value) => setTotalUsers(value)}
            />
            <Text className="text-white text-xs ml-5 mb-5" style={{ fontFamily: 'LatoLight' }}>
              Total Subscribed Users = {totalUsers} (Adding {totalUsers} users)
            </Text>
            <TouchableOpacity className="w-full items-center bg-[#017A5B] p-4 rounded-full mb-4" onPress={handleSubscribedNext}>
              <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>Next</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* 1999 subscicpction details */}
      <Modal
        isVisible={paymentDetailedSubscriptionModalVisible}
        onBackdropPress={() => setPaymentDetailedSubscriptionModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropOpacity={0.3}
        style={{ justifyContent: 'flex-start', margin: 0 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View className="rounded-t-3xl bg-[#0A0D28] p-5">
            <View className="mb-4 mt-2 flex w-full flex-row items-center justify-between">
              <Text className="text-xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                Payment Details
              </Text>
              <TouchableOpacity onPress={() => setPaymentDetailedSubscriptionModalVisible(false)}>
                <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-col mt-3">
              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                Amount (excluding GST) = ₹{(totalUsers * 1999).toFixed(2)}
              </Text>

              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                Total Discount Applicable = ₹0
              </Text>

              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                Payable (excluding GST) = ₹{(totalUsers * 1999).toFixed(2)}
              </Text>

              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                GST (18%) = ₹{((totalUsers * 1999) * 0.18).toFixed(2)}
              </Text>

              <Text className="text-white mb-4 mt-2 text-sm" style={{ fontFamily: 'LatoBold' }}>
                Total Payable = ₹{((totalUsers * 1999) + (totalUsers * 1999 * 0.18)).toFixed(2)}
              </Text>
            </View>

            <InputContainer
              label="Enter GST Number(Optional):"
              value={gstNumber}
              onChangeText={setGstNumber}
              keyboardType="default"
              passwordError={false}
              backgroundColor="#0A0D28"
            />
            <View className="flex items-center gap-5 flex-row justify-center mt-8 mb-4">
              <TouchableOpacity
                className="bg-[#6b7280] p-4 w-1/3 rounded-md items-center"
                onPress={handleBackPressForSubscription}
              >
                <Text className="text-white text-sm" style={{ fontFamily: 'LatoBold' }}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#017A5B] p-4 rounded-md items-center w-1/2"
                onPress={handlePaymentForSubscription}
              >
                <Text className="text-white text-sm" style={{ fontFamily: 'LatoBold' }}>Proceed to Payment</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
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