import React, { useState } from 'react'
import { ActivityIndicator, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import axios from 'axios'

import {
  YStack,
  XStack,
  Button,
  Input,
  Paragraph,
  Label,
  ScrollView,
  useTheme,
  Image,
  Separator,
  Card,
  Theme,
} from 'tamagui'

import { backend_Host } from '~/config'
import CustomAlert from '~/components/CustomAlert/CustomAlert'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const theme = useTheme()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setAlertMessage('Please enter a valid email address.')
      setAlertType('error')
      setShowAlert(true)
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${backend_Host}/forgetPassword`, { email })

      setAlertMessage('Password reset link has been sent to your email.')
      setAlertType('success')
      setShowAlert(true)
    } catch (err: any) {
      setAlertMessage('Failed to send email. Please try again.')
      setAlertType('error')
      setShowAlert(true)
    } finally {
      setLoading(false)
      setEmail('')
    }
  }

  return (
    <Theme name="dark">
      <YStack flex={1} backgroundColor="$bg">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Logo Section */}
          <YStack alignItems="center">
            <Image src={require('~/assets/sign-in/sign_in.png')} scale={0.4} />
          </YStack>

          {/* Card Container */}
          <Card
            width="90%"
            borderRadius={12}
            bordered
            borderColor={'$accent'}
            // borderBlockColor={'$accent'}
            // elevate
            padding="$4"
            // alignContent='center'
            // alignItems='center'
            backgroundColor="$bg"
            marginTop="$4"
          >
            <YStack gap="$3">
              {/* Heading */}
              <Paragraph size="$6" fontWeight="bold" color="$color">
                Forgot Password
              </Paragraph>
              <Paragraph size="$3" color="$mutedForeground">
                Enter your registered email to receive a password reset link.
              </Paragraph>

              {/* Email Input */}
              <YStack width="100%" gap="$2">
                {/* <Label size="$4" color="$color">
                  Email Address
                </Label> */}
                <Input
                  placeholder="Enter your email"
                  height={40}
                  paddingHorizontal="$2"
                  value={email}
                  onChangeText={setEmail}
                  borderColor="$border"
                  color="$color"
                  backgroundColor="$background"
                  placeholderTextColor={'$mutedForeground'}
                  borderRadius="$md"
                />
              </YStack>

              {/* Send Reset Link Button */}
              <Button
                width="100%"
                height={50}
                marginBottom={20}
                marginTop="$4"
                size={16}
                backgroundColor={email ? '$primary' : '$border'}
                pressStyle={{ opacity: 0.8 }}
                onPress={handleResetPassword}
                borderRadius="$lg"
              >
                {loading ? <ActivityIndicator size="small" color="white" /> : 'Reset Password'}
              </Button>
            </YStack>
          </Card>

          {/* Back to Login */}
          <XStack alignItems="center" marginTop="$4">
            <Feather name="home" size={16} color={'white'} />
            <Button chromeless onPress={() => router.back()} marginLeft="$2">
              <Paragraph size={16} color="white">
                Back to Login
              </Paragraph>
            </Button>
          </XStack>
        </ScrollView>

        {/* Custom Alert */}
        <CustomAlert
          visible={showAlert}
          message={alertMessage}
          type={alertType}
          onClose={() => setShowAlert(false)}
        />
      </YStack>
    </Theme>
  )
}
