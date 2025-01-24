import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  Image,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import WorkSpaceScreen from './WorkSpaceScreen';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '~/redux/store';
import { logIn } from '~/redux/slices/authSlice';
import { router } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { GradientText } from '~/components/GradientText';
import { Ionicons } from '@expo/vector-icons';
import InputContainer from '~/components/InputContainer';
import { Dropdown } from 'react-native-element-dropdown';
import countryData from '../../data/country.json';

const { width, height } = Dimensions.get('window');

// Utility for scaling sizes
const verticalScale = (size: number) => (height / 812) * size; // Base screen height of 812

interface SignupScreenProps {
  navigation: {
    navigate: (route: string) => void;
  };
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
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

  const findIndianDialCode = () => {
    const indianCode = countryData.find(country => country.dial_code === '+91');
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

  const handleEmailValidation = (value: string) => {
    setFormData((prev) => ({ ...prev, email: value }));
    setIsEmailTouched(true);

    if (!value) {
      setEmailError('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Invalid email address');
    } else {
      setEmailError('');
    }
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
    setFormData((prev) => ({ ...prev, password: value }));
    setIsPasswordTouched(true);
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
    const { firstName, lastName, phone, email, password, confirmPassword,description,companyName } = formData;

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
    } else if (!/(?=.*[0-9])/.test(password)) {
      setError('Write at least one number');
      valid = false;
    } else if (!/(?=.{6,})/.test(password)) {
      setError('Write at least 6 characters');
      valid = false;
    } else {
      setError('');
    }

    if (!confirmPassword){
      setConfirmPasswordError('Password is required');
    } 
    else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (showWorkspace) {

    }

    return valid;
  };

  const handleNextOrSignUp = async () => {
    if (handleValidation()) {
      if (showWorkspace) {
        const payload = {
          whatsappNo: formData.phone,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          companyName: formData.companyName,
          industry: businessIndustry,
          teamSize: teamSize,
          description: formData.description,
          categories: selectedCategories,
          country: 'IN',
        };
        console.log('okkkk', payload);
        setButtonSpinner(true);

        try {
          const response = await axios.post(`${backend_Host}/users/signup`, payload);
          console.log('okkkkkkkk', response);
          if (response.data.success) {
            const token = response?.data?.token;
            const userData = response?.data;

            Alert.alert('Success', 'You have signed up successfully!');
            dispatch(logIn({ token, userData }));
            router.push('/(routes)/home');
          } else {
            Alert.alert(response.data.message || 'Invalid credentials');
          }
        } catch (error: any) {
          Alert.alert('Signup Failed', error.response.data.error || 'Something went wrong!');
          console.log('>>>>>>>>>>>>', error.response.data.error);
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
          
          <View 
          className='flex mt-16 relative items-center'
          style={{ marginVertical: verticalScale(25) }}
          >
          <TouchableOpacity className='w-10 ml-4 h-9 absolute left-1 bottom-6 '>
            <Image resizeMode="contain" className='w-full h-full' source={require("../../assets/sign-in/back.png")}/>
          </TouchableOpacity>
          <Image
            className="h-9"
            source={require('../../assets/sign-in/logo.png')}
            resizeMode="contain"
          />
          </View>

          {!showWorkspace && (
            <>
            <View className="flex h-full w-full items-center pb-14">
              <View className="mb-4 flex items-center justify-center gap-4 ">
                <Text className="text-2xl  text-white" style={{fontFamily:"LatoBold"}}>Let’s Get Started</Text>
                <Text className="font-light text-white" style={{fontFamily:"Lato-Light"}}>
                  Let's get started by filling out the form below.
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
                <View className="ml-8 mt-2 flex-row self-start items-center">
                  <Ionicons name="close-circle" size={16} color="#EE4848" />
                  <Text className="font-pathwayExtreme ml-1 self-start text-sm text-red-500" style={{fontFamily:"Lato-Light"}}>
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
                <View className="ml-8 mt-2 flex-row self-start items-center">
                  <Ionicons name="close-circle" size={16} color="#EE4848" />
                  <Text className="font-pathwayExtreme ml-1 self-start text-sm text-red-500" style={{fontFamily:"Lato-Light"}}>
                    {lastNameError}
                  </Text>
                </View>
              )}

              <View className="mb-4 flex w-[69%]  flex-row items-center justify-center gap-2">
                <Dropdown
                  search
                  searchPlaceholder='search'
                  inputSearchStyle={{
                    borderRadius:20,
                    borderWidth:0,
                    color: 'white',
                  }}
                  searchPlaceholderTextColor='#787CA5'
                  style={{
                    borderWidth: 1,
                    borderColor: '#37384B',
                    borderRadius: 29,
                    backgroundColor: '#05071E',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    height: 55,
                    marginTop: 27,
                    width: 100,
                  }}
                  placeholderStyle={{
                    fontSize: 14,
                    color: '#787CA5',
                  }}
                  selectedTextStyle={{
                    fontSize: 10,
                    color: '#787CA5',
                    marginLeft: 2,
                  }}
                  iconStyle={[
                    {
                      width: 10,
                      height: 20,
                      transform: [{ rotate: isDropdownOpen ? '180deg' : '0deg' }],
                    },
                  ]}
                  containerStyle={{
                    backgroundColor: '#05071E',
                    borderColor: '#37384B',
                    borderRadius: 20,
                    overflow: 'hidden',
                  }}
                  data={countryData}
                  labelField="dial_code"
                  valueField="dial_code"
                  placeholder="Select Code"
                  value={numberValue}
                  onFocus={() => setIsDropdownOpen(true)}
                  onBlur={() => setIsDropdownOpen(false)}
                  onChange={(item) => setNumberValue(item.dial_code)}
                  renderLeftIcon={() => {
                    const selectedItem = countryData.find((item) => item.dial_code === numberValue);
                    return (
                      <Text style={{ fontSize: 13 }}>{selectedItem?.flag}</Text>
                    );
                  }}
                  renderItem={(item) => {
                    const isSelected = item.dial_code === numberValue;
                    return (
                      <TouchableOpacity
                        style={[
                          {
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 2,
                            borderBottomColor: '#4e5278',
                            backgroundColor: isSelected ? '#4e5278' : 'transparent',
                            borderBottomWidth: 1,
                          },
                        ]}
                        onPress={() => setNumberValue(item.dial_code)}>
                        <Text style={{ fontSize: 20, marginRight: 10 }}>{item.flag}</Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: isSelected ? '#FFFFFF' : '#787CA5',
                            fontWeight: isSelected ? 'bold' : 'normal',
                          }}>
                          {item.dial_code}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />

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
                <View className="ml-8 mt-2 flex-row self-start items-center">
                  <Ionicons name="close-circle" size={16} color="#EE4848" />
                  <Text className="font-pathwayExtreme ml-1 self-start text-sm text-red-500" style={{fontFamily:"Lato-Light"}}>
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

              { emailError && (
                <View className="ml-8 mt-2 flex-row self-start items-center">
                  <Ionicons name="close-circle" size={16} color="#EE4848" />
                  <Text className="font-pathwayExtreme ml-1 self-start text-sm text-red-500" style={{fontFamily:"Lato-Light"}}>
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
                    <Ionicons name="eye-off-outline" size={23} color={'#FFFFFF'} />
                  ) : (
                    <Ionicons name="eye-outline" size={23} color={'#FFFFFF'} />
                  )}
                </TouchableOpacity>
              </View>

            
                  {error ? (
                    <View className="ml-8 mt-2 flex-row self-start items-center">
                      <Ionicons name="close-circle" size={16} color="#EE4848" />
                      <Text className="font-pathwayExtreme ml-1 self-start text-sm text-red-500" style={{fontFamily:"Lato-Light"}}>
                        {error}
                      </Text>
                    </View>
                  ) : (
                    <View className="ml-8 mt-2 flex-row self-start items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#80ED99" />
                      <Text className="font-pathwayExtreme ml-1 self-start text-sm text-green-500" style={{fontFamily:"Lato-Light"}}>
                        Password is valid!
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
                    <Ionicons name="eye-off-outline" size={23} color={'#FFFFFF'} />
                  ) : (
                    <Ionicons name="eye-outline" size={23} color={'#FFFFFF'} />
                  )}
                </TouchableOpacity>
              </View>


                  {confirmPasswordError ? (
                    <View className="ml-8 mt-2 flex-row self-start items-center">
                      <Ionicons name="close-circle" size={16} color="#EE4848" />
                      <Text className="font-pathwayExtreme ml-1 self-start text-sm text-red-500" style={{fontFamily:"Lato-Light"}}>
                        {confirmPasswordError}
                      </Text>
                    </View>
                  ) : (
                    <View className="ml-8 mt-2 flex-row self-start items-center">
                      <Ionicons name="checkmark-circle" size={16} color="#80ED99" />
                      <Text className="font-pathwayExtreme ml-1 self-start text-sm text-green-500" style={{fontFamily:"Lato-Light"}}>
                        Password matched!
                      </Text>
                    </View>
                  )}
         
           
            <View className="w-full px-4 mt-16">
            <TouchableOpacity
              className={`flex h-[3.7rem] items-center justify-center rounded-full ${
                showWorkspace ? 'bg-[#815BF5]' : 'bg-[#37384B]'
              }`}
              onPress={handleNextOrSignUp}>
              {buttonSpinner ? (
                <ActivityIndicator size="small" color={'white'} />
              ) : (
                <Text className="text-center font-semibold text-white" style={{fontFamily:"LatoBold"}}>
                  {showWorkspace ? 'Sign Up' : 'Create Work Space'}
                </Text>
              )}
            </TouchableOpacity>
            <View className="flex-row items-center justify-center bg-primary py-5">
              <View className="flex-row">
                <Text className="text-base  text-white" style={{fontFamily:"Lato-Light"}}>Already a </Text>
                <GradientText text="Zapllonian" textStyle={{ fontSize: 16, fontWeight: '400' }} />
              </View>
              <TouchableOpacity onPress={() => router.push('/(routes)/login' as any)}>
                <Text className="text-base font-extrabold text-white">? Login Here</Text>
              </TouchableOpacity>
            </View>
          </View>
          </View>
          </>
          )}
          
            
    

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
                <TouchableOpacity
                  className={`flex h-[3.6rem] items-center justify-center rounded-full ${
                    showWorkspace ? 'bg-[#815BF5]' : 'bg-[#37384B]'
                  }`}
                  onPress={handleNextOrSignUp}>
                  {buttonSpinner ? (
                    <ActivityIndicator size="small" color={'white'} />
                  ) : (
                    <Text className="text-center font-semibold text-white">
                      {showWorkspace ? 'Sign Up' : 'Create Work Space'}
                    </Text>
                  )}
                </TouchableOpacity>
                <View className="flex-row  items-center justify-center bg-primary py-5 mb-10">
                  <View className="flex-row">
                    <Text className="text-base  text-white font-light" style={{fontFamily:"Lato-Thin"}}>Already a </Text>
                    <GradientText
                      text="Zapllonian"
                      textStyle={{ fontSize: 16, fontWeight: '400' }}
                    />
                  </View>
                  <TouchableOpacity onPress={() => router.push('/(routes)/login' as any)}>
                    <Text className="text-base font-extrabold text-white" style={{fontFamily:"LatoBold"}}>? Login Here</Text>
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