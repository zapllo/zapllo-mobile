
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Clipboard,
  StyleSheet,
  Animated,
} from 'react-native';
import NavbarTwo from '~/components/navbarTwo';
import { router, useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import Infocontainer from '~/components/profile/InfoInpu';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '~/redux/store';
import { useDispatch } from 'react-redux';
import ProfileImage from '~/components/profile/ProfileImage';
import { AntDesign, Entypo, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useFocusEffect } from '@react-navigation/native';
import CustomAlert from '~/components/CustomAlert/CustomAlert';
import { rgba } from '@tamagui/core';
import { Share } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { logOut } from '~/redux/slices/authSlice';

// Define the type for your navigation
type RootStackParamList = {
  '(routes)/home/index': undefined; // Define your routes with parameters (if any)
};

const data = [
  { label: '+91', value: '+91', icon: require('~/assets/sign-in/india.png') },
  { label: '+222', value: '+222' },
  { label: '+102', value: '+102' },
  { label: '+100', value: '+100' },
  { label: '+69', value: '+69' },
  { label: '++100', value: '++100' },
  { label: '+11', value: '+11' },
  { label: '+12', value: '+12' },
];

type NavigationProp = StackNavigationProp<RootStackParamList, '(routes)/home/index'>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn, token, userData } = useSelector((state: RootState) => state.auth);
  const [image, setImage] = useState<string | null>(null);
  const [numberValue, setNumberValue] = useState(data[0]?.value || null);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState();
  const [profilePic, setProfilePic] = useState('');
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<'success' | 'error' | 'loading'>('success');
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const appLink = "https://zapllo.com/download"; 

  const toggleShareModal = () => {
    setIsShareModalVisible(!isShareModalVisible);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out Zapllo: ${appLink}`,
        url: appLink, // iOS only
        title: 'Zapllo App', // Android only
      });
      setIsShareModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while sharing');
    }
  };

  const handleCopyLink = () => {
    Clipboard.setString(appLink);
    Alert.alert('Success', 'Link copied to clipboard');
    setIsShareModalVisible(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      handleGetProfile();
    }, [])
  );

  const handleLogoutClick = () => {
    setIsLogoutModalVisible(true);
  };

  const cancelLogout = () => {
    setIsLogoutModalVisible(false);
  };

  const handleLogout = async () => {
    setButtonSpinner(true);
    setIsLogoutModalVisible(false);

    try {
      // Call the logout API
      const response = await axios.get(
        `${backend_Host}/users/logout`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Clear all auth-related data from SecureStore
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userData');
      await SecureStore.deleteItemAsync('hasCompletedLogin');
      
      // Dispatch logout action to clear Redux state
      dispatch(logOut());
      
      // Show success message
      setCustomAlertVisible(true);
      setCustomAlertMessage('Logged out successfully!');
      setCustomAlertType('success');
      
      // Navigate to login screen
      router.push('/(routes)/login');
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      
      // Even if API fails, clear local storage for security
      try {
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('userData');
        await SecureStore.deleteItemAsync('hasCompletedLogin');
        dispatch(logOut());
        router.push('/(routes)/login');
      } catch (storageErr) {
        console.error('Error clearing secure storage:', storageErr);
      }
      
      setCustomAlertVisible(true);
      setCustomAlertMessage('Failed to log out. Please try again.');
      setCustomAlertType('error');
    } finally {
      setButtonSpinner(false);
    }
  };

  const handleGetProfile = async () => {
    try {
      const response = await axios.get(
        `${backend_Host}/users/me`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log("pljoihbihbuoi", response.data.data.profilePic)
      setProfilePic(response.data.data.profilePic);
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
    }
  };

  const uploadPhoto = async ({ picture }) => {

    try {
      const base64Data = picture.base64;
      const mimeType = picture.mimeType || 'image/jpeg';
      const dataUri = `data:${mimeType};base64,${base64Data}`;

      // Create a FormData object
      const formData = new FormData();
      // Here we append the file as a Blob with the appropriate mime type
      formData.append(
        'files',
        {
          uri: dataUri, // Base64 data URI
          type: mimeType, // MIME type (image/jpeg or image/png)
          name: picture.fileName || 'photo.jpg', // Default file name
        },
        '[PROXY]'
      );

      // Send the formData to the backend using Axios
      const uploadResponse = await axios.post('https://zapllo.com/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfilePhoto(uploadResponse?.data?.fileUrls[0]);

    } catch (error: any) {
      console.error('Error uploading image:', error.response || error.message);
      if (error.response) {
        console.log('Error Response:', error.response.data);
        console.log('Error Headers:', error.response.headers);
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    console.log(result);

    if (!result.canceled) {
      setProfileModal(false)
      uploadPhoto({ picture: result.assets[0] });
      handleProfileUpdate();
    } else {
      setProfileModal(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true)
    try {
      const response = await axios.patch(
        `${backend_Host}/users/profilePic`,
        { profilePic: profilePhoto },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setImage(response?.data?.profilePic);
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      setButtonSpinner(true);
      setCustomAlertVisible(true);
      setCustomAlertMessage('Failed to update profile. Please try again.');
      setCustomAlertType('error');

    } finally {
      setLoading(false)
    }
  };

  console.log("ppppppp", profilePic, image)
  return (
    <SafeAreaView className="h-full w-full flex-1 bg-[#05071E]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="w-full">
        <ScrollView
          className="h-full w-full flex-grow"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          {/* Navbar */}
          <NavbarTwo title="Profile"  />

          {/* container */}
          <View className="mb-12 mt-3 flex h-full   w-full items-center">
            {/*profile photo name and role */}
            <View className="flex w-[90%] flex-row items-center justify-start gap-5">
              <TouchableOpacity
                onPress={() => setProfileModal(true)}
                className="w-18 h-18 rounded-full border border-[#0A0D28]">
                <MaterialCommunityIcons
                  className=" absolute -right-2 bottom-0 z-20 rounded-full bg-[#111434] p-1.5"
                  name="camera-retake"
                  size={12}
                  color="#b5afaf"
                />
                <ProfileImage
                  profilePic={profilePic}
                  firstName={userData?.user?.firstName || userData?.data?.firstName}
                  lastName={userData?.user?.lastName || userData?.data?.lastName}
                  image={image}
                  loading={loading}
                />
              </TouchableOpacity>

              <View className=" flex flex-col items-start gap-1">
                <Text className="text-xl font-medium text-white" style={{ fontFamily: 'LatoBold' }}>
                  {userData?.user?.firstName || userData?.data?.firstName}{' '}
                  {userData?.user?.lastName || userData?.data?.lastName}
                </Text>
                <Text
                  className=" w-16 rounded-full border border-[#865ffa] p-1 text-center text-[10px] font-light text-white"
                  style={{ fontFamily: 'Lato-thin' ,backgroundColor:"rgba(127, 71, 192, 0.3)"}}>
                  {userData?.user?.role || userData?.data?.role === 'orgAdmin' ? 'Admin' : 'User'}
                </Text>
              </View>
            </View>

            <View className="flex w-[90%] flex-row items-center justify-start gap-4">
              {/* line */}
              <View className="mb-9 mt-9 rounded-full h-0.5 w-full bg-[#453f56]"></View>
            </View>


            {/* Account Information */}
            <View className="w-full px-5 mt-6">
              <Text
                className="text-[#787CA5] text-sm mb-4 font-medium"
                style={{ fontFamily: 'LatoBold' }}>
                ACCOUNT INFORMATION
              </Text>

              <View className="flex w-full items-center">
                {/* Email */}
                <View className="w-full mb-3">
                  <View className="bg-[#0A0D28] rounded-xl shadow-md shadow-[#000]/20 overflow-hidden">
                    <View className="flex-row items-center px-4 py-3.5">
                      <View className="h-9 w-9 rounded-full bg-[#1E2142] items-center justify-center mr-3">
                        <AntDesign name="mail" color="#815BF5" size={18} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#787CA5] text-xs mb-0.5" style={{ fontFamily: 'Lato-Regular' }}>
                          Email Address
                        </Text>
                        <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>
                          {userData?.user?.email || userData?.data?.email}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Phone Number */}
                <View className="w-full mb-3">
                  <View className="bg-[#0A0D28] rounded-xl shadow-md shadow-[#000]/20 overflow-hidden">
                    <View className="flex-row items-center px-4 py-3.5">
                      <View className="h-9 w-9 rounded-full bg-[#1E2142] items-center justify-center mr-3">
                        <Ionicons name="call-outline" color="#815BF5" size={18} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#787CA5] text-xs mb-0.5" style={{ fontFamily: 'Lato-Regular' }}>
                          Phone Number
                        </Text>
                        <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>
                          {userData?.user?.whatsappNo || userData?.data?.whatsappNo || "Add phone number"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Change Password Button */}
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/ChangePassword' as any)}
                  className="mt-4 w-full bg-[#1E2142] rounded-xl overflow-hidden shadow-md shadow-[#000]/20">
                  <View className="flex-row items-center px-4 py-3.5">
                    <View className="h-9 w-9 rounded-full bg-[#0A0D28] items-center justify-center mr-3">
                      <AntDesign name="lock" color="#815BF5" size={18} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>
                        Change Password
                      </Text>
                    </View>
                    <AntDesign name="right" color="#787CA5" size={16} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Support Section */}
            <View className="w-full px-5 mt-8">
              <Text
                className="text-[#787CA5] text-sm mb-4 font-medium"
                style={{ fontFamily: 'LatoBold' }}>
                SUPPORT & SETTINGS
              </Text>

              <View className="bg-[#0A0D28] rounded-xl shadow-md shadow-[#000]/20 overflow-hidden mb-4">

              {
                userData?.user?.role || userData?.data?.role === 'orgAdmin' && 
                <TouchableOpacity
                onPress={() => router.push('/(routes)/profile/general' as any)}
                className="flex-row items-center px-4 py-3.5 border-b border-[#1E2142]">
                <View className="h-9 w-9 rounded-full bg-[#1E2142] items-center justify-center mr-3">
                  <AntDesign name="setting" color="#815BF5" size={18} />
                </View>
                <View className="flex-1">
                  <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>
                    General
                  </Text>
                </View>
                <AntDesign name="right" color="#787CA5" size={16} />
              </TouchableOpacity>
              }


                {/* Tutorials */}
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/tutorials' as any)}
                  className="flex-row items-center px-4 py-3.5 border-b border-[#1E2142]">
                  <View className="h-9 w-9 rounded-full bg-[#1E2142] items-center justify-center mr-3">
                    <AntDesign name="videocamera" color="#815BF5" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>
                      Tutorials
                    </Text>
                  </View>
                  <AntDesign name="right" color="#787CA5" size={16} />
                </TouchableOpacity>

                {/* Tickets */}
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/Tickits' as any)}
                  className="flex-row items-center px-4 py-3.5 border-b border-[#1E2142]">
                  <View className="h-9 w-9 rounded-full bg-[#1E2142] items-center justify-center mr-3">
                    <AntDesign name="tagso" color="#815BF5" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>
                      Tickets
                    </Text>
                  </View>
                  <AntDesign name="right" color="#787CA5" size={16} />
                </TouchableOpacity>

                {/* Billing */}
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/billing' as any)}
                  className="flex-row items-center px-4 py-3.5 border-b border-[#1E2142]">
                  <View className="h-9 w-9 rounded-full bg-[#1E2142] items-center justify-center mr-3">
                    <AntDesign name="creditcard" color="#815BF5" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>
                      Billing
                    </Text>
                  </View>
                  <AntDesign name="right" color="#787CA5" size={16} />
                </TouchableOpacity>

                {/* Checklist */}
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/Checklist' as any)}
                  className="flex-row items-center px-4 py-3.5 border-b border-[#1E2142]">
                  <View className="h-9 w-9 rounded-full bg-[#1E2142] items-center justify-center mr-3">
                    <AntDesign name="checkcircleo" color="#815BF5" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>
                      Checklist
                    </Text>
                  </View>
                  <AntDesign name="right" color="#787CA5" size={16} />
                </TouchableOpacity>

                {/* Share the App */}
                <TouchableOpacity
        onPress={toggleShareModal}
        className="flex-row items-center px-4 py-3.5">
        <View className="h-9 w-9 rounded-full bg-[#1E2142] items-center justify-center mr-3">
          <Entypo name="share" color="#815BF5" size={18} />
        </View>
        <View className="flex-1">
          <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>
            Share the app
          </Text>
        </View>
        <AntDesign name="right" color="#787CA5" size={16} />
      </TouchableOpacity>
              </View>
            </View>

            {/* LOGOUT */}
            <View className="w-full px-5 mt-8 mb-10">
              <TouchableOpacity
                onPress={handleLogoutClick}
                className="bg-[#1E2142] rounded-xl overflow-hidden shadow-md shadow-[#000]/20">
                <View className="flex-row items-center px-4 py-3.5">
                  <View className="h-9 w-9 rounded-full bg-[#2A0A0A] items-center justify-center mr-3">
                    <AntDesign name="logout" color="#EF4444" size={18} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[#EF4444] text-base font-medium" style={{ fontFamily: 'LatoBold' }}>
                      Log Out
                    </Text>
                  </View>
                  {buttonSpinner && (
                    <ActivityIndicator size="small" color="#EF4444" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <Modal
            isVisible={profileModal}
            onBackdropPress={() => setProfileModal(false)}
            style={{ margin: 0, justifyContent: 'flex-end' }}
            animationIn="slideInUp"
            animationOut="slideOutDown">
            <View className="mb-10 mt-2 flex w-full flex-col items-center justify-center">
              <View className=" mb-2 w-[95%]  items-center rounded-2xl bg-[#14173b] p-4 ">
                <TouchableOpacity
                  onPress={pickImage}
                  className="w-full items-center rounded-2xl pb-3 ">
                  <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                    Add profile photo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="w-full items-center rounded-2xl pt-3 ">
                  <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                    Delete profile photo
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className=" mt-3 w-[95%] items-center rounded-2xl bg-[#14173b] p-3 "
                onPress={() => setProfileModal(false)}>
                <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>


          {/* share modal */}
          <Modal
        isVisible={isShareModalVisible}
        onBackdropPress={toggleShareModal}
        onBackButtonPress={toggleShareModal}
        swipeDirection="down"
        onSwipeComplete={toggleShareModal}
        style={{ margin: 0, justifyContent: 'flex-end' }}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown">
        <View className="bg-[#1E2142] rounded-t-3xl p-5 ">
          <View className=" flex flex-row w-12 h-1 bg-gray-500 rounded-full self-center mb-5 opacity-50" />
          
       <View className=' flex flex-row items-start'>
       <TouchableOpacity 
            onPress={handleShare}
            className="flex-col items-center mb-5 px-2 gap-1 py-3 justify-center">
            <View className="h-14 w-14 rounded-full bg-[#2A2E54] items-center justify-center mr-4">
              <Ionicons name="share-social" color="#815BF5" size={20} />
            </View>
            <Text className="text-white text-xs" style={{ fontFamily: 'LatoRegular' }}>
              Share to...
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleCopyLink}
            className="flex-col items-center px-2 py-3 gap-1 justify-center">
            <View className="h-14 w-14 rounded-full bg-[#2A2E54] items-center justify-center mr-4">
              <Ionicons name="copy-outline" color="#815BF5" size={20} />
            </View>
            <Text className="text-white text-xs" style={{ fontFamily: 'LatoRegular' }}>
              Copy link
            </Text>
          </TouchableOpacity>
       </View>

          
     
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isVisible={isLogoutModalVisible}
        onBackdropPress={cancelLogout}
        backdropOpacity={0.6}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={300}
        animationOutTiming={300}
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={300}
        style={{ margin: 20, justifyContent: 'center' }}
        customBackdrop={
          <BlurView intensity={Platform.OS === 'ios' ? 40 : 80} tint="dark" style={StyleSheet.absoluteFill} />
        }
      >
        <Animated.View className="bg-[#1F2235] rounded-2xl overflow-hidden">
          <LinearGradient
            colors={['#1F2235', '#141625']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6"
          >
            <View className="items-center mb-4 mt-5">
              <LinearGradient
                colors={['rgba(255, 71, 87, 0.2)', 'rgba(255, 71, 87, 0.1)']}
                style={{ width: 50, height: 50,borderRadius:50,display:'flex',alignItems:'center',justifyContent:'center' }}
              
              >
                <Image
                  style={{ width: 30, height: 30 }}
                  source={require('../../assets/Tickit/delIcon.png')}
                />
              </LinearGradient>
            </View>
            
            <Text className="text-white text-xl font-bold text-center mb-2" style={{ fontFamily: 'LatoBold' }}>
              Logout Confirmation
            </Text>
            <Text className="text-[#787CA5] text-base text-center mb-6" style={{ fontFamily: 'LatoRegular' }}>
              Are you sure you want to log out of your account?
            </Text>
            
            <View className="flex-row justify-between space-x-4">
              <TouchableOpacity
                onPress={cancelLogout}
                className="flex-1"
              >
                <BlurView intensity={20} tint="dark" className="rounded-xl overflow-hidden">
                  <View className="px-4 py-3 items-center">
                    <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>Cancel</Text>
                  </View>
                </BlurView>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-1"
                disabled={buttonSpinner}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF4757']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="rounded-xl"
                >
                  <View className="px-4 py-3 items-center flex-row justify-center">
                    {buttonSpinner ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="logout" size={18} color="#fff" className="mr-2" />
                        <Text className="text-white text-base" style={{ fontFamily: 'LatoBold' }}>Logout</Text>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
      <CustomAlert
        visible={customAlertVisible}
        message={customAlertMessage}
        type={customAlertType}
        onClose={() => setCustomAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default ProfileScreen;