import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

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
  date:any
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  count,
  tasks,
  status,
  borderColor,
  date,
}) => {
  const colors = ['#c3c5f7', '#ccc', '#fff', '#3399FF', '#FF33A6'];

  const getInitials = (assignedUser: { firstName?: string; lastName?: string }): string => {
    const firstInitial = assignedUser?.firstName ? assignedUser.firstName[0].toUpperCase() : '';
    const lastInitial = assignedUser?.lastName ? assignedUser.lastName[0].toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  return (
    <>
      <View className="flex items-start">
        <Text className="w-[30vh] text-white" style={{ fontFamily: 'LatoBold' }}>{title}</Text>
        <Text className="text-white" style={{ fontSize: 34 }}>
          {count}
        </Text>
        <Text className="w-[40vw] pt-2 text-[10px] text-white" style={{ fontFamily: 'LatoBold' }}>{date}</Text>
      </View>
      <View className="mt-10 flex  w-[28vw] flex-row items-center bg-opacity-50">
        <View className="flex flex-row items-start">
          <View className="flex w-full flex-row">
            {tasks
              .filter((task) => task.status === status)
              .slice(0, 2)
              .map((task, index) => (
                <View key={task._id} className="relative flex flex-row">
                  <View
                    className="-m-1.5 flex h-10 w-10 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor,
                      backgroundColor: colors[index % colors.length],
                    }}>
                    <Text className="text-center text-sm text-black"
                    style={{ fontFamily: 'Lato-Thin' }}
                    >
                      {task?.assignedUser ? getInitials(task?.assignedUser) : '0'}
                    </Text>
                  </View>
                </View>
              ))}
            {tasks.filter((task) => task.status === status).length > 2 && (
              <View className="relative -m-1.5 flex flex-row">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full border-2"
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
           <TouchableOpacity>
              <View className=" flex h-10 w-10 items-center justify-center self-end rounded-full border border-white">
                <Image
                  className="h-4 w-4"
                  source={require('~/assets/Tasks/goto.png')}
                />
              </View>
         </TouchableOpacity>

      </View>

    </>
  );
};

export default TaskCard;
