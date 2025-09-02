import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import UserAvatar from '../profile/UserAvatar';

interface Task {
  _id: string;
  status: string;
  title?: string;
  assignedUser: {
    firstName?: string;
    lastName?: string;
    _id?: string;
    profilePic?: string;
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

const DashboardCard: React.FC<TaskCardProps> = ({ 
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

  const getInitials = (assignedUser: { firstName?: string; lastName?: string }): string => {
    if (!assignedUser) return '';
    
    const firstInitial = assignedUser?.firstName ? assignedUser.firstName[0].toUpperCase() : '';
    const lastInitial = assignedUser?.lastName ? assignedUser.lastName[0].toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  const getFirstWord = (text?: string): string => {
    if (!text) return '';
    const word = text.trim().split(/\s+/)[0] || '';
    return word.length > 12 ? word.slice(0, 12) : word;
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
          className="text-white text-5xl mt-1"
          style={{ fontFamily: 'LatoBold' }}>
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
                <View className="-m-1.5">
                  <UserAvatar
                    size={35}
                    borderColor={borderColor}
                    userId={task?.assignedUser?._id}
                    name={`${(task?.assignedUser?.firstName || '')} ${(task?.assignedUser?.lastName || '')}`.trim()}
                    imageUrl={task?.assignedUser?.profilePic}
                  />
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
                  <Text className="text-center text-black text-xs">+{validTasks.length - 2}</Text>
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

export default DashboardCard;