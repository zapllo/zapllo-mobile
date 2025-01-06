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
} from 'react-native';
import NavbarTwo from '~/components/navbarTwo';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import ProfileButton from '~/components/profile/ProfileButton';
import InputContainer from '~/components/InputContainer';
import { Dropdown } from 'react-native-element-dropdown';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';

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
  const { isLoggedIn, token, userData } = useSelector((state: RootState) => state.auth);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [numberValue, setNumberValue] = useState(data[0]?.value || null);
  const [buttonSpinner, setButtonSpinner] = useState(false);

  console.log('userrrr', userData?.data?.profilePic);

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
          <NavbarTwo
            title="Profile"
            onBackPress={() => navigation.navigate('(routes)/home/index')}
          />

          {/* container */}
          <View className="mb-12 mt-3 flex h-full   w-full items-center">
            {/*profile photo name and role */}
            <View className="flex w-[90%] flex-row items-center justify-start gap-4">
              <View className="h-16 w-16 rounded-full bg-white ">
                {(userData?.data?.profilePic || userData?.user?.profilePic) && (
                  <Image
                    className="h-16 w-16 rounded-full"
                    source={{ uri: userData?.data?.profilePic }}
                  />
                )}
              </View>
              <View className=" flex flex-col items-start gap-1">
                <Text className="text-xl font-medium text-white">
                  {userData?.user?.firstName || userData?.data?.firstName}{' '}
                  {userData?.user?.lastName || userData?.data?.lastName}
                </Text>
                <Text className=" w-16 rounded-lg bg-[#815BF5] p-1 text-center text-xs text-white">
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
            
              <Text className="text-start text-sm text-[#787CA5] ml-7 ">Account Information</Text>
              
              <View className='w-full flex items-center'>
              {/* mail */}
              <InputContainer
                label="Email"
                placeholder=""
                className="flex-1 text-sm text-[#787CA5]"
                value={userData?.user?.email || userData?.data?.email}
                passwordError={''}
                onChangeText={()=>{''}}
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
                  onChangeText={()=>{''}}
                />
              </View>

              {/* change pasword buttons */}
              
                <TouchableOpacity
                  className={`mt-6 flex  h-[3.7rem] w-[90%] items-center justify-center rounded-full bg-[#37384B] p-2.5`}>
                  {buttonSpinner ? (
                    <ActivityIndicator size="small" color={'white'} />
                  ) : (
                    <Text className="text-center  font-semibold text-white ">Change Password</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>



            {/* supports */}
            <View className=" flex w-[90%] flex-col items-start gap-2">
            {/* line */}
            <View className="mb-9 mt-9 h-0.5 w-full bg-[#37384B]"></View>
              <Text className="text-xs text-[#787CA5]">Support</Text>

              {/* Tutorials */}
              <View className="w-full items-center gap-5">
                <TouchableOpacity className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white">Tutorials</Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>

              {/* My Tickets */}
              <View className="mt-4 w-full items-center gap-5">
                <TouchableOpacity className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white">My Tickets</Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>

              {/* Raise a Tickets*/}
              <View className="mt-4 w-full items-center gap-5">
                <TouchableOpacity className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white">Raise a Tickets</Text>
                  <Image
                    source={require('../../assets/commonAssets/smallGoto.png')}
                    className="mb-1 h-3 w-3"
                  />
                </TouchableOpacity>
                <View className="h-0.5 w-full bg-[#37384B] "></View>
              </View>

              {/* Mobile App */}
              <View className="mt-4 w-full items-center gap-5">
                <TouchableOpacity className="flex  w-full flex-row items-center justify-between pr-2">
                  <Text className="text-base text-white">Mobile App</Text>
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
                  <Text className="text-base text-white">Events</Text>
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
                  <Text className="text-base text-white">Time zone</Text>
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
                  <Text className="text-base text-white">Change Language</Text>
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
              className={`mt-8 flex  h-[3.7rem] w-[90%] items-center justify-center rounded-full bg-[#EF4444] p-2.5`}>
              {buttonSpinner ? (
                <ActivityIndicator size="small" color={'white'} />
              ) : (
                <Text className="text-center  font-semibold text-white ">Log Out</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
