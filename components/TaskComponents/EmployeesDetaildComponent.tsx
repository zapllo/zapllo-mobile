import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";

// Define the props interface
interface EmployeesDetaildComponentProps {
  overdue: any;
  pending: any;
  inProgress: any;
  completed: any;
  name:string;
}

const EmployeesDetaildComponent: React.FC<EmployeesDetaildComponentProps> = ({
  overdue,
  pending,
  inProgress,
  completed,
  name
}) => {
  return (
    <View className="w-[90%] h-64 border border-[#37384B] p-5 pl-6 pr-6 rounded-3xl items-center mt-5">
      <View className="flex flex-row justify-between items-center mb-4 ">
        <View className="gap-3 items-center flex flex-row">
          {/* profile image  */}
          
          <View className="w-12 h-12 bg-white rounded-full"></View>
          <Text className="text-xl w-[70%] text-white">{name}</Text>
        </View>

        
      </View>

      <View className="w-full flex flex-row justify-start gap-24 items-center">
        <View className="flex flex-col gap-3">
          {/* Overdue */}
          <View className="flex flex-col">
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require('../../assets/Tasks/overdue.png')}
                className="w-5 h-5"
              />
              <Text className="text-[#787CA5] text-sm">Overdue</Text>
            </View>
            <Text className="text-[#EF4444] ml-7 text-lg">{overdue}</Text>
          </View>

          {/* In Progress */}
          <View className="flex flex-col">
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require('../../assets/Tasks/InProgress.png')}
                className="w-5 h-5"
              />
              <Text className="text-[#787CA5] text-sm">In Progress</Text>
            </View>
            <Text className="text-[#A914DD] ml-7 text-lg">{inProgress}</Text>
          </View>
        </View>
        <View className="flex flex-col gap-3">
          {/* Pending */}
          <View className="flex flex-col">
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require('../../assets/Tasks/overdue.png')}
                className="w-5 h-5"
              />
              <Text className="text-[#787CA5] text-sm">Pending</Text>
            </View>
            <Text className="text-[#A914DD] ml-7 text-lg">{pending}</Text>
          </View>

          {/* Completed */}
          <View className="flex flex-col">
            <View className="flex flex-row items-center gap-2">
              <Image
                source={require('../../assets/Tasks/Completed.png')}
                className="w-5 h-5"
              />
              <Text className="text-[#787CA5] text-sm">Completed</Text>
            </View>
            <Text className="text-[#007B5B] ml-7 text-lg">{completed}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EmployeesDetaildComponent;