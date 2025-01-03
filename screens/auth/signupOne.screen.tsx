import React, { useState } from 'react';
import {
  View,
  StyleSheet,
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
import { TextInput, Button } from 'react-native-paper';
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
import CountryPicker from 'react-native-country-picker-modal';

const { width, height } = Dimensions.get('window');

// Utility for scaling sizes
const scale = (size: number) => (width / 375) * size; // Base screen width of 375
const verticalScale = (size: number) => (height / 812) * size; // Base screen height of 812
interface SignupScreenProps {
  navigation: {
    navigate: (route: string) => void;
  };
}
const scaleFontSize = (size: number) => {
  const baseScale = (width / 375) * size; // Adjust for screen width
  return Platform.OS === 'ios' ? baseScale : baseScale * 0.95; // Slightly smaller on Android
};

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [businessIndustry, setBusinessIndustry] = useState<string>('Select Industry');
  const [teamSize, setTeamSize] = useState<string>('Select Team Size');
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
  const [showWorkspace, setShowWorkspace] = useState(true);
  const [error, setError] = useState<string>('');
  const [isPasswordTouched, setIsPasswordTouched] = useState<boolean>(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState('IN'); // Default to India
  const [callingCode, setCallingCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');

  const onSelect = (country: any) => {
    setCountryCode(country.cca2);
    setCallingCode(`+${country.callingCode[0]}`);
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const handlePasswordValidation = (value: string) => {
    const passwordSpecialCharacter = /(?=.*[!@#$&*])/;
    const passwordOneNumber = /(?=.*[0-9])/;
    const passwordSixValue = /(?=.{6,})/;

    if (!passwordSpecialCharacter.test(value)) {
      setError('Write at least one special character');
    } else if (!passwordOneNumber.test(value)) {
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
    const { firstName, lastName, phone, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
      Alert.alert('Validation Error', 'All fields are required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return false;
    }

    return true;
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
            // Store user data in AsyncStorage
            // await AsyncStorage.setItem("userData", JSON.stringify(response.data.data));
            const token = response?.data?.token;
            const userData = response?.data;

            // Navigate to the home screen
            Alert.alert('Success', 'You have signed up successfully!');
            dispatch(logIn({ token, userData }));
            router.push('/(routes)/home');
          } else {
            Alert.alert(response.data.message || 'Invalid credentials');
          }
          //   navigation.navigate(Route.LOGIN);
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
          <Image
            className="h-9 self-center"
            style={{ marginVertical: verticalScale(25) }}
            source={require('../../assets/sign-in/logo.png')}
            resizeMode="contain"
          />
          {!showWorkspace && (
            <View className="px-5">
              <View className="mb-4 flex items-center justify-center gap-4">
                <Text className="text-2xl font-semibold text-white">Let’s Get Started</Text>
                <Text className="mb-4 font-light text-white">
                  Let's get started by filling out the form below.
                </Text>
              </View>
              <TextInput
                label="First Name"
                mode="outlined"
                placeholder="First Name"
                placeholderTextColor="#787CA5"
                textColor="#FFFFFF"
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => handleChange('firstName', text)}
                theme={{
                  roundness: 25,
                  colors: {
                    primary: '#787CA5',
                    background: '#37384B',
                  },
                }}
              />
              <TextInput
                label="Last Name"
                mode="outlined"
                placeholder="Last Name"
                placeholderTextColor="#787CA5"
                textColor="#FFFFFF"
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => handleChange('lastName', text)}
                theme={{
                  roundness: 25,
                  colors: {
                    primary: '#787CA5',
                    background: '#37384B',
                  },
                }}
              />

              <View style={styles.row}>
                <TextInput
                  label="+91"
                  mode="outlined"
                  style={[styles.input, styles.phoneCode]}
                  editable={false}
                  theme={{ roundness: 25 }}
                  right={<TextInput.Icon icon={'menu-down'} size={25} color="#787CA5" />}
                />
                <TextInput
                  label="WhatsApp Number"
                  mode="outlined"
                  textColor="#FFFFFF"
                  placeholderTextColor="#787CA5"
                  style={[styles.input, styles.phoneNumber]}
                  value={formData.phone}
                  onChangeText={(text) => handleChange('phone', text)}
                  keyboardType="phone-pad"
                  theme={{ roundness: 25 }}
                />
              </View>

              <TextInput
                label="Email Address"
                mode="outlined"
                placeholder="Email Address"
                placeholderTextColor="#787CA5"
                textColor="#FFFFFF"
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                theme={{
                  roundness: 25,
                  colors: {
                    primary: '#787CA5',
                    background: '#37384B',
                  },
                }}
              />

              <TextInput
                label="Password"
                mode="outlined"
                placeholder="**********"
                placeholderTextColor="#787CA5"
                textColor="#FFFFFF"
                style={styles.input}
                secureTextEntry={!passwordVisible}
                textContentType="none"
                value={formData.password}
                onChangeText={handlePasswordValidation}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={25}
                    color="#fff"
                    onPress={() => setPasswordVisible(!passwordVisible)}
                  />
                }
                theme={{
                  roundness: 25,
                  colors: {
                    primary: error ? '#EE4848' : '#787CA5',
                    background: '#37384B',
                  },
                }}
              />
              {isPasswordTouched && (
                <>
                  {error ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 10,
                        marginTop: verticalScale(-10),
                        marginBottom: verticalScale(5),
                      }}>
                      <Ionicons name="close-circle" size={16} color="#EE4848" />
                      <Text style={styles.invalidText}>{error}</Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 10,
                        marginTop: verticalScale(-10),
                        marginBottom: verticalScale(5),
                      }}>
                      <Ionicons name="checkmark-circle" size={16} color="#80ED99" />
                      <Text style={styles.validText}>Password is valid!</Text>
                    </View>
                  )}
                </>
              )}

              <TextInput
                label="Confirm Password"
                mode="outlined"
                placeholder="**********"
                placeholderTextColor="#787CA5"
                textColor="#FFFFFF"
                style={styles.input}
                secureTextEntry={!confirmPasswordVisible}
                value={formData.confirmPassword}
                onChangeText={handleConfirmPasswordValidation}
                right={
                  <TextInput.Icon
                    icon={confirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={25}
                    color="#fff"
                    onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                  />
                }
                theme={{
                  roundness: 25,
                  colors: {
                    primary: confirmPasswordError ? '#EE4848' : '#787CA5',
                    background: '#37384B',
                  },
                }}
              />
              {isConfirmPasswordTouched && (
                <>
                  {confirmPasswordError ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 10,
                        marginTop: verticalScale(-10),
                        marginBottom: verticalScale(5),
                      }}>
                      <Ionicons name="close-circle" size={16} color="#EE4848" />
                      <Text style={styles.invalidText}>{confirmPasswordError}</Text>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: 10,
                        marginTop: verticalScale(-10),
                        marginBottom: verticalScale(5),
                      }}>
                      <Ionicons name="checkmark-circle" size={16} color="#80ED99" />
                      <Text style={styles.validText}>Password matched!</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {showWorkspace && (
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
          )}

          <View>
            <Button
              mode="contained"
              style={[
                styles.button,
                {
                  backgroundColor: '#37384B',
                },
                Platform.OS === 'ios' ? { padding: 7 } : { padding: 2 },
              ]}
              onPress={handleNextOrSignUp}
              disabled={buttonSpinner} // Disable button while loading
            >
              {buttonSpinner ? (
                <ActivityIndicator size="small" color="white" />
              ) : showWorkspace ? (
                'Sign Up'
              ) : (
                'Create Work Space'
              )}
            </Button>
          </View>
          <View style={styles.registerContainer}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={styles.registerText}>Already a </Text>
              <GradientText text="Zapllonian" textStyle={styles.registerText} />
            </View>
            <TouchableOpacity onPress={() => router.push('/(routes)/login' as any)}>
              <Text style={styles.registerLink}>? Login Here</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: '100%',
    backgroundColor: '#05071E',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(30),
  },
  logo: {
    height: verticalScale(30),
    width: scale(200),
    alignSelf: 'center',
    marginVertical: verticalScale(25),
  },
  subtitle: {
    color: '#fff',
    fontSize: scaleFontSize(20), // Platform-adjusted scaling
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: verticalScale(5),
  },
  description: {
    color: '#fff',
    textAlign: 'center',
    marginTop: verticalScale(5),
    marginBottom: verticalScale(25),
    fontSize: scaleFontSize(14),
  },
  input: {
    marginBottom: verticalScale(20),
    backgroundColor: '#05071E',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(15),
  },
  phoneCode: {
    flex: 1,
    marginRight: scale(10),
  },
  phoneNumber: {
    flex: 3,
  },
  button: {
    marginTop: verticalScale(10),
    backgroundColor: '#37384B',
    borderRadius: scale(25),
    marginHorizontal: scale(8),
  },
  registerContainer: {
    marginTop: verticalScale(25),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
  },
  registerLink: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  highlight: {
    color: '#FF9800',
  },
  link: {
    color: '#4E86E4',
    textDecorationLine: 'underline',
    fontSize: scale(12),
  },
  validText: {
    color: '#4CAF50',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginLeft: scale(5),
  },
  invalidText: {
    color: '#F44336',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginLeft: scale(5),
  },
});

export default SignupScreen;
