import React from 'react';
import { View, Text, Image } from 'react-native';

interface TaskStatusCardProps {
  imageSource: any;
  status: string;
  count: string;
}

const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ imageSource, status, count }) => {
  return (
    <View className="p-5 items-start gap-4 flex flex-row border border-[#37384B] rounded-3xl w-1/2">
      <Image className="h-8 w-8" source={imageSource} />
      <View className="flex flex-col items-center">
        <Text className="text-white text-sm">{status}</Text>
        <Text className="text-white text-4xl font-medium">{count}</Text>
      </View>
    </View>
  );
};

export default TaskStatusCard;