import React, { useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import InputContainer from '~/components/InputContainer';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { GradientText } from '~/components/GradientText';
import Checkbox from '~/components/Checkbox';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '~/redux/store';
import { logIn } from '~/redux/slices/authSlice';

export default function Loginscreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [responseError, setResponseError] = useState('');
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState({
    password: '',
    email: '',
  });
  const [isChecked, setIsChecked] = useState(false);

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Invalid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!/(?=.*[0-9])/.test(password)) {
      return 'Write at least one number';
    } else if (!/(?=.{6,})/.test(password)) {
      return 'Write at least 6 characters';
    }
    return '';
  };

  const handleLogin = async () => {
    const emailError = validateEmail(userInfo.email);
    const passwordError = validatePassword(userInfo.password);

    if (emailError || passwordError || !isChecked) {
      setError({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setButtonSpinner(true);
    try {
      const response = await axios.post(`${backend_Host}/users/login`, {
        email: userInfo.email,
        password: userInfo.password,
      });

      if (response.data.success) {
        const token = response?.data?.token;
        const userData = response?.data;

        Alert.alert(response.data.message);
        dispatch(logIn({ token: token, userData: userData }));
        router.push('/(routes)/home');
      } else {
        setError(response.data.message || 'Invalid credentials');
      }
    } catch (err: any) {
      console.error('Login error:', err.response.data.error || err.message);
      setResponseError(err.response.data.error);
    } finally {
      setButtonSpinner(false);
    }
  };

  const isFormValid = () => {
    return (
      !validateEmail(userInfo.email) &&
      !validatePassword(userInfo.password) &&
      isChecked
    );
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

            <View className="mb-5 flex flex-row items-center gap-2 ">
              <Image
                className="h-9"
                source={require('~/assets/sign-in/logo.png')}
                resizeMode="contain"
              />
            </View>

            <InputContainer
              label="Email Address"
              value={userInfo.email.toLowerCase()}
              onChangeText={(value) => setUserInfo({ ...userInfo, email: value })}
              placeholder="Email Address"
              className="flex-1  text-sm text-[#787CA5]"
              passwordError={error?.email}
            />

            {error.email ? (
              <View className="ml-8 mt-2 flex-row self-start items-center">
                <Ionicons name="close-circle" size={16} color="#EE4848" />
                <Text className="font-pathwayExtreme ml-1 self-start text-sm text-red-500">
                  {error.email}
                </Text>
              </View>
            ) : <></>
          }

            <View className="relative w-full items-center">
              <InputContainer
                label="Password"
                value={userInfo.password}
                onChangeText={(value) => setUserInfo({ ...userInfo, password: value })}
                placeholder="**********"
                secureTextEntry={!isPasswordVisible}
                className="flex-1  text-sm text-[#787CA5]"
                passwordError={error?.password}
              />

              <TouchableOpacity
                className="absolute right-12 top-12"
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                {isPasswordVisible ? (
                  <Ionicons name="eye-off-outline" size={23} color={'#FFFFFF'} />
                ) : (
                  <Ionicons name="eye-outline" size={23} color={'#FFFFFF'} />
                )}
              </TouchableOpacity>
            </View>

            {error.password ? (
              <View className="ml-8 mt-2 flex-row self-start items-center">
                <Ionicons name="close-circle" size={16} color="#EE4848" />
                <Text className="font-pathwayExtreme ml-1 self-start text-sm text-red-500">
                  {error.password}
                </Text>
              </View>
            ):<></>
          }

            <TouchableOpacity
              className="mr-9 mt-16 self-end"
              onPress={() => router.push('/(routes)/forgot-PassWord' as any)}>
              <Text className="text-sm  text-white" style={{ fontFamily: 'Lato-Light' }}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`mb-10 mt-3 flex h-[3.6rem] w-[89%] items-center justify-center rounded-full p-2.5 ${
                isFormValid() ? 'bg-[#815BF5]' : 'bg-[#37384B]'
              }`}
              onPress={handleLogin}>
              {buttonSpinner ? (
                <ActivityIndicator size="small" color={'white'} />
              ) : (
                <Text className="text-center  font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                  Login
                </Text>
              )}
            </TouchableOpacity>

            <View className="mb-14 mr-7 w-[80%]">
              <Checkbox isChecked={isChecked} onPress={() => setIsChecked(!isChecked)} />
            </View>
            <View className="flex-row items-center justify-center bg-primary py-5">
              <View className="flex-row">
                <Text className="text-base  text-white" style={{ fontFamily: 'Lato-Light' }}>
                  Not a{' '}
                </Text>
                <GradientText text="Zapllonian" textStyle={{ fontSize: 16, fontWeight: '400' }} />
              </View>
              <Link href="/(routes)/signup/pageOne">
                <Text className="text-base font-extrabold text-white" style={{ fontFamily: 'LatoBold' }}>
                  ? Register Here
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}