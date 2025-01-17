import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const WeeklyButtons = () => {
  const [selectedDays, setSelectedDays] = useState<boolean[]>(Array(7).fill(false));

  const toggleDay = (index: number) => {
    const updatedDays = [...selectedDays];
    updatedDays[index] = !updatedDays[index];
    setSelectedDays(updatedDays);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <View className="w-full flex flex-col mb-7 ml-10">
      <Text className="text-xs text-[#787CA5]">Weekly Offs</Text>
      <View className="flex flex-row flex-wrap justify-start my-2">
        {daysOfWeek.map((day, index) => (
          <TouchableOpacity
            key={day}
            className={`items-center py-2.5 px-4 mx-2 my-2 rounded-xl ${
              selectedDays[index] ? "bg-[#815BF5]" : "bg-[#37384B]"
            }`}
            onPress={() => toggleDay(index)}
          >
            <Text className="text-white text-[13px]">{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default WeeklyButtons;