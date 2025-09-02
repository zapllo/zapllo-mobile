import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';

interface Task {
  _id: string;
  status: string;
  category?: {
    name: string;
    _id?: string;
  };
}

interface TaskCardProps {
  title: string;
  count: number;
  tasks: Task[];
  status?: string;
  backgroundColor?: string;
  borderColor: string;
  onPress?: () => void;
  date?: string;
  colors?: string[];
}

const DashboardCardTwo: React.FC<TaskCardProps> = ({ 
  title, 
  count, 
  tasks = [], // Provide default empty array
  borderColor,
  onPress,
  date 
}) => {
  const screenHeight = Dimensions.get('window').height;
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const colors = ['#c3c5f7', '#ccc', '#fff', '#3399FF', '#FF33A6'];

  const getInitials = (category?: { name: string }): string => {
    if (!category || !category.name) return '';
    return category.name[0].toUpperCase();
  };

  // Ensure tasks is an array and filter out any invalid tasks
  const validTasks = Array.isArray(tasks) 
    ? tasks.filter(task => task && task._id) 
    : [];

  return (
    <>
      <View className="flex items-start">
        <Text className="w-[30vh] text-white mb-2" style={{ fontFamily: 'LatoBold' }}>
          {title}
        </Text>
        <Text
          className="text-white mt-1 text-5xl"
          style={{ fontFamily: 'LatoBold'}}>
          {count}
        </Text>
        <Text className="w-[40vw] pt-2 text-[10px] text-white" style={{ fontFamily: 'LatoBold' }}>
          {date}
        </Text>
      </View>

      <View className={`flex w-[28vw] flex-row items-center ${
        screenHeight > 900 ? 'mt-12' : 'mt-8'
      }`}>
        <View className="flex flex-row items-start">
          <View className="flex w-full flex-row">
            {validTasks.slice(0, 2).map((task, index) => (
              <View key={task._id} className="relative flex flex-row">
                <View
                  className="-m-1.5 h-10 w-10 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor,
                    backgroundColor: colors[index % colors.length],
                  }}>
                  <Text
                    className="text-center text-sm text-black"
                    style={{ fontFamily: 'LatoBold' }}
                  >
                    {getInitials(task.category)}
                  </Text>
                </View>
              </View>
            ))}
            {validTasks.length > 2 && (
              <View className="relative -m-1.5 flex flex-row">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor,
                    backgroundColor: colors[2 % colors.length],
                  }}>
                  <Text className="text-center text-black" style={{ fontSize: 10, fontFamily: 'LatoBold' }}>+{validTasks.length - 2}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        {onPress && (
          <TouchableOpacity onPress={onPress}>
            <View className="flex h-10 w-10 items-center justify-center self-end rounded-full border border-white">
              <Image className="h-4 w-4" source={require('~/assets/Tasks/goto.png')} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default DashboardCardTwo;