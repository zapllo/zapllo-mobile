import React from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface TaskStatusCardProps {
  imageSource: any;
  status: string;
  count: string;
  color?: string;
}

const TaskStatusCard: React.FC<TaskStatusCardProps> = ({ 
  imageSource, 
  status, 
  count,
  color = '#37384B'
}) => {
  return (
    <View className="w-[47%] overflow-hidden">
      <LinearGradient
        colors={[`${color}20`, `${color}05`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 rounded-[24px] border-[0.5px] border-[#ffffff15]"
        style={{
          shadowColor: color,
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-[#ffffff10]">
            <Image 
              source={imageSource} 
              className="h-6 w-6"
              style={{ opacity: 0.9 }}
            />
          </View>
          <Text className="text-white text-sm font-medium opacity-70">
            {status}
          </Text>
        </View>
        <Text className="text-white text-3xl font-semibold tracking-tight">
          {count || '0'}
        </Text>
      </LinearGradient>
    </View>
  );
};

export default TaskStatusCard;