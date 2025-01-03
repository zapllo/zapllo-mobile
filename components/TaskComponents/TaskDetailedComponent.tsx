import React from "react";
import { View, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";

interface TaskDetailedComponentProps {
  title: string;
  dueDate: string;
  assignedTo: string;
  assignedBy: string;
  category: string;
}

const TaskDetailedComponent: React.FC<TaskDetailedComponentProps> = ({
  title,
  dueDate,
  assignedTo,
  assignedBy,
  category,
}) => {
  return (
    <View className="w-[90%] h-52 border border-[#37384B] p-4 rounded-3xl items-center mt-5 gap-6">
      <View className="flex items-center flex-row w-full justify-between">
        <Text className="text-white font-semibold text-lg">{title}</Text>
        <AntDesign
          name="ellipsis1"
          size={24}
          color="white"
          style={{ marginLeft: 8, transform: [{ rotate: "90deg" }] }}
        />
      </View>

      <View className="flex flex-row w-full justify-around items-start">
        <View className="flex gap-3">
          <View className="flex flex-col">
            <Text className="text-[#787CA5] text-xs">Due Date</Text>
            <Text className="text-[#EF4444] text-lg">{dueDate}</Text>
          </View>

          <View className="flex flex-col">
            <Text className="text-[#787CA5] text-xs">Assigned to</Text>
            <Text className="text-[#D85570]">{assignedTo}</Text>
          </View>
        </View>

        <View className="flex gap-3">
          <View className="flex flex-col">
            <Text className="text-[#787CA5] text-xs">Assigned by</Text>
            <Text className="text-[#815BF5] mt-1">{assignedBy}</Text>
          </View>

          <View className="flex flex-col mt-1">
            <Text className="text-[#787CA5] text-xs">Category</Text>
            <Text className="text-[#FDB314]">{category}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default TaskDetailedComponent;