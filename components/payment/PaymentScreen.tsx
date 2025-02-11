import React, { useState } from 'react';
import { View, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

// Replace these with your actual functions/data
// Example plan data and calculation function
const plans = {
  basic: 100, // cost per user in INR
  premium: 200,
};

const calculatePaymentDetails = (planCost: number, userCount: number) => {
  // For demonstration, we'll assume a simple calculation.
  const subtotal = planCost * userCount;
  const discount = 0; // update as needed
  const gst = subtotal * 0.18; // e.g., 18% GST
  const total = subtotal + gst - discount;
  return { subtotal, discount, gst, total };
};

interface PaymentScreenProps {
  currentUser: any;
  selectedPlan: keyof typeof plans;
  userCount: number;
  gstNumber: string;
  additionalUserCount?: number;
}

const PaymentScreen: React.FC<PaymentScreenProps> = ({
  currentUser,
  selectedPlan,
  userCount,
  gstNumber,
  additionalUserCount = 0,
}) => {
  const navigation = useNavigation();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{ orderId: string; amount: number } | null>(null);

  // This function is triggered when the user taps "Pay Now"
  const handlePayment = async () => {
    // Validate the selected plan
    if (!selectedPlan || !(selectedPlan in plans)) {
      Alert.alert('Error', 'Selected plan is invalid.');
      return;
    }

    const { subtotal, discount, gst, total } = calculatePaymentDetails(plans[selectedPlan], userCount);

    try {
      setIsPaymentProcessing(true);

      // STEP 1: (Optional) Deduct applied credits from wallet if applicable  
      // await axios.post('https://yourserver.com/api/wallet/deduct', { userId: currentUser?._id, amount: discount });

      // STEP 2: For a zero total, update user count and record order (skip Razorpay)
      if (total === 0) {
        // Update user count
        const updateResponse = await axios.post('https://yourserver.com/api/organization/update-user-count', {
          organizationId: currentUser?.organization,
          subscribedUserCount: userCount,
          additionalUserCount: 0,
        });
        if (!updateResponse.data.success) {
          Alert.alert('Error', 'Failed to update user count. Please try again.');
          setIsPaymentProcessing(false);
          return;
        }
        // Create an order record with zero amount if needed
        await axios.post('https://yourserver.com/api/create-wallet-order', {
          userId: currentUser._id,
          amount: 0,
          planName: selectedPlan,
          creditedAmount: 0,
          subscribedUserCount: userCount,
          additionalUserCount: additionalUserCount,
          deduction: plans[selectedPlan] * userCount,
        });
        Alert.alert('Payment Successful', 'No additional amount charged.', [
          { text: 'OK', onPress: () => navigation.replace('PaymentSuccessScreen') },
        ]);
        setIsPaymentProcessing(false);
        return;
      }

      // STEP 3: Create an order on your backend
      const orderPayload = {
        amount: Math.round(total * 100), // convert rupees to paise
        currency: 'INR',
        receipt: 'receipt_order_123456', // replace as needed
        notes: {
          email: currentUser?.email,
          whatsappNo: currentUser?.whatsappNo,
          planName: selectedPlan,
          gstNumber: gstNumber,
        },
        subscribedUserCount: userCount,
      };

      const orderResponse = await axios.post('https://yourserver.com/api/create-order', orderPayload);
      if (!orderResponse.data.orderId) {
        throw new Error('Order ID not returned');
      }

      // Save order details for use in the WebView
      setOrderDetails({
        orderId: orderResponse.data.orderId,
        amount: orderPayload.amount,
      });

      // Show the WebView to process the payment
      setShowWebView(true);
      setIsPaymentProcessing(false);
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Error processing payment. Please try again.');
      setIsPaymentProcessing(false);
    }
  };

  // Called when the WebView sends a message (i.e. payment success or failure)
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.status === 'success') {
        // Payment successful
        Alert.alert('Payment Successful', 'Your payment was processed successfully.', [
          {
            text: 'OK',
            onPress: () => {
              setShowWebView(false);
              navigation.navigate('PaymentScreen', { /* Pass any necessary params here */ });
            },
          },
        ]);
      } else {
        // Payment failed or cancelled
        Alert.alert('Payment Failed', 'There was an error processing your payment.');
        setShowWebView(false);
      }
    } catch (error) {
      console.error('Error handling message from WebView:', error);
      setShowWebView(false);
    }
  };

  return (
    <View style={styles.container}>
      {!showWebView && (
        <View style={styles.content}>
          <Button title="Pay Now" onPress={handlePayment} disabled={isPaymentProcessing} />
          {isPaymentProcessing && <ActivityIndicator size="large" color="#04061E" />}
        </View>
      )}

      {showWebView && orderDetails && (
        <WebView
          originWhitelist={['*']}
          source={{
            html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
              </head>
              <body>
                <script>
                  var options = {
                    "key": "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay key
                    "amount": "${orderDetails.amount}", // Amount in paise
                    "currency": "INR",
                    "name": "Zapllo",
                    "description": "Payment for ${selectedPlan}",
                    "order_id": "${orderDetails.orderId}",
                    "handler": function (response){
                      window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'success', response: response }));
                    },
                    "prefill": {
                      "name": "${currentUser?.firstName} ${currentUser?.lastName}",
                      "email": "${currentUser?.email}",
                      "contact": "${currentUser?.whatsappNo}"
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
            `,
          }}
          onMessage={handleWebViewMessage}
          style={{ flex: 1 }}
          javaScriptEnabled
          domStorageEnabled
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaymentScreen;