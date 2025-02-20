import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,

  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import WorkSpaceScreen from './WorkSpaceScreen';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '~/redux/store';
import { logIn } from '~/redux/slices/authSlice';
import { router, useNavigation } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { GradientText } from '~/components/GradientText';
import { Ionicons } from '@expo/vector-icons';
import InputContainer from '~/components/InputContainer';
import { Dropdown } from 'react-native-element-dropdown';
import countryData from '../../data/country.json';
import { Animated } from 'react-native';
import { Button, Image, YStack } from 'tamagui';
import CustomAlert from '~/components/CustomAlert/CustomAlert';

const { width, height } = Dimensions.get('window');

// Utility for scaling sizes
const verticalScale = (size: number) => (height / 812) * size; // Base screen height of 812

interface SignupScreenProps {
  navigation: {
    navigate: (route: string) => void;
  };
}

const SignupScreen: React.FC<SignupScreenProps> = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [businessIndustry, setBusinessIndustry] = useState<string>('Select Industry');
  const [teamSize, setTeamSize] = useState<string>('Select Team Size');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    description: '',
  });
  console.log(formData, 'okay?')
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [error, setError] = useState<string>('');
  const [isPasswordTouched, setIsPasswordTouched] = useState<boolean>(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>('');
  const [isEmailTouched, setIsEmailTouched] = useState<boolean>(false);
  const [firstNameError, setFirstNameError] = useState<string>('');
  const [lastNameError, setLastNameError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const navigation = useNavigation();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'loading'>('success');


  const [selectedCountry, setSelectedCountry] = useState(
    countryData.find((c) => c.dial_code === '+91') // Default to India
  );

  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownAnimation = useState(new Animated.Value(0))[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Function to animate dropdown
  const toggleDropdown = (open: boolean) => {
    setIsDropdownOpen(open);
    Animated.timing(dropdownAnimation, {
      toValue: open ? 1 : 0,
      duration: 200, // Smooth animation
      useNativeDriver: true,
    }).start();
  };

  const findIndianDialCode = () => {
    const indianCode = countryData.find((country) => country.dial_code === '+91');
    return indianCode || countryData[0]; // Fallback to first country if India not found
  };
  const initializeCountryDropdown = () => {
    const defaultCountry = findIndianDialCode();
    return defaultCountry?.dial_code || '+91';
  };
  const [numberValue, setNumberValue] = useState(initializeCountryDropdown());

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setModalVisible(false);
  };

  const filteredCountries = countryData.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dial_code.includes(searchQuery)
  );


  const handleEmailValidation = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
  };

  const handlePasswordValidation = (value: string) => {
    setFormData((prev) => ({ ...prev, password: value }));
  };

  const handleConfirmPasswordValidation = (value: string) => {
    setFormData((prev) => ({ ...prev, confirmPassword: value }));
    setIsConfirmPasswordTouched(true);

    if (value !== formData.password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleValidation = (): boolean => {
    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      confirmPassword,
      description,
      companyName,
    } = formData;

    let valid = true;

    if (!firstName) {
      setFirstNameError('First name is required');
      valid = false;
    } else {
      setFirstNameError('');
    }

    if (!lastName) {
      setLastNameError('Last name is required');
      valid = false;
    } else {
      setLastNameError('');
    }

    if (!phone) {
      setPhoneError('WhatsApp number is required');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (!email) {
      setEmailError('Email is required');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Invalid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setError('Password is required');
      valid = false;
    } else if (!/(?=.{6,})/.test(password)) {
      setError('Write at least 6 characters');
      valid = false;
    } else {
      setError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Password is required');
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    return valid;
  };

  const handleNextOrSignUp = async () => {
    if (handleValidation()) {
      if (showWorkspace) {
        const payload = {
          whatsappNo: formData?.phone || '',
          email: formData?.email || '',
          password: formData?.password || '',
          firstName: formData?.firstName || '',
          lastName: formData?.lastName || '',
          companyName: formData?.companyName || '',
          industry: businessIndustry || '',
          teamSize: teamSize || '',
          description: formData?.description || '',
          categories: selectedCategories || [],
          country: 'IN',
        };

        console.log('okkkk', payload);
        setButtonSpinner(true);

        try {
          const response = await axios.post(`${backend_Host}/users/signup`, payload);
          console.log('RESPONSEEEEEEE!!!!!!', response);
          if (response.data.success) {
            const token = response?.data?.token;
            const userData = response?.data;
            setAlertVisible(true);
            setAlertMessage('You have signed up successfully!');
            setAlertType('success');
            // dispatch(logIn({ token, userData }));
            // router.push('/(routes)/home');
            setTimeout(() => {
              setAlertVisible(false);
              router.push('/(routes)/login' as any);
            }, 2000); // Auto-close after 2 seconds
            // router.push('/(routes)/login' as any);
          } else {
            setAlertMessage(response.data.message || 'Invalid credentials');
            setAlertType('error');
          }
        } catch (error: any) {
          setAlertVisible(true);
          setAlertMessage(error.response?.data?.error || 'Something went wrong!');
          setAlertType('error');
          console.log(error, 'ERRROR')
          console.log('>>>>>>>>>>>>', error.response?.data?.error);
        } finally {
          setButtonSpinner(false);
        }
      } else {
        setShowWorkspace(true);
      }
    }
  };

  return (
    <SafeAreaView className="h-full w-full bg-[#05071E]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <YStack
            alignItems='center'
          >
            {showWorkspace && (
              <TouchableOpacity
                onPress={() => setShowWorkspace(false)}
                className="absolute bottom-6 left-1 ml-2 h-9 w-10 ">
                <Image
                  // resizeMode="contain"
                  scale={0.8}
                  className="h-9 w-9"
                  source={require('../../assets/sign-in/back.png')}
                />
              </TouchableOpacity>
            )}

            <Image src={require('~/assets/sign-in/sign_in.png')} scale={0.3} />
          </YStack>

          {!showWorkspace && (
            <>
              <View className="flex h-full w-full items-center pb-14">
                <View className="mb-4 flex items-center justify-center gap-4 ">
                  <Text className="text-3xl  text-white" style={{ fontFamily: 'LatoBold' }}>
                    Start Premium Trial
                  </Text>
                  <Text className="font-light text-white " style={{ fontFamily: 'Lato-Light' }}>
                    Let's get started by filling out the form below
                  </Text>
                </View>

                {/* first name */}
                <InputContainer
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(text) => handleChange('firstName', text)}
                  placeholder="First Name"
                  className="flex-1  text-[#787CA5]"
                  passwordError={firstNameError}
                />

                {firstNameError && (
                  <View className="ml-8 mt-2 flex-row items-center self-start">
                    <Ionicons name="close-circle" size={16} color="#EE4848" />
                    <Text
                      className="font-pathwayExtreme ml-1 self-start text-sm text-red-500"
                      style={{ fontFamily: 'Lato-Light' }}>
                      {firstNameError}
                    </Text>
                  </View>
                )}

                {/* last name */}
                <InputContainer
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(text) => handleChange('lastName', text)}
                  placeholder="Last Name"
                  passwordError={lastNameError}
                  className="flex-1  text-sm text-[#787CA5]"
                />

                {lastNameError && (
                  <View className="ml-8 mt-2 flex-row items-center self-start">
                    <Ionicons name="close-circle" size={16} color="#EE4848" />
                    <Text
                      className="font-pathwayExtreme ml-1 self-start text-sm text-red-500"
                      style={{ fontFamily: 'Lato-Light' }}>
                      {lastNameError}
                    </Text>
                  </View>
                )}
                {/* Country Code Dropdown & Phone Input */}
                <Dropdown
                  search
                  searchPlaceholder="Search country..."
                  inputSearchStyle={{
                    // borderRadius: 15,
                    color: 'white',
                    borderWidth: 0,
                    // width: '100%',
                    borderRadius: 15,
                    height: 48,
                    backgroundColor: '#121212',
                  }}
                  containerStyle={{
                    backgroundColor: '#121212', // Ensure the dropdown container is dark
                    borderRadius: 15, // Optional, for better design
                    borderWidth: 1,
                    borderColor: '#37384B',
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: '#37384B',
                    // borderRadius: 15,
                    backgroundColor: '',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    height: 55,
                    borderRadius: 15,
                    marginTop: 20,
                    width: '90%',
                  }}
                  placeholderStyle={{
                    fontSize: 14,
                    color: '#787CA5',
                  }}
                  selectedTextStyle={{
                    fontSize: 16,
                    color: 'white',
                    marginLeft: 5,
                  }}
                  iconStyle={{
                    width: 18,
                    height: 18,
                    tintColor: '#787CA5',
                  }}
                  data={countryData}
                  labelField="name"
                  valueField="dial_code"
                  placeholder="Select Country"
                  value={selectedCountry?.dial_code}
                  onFocus={() => toggleDropdown(true)}
                  onBlur={() => toggleDropdown(false)}
                  onChange={(item) => {
                    setSelectedCountry(item);
                    setIsDropdownOpen(false);
                    setTimeout(() => {
                      toggleDropdown(false); // Ensures the dropdown closes smoothly
                    }, 100);
                  }}
                  renderLeftIcon={() => (
                    <Text style={{ fontSize: 18 }}>{selectedCountry?.flag}</Text>
                  )}
                  renderItem={(item) => {
                    return (
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',

                          paddingVertical: 16,
                          paddingHorizontal: 12,
                          // borderRadius: 15,
                          borderBottomWidth: 1,
                          // borderBottomColor: '#37384B',
                          backgroundColor: selectedCountry?.dial_code === item.dial_code ? '#4e5278' : '#121212',
                        }}
                        onPress={() => {
                          setSelectedCountry(item);
                          toggleDropdown(false); // Close dropdown after selection
                          setIsDropdownOpen(false);
                        }}
                      >
                        <Text style={{ fontSize: 18, marginRight: 10 }}>{item.flag}</Text>
                        <Text style={{ color: 'white', flex: 1 }}>
                          {item.name} ({item.dial_code})
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
                <View className="mb-4 flex w-[100%]  flex-row items-center justify-center gap-2">

                  <InputContainer
                    label="WhatsApp Number"
                    value={formData.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    placeholder="7863983914"
                    keyboardType="numeric"
                    className="flex-1 p-2 text-sm text-[#787CA5]"
                    passwordError={phoneError}
                  />
                </View>

                {phoneError && (
                  <View className="ml-8 mt-2 flex-row items-center self-start">
                    <Ionicons name="close-circle" size={16} color="#EE4848" />
                    <Text
                      className="font-pathwayExtreme ml-1 self-start text-sm text-red-500"
                      style={{ fontFamily: 'Lato-Light' }}>
                      {phoneError}
                    </Text>
                  </View>
                )}

                {/* email input */}
                <InputContainer
                  label="Email Address"
                  value={formData.email}
                  onChangeText={handleEmailValidation}
                  placeholder="Email Address"
                  className="flex-1  text-[#787CA5]"
                  passwordError={emailError}
                />

                {emailError && (
                  <View className="ml-8 mt-2 flex-row items-center self-start">
                    <Ionicons name="close-circle" size={16} color="#EE4848" />
                    <Text
                      className="font-pathwayExtreme ml-1 self-start text-sm text-red-500"
                      style={{ fontFamily: 'Lato-Light' }}>
                      {emailError}
                    </Text>
                  </View>
                )}

                {/* password input */}
                <View className="relative w-full items-center">
                  <InputContainer
                    label="Password"
                    value={formData.password}
                    onChangeText={handlePasswordValidation}
                    placeholder="**********"
                    secureTextEntry={!passwordVisible}
                    className="flex-1  text-[#787CA5]"
                    passwordError={error}
                  />
                  <TouchableOpacity
                    className="absolute right-12 top-12"
                    onPress={() => setPasswordVisible(!passwordVisible)}>
                    {passwordVisible ? (
                      <Ionicons name="eye-outline" size={23} color={'#FFFFFF'} />
                    ) : (
                      <Ionicons name="eye-off-outline" size={23} color={'#FFFFFF'} />
                    )}
                  </TouchableOpacity>
                </View>

                {error && (
                  <View className="ml-8 mt-2 flex-row items-center self-start">
                    <Ionicons name="close-circle" size={16} color="#EE4848" />
                    <Text
                      className="font-pathwayExtreme ml-1 self-start text-sm text-red-500"
                      style={{ fontFamily: 'Lato-Light' }}>
                      {error}
                    </Text>
                  </View>
                )}

                {/* confirm password */}
                <View className="relative w-full items-center">
                  <InputContainer
                    label="Confirm Password"
                    secureTextEntry={!confirmPasswordVisible}
                    value={formData.confirmPassword}
                    onChangeText={handleConfirmPasswordValidation}
                    placeholder="**********"
                    className="flex-1  text-[#787CA5]"
                    passwordError={confirmPasswordError}
                  />
                  <TouchableOpacity
                    className="absolute right-12 top-12"
                    onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
                    {confirmPasswordVisible ? (
                      <Ionicons name="eye-outline" size={23} color={'#FFFFFF'} />
                    ) : (
                      <Ionicons name="eye-off-outline" size={23} color={'#FFFFFF'} />
                    )}
                  </TouchableOpacity>
                </View>

                {confirmPasswordError && (
                  <View className="ml-8 mt-2 flex-row items-center self-start">
                    <Ionicons name="close-circle" size={16} color="#EE4848" />
                    <Text
                      className="font-pathwayExtreme ml-1 self-start text-sm text-red-500"
                      style={{ fontFamily: 'Lato-Light' }}>
                      {confirmPasswordError}
                    </Text>
                  </View>
                )}

                <View className="mt-8 w-full px-4">
                  <Button
                    width="100%"
                    height={50}
                    marginBottom={20}
                    size={16}
                    backgroundColor={showWorkspace ? '$primary' : '$border'}
                    pressStyle={{ opacity: 0.8 }}
                    onPress={handleNextOrSignUp}
                    borderRadius="$lg"
                  >
                    {buttonSpinner ? (
                      <ActivityIndicator size="small" color={'white'} />
                    ) : (
                      <Text
                        className="text-center font-semibold text-xl text-white"
                        style={{ fontFamily: 'LatoBold' }} >
                        {showWorkspace ? 'Sign Up' : 'Next'}
                      </Text>
                    )}
                  </Button>
                  <View className="flex-row items-center justify-center bg-primary py-2">
                    <View className="flex-row">
                      <Text className="text-base  text-white" style={{ fontFamily: 'Lato-Light' }}>
                        Already a{' '}
                      </Text>
                      <GradientText
                        text="Zapllonian"
                        textStyle={{ fontSize: 16, fontWeight: '400' }}
                      />
                    </View>
                    <TouchableOpacity onPress={() => router.push('/(routes)/login' as any)}>
                      <Text className="text-base font-extrabold text-white">? Login Here</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}
          <CustomAlert
            visible={alertVisible}
            message={alertMessage}
            type={alertType}
            onClose={() => setAlertVisible(false)}
          />
          {showWorkspace && (
            <>
              <WorkSpaceScreen
                handleChange={handleChange}
                formData={formData}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                teamSize={teamSize}
                setTeamSize={setTeamSize}
                businessIndustry={businessIndustry}
                setBusinessIndustry={setBusinessIndustry}
              />
              <View className="w-full px-4">
                <Button
                  width="100%"
                  height={50}
                  marginBottom={4}
                  size={16}
                  backgroundColor={showWorkspace ? '$primary' : '$border'}
                  pressStyle={{ opacity: 0.8 }}
                  onPress={handleNextOrSignUp}
                  borderRadius="$lg"
                >
                  {buttonSpinner ? (
                    <ActivityIndicator size="small" color={'white'} />
                  ) : (
                    <Text
                      className="text-center font-semibold text-xl text-white"
                      style={{ fontFamily: 'LatoBold' }} >
                      {showWorkspace ? 'Sign Up' : 'Next'}
                    </Text>
                  )}
                </Button>
                <View className="mb-10  flex-row items-center justify-center bg-primary py-5">
                  <View className="flex-row">
                    <Text
                      className="text-base  font-light text-white"
                      style={{ fontFamily: 'Lato-Thin' }}>
                      Already a{' '}
                    </Text>
                    <GradientText
                      text="Zapllonian"
                      textStyle={{ fontSize: 16, fontWeight: '400' }}
                    />
                  </View>
                  <TouchableOpacity onPress={() => router.push('/(routes)/login' as any)}>
                    <Text
                      className="text-base font-extrabold text-white"
                      style={{ fontFamily: 'LatoBold' }}>
                      ? Login Here
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupScreen;
