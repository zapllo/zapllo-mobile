import React from 'react';
import { View, Text, Image } from 'react-native';

interface TaskStatusCardProps {
  imageSource: any;
  status: string;
  count: number;
}

const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ imageSource, status, count }) => {
  return (
    <View className="p-5 items-start gap-3 flex flex-row border border-[#37384B] rounded-3xl w-1/2">
      <Image className="h-7 w-7" source={imageSource} />
      <View className="flex flex-col items-start">
        <Text className="text-white text-xl" style={{fontFamily:"LatoRegular"}}>{status}</Text>
        <Text className="text-white text-3xl" style={{fontFamily:"LatoBold"}}>{count}</Text>
      </View>
    </View>
  );
};

export default TaskStatusCard;