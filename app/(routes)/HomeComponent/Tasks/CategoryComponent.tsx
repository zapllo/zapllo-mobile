// File: CategoryComponent.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

interface CategoryComponentProps {
  title: string;
  onAddPress?: () => void;
  onDeletePress?: () => void;
}

const CategoryComponent: React.FC<CategoryComponentProps> = ({
  title,
  onAddPress,
  onDeletePress
}) => {
    
  return (
    <View className="pt-5 pb-5 items-center flex flex-row justify-between w-[90%] p-4 border border-[#37384B] rounded-3xl bg-[#10122d] mb-3">
      <Text className="text-white text-lg" style={{fontFamily:"LatoBold"}}>{title}</Text>
      <View className="flex items-center justify-center gap-3 flex-row">
        <TouchableOpacity onPress={onAddPress}>
          <Image source={require("../../../../assets/Tasks/addto.png")} className="w-7 h-7" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onDeletePress}>
          <Image source={require("../../../../assets/Tasks/deleteTwo.png")} className="w-7 h-7" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CategoryComponent;