import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";

// Full day names
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface WeeklyButtonsProps {
  selectedDays: string[];
  onSelectDay: (day: string) => void;
}

const WeeklyButtons: React.FC<WeeklyButtonsProps> = ({ selectedDays, onSelectDay }) => {
  const [selectedStates, setSelectedStates] = useState<boolean[]>(Array(7).fill(false));

  // Update selected states when `selectedDays` from API changes
  useEffect(() => {
    const updatedStates = daysOfWeek.map((day) => selectedDays.includes(day));
    setSelectedStates(updatedStates);
  }, [selectedDays]);

  const toggleDay = (index: number) => {
    const day = daysOfWeek[index];
    onSelectDay(day); // Notify parent component (NotificationScreen)
    const updatedStates = [...selectedStates];
    updatedStates[index] = !updatedStates[index];
    setSelectedStates(updatedStates);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <View className="w-full flex flex-col py-4 rounded-lg mb-7 ml-10">
      <Text className="text-xs px-4 text-[#787CA5]">Weekly Offs</Text>
      <View className="flex flex-row flex-wrap justify-start my-2">
        {daysOfWeek.map((day, index) => (
          <TouchableOpacity
            key={day}
            className={`items-center py-2.5 px-4 mx-2 my-2 rounded-xl ${
              selectedStates[index] ? "bg-[#815BF5]" : "bg-[#37384B]"
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
