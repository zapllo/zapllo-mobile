import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Image, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavbarTwo from '~/components/navbarTwo';
import { StackNavigationProp } from '@react-navigation/stack';

const TickitDetails: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { status, message, date, category, subCategory, subject } = useLocalSearchParams();
  const [comment, setComment] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardOffset(e.endCoordinates.height);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary">
      <KeyboardAvoidingView
        className="w-full flex-1 h-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <NavbarTwo
          title="Ticket Details"
          onBackPress={() => navigation.goBack()}
        />

        <View className="mt-8 items-center pb-20 w-full flex flex-col gap-2">
          <View className='w-[90%] p-5 border border-[#37384B] rounded-3xl'>
            <View className='bg-[#815BF5] p-2 w-20 items-center rounded-md mb-2'>
              <Text className='text-white text-xs' style={{ fontFamily: "LatoBold" }}>{status}</Text>
            </View>

            <Text className='text-white font-bold text-lg w-full mb-3' style={{ fontFamily: "LatoBold" }}> {message}</Text>

            <View className='flex flex-col gap-1'>
              <Text className='text-[#787CA5] text-sm' style={{ fontFamily: "LatoBold" }}>
                Date: <Text className='text-white text-sm' style={{ fontFamily: "LatoBold" }}>{date}</Text>
              </Text>
              <Text className='text-[#787CA5] text-sm' style={{ fontFamily: "LatoBold" }}>Category: <Text className='text-white text-sm' style={{ fontFamily: "LatoBold" }}> {category}</Text>
              </Text>
              <Text className='text-[#787CA5] text-sm' style={{ fontFamily: "LatoBold" }}>Subcategory: <Text className='text-white text-sm' style={{ fontFamily: "LatoBold" }}>{subCategory}</Text>
              </Text>
              <Text className='text-[#787CA5] text-sm' style={{ fontFamily: "LatoBold" }}>Description: <Text className='text-white text-sm' style={{ fontFamily: "LatoBold" }}>{message}</Text>
              </Text>
              <Text className='text-[#787CA5] text-sm' style={{ fontFamily: "LatoBold" }}>Subject: <Text className='text-[#EF4444] text-sm' style={{ fontFamily: "LatoBold" }}>{subject}</Text>
              </Text>
            </View>
          </View>

          <View className='w-[90%] mt-6'><Text className='text-[#787CA5] text-sm' style={{ fontFamily: "LatoBold" }}> Ticket Updates</Text></View>
          <View className='flex flex-col border-[#37384B] border w-[90%] p-6 rounded-3xl'>
            <View className='flex flex-row items-start gap-2'>
              <View className='w-12 h-12 bg-white rounded-full'></View>

              <View className='flex flex-col gap-1'>
                <Text className='text-white text-lg' style={{ fontFamily: "LatoBold" }}>Shubhodeep Banerjee</Text>
                <View className='flex flex-row items-center gap-2'>
                  <Image className='w-5 h-5' source={require("../../../../../assets/Tasks/calender.png")} />
                  <Text className='text-[#787CA5] text-sm' style={{ fontFamily: "LatoBold" }}>Wed, December 25 - 12:13 PM</Text>
                </View>
                <Text className='text-white mt-2' style={{ fontFamily: "LatoBold" }}>Comment</Text>
              </View>
            </View>
          </View>
        </View>

        <View className='flex flex-row px-5 bg-[#05071E] justify-between items-center' style={{ position: 'absolute', bottom: keyboardOffset ? 325 : 0, width: '100%', alignItems: 'center' }}>
          <TouchableOpacity className=''>
            <Image className='w-14 h-14' source={require("../../../../../assets/Tickit/fileUpload.png")} />
          </TouchableOpacity>

          <TextInput
            value={comment}
            onChangeText={(value) => setComment(value)}
            placeholder="Type your comment here"
            placeholderTextColor="#787CA5"
            className='rounded-full p-5 h-16 pt-3 text-sm text-white w-2/3'
            style={{
              fontFamily: "LatoBold",
              borderColor: isFocused || comment ? '#815BF5' : '#37384B',
              borderWidth: 1,
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <TouchableOpacity>
            <Image
              className='w-14 h-14'
              source={require("../../../../../assets/Tickit/send.png")}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0D28',
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  detail: {
    fontSize: 18,
    color: '#787CA5',
    marginBottom: 10,
  },
});

export default TickitDetails;