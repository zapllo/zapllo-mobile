import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';

// Define the props interface
interface CategoryDetailComponentProps {
  overdue: number;
  pending: number;
  inProgress: number;
  completed: number;
  name: string;
}

const CategoryDetailComponent: React.FC<CategoryDetailComponentProps> = ({
  overdue,
  pending,
  inProgress,
  completed,
  name,
}) => {
  return (
    <View className="mt-5 h-64 w-[90%] items-center rounded-3xl border border-[#37384B] p-5 pl-6 pr-6">
      <View className="mb-4 flex flex-row items-center justify-between">
       
          <Text className="w-[70%] text-xl text-white text-start">{name}</Text>

        <View className="h-14 w-14 rounded-full bg-white"></View>
      </View>

      <View className="flex w-full flex-row items-center justify-start gap-24">
        <View className="flex flex-col gap-3">
          {/* Overdue */}
          <View className="flex flex-col">
            <View className="flex flex-row items-center gap-2">
              <Image source={require('../../assets/Tasks/overdue.png')} className="h-5 w-5" />
              <Text className="text-sm text-[#787CA5]">Overdue</Text>
            </View>
            <Text className="ml-7 text-lg text-[#EF4444]">{overdue}</Text>
          </View>

          {/* In Progress */}
          <View className="flex flex-col">
            <View className="flex flex-row items-center gap-2">
              <Image source={require('../../assets/Tasks/InProgress.png')} className="h-5 w-5" />
              <Text className="text-sm text-[#787CA5]">In Progress</Text>
            </View>
            <Text className="ml-7 text-lg text-[#A914DD]">{inProgress}</Text>
          </View>
        </View>
        <View className="flex flex-col gap-3">
          {/* Pending */}
          <View className="flex flex-col">
            <View className="flex flex-row items-center gap-2">
              <Image source={require('../../assets/Tasks/overdue.png')} className="h-5 w-5" />
              <Text className="text-sm text-[#787CA5]">Pending</Text>
            </View>
            <Text className="ml-7 text-lg text-[#A914DD]">{pending}</Text>
          </View>

          {/* Completed */}
          <View className="flex flex-col">
            <View className="flex flex-row items-center gap-2">
              <Image source={require('../../assets/Tasks/Completed.png')} className="h-5 w-5" />
              <Text className="text-sm text-[#787CA5]">Completed</Text>
            </View>
            <Text className="ml-7 text-lg text-[#007B5B]">{completed}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CategoryDetailComponent;
