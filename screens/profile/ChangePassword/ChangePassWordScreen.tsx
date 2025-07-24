import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import InputContainer from '~/components/InputContainer';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import CustomAlert from '~/components/CustomAlert/CustomAlert';
import CustomSplashScreen from '~/components/CustomSplashScreen';
import { Theme } from 'tamagui';

export default function ChangePassWordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string>('');
  const navigation = useNavigation();
  const { token } = useSelector((state: RootState) => state.auth);
  const [isPasswordTouched, setIsPasswordTouched] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<'success' | 'error' | 'loading'>('success');
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);

  const handleSplashComplete = () => {
    setShowSuccessSplash(false);
    navigation.goBack();
  };

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
    setNewPassword(value);
    setIsPasswordTouched(true);
  };

  const handelChangePassword = async () => {
    if (!currentPassword.trim()) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Current password cannot be empty.');
      setCustomAlertType('error');
      return;
    }

    if (!newPassword.trim()) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('New password cannot be empty.');
      setCustomAlertType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.patch(
        `${backend_Host}/changePassword`,
        { currentPassword: currentPassword, newPassword: newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Show success splash screen instead of alert
      setCurrentPassword('');
      setNewPassword('');
      setShowSuccessSplash(true);
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      setCustomAlertVisible(true);
      setCustomAlertMessage('Failed to update password. Please try again.');
      setCustomAlertType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Theme name="dark">
      <SafeAreaView className="h-full w-full flex-1 items-center bg-primary ">
        <KeyboardAvoidingView
          className=" w-full"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

            <View className="h-full w-full items-center">
              <View className="m-4 w-full ">
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  className="ml-4 flex h-9 w-10 items-start justify-start">
                  <Image
                    resizeMode="contain"
                    className="h-full w-full"
                    source={require('~/assets/sign-in/back.png')}
                  />
                </TouchableOpacity>
              </View>
              <Image
                className="h-22 mb-5 mt-10 w-1/2"
                source={require('~/assets/sign-in/sign_in.png')}
                resizeMode="contain"
              />
              <View className=" rounded-xl border border-[#37384B] p-5 mt-5">
                <Text className="text-xl font-bold text-white">Change Your Password</Text>

                <InputContainer
                  label="Current Password"
                  value={currentPassword}
                  onChangeText={(text) => setCurrentPassword(text)}
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
                      <View className="ml-8 mt-2 flex-row items-center self-start">
                        <Ionicons name="close-circle" size={16} color="#EE4848" />
                        <Text
                          className="font-pathwayExtreme ml-1 self-start text-sm text-red-500"
                          style={{ fontFamily: 'Lato-Light' }}>
                          {error}
                        </Text>
                      </View>
                    ) : (
                      <View className="ml-8 mt-2 flex-row items-center self-start">
                        <Ionicons name="checkmark-circle" size={16} color="#80ED99" />
                        <Text
                          className="font-pathwayExtreme ml-1 self-start text-sm text-green-500"
                          style={{ fontFamily: 'Lato-Light' }}>
                          Password is valid!
                        </Text>
                      </View>
                    )}
                  </>
                )}


                <TouchableOpacity
                  disabled={loading}
                  onPress={handelChangePassword}
                  className={`my-7 w-full items-center rounded-full p-4 ${currentPassword === newPassword && !error && currentPassword !== "" && newPassword !== "" ? 'bg-[#815BF5]' : 'bg-[#2B2F3A]'}`}>
                  {loading ? (
                    <ActivityIndicator size={'small'} color={'#fff'} />
                  ) : (
                    <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                      Change Password
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
    
        </KeyboardAvoidingView>
        
        <CustomAlert
          visible={customAlertVisible}
          message={customAlertMessage}
          type={customAlertType}
          onClose={() => setCustomAlertVisible(false)}
        />

        {/* Success Splash Screen */}
        <CustomSplashScreen
          visible={showSuccessSplash}
          lottieSource={require('~/assets/Animation/success.json')}
          mainText="Password Changed Successfully!"
          subtitle="Your password has been updated successfully. You can now use your new password to login."
          onComplete={handleSplashComplete}
          onDismiss={handleSplashComplete}
          duration={3000}
          gradientColors={["#05071E", "#0A0D28"]}
          textGradientColors={["#815BF5", "#FC8929"]}
        />
      </SafeAreaView>
    </Theme>
  );
}