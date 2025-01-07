import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import moment from 'moment';

interface TaskCardProps {
  title: string;
  count: number;
  tasks: any[];
  status: string;
  colors: string[];
  navigation?: any;
  filterKey?: string;
  navigateTo?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  count,
  tasks,
  status,
  colors,
  navigation,
  filterKey,
  navigateTo,
}) => {
  const getInitials = (assignedUser: { firstName?: string; lastName?: string }): string => {
    const firstInitial = assignedUser?.firstName ? assignedUser.firstName[0].toUpperCase() : '';
    const lastInitial = assignedUser?.lastName ? assignedUser.lastName[0].toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  return (
    <>
      <View className="flex items-start">
        <Text className="font-medium text-white">{title}</Text>
        <Text className="text-4xl font-semibold text-white">{count}</Text>
        <Text className="w-[40vw] pt-2 text-xs text-white">
          {tasks.length > 0 && moment(tasks[0]?.dueDate).format('Do MMMM,  YYYY')}
        </Text>
      </View>
      <View className="mt-7 mr-2 flex flex-row items-center justify-between">
        <View className="flex flex-row items-center">
          {tasks
            .filter((task) => task.status === status)
            .slice(0, 2)
            .map((task, index) => (
              <View key={task._id} className="flex flex-row">
                <View
                  className="-mr-2.5 flex h-8 w-8 items-center justify-center rounded-full border"
                  style={{
                    borderColor: colors[index % colors.length],
                    backgroundColor: colors[index % colors.length],
                  }}>
                  <Text className="text-sm font-medium text-black">
                    {getInitials(task?.assignedUser)}
                  </Text>
                </View>
              </View>
            ))}
          {tasks.filter((task) => task.status === status).length > 2 && (
            <View className=" mr-2 flex flex-row">
              <View
                className="flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  backgroundColor: colors[2 % colors.length],
                }}>
                <Text className="font-bold text-black">
                  +{tasks.filter((task) => task.status === status).length - 2}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* {navigateTo && (
          <TouchableOpacity
            className="flex h-9 w-9 items-center justify-center self-end rounded-full border border-white"
            onPress={() => navigation?.navigate(navigateTo, { [filterKey]: tasks })}>
            <Image className="h-4 w-4" source={require('~/assets/Tasks/goto.png')} />
          </TouchableOpacity>
        )} */}
    </>
  );
};
export default TaskCard;
