import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Platform, TouchableOpacity, View } from 'react-native'

import {
  YStack,
  XStack,
  Button,
  Paragraph,
  ScrollView,
  useTheme,
  Image,
  Separator,
  Text,
} from 'tamagui'

import { logIn } from '~/redux/slices/authSlice'
import { backend_Host } from '~/config'
import Checkbox from '~/components/Checkbox'
import CustomAlert from '~/components/CustomAlert/CustomAlert'
import InputContainer from '~/components/InputContainer'
import { GradientText } from '~/components/GradientText'
import * as SecureStore from 'expo-secure-store'

export default function Loginscreen() {
  const dispatch = useDispatch()
  const router = useRouter()
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [buttonSpinner, setButtonSpinner] = useState(false)
  const [userInfo, setUserInfo] = useState({ email: '', password: '' })
  const [error, setError] = useState({ password: '', email: '' })
  const [isChecked, setIsChecked] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')

  const theme = useTheme()

  const handleLogin = async () => {
    if (!userInfo.email || !userInfo.password || !isChecked) return
    setButtonSpinner(true)
    try {
      // Convert email to lowercase before sending to API
      const loginData = {
        ...userInfo,
        email: userInfo.email.toLowerCase()
      };
      
      const response = await axios.post(`${backend_Host}/users/login`, loginData)

      if (response.data.success) {
        // Store the token from the response
        const token = response.data.token;
        
        // IMPORTANT: Make sure we're storing the complete user data
        // This ensures the home screen can access firstName and other user details
        const userData = response.data;
        
        // Dispatch login action with token and complete user data
        dispatch(logIn({ token: token, userData: userData }));
        
        // Store token in SecureStore for persistence
        await SecureStore.setItemAsync('authToken', token);
        
        // Also store user data in SecureStore as a backup
        await SecureStore.setItemAsync('userData', JSON.stringify(userData));
        
        // Set login and onboarding flags
        await SecureStore.setItemAsync('hasCompletedLogin', 'true');
        await SecureStore.setItemAsync('hasCompletedOnboarding', 'true');
        
        console.log('Login successful, user data stored:', userData);
        
        // Navigate to home screen
        router.push('/(routes)/home')
      } else {
        setAlertMessage(response.data.message || 'Invalid credentials')
        setAlertType('error')
        setShowAlert(true)
      }
    } catch (err) {
      console.error('Error during login:', err);
      setAlertMessage('An error occurred, please try again.')
      setAlertType('error')
      setShowAlert(true)
    } finally {
      setButtonSpinner(false)
    }
  }

  return (
    <YStack flex={1} backgroundColor="$bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <YStack alignItems="center" justifyContent='center'>
          <Image
            source={require('~/assets/sign-in/sign_in.png')}
            scale={0.4}
          />
        </YStack>

        <YStack alignItems="center">
          <Image src={require('~/assets/sign-in/logo.png')} scale={0.4} />
        </YStack>


        {/* Email Input (Using InputContainer) */}
        <InputContainer
          label="Email Address"
          value={userInfo.email}
          onChangeText={(value) => setUserInfo({ ...userInfo, email: value })}
          placeholder="Enter your email"
          passwordError={error.email}
          keyboardType="email-address"
          backgroundColor="#0B0F19"
        />
        {error.email && (
          <XStack alignItems="center" marginTop="$2">
            <Ionicons name="alert-circle-outline" size={18} color="red" />
            <Paragraph color="$destructive" size="$3" marginLeft="$2">
              {error.email}
            </Paragraph>
          </XStack>
        )}

        {/* Password Input (Using InputContainer) */}
        <InputContainer
          label="Password"
          value={userInfo.password}
          onChangeText={(value) => setUserInfo({ ...userInfo, password: value })}
          placeholder="Enter your password"
          passwordError={error.password}
          secureTextEntry={!isPasswordVisible}
          backgroundColor="#0B0F19"
          rightIcon={
            <Ionicons
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color="#FFFFFF"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            />
          }
        />
        {error.password && (
          <XStack alignItems="center" marginTop="$2">
            <Ionicons name="alert-circle-outline" size={18} color="red" />
            <Paragraph color="$destructive" size="$3" marginLeft="$2">
              {error.password}
            </Paragraph>
          </XStack>
        )}

        {/* Checkbox */}
        <XStack width="90%" alignItems="center" marginTop={24} marginBottom={12}>
          <Checkbox isChecked={isChecked} onPress={() => setIsChecked(!isChecked)} />
        </XStack>

        {/* Login Button */}
        <Button
          width="90%"
          height={50}
          marginBottom={4}
          marginTop={12}
          size={20}
          backgroundColor={isChecked ? '$primary' : '$border'}
          pressStyle={{ opacity: 0.8 }}
          onPress={handleLogin}
          borderRadius="$lg"
        >
          {buttonSpinner ? <ActivityIndicator size="small" color="white" /> : 'Login'}
        </Button>
        {/* Forgot Password */}
        <Button chromeless onPress={() => router.push('/(routes)/forgot-PassWord')} marginTop={12} marginBottom={12}>
          <Paragraph size="$3" color="white">
            Forgot your password?
          </Paragraph>
        </Button>

        {/* Register Section */}
        <View className="flex-row items-center justify-center  py-2">
          <View className="flex-row">
            <Text className="text-base text-white" style={{ fontFamily: 'Lato-Light' }}>
              Not a{' '}
            </Text>
            <GradientText
              text="Zapllonian"
              textStyle={{ fontSize: 16, fontWeight: '400' }}
            />
          </View>
          <TouchableOpacity onPress={() => router.push('/(routes)/signup/pageOne' as any)}>
            <Text className="text-base font-extrabold text-white">? Register Here</Text>
          </TouchableOpacity>
        </View>
        {/* Custom Alert */}
        <CustomAlert
          visible={showAlert}
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      </ScrollView>
    </YStack>
  )
}