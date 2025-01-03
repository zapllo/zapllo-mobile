import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import axios from 'axios';
import { backend_Host } from '../../config';
import { useDispatch } from 'react-redux';
import { GradientText } from '~/components/GradientText';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch } from '~/redux/store';
import { logIn } from '~/redux/slices/authSlice';
const { width, height } = Dimensions.get('window');

// Utility for scaling sizes
const scale = (size: number) => (width / 375) * size; // Base screen width of 375
const verticalScale = (size: number) => (height / 812) * size; // Base screen height of 812

interface LoginScreenProps {
  navigation: {
    navigate: (route: string) => void;
  };
}

const Loginscreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isPasswordTouched, setIsPasswordTouched] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isChecked, setIsChecked] = useState(false);
  const [buttonSpinner, setButtonSpinner] = useState(false);

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
    setPassword(value);
    setIsPasswordTouched(true);
  };

  const handleValidation = (): boolean => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'All fields are required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (handleValidation()) {
      const payload = {
        email: email,
        password: password,
      };
      try {
        const response = await axios.post(`${backend_Host}/users/login`, payload);
        if (response.data.success) {
          const token = response?.data?.token;
          const userData = response?.data?.data;
          Alert.alert(response?.data?.message);
          dispatch(logIn({ token, userData }));
          router.push('/(routes)/home');
        } else {
          setError(response.data.message || 'Invalid credentials');
        }
      } catch (error: any) {
        console.log("object",error)
        Alert.alert('Login Failed',  error.response.data.error || 'Something went wrong!');
      } finally {
        setButtonSpinner(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View>
          <Image style={styles.logo} source={require('../../assets/sign-in/sign_in.png')} />
        </View>
        <Image style={styles.teamImg} source={require('../../assets/sign-in/logo.png')} />

        <TextInput
          label="Email Address"
          mode="outlined"
          placeholder="Email Address"
          placeholderTextColor="#787CA5"
          textColor="#FFFFFF"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
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
          style={[styles.input, styles.passwordInput]}
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={handlePasswordValidation}
          right={
            <TextInput.Icon
              icon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={25}
              color="#fff"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
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
              <View style={{ flexDirection: 'row', marginLeft: 5, marginTop: verticalScale(-15) }}>
                <Ionicons name="close-circle" size={16} color={'#EE4848'} />
                <Text style={styles.invalidText}>{error}</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', marginLeft: 5, marginTop: verticalScale(-15) }}>
                <Ionicons name="checkmark-circle" size={16} color={'#80ED99'} />
                <Text style={styles.validText}>Password is valid!</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.buttonContainer}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>

          <Button
            mode="contained"
            style={[
              styles.button,
              {
                backgroundColor: email && password ? '#815BF5' : '#37384B',
              },
              Platform.OS === 'ios' ? { padding: 7 } : { padding: 2 },
            ]}
            disabled={!email || !password || buttonSpinner}
            onPress={handleLogin}>
            {buttonSpinner ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </Button>
        </View>
        <View style={styles.termsContainer}>
          <TouchableOpacity onPress={() => setIsChecked(!isChecked)} style={styles.checkbox}>
            <Ionicons name="checkbox" size={23} color={isChecked ? '#fff' : '#37384B'} />
          </TouchableOpacity>
          <View style={styles.textContainer}>
            <Text style={styles.termsText}>By clicking continue, you agree to</Text>
            <Text style={styles.termsText}>
              our <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>

        <View style={styles.registerContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.registerText}>Not a </Text>
            <GradientText text="Zapllonian" textStyle={styles.registerText} />
          </View>
          <TouchableOpacity onPress={() => router.push('/(routes)/signup/pageOne' as any)}>
            <Text style={styles.registerLink}>? Register Here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05071E',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(30),
  },
  logo: {
    height: verticalScale(41),
    width: scale(220),
    alignSelf: 'center',
    marginVertical: verticalScale(50),
  },
  teamImg: {
    height: verticalScale(29),
    width: scale(206),
    alignSelf: 'center',
    marginVertical: verticalScale(25),
  },
  input: {
    marginBottom: verticalScale(25),
    backgroundColor: '#05071E',
  },
  passwordInput: {
    paddingRight: 40,
  },
  validText: {
    color: '#4CAF50',
    fontSize: 13,
    alignSelf: 'flex-start',
    fontFamily: 'PathwayExtreme',
    marginLeft: scale(5),
  },
  invalidText: {
    color: '#F44336',
    fontSize: 13,
    alignSelf: 'flex-start',
    fontFamily: 'PathwayExtreme',
    marginLeft: scale(5),
  },
  buttonContainer: {
    marginTop: verticalScale(25),
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#ffffff',
    fontSize: 16,
    marginRight: scale(15),
    fontFamily: 'PathwayExtreme',
  },
  button: {
    marginTop: verticalScale(15),
    backgroundColor: '#37384B',
    borderRadius: scale(25),
    marginHorizontal: scale(5),
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsContainer: {
    flexDirection: 'row', // Row layout for checkbox and text
    alignItems: 'flex-start', // Align items at the top
    marginHorizontal: 10,
    marginVertical: 15,
  },
  checkbox: {
    marginRight: 10, // Space between checkbox and text
    marginTop: 5, // Align checkbox vertically with text
  },
  textContainer: {
    // flex: 1, // Ensure text wraps properly
  },
  termsText: {
    color: '#fff', // White text color
    fontSize: 15, // Match font size
    lineHeight: 20, // Improve readability
    fontWeight: '500',
  },
  linkText: {
    color: '#815BF5', // Link color
    textDecorationLine: 'underline', // Underline style for links
  },
  registerContainer: {
    position: 'absolute',
    bottom: verticalScale(20),
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
});

export default Loginscreen;
