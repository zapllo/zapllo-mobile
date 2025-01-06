import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '@react-navigation/core';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';


// Define the TaskStatus type
// Define the TaskStatus type
type TaskStatus = 'Pending' | 'InProgress' | 'Completed'; // Add other statuses as needed

// Define the Task interface
interface Task {
  _id: string; // Assuming tasks have an ID
  status: TaskStatus;
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
  status: TaskStatus;
  backgroundColor: string;
  borderColor: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, count, tasks, status, backgroundColor, borderColor }) => {
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const colors = ['#c3c5f7', '#ccc', '#fff', '#3399FF', '#FF33A6'];

  const getInitials = (assignedUser: { firstName?: string; lastName?: string }): string => {
    const firstInitial = assignedUser?.firstName ? assignedUser.firstName[0].toUpperCase() : '';
    const lastInitial = assignedUser?.lastName ? assignedUser.lastName[0].toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  return (
    <View className="flex h-full w-1/2 flex-col rounded-3xl p-5 m-0.5" style={{ backgroundColor }}>
      <TouchableOpacity className='w-full h-full'>
      <View className="flex items-start">
        <Text className="text-white w-[30vh]">{title}</Text>
        <Text className="text-white" style={{ fontSize: 34 }}>
          {count}
        </Text>
        <Text className="w-[40vw] pt-2 text-xs text-white">25th December, 2024</Text>
      </View>
      <View className="mt-3 flex flex-row items-start">
        <View className="flex w-full flex-row pt-9">
          {tasks
            .filter((task) => task.status === status)
            .slice(0, 2)
            .map((task, index) => (
              <View key={task._id} className="relative flex flex-row">
                <View
                  className="-m-1.5 h-9 w-9 rounded-full items-center flex border-2 justify-center"
                  style={{
                    borderColor,
                    backgroundColor: colors[index % colors.length],
                  }}>
                  <Text className="mt-2 text-center text-sm text-black">
                    {getInitials(task?.assignedUser)}
                  </Text>
                </View>
              </View>
            ))}
          {tasks.filter((task) => task.status === status).length > 2 && (
            <View className="relative -m-1.5 flex flex-row">
              <View
                className="h-9 w-9 items-center justify-center rounded-full border-2"
                style={{
                  borderColor,
                  backgroundColor: colors[2 % colors.length],
                }}>
                <Text className="text-center text-black">
                  +{tasks.filter((task) => task.status === status).length - 2}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <TouchableOpacity
        onPress={() => {
          const filteredTasks  = tasks.filter((task) => task.status === status);
          navigation.navigate('PendingTask', { filteredTasks });
        }}>
        <View className="-mt-7 flex h-8 w-8 items-center justify-center self-end rounded-full border border-white">
          <Image className="h-4 w-4" source={require('~/assets/Tasks/goto.png')} />
        </View>
      </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

export default TaskCard;