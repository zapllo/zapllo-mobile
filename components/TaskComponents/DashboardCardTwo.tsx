import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';

// Define the Task interface
interface Task {
  _id: string; // Assuming tasks have an ID

  assignedUser: {
    firstName?: string;
    lastName?: string;
  };
  // Add other properties of a task as needed
}

// Ensure this is imported where needed
interface TaskCardProps {
  title: string;
  count: number;
  tasks: Task[];
  backgroundColor: string;
  borderColor: string;
  onPress: any;
}

const DashboardCardTwo: React.FC<TaskCardProps> = ({ title, count, tasks, borderColor,onPress }) => {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const colors = ['#c3c5f7', '#ccc', '#fff', '#3399FF', '#FF33A6'];

  const getInitials = ( category: {name:string; }): string => {
    const firstInitial = category?.name ? category.name[0].toUpperCase() : '';
    return firstInitial 
  };

  console.log('>>>>>>>>>>>>>>>tttttt', tasks);

  return (
    <>
      <View className="flex items-start">
        <Text className="w-[30vh] text-white text-lg" style={{ fontFamily: 'LatoBold' }}>
          {title}
        </Text>
        <Text
          className="text-white text-5xl mt-4"
          style={{  fontFamily: 'LatoBold' }}>
          {count}
        </Text>
        <Text className="w-[40vw] pt-2 text-sm text-white " style={{ fontFamily: 'LatoBold' }}>
          25th Dec, 2024
        </Text>
      </View>

      <View className="mt-8 flex  w-[28vw] flex-row items-center ">
        <View className=" flex flex-row items-start">
          <View className="flex w-full flex-row">
            {tasks?.slice(0, 2).map((task, index) => (
              <View key={task._id} className="relative flex flex-row">
                <View
                  className="-m-1.5 flex h-10 w-10 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor,
                    backgroundColor: colors[index % colors.length],
                  }}>
                  <Text
                    className=" text-center text-sm text-black"
                    style={{ fontFamily: 'Lato-Thin' }}>
                    {getInitials(task?.category)}
                  </Text>
                </View>
              </View>
            ))}
            {tasks?.length > 2 && (
              <View className="relative -m-1.5 flex flex-row">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor,
                    backgroundColor: colors[2 % colors.length],
                  }}>
                  <Text className="text-center text-black">+{tasks.length - 2} </Text>
                </View>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onPress}>
          <View className=" flex h-10 w-10 items-center justify-center self-end rounded-full border border-white">
            <Image className="h-4 w-4" source={require('~/assets/Tasks/goto.png')} />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default DashboardCardTwo;