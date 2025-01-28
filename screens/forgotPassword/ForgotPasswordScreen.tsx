import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Image,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import InputContainer from '~/components/InputContainer';
import { Feather } from '@expo/vector-icons';
import { router, useNavigation } from 'expo-router';
import { NavigationProp } from '@react-navigation/native';
import axios from 'axios';
import { backend_Host } from '~/config';


export default function ForgotPasswordScreen() {
  const [mail, setMail] = useState('');
  const [loading, setLoading] = useState(false);

  const isEmailValid = () => {};

  const navigation = useNavigation();

  const handelChangePassword = async () => {
    if (!mail.trim()) {
      Alert.alert('Validation Error', 'Email cannot be empty.');
      return;
    }
    console.log(">>>>",mail)
    setLoading(true);
    try {
      const response = await axios.post(`${backend_Host}/forgetPassword`, { email: mail });

      Alert.alert('Success', 'Password reset link sent to your email');
      navigation.goBack();
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      Alert.alert('Failed to sending mail. Please try again.');
    } finally {
      setLoading(false);
      setMail('');
    }
  };

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary ">
      <KeyboardAvoidingView
        className=" w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          className="h-full w-full flex-grow"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center">
            <Image
              className="h-22 mb-[5.3rem] mt-[4.6rem] w-1/2"
              source={require('~/assets/sign-in/sign_in.png')}
              resizeMode="contain"
            />
            <View className="w-[90%] rounded-xl border border-[#37384B] p-5 py-8">
              <Text className="text-2xl font-bold text-white">Forgot Password</Text>
              <Text className="text-xs text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                Enter your registered Email to receive a password reset email
              </Text>
              <InputContainer
                label="Email Address"
                value={mail}
                onChangeText={(value) => setMail(value)}
                placeholder="Enter your email"
                className="flex-1  text-sm text-[#787CA5]"
                passwordError={''}
              />
              <TouchableOpacity
                disabled={loading}
                onPress={handelChangePassword}
                className="my-7 w-[70%] items-center rounded-full bg-[#34785D] p-4">
                {loading ? (
                  <ActivityIndicator size={'small'} color={'#fff'} />
                ) : (
                  <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                    Send Password Link
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className=" mt-44 flex flex-row items-center gap-2">
              <Feather name="home" size={22} color="#fff" />
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
