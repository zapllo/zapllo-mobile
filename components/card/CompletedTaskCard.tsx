import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import moment from 'moment';

interface CompletedCardProps {
    title: string;
    count: number;
    tasks: any[];
    colors: string[];
  }
  
  export const CompletedCard: React.FC<CompletedCardProps> = ({
    title,
    count,
    tasks,
    colors,
  }) => {
    const getInitials = (assignedUser: { firstName?: string; lastName?: string }): string => {
      const firstInitial = assignedUser?.firstName ? assignedUser.firstName[0].toUpperCase() : '';
      const lastInitial = assignedUser?.lastName ? assignedUser.lastName[0].toUpperCase() : '';
      return firstInitial + lastInitial;
    };
  
    return (
        <>
        <View className="flex w-full flex-row items-center justify-between">
          <Text className="text-white">{title}</Text>
          <Text className="text-xs text-white">22-12-2024 to 28-12-2024</Text>
        </View>
        <Text className="mt-2 font-semibold text-white" style={{ fontSize: 34 }}>
          {count}
        </Text>
  
        <View className="flex w-full flex-row items-center justify-between gap-20 pt-5">
          <View className="relative flex flex-row">
            {tasks
              .filter((task) => task.status === 'Completed')
              .slice(0, 2)
              .map((task, index) => (
                <View key={task._id} className="relative flex flex-row">
                  <View
                    className="-m-1.5 h-9 w-9 rounded-full border"
                    style={{
                      borderColor: colors[index % colors.length],
                      backgroundColor: colors[index % colors.length],
                    }}
                  >
                    <Text className="mt-2 text-center text-sm font-medium text-black">
                      {getInitials(task?.assignedUser)}
                    </Text>
                  </View>
                </View>
              ))}
            {tasks.filter((task) => task.status === 'Completed').length > 2 && (
              <View className="relative flex flex-row">
                <View
                  className="h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: colors[2 % colors.length],
                  }}
                >
                  <Text className="text-center font-bold text-black">
                    +{tasks.filter((task) => task.status === 'Completed').length - 2}
                  </Text>
                </View>
              </View>
            )}
          </View>
  
          <View className="flex h-9 w-9 items-center justify-center rounded-full border border-white">
            <Image className="h-4 w-4" source={require('~/assets/Tasks/goto.png')} />
          </View>
        </View>
        </>
    );
  };

  