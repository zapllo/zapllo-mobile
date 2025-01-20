import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import NavbarTwo from '~/components/navbarTwo';
import { StackNavigationProp } from '@react-navigation/stack';

const TickitDetails: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<any>>()
  const { status, message, date } = useLocalSearchParams();

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary">
    <KeyboardAvoidingView
      className="w-full"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <NavbarTwo
        title="Ticket Details"
        onBackPress={() => navigation.goBack()}
        
      />

      <View className=" mt-8 items-center pb-20 w-full flex flex-col gap-2 ">
        <View className='w-[90%] p-5 border border-[#37384B] rounded-3xl'>
          <View className='bg-[#815BF5] p-2 w-20 items-center rounded-md mb-2'>
            <Text className='text-white text-xs'style={{fontFamily:"LatoBold"}}>{status}</Text>
          </View>

          <Text className='text-white font-bold text-lg w-full mb-3' style={{fontFamily:"LatoBold"}}> {message}</Text>

          <View className='flex flex-col gap-1'>
            <Text className='text-[#787CA5] text-sm'style={{fontFamily:"LatoBold"}}
            >Date:<Text className='text-white text-sm'style={{fontFamily:"LatoBold"}}>{date}</Text>
            </Text>
            <Text className='text-[#787CA5] text-sm' style={{fontFamily:"LatoBold"}}>Category:<Text className='text-white text-sm' style={{fontFamily:"LatoBold"}}>Report An Error</Text>
            </Text>
            <Text className='text-[#787CA5] text-sm' style={{fontFamily:"LatoBold"}}>Subcategory: <Text className='text-white text-sm' style={{fontFamily:"LatoBold"}}>Report An Error</Text>
            </Text>
            <Text className='text-[#787CA5] text-sm' style={{fontFamily:"LatoBold"}}>Description:<Text className='text-white text-sm'style={{fontFamily:"LatoBold"}}>Error</Text>
            </Text>
            <Text className='text-[#787CA5] text-sm' style={{fontFamily:"LatoBold"}}>Subject:<Text className='text-[#EF4444] text-sm'style={{fontFamily:"LatoBold"}}>Error</Text>
            </Text>
          </View>


        </View>
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