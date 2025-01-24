import React, { useState } from 'react';
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
import InputContainer from '~/components/InputContainer';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '~/redux/store';
import { useDispatch } from 'react-redux';
import { logOut } from '~/redux/slices/authSlice';
import ProfileImage from '~/components/profile/ProfileImage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [numberValue, setNumberValue] = useState(data[0]?.value || null);
  const [buttonSpinner, setButtonSpinner] = useState(false);
  const [profileModal, setProfileModal] = useState(false);

  const handleLogout = () => {
    setButtonSpinner(true);
    setTimeout(() => {
      dispatch(logOut());
      setButtonSpinner(false);
      Alert.alert('Logged out sucessfully!');
      router.push('/(routes)/login');
    }, 1000);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }else{
      setProfileModal(false)
    }
  };


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
          <NavbarTwo title="Profile" onBackPress={() => navigation.goBack()} />

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
                  profilePic={userData?.data?.profilePic || userData?.user?.profilePic}
                  firstName={userData?.user?.firstName || userData?.data?.firstName}
                  lastName={userData?.user?.lastName || userData?.data?.lastName}
                  image={image}
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

              <View className="flex w-full items-center">
                {/* mail */}
                <InputContainer
                  label="Email"
                  placeholder=""
                  className="flex-1 text-sm text-[#787CA5]"
                  value={userData?.user?.email || userData?.data?.email}
                  passwordError={''}
                  onChangeText={() => {
                    ('');
                  }}
                />

                {/* numbers */}
                <View className="mt-1 flex w-[69%]  flex-row items-center justify-center gap-3">
                  <Dropdown
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
                        width: 20,
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
                    data={data}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Code"
                    value={numberValue}
                    onFocus={() => setIsDropdownOpen(true)} // Handle open state
                    onBlur={() => setIsDropdownOpen(false)} // Handle close state
                    onChange={(item) => setNumberValue(item.value)} // Handle selection
                    renderLeftIcon={() => {
                      const selectedItem = data.find((item) => item.value === numberValue);
                      return (
                        <Image
                          source={selectedItem?.icon}
                          style={{ width: 15, height: 20, marginRight: 5 }}
                          resizeMode="contain"
                        />
                      );
                    }}
                    renderItem={(item) => {
                      const isSelected = item.value === numberValue;
                      return (
                        <TouchableOpacity
                          style={[
                            {
                              flexDirection: 'row',
                              alignItems: 'center',
                              padding: 10,
                              borderBottomColor: '#4e5278',
                              backgroundColor: isSelected ? '#4e5278' : 'transparent',
                              borderBottomWidth: 1,
                            },
                          ]}
                          onPress={() => setNumberValue(item.value)}>
                          <Image
                            source={item.icon}
                            style={{ width: 15, height: 20, marginRight: 10 }}
                            resizeMode="contain"
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              color: isSelected ? '#FFFFFF' : '#787CA5',
                              fontWeight: isSelected ? 'bold' : 'normal',
                            }}>
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                  />

                  {/* numbers */}
                  <InputContainer
                    label="WhatsApp Number"
                    placeholder="7863983914"
                    keyboardType="numeric"
                    value={userData?.user?.whatsappNo || userData?.data?.whatsappNo}
                    className="flex-1 p-2 text-sm text-[#787CA5]"
                    passwordError={''}
                    onChangeText={() => {
                      ('');
                    }}
                  />
                </View>

                {/* change pasword buttons */}

                <TouchableOpacity
                  onPress={() => router.push('/(routes)/profile/ChangePassword' as any)}
                  className={`mt-6 flex  h-[3.7rem] w-[90%] items-center justify-center rounded-full bg-[#37384B] p-2.5`}>
                  {buttonSpinner ? (
                    <ActivityIndicator size="small" color={'white'} />
                  ) : (
                    <Text className="text-center  text-white " style={{ fontFamily: 'LatoBold' }}>
                      Change Password
                    </Text>
                  )}
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
                <TouchableOpacity onPress={pickImage} className="w-full items-center rounded-2xl pb-3 ">
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
    </SafeAreaView>
  );
};

export default ProfileScreen;
