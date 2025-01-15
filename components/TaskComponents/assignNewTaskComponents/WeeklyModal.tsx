import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';

interface WeeklyModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const WeeklyModal: React.FC<WeeklyModalProps> = ({ isVisible, onClose }) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const toggleDaySelection = (day: string) => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day]
    );
    // Trigger haptic feedback
    Haptics.selectionAsync();
  };

  // Use unique identifiers for each day
  const daysOfWeek = [
    { label: 'M', id: 'Monday' },
    { label: 'T', id: 'Tuesday' },
    { label: 'W', id: 'Wednesday' },
    { label: 'T', id: 'Thursday' },
    { label: 'F', id: 'Friday' },
    { label: 'S', id: 'Saturday' },
    { label: 'S', id: 'Sunday' },
  ];

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: "center" }}
    >
      <View className="rounded-xl bg-[#0A0D28] p-5 pb-8">
        <View className="mb-4 flex w-full flex-row items-center justify-between">
          <Text className="text-lg text-white" style={{ fontFamily: "LatoBold" }}>
            Select Days
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Image
              source={require("../../../assets/commonAssets/cross.png")}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>

        {/* Render weekly days */}
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day.id}
              style={[
                styles.dayBox,
                selectedDays.includes(day.id) && styles.selectedDayBox,
              ]}
              onPress={() => toggleDaySelection(day.id)}
            >
              <Text style={styles.dayText}>{day.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm week */}
        <View className='w-full flex justify-end items-end mt-10'>
          <TouchableOpacity className='bg-[#46765f] w-1/4 items-center py-3 rounded-lg'>
            <Text className='text-white'>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dayBox: {
    width: 40,
    height: 40,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#1A1D3D',
    borderRadius: 5,
    borderWidth: 2,
  },
  selectedDayBox: {
    backgroundColor: '#46765f', // Change color when selected
  },
  dayText: {
    color: 'white',
    fontFamily: 'Lato-Regular',
  },
});

export default WeeklyModal;