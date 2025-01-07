import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';

const ProgressCard = () => {
  return (
    <View className="mb-4 flex w-[90%] flex-col items-center gap-5 ">
      {/* 1st row */}
      <View className=" flex flex-row items-center gap-5">
        {/* overdue */}
        <View className="flex w-1/2 flex-row items-start gap-4 rounded-3xl border border-[#37384B] p-5 ">
          <Image className="h-8 w-8" source={require('../../assets/commonAssets/overdue.png')} />
          <View className="flex flex-col  items-center">
            <Text className="text-sm text-white">Overdue</Text>
            <Text className="text-4xl font-bold text-white">07</Text>
          </View>
        </View>

        {/* pending */}
        <View className="flex w-1/2 flex-row items-start gap-4 rounded-3xl border border-[#37384B] p-5 ">
          <Image className="h-8 w-8" source={require('../../assets/Tasks/overdue.png')} />
          <View className="flex flex-col  items-center">
            <Text className="text-sm text-white">Pending</Text>
            <Text className="text-4xl font-bold text-white">07</Text>
          </View>
        </View>
      </View>
      {/* 2nd row */}
      <View className=" flex flex-row items-center gap-5">
        {/* In Progress */}
        <View className="flex w-1/2 flex-row items-start gap-4 rounded-3xl border border-[#37384B] p-5 ">
          <Image
            className="h-8 w-8"
            source={require('../../assets/commonAssets/Progress.png')}
          />
          <View className="flex flex-col  items-center">
            <Text className="text-sm text-white">In Progress</Text>
            <Text className="text-4xl font-bold text-white">07</Text>
          </View>
        </View>

        {/* Completed */}
        <View className="flex w-1/2 flex-row items-start gap-4 rounded-3xl border border-[#37384B] p-5 ">
          <Image
            className="h-8 w-8"
            source={require('../../assets/commonAssets/Completed.png')}
          />
          <View className="flex flex-col  items-center">
            <Text className="text-sm text-white">Completed</Text>
            <Text className="text-4xl font-bold text-white">07</Text>
          </View>
        </View>
      </View>

      {/* 3rd row */}
      <View className=" flex flex-row items-center gap-5">
        {/* In Time */}
        <View className="flex w-1/2 flex-row items-start gap-4 rounded-3xl border border-[#37384B] p-5 ">
          <Image
            className="h-8 w-8"
            source={require('../../assets/commonAssets/inTime.png')}
          />
          <View className="flex flex-col  items-center">
            <Text className="text-sm text-white">In Time</Text>
            <Text className="text-4xl font-bold text-white">07</Text>
          </View>
        </View>

        {/* Delayed */}
        <View className="flex w-1/2 flex-row items-start gap-4 rounded-3xl border border-[#37384B] p-5 ">
          <Image
            className="h-8 w-8"
            source={require('../../assets/commonAssets/Delayed.png')}
          />
          <View className="flex flex-col  items-center">
            <Text className="text-sm text-white">Delayed</Text>
            <Text className="text-4xl font-bold text-white">07</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProgressCard;

const styles = StyleSheet.create({});
