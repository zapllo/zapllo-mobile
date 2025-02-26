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
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useFocusEffect } from '@react-navigation/native';
import CustomAlert from '~/components/CustomAlert/CustomAlert';

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

  useFocusEffect(
    React.useCallback(() => {
      handleGetProfile();
    }, [])
  );

  const handleLogout = async () => {
    setButtonSpinner(true);

    try {
      const response = await axios.get(
        `${backend_Host}/users/logout`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setButtonSpinner(true);
      setCustomAlertVisible(true);
      setCustomAlertMessage('Logged out successfully!');
      setCustomAlertType('success');
      router.push('/(routes)/login');
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);

      setButtonSpinner(true);
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
          <NavbarTwo title="Profile" image={image} profile={profilePic} onBackPress={() => navigation.goBack()} />

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
                  className=" w-16 rounded-lg bg-[#815BF5] p-1 text-center text-[11px] font-light text-white"
                  style={{ fontFamily: 'Lato-thin' }}>
                  {userData?.user?.role || userData?.data?.role === 'orgAdmin' ? 'Admin' : 'User'}
                </Text>
              </View>
            </View>

            <View className="flex w-[90%] flex-row items-center justify-start gap-4">
              {/* line */}
              <View className="mb-9 mt-9 h-0.5 w-full bg-[#37384B]"></View>
            </View>

            {/* Account Information */}
            <View className="w-full">
              <Text
                className="ml-7 text-start text-sm text-[#787CA5] "
                style={{ fontFamily: 'LatoBold' }}>
                Account Information
              </Text>

              <View className="flex w-full items-center ">
                {/* Email */}
                <View className='w-full  flex items-center relative'>
                  <Infocontainer
                    placeholder=""
                    value={userData?.user?.email || userData?.data?.email}
                    passwordError={''}
                    onChangeText={() => {
                      ('');
                    }}
                  />
                  <View className=' flex items-center justify-center h-8 w-16 rounded-full border border-[#384387] bg-transparent  pl-4 '
                    style={{ position: "absolute", left: "75%", top: "50%" }}
                  >
                    <AntDesign
                      name='mail'
                      color={"#384387"}
                      size={20}
                    />
                  </View>

                </View>


                {/* Phone Number */}
                <View className="mt-1 flex w-[100%] flex-row items-center justify-center gap-3">


                  <Infocontainer
                    placeholder="7863983914"
                    keyboardType="numeric"
                    value={userData?.user?.whatsappNo || userData?.data?.whatsappNo}
                    passwordError={''}
                    onChangeText={() => {
                      ('');
                    }}
                  />
                  <View className=' flex items-center justify-center h-8 w-16 rounded-full border border-[#384387] bg-transparent  pl-4 '
                    style={{ position: "absolute", left: "75%", top: "50%" }}
                  >
                    <Ionicons
                      name='call-outline'
                      className=']'
                      color={"#384387"}
                      size={20}
                    />
                  </View>
                </View>

                {/* change pasword buttons */}

                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/ChangePassword' as any)}
                  className={`mt-6 flex  h-[3.7rem] w-[90%] items-center justify-center rounded-full bg-[#37384B] p-2.5`}>
                  <Text className="text-center  text-white " style={{ fontFamily: 'LatoBold' }}>
                    Change Password
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* supports */}
            <View className=" flex w-[90%] flex-col items-start gap-2">
              {/* line */}
              <View className="mb-9 mt-9 h-0.5 w-full bg-[#37384B]"></View>
              <Text className="text-xs text-[#787CA5]" style={{ fontFamily: 'LatoBold' }}>
                Support
              </Text>

              {/* Tutorials */}
              <View className="w-full items-center gap-5">
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/tutorials' as any)}
                  className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white" style={{ fontFamily: 'LatoBold' }}>
                    Tutorials
                  </Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>

              {/* My Tickets */}
              <View className="mt-4 w-full items-center gap-5">
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/Tickits' as any)}
                  className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white" style={{ fontFamily: 'LatoBold' }}>
                    Tickets
                  </Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>

              {/* Billing */}
              <View className="mt-4 w-full items-center gap-5">
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/billing' as any)}
                  className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white" style={{ fontFamily: 'LatoBold' }}>
                    Billing
                  </Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>

              {/* Checklist */}
              <View className="mt-4 w-full items-center gap-5">
                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/Checklist' as any)}
                  className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white" style={{ fontFamily: 'LatoBold' }}>
                    Checklist
                  </Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>

              {/* Events */}
              <View className="mt-4 w-full items-center gap-5">
                <TouchableOpacity className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white" style={{ fontFamily: 'LatoBold' }}>
                    Events
                  </Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>

              {/* Time zone */}
              <View className="mt-4 w-full items-center gap-5">
                <TouchableOpacity className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white" style={{ fontFamily: 'LatoBold' }}>
                    Time zone
                  </Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>

              {/* Change Language */}
              <View className="mt-4 w-full items-center gap-5">
                <TouchableOpacity className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white" style={{ fontFamily: 'LatoBold' }}>
                    Change Language
                  </Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>
            </View>

            {/* LOGOUT */}
            <TouchableOpacity
              onPress={handleLogout}
              className={`mt-8 flex  h-[3.7rem] w-[90%] items-center justify-center rounded-full bg-[#EF4444] p-2.5`}>
              {buttonSpinner ? (
                <ActivityIndicator size="small" color={'white'} />
              ) : (
                <Text
                  className="text-center text-lg  font-semibold text-white "
                  style={{ fontFamily: 'LatoBold' }}>
                  Log Out
                </Text>
              )}
            </TouchableOpacity>
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

export default ProfileScreen;
