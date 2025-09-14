import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import NavbarTwo from '~/components/navbarTwo';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import CustomAlert from '~/components/CustomAlert/CustomAlert';

const { width } = Dimensions.get('window');

interface UsageData {
  date: string;
  usage: number;
}

interface UsageDetails {
  taskId: string;
  taskName: string;
  date: string;
  credits: number;
}

export default function AiCreditsScreen() {
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const [aiCredits, setAiCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [usageDetails, setUsageDetails] = useState<UsageDetails[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'usage' | 'transactions'>('usage');
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<'success' | 'error' | 'loading'>('success');
  const [gstNumber, setGstNumber] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentBack, setPaymentBack] = useState(false);
  const [isGstFocused, setIsGstFocused] = useState(false);

  const rechargePackages = [
    { amount: 100, label: 'Basic', description: 'Get started with basic AI tasks' },
    { amount: 200, label: 'Standard', description: 'For regular AI usage' },
    { amount: 500, label: 'Pro', description: 'For power users and teams' },
    { amount: 1000, label: 'Enterprise', description: 'Full-scale AI automation' },
  ];

  useEffect(() => {
    fetchAiCreditsData();
  }, []);

  const fetchAiCreditsData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch AI credits
      const creditsRes = await axios.get(`${backend_Host}/organization/ai-credits`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (creditsRes.data.success) {
        setAiCredits(creditsRes.data.aiCredits);
      }

      // Fetch usage history
      const usageRes = await axios.get(`${backend_Host}/ai-credits/history?type=usage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usageRes.data.success) {
        setUsageDetails(usageRes.data.data.map((item: any) => ({
          taskId: item.taskId || 'N/A',
          taskName: item.task || 'AI Task',
          date: item.date,
          credits: item.credits
        })));
      }

      // Fetch transaction history
      const transactionsRes = await axios.get(`${backend_Host}/ai-credits/history?type=recharge`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (transactionsRes.data.success) {
        setRecentTransactions(transactionsRes.data.data.map((tx: any) => ({
          id: tx.transactionId,
          amount: tx.credits,
          date: tx.date,
          status: 'completed'
        })));
      }
    } catch (error) {
      console.error('Error fetching AI credits data:', error);
      setCustomAlertVisible(true);
      setCustomAlertMessage('Failed to load AI credits data');
      setCustomAlertType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecharge = () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    
    if (amount < 100) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Minimum recharge amount is 100 credits');
      setCustomAlertType('error');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    processRecharge(amount);
  };

  const processRecharge = async (amount: number) => {
    try {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Processing payment...');
      setCustomAlertType('loading');
      
      const amountInRupees = amount;
      const gstAmount = amountInRupees * 0.18;
      const totalAmount = amountInRupees + gstAmount;

      const orderData = {
        amount: totalAmount * 100,
        currency: 'INR',
        receipt: `ai-credits-${Date.now()}`,
        notes: {
          type: 'AI Credits',
          credits: amount,
          gstNumber: gstNumber || 'N/A'
        }
      };

      const { data } = await axios.post(`${backend_Host}/create-order`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!data.orderId) {
        throw new Error('Order ID not found');
      }

      setIsRechargeModalOpen(false);
      setCustomAlertVisible(false);

      setOrderData({ ...data, amount, totalAmount, gstNumber });
      setShowWebView(true);

    } catch (error) {
      console.error('Error processing payment:', error);
      setCustomAlertMessage('Failed to process payment. Please try again.');
      setCustomAlertType('error');
      setCustomAlertVisible(true);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const lastWeekUsage = usageDetails.slice(-7).reduce((sum, item) => sum + item.credits, 0);

  if (isLoading) {
    return (
      <SafeAreaView className="h-full w-full flex-1 bg-[#05071E]">
        <NavbarTwo title="AI Credits" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#815BF5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="h-full w-full flex-1 bg-[#05071E]">
      {showWebView ? (
        <SafeAreaView style={{flex:1}} className="relative h-full w-full flex-1 bg-[#05071E]">
          <View className="flex absolute z-20 left-4 top-1 h-[45px] w-[45px] bg-[#05071E] items-center justify-center rounded-full">
            <TouchableOpacity onPress={() => setPaymentBack(true)}>
              <AntDesign name="arrowleft" size={24} color="#ffffff" />
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
                      "key": "rzp_live_your_key_here", 
                      "amount": "${orderData?.totalAmount ? Math.round(orderData.totalAmount * 100) : 0}",
                      "currency": "INR",
                      "name": "Zapllo",
                      "description": "AI Credits Recharge",
                      "order_id": "${orderData?.orderId || ''}",
                      "handler": function (response) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', response: response }));
                      },
                      "theme": {
                        "color": "#05071E"
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
                setCustomAlertMessage(`Successfully added ${orderData?.amount || 0} AI credits!`);
                setCustomAlertType('success');
                setCustomAlertVisible(true);
                setAiCredits(prev => prev + (orderData?.amount || 0));
                setShowWebView(false);
                setCustomAmount('');
                setSelectedAmount(100);
                setGstNumber('');
                setOrderData(null);
              } else {
                setCustomAlertMessage('Payment failed. Please try again.');
                setCustomAlertType('error');
                setCustomAlertVisible(true);
                setShowWebView(false);
              }
            }}
          />

          <Modal
            visible={paymentBack}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setPaymentBack(false)}>
            <View className="flex-1 bg-black/50 justify-end">
              <View className="mb-10 mt-2 flex w-full flex-col items-center justify-center">
                <View className="mb-2 w-[95%] items-center rounded-2xl bg-[#14173b] p-4">
                  <TouchableOpacity
                    onPress={() => setPaymentBack(false)}
                    className="w-full items-center rounded-2xl">
                    <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                      Stay here
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="mt-3 w-[95%] items-center rounded-2xl bg-[#14173b] p-3"
                  onPress={() => {
                    setShowWebView(false);
                    setPaymentBack(false);
                    setOrderData(null);
                  }}>
                  <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                    Back to AI Credits
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      ) : (
        <>
          <NavbarTwo title="AI Credits" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 mt-6 mb-8">
          <Text className="text-white text-3xl font-bold mb-2" style={{ fontFamily: 'LatoBold' }}>
            AI Credits Management
          </Text>
          <Text className="text-[#787CA5] text-base" style={{ fontFamily: 'LatoRegular' }}>
            Manage your organization's AI credits and track usage
          </Text>
        </View>

        {/* Credit Summary Cards */}
        <View className="px-5 mb-8">
          {/* Available Credits Card */}
          <View className="mb-6">
            <View className="bg-[#0A0D28] rounded-xl p-6 border border-[#1E2142] shadow-lg">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="bg-[#815BF5]/20 rounded-full p-3 mr-3">
                    <MaterialIcons name="psychology" size={24} color="#815BF5" />
                  </View>
                  <View>
                    <Text className="text-white text-xl font-bold" style={{ fontFamily: 'LatoBold' }}>
                      Available Credits
                    </Text>
                    <Text className="text-[#787CA5] text-sm" style={{ fontFamily: 'LatoRegular' }}>
                      Current balance of AI credits
                    </Text>
                  </View>
                </View>
              </View>
              
              <View className="mb-6">
                <View className="flex-row items-baseline">
                  <Text className="text-white text-4xl font-bold" style={{ fontFamily: 'LatoBold' }}>
                    {aiCredits}
                  </Text>
                  <Text className="text-[#787CA5] text-lg ml-2" style={{ fontFamily: 'LatoRegular' }}>
                    credits
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={() => setIsRechargeModalOpen(true)}
                className="bg-[#815BF5] rounded-xl py-4 px-6 w-full">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white font-bold text-center ml-2" style={{ fontFamily: 'LatoBold' }}>
                    Recharge Credits
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards Row */}
          <View className="flex-row gap-3">
            {/* Usage Statistics */}
            <View className="flex-1 bg-[#0A0D28] rounded-xl p-4 border border-[#1E2142]">
              <View className="flex-row items-center mb-3">
                <Ionicons name="trending-up" size={16} color="#815BF5" />
                <Text className="text-white text-sm font-medium ml-2" style={{ fontFamily: 'LatoBold' }}>
                  Usage Statistics
                </Text>
              </View>
              <Text className="text-white text-xl font-bold mb-1" style={{ fontFamily: 'LatoBold' }}>
                {lastWeekUsage}
              </Text>
              <Text className="text-[#787CA5] text-xs" style={{ fontFamily: 'LatoRegular' }}>
                Last 7 days
              </Text>
            </View>

            {/* Recent Activity */}
            <View className="flex-1 bg-[#0A0D28] rounded-xl p-4 border border-[#1E2142]">
              <View className="flex-row items-center mb-3">
                <Ionicons name="refresh" size={16} color="#815BF5" />
                <Text className="text-white text-sm font-medium ml-2" style={{ fontFamily: 'LatoBold' }}>
                  Recent Activity
                </Text>
              </View>
              <Text className="text-white text-xl font-bold mb-1" style={{ fontFamily: 'LatoBold' }}>
                {usageDetails.length}
              </Text>
              <Text className="text-[#787CA5] text-xs" style={{ fontFamily: 'LatoRegular' }}>
                Total transactions
              </Text>
            </View>
          </View>
        </View>



        {/* Tabs */}
        <View className="px-5 mb-4">
          <View className="items-center border border-[#676B93] w-[83%] px-1.5 py-1.5 rounded-full mx-auto">
            <View className="w-full flex flex-row items-center justify-between">
              <TouchableOpacity
                className="w-1/2 items-center"
                onPress={() => {
                  setActiveTab('usage');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={activeTab === 'usage' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                  style={{
                    borderRadius: 9999,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    width: '100%',
                    alignItems: 'center',
                  }}>
                  <Text className={`text-xs ${
                    activeTab === 'usage' ? 'text-white' : 'text-[#676B93]'
                  }`} style={{ fontFamily: 'LatoBold' }}>
                    Usage Details
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-1/2 items-center"
                onPress={() => {
                  setActiveTab('transactions');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                }}>
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={activeTab === 'transactions' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                  style={{
                    borderRadius: 9999,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    width: '100%',
                    alignItems: 'center',
                  }}>
                  <Text className={`text-xs ${
                    activeTab === 'transactions' ? 'text-white' : 'text-[#676B93]'
                  }`} style={{ fontFamily: 'LatoBold' }}>
                    Purchase History
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab Content */}
        <View className="px-5 mb-20">
          {activeTab === 'usage' ? (
            <View className="bg-[#0A0D28] rounded-xl p-4">
              <Text className="text-white text-lg mb-4" style={{ fontFamily: 'LatoBold' }}>
                AI Credits Usage Details
              </Text>
              {usageDetails.length > 0 ? (
                usageDetails.map((detail, index) => (
                  <View key={index} className="flex-row justify-between items-center py-3 border-b border-[#1E2142]">
                    <View className="flex-1">
                      <Text className="text-white font-medium" style={{ fontFamily: 'LatoBold' }}>
                        {detail.taskName}
                      </Text>
                      <Text className="text-[#787CA5] text-sm" style={{ fontFamily: 'LatoRegular' }}>
                        {formatDate(detail.date)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-white font-bold" style={{ fontFamily: 'LatoBold' }}>
                        {detail.credits}
                      </Text>
                      <Text className="text-[#787CA5] text-xs" style={{ fontFamily: 'LatoRegular' }}>
                        credits
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="items-center py-8">
                  <LottieView
                    source={require('../../../assets/Animation/no-data.json')}
                    autoPlay
                    loop
                    style={{ width: 200, height: 200 }}
                  />
                  <Text className="text-[#787CA5] text-center" style={{ fontFamily: 'LatoRegular' }}>
                    No usage history found
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="bg-[#0A0D28] rounded-xl p-4">
              <Text className="text-white text-lg mb-4" style={{ fontFamily: 'LatoBold' }}>
                Purchase History
              </Text>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <View key={index} className="flex-row justify-between items-center py-3 border-b border-[#1E2142]">
                    <View className="flex-1">
                      <Text className="text-white font-medium" style={{ fontFamily: 'LatoBold' }}>
                        {transaction.id}
                      </Text>
                      <Text className="text-[#787CA5] text-sm" style={{ fontFamily: 'LatoRegular' }}>
                        {formatDate(transaction.date)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-white font-bold" style={{ fontFamily: 'LatoBold' }}>
                        {transaction.amount} credits
                      </Text>
                      <View className="bg-green-500/20 px-2 py-1 rounded-full">
                        <Text className="text-green-400 text-xs" style={{ fontFamily: 'LatoBold' }}>
                          {transaction.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="items-center py-8">
                  <LottieView
                    source={require('../../../assets/Animation/no-data.json')}
                    autoPlay
                    loop
                    style={{ width: 200, height: 200 }}
                  />
                  <Text className="text-[#787CA5] text-center" style={{ fontFamily: 'LatoRegular' }}>
                    No transaction history found
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Recharge Modal */}
      <Modal
        visible={isRechargeModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsRechargeModalOpen(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-[#0A0D28] rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl" style={{ fontFamily: 'LatoBold' }}>
                Recharge AI Credits
              </Text>
              <TouchableOpacity onPress={() => setIsRechargeModalOpen(false)}>
                <Ionicons name="close" size={24} color="#787CA5" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Packages */}
              <Text className="text-[#787CA5] text-sm mb-4" style={{ fontFamily: 'LatoBold' }}>
                SELECT A PACKAGE
              </Text>
              <View className="flex-row flex-wrap justify-between mb-6">
                {rechargePackages.map((pkg) => (
                  <TouchableOpacity
                    key={pkg.amount}
                    onPress={() => {
                      setSelectedAmount(pkg.amount);
                      setCustomAmount('');
                    }}
                    className={`w-[48%] mb-3 p-4 rounded-xl border ${
                      !customAmount && selectedAmount === pkg.amount
                        ? 'border-[#815BF5] bg-[#815BF5]/10'
                        : 'border-[#37384B]'
                    }`}>
                    <Text className="text-white text-2xl font-bold" style={{ fontFamily: 'LatoBold' }}>
                      {pkg.amount}
                    </Text>
                    <Text className="text-[#815BF5] text-sm" style={{ fontFamily: 'LatoBold' }}>
                      {pkg.label}
                    </Text>
                    <Text className="text-[#787CA5] text-xs mt-1" style={{ fontFamily: 'LatoRegular' }}>
                      {pkg.description}
                    </Text>
                    <Text className="text-white text-sm mt-2" style={{ fontFamily: 'LatoBold' }}>
                      ₹{(pkg.amount * 1.18).toFixed(0)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Amount */}
              <Text className="text-[#787CA5] text-sm mb-3" style={{ fontFamily: 'LatoBold' }}>
                CUSTOM AMOUNT
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // Focus will be handled by TextInput
                }}
                className={`rounded-xl px-4 py-2 mb-6 border ${
                  customAmount
                    ? 'border-[#815BF5] bg-[#815BF5]/10'
                    : 'border-[#37384B] bg-[#1E2142]'
                }`}>
                <View className="flex-row items-center">
                  <Text className="text-[#787CA5]  mr-2 mt-2" style={{ fontFamily: 'LatoBold' }}>₹</Text>
                  <TextInput
                    value={customAmount}
                    onChangeText={(text) => {
                      setCustomAmount(text);
                      setSelectedAmount(0);
                    }}
                    placeholder="Enter amount (min. 100)"
                    placeholderTextColor="#787CA5"
                    keyboardType="numeric"
                    className="text-white text-base flex-1"
                    style={{ 
                      fontFamily: 'LatoRegular',
                      paddingVertical: 8,
                      minHeight: 40,
                      textAlignVertical: 'center'
                    }}
                  />
                </View>
                {customAmount && (
                  <View className="mt-3 pt-3 border-t border-[#37384B]">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-[#787CA5] text-sm" style={{ fontFamily: 'LatoRegular' }}>
                        Credits: {parseInt(customAmount) || 0}
                      </Text>
                      <Text className="text-[#815BF5] text-sm" style={{ fontFamily: 'LatoBold' }}>
                        Total: ₹{((parseInt(customAmount) || 0) * 1.18).toFixed(2)}
                      </Text>
                    </View>
                    <Text className="text-[#787CA5] text-xs mt-1" style={{ fontFamily: 'LatoRegular' }}>
                      (including 18% GST)
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* GST Number Input */}
              <Text className="text-[#787CA5] text-sm mb-2" style={{ fontFamily: 'LatoBold' }}>
                GST NUMBER (OPTIONAL)
              </Text>
              <View className={`rounded-xl p-4 mb-2 border ${
                gstNumber || isGstFocused
                  ? 'border-[#815BF5] bg-[#815BF5]/10'
                  : 'border-[#37384B] bg-[#1E2142]'
              }`}>
                <TextInput
                  value={gstNumber}
                  onChangeText={setGstNumber}
                  onFocus={() => setIsGstFocused(true)}
                  onBlur={() => setIsGstFocused(false)}
                  placeholder="Enter GST number for invoice"
                  placeholderTextColor="#787CA5"
                  className="text-white text-base"
                  style={{ fontFamily: 'LatoRegular' }}
                />
              </View>
              <Text className="text-[#787CA5] text-xs mb-6" style={{ fontFamily: 'LatoRegular' }}>
                Providing GST number helps us generate proper tax invoices
              </Text>

              {/* Order Summary */}
              <View className="bg-[#1E2142] rounded-xl p-4 mb-6">
                <Text className="text-white text-lg mb-3" style={{ fontFamily: 'LatoBold' }}>
                  Order Summary
                </Text>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[#787CA5]" style={{ fontFamily: 'LatoRegular' }}>Credits</Text>
                  <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                    {customAmount ? parseInt(customAmount) || 0 : selectedAmount}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[#787CA5]" style={{ fontFamily: 'LatoRegular' }}>Subtotal</Text>
                  <Text className="text-white" style={{ fontFamily: 'LatoRegular' }}>
                    ₹{customAmount ? parseInt(customAmount) || 0 : selectedAmount}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-[#787CA5]" style={{ fontFamily: 'LatoRegular' }}>GST (18%)</Text>
                  <Text className="text-white" style={{ fontFamily: 'LatoRegular' }}>
                    ₹{((customAmount ? parseInt(customAmount) || 0 : selectedAmount) * 0.18).toFixed(2)}
                  </Text>
                </View>
                <View className="border-t border-[#37384B] pt-3">
                  <View className="flex-row justify-between">
                    <Text className="text-white text-lg" style={{ fontFamily: 'LatoBold' }}>Total</Text>
                    <Text className="text-[#815BF5] text-lg" style={{ fontFamily: 'LatoBold' }}>
                      ₹{((customAmount ? parseInt(customAmount) || 0 : selectedAmount) * 1.18).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={handleRecharge}
                disabled={(!customAmount && selectedAmount === 0)}
                className={`w-full rounded-xl py-4 ${
                  (!customAmount && selectedAmount === 0) ? 'bg-[#37384B]' : 'bg-[#815BF5]'
                }`}>
                <Text className="text-white text-center font-bold" style={{ fontFamily: 'LatoBold' }}>
                  Proceed to Payment
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

          <CustomAlert
            visible={customAlertVisible}
            message={customAlertMessage}
            type={customAlertType}
            onClose={() => setCustomAlertVisible(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
}