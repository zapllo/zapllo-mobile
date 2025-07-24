import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';

interface MonthlyModalProps {
  isVisible: boolean;
  onClose: () => void;
  setMonthDays:any;
}

const MonthlyModal: React.FC<MonthlyModalProps> = ({ isVisible, onClose,setMonthDays }) => {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const toggleDaySelection = (day: number) => {
    setSelectedDays((prevSelectedDays) =>
      prevSelectedDays.includes(day)
        ? prevSelectedDays.filter((d) => d !== day)
        : [...prevSelectedDays, day]
    );
    // Trigger haptic feedback
    Haptics.selectionAsync();
  };

  const handelConfirm =()=>{
    setMonthDays(selectedDays);
    onClose()
  }

  const handleClose = () => {
    setSelectedDays([]);
    onClose();
  }

  return (
    <Modal
      isVisible={isVisible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: "center",alignContent:'center', alignSelf:'center', width:'95%' }}
    >
      <View className="rounded-xl bg-[#0A0D28] p-5 pb-8">
        <View className="mb-4 flex w-full flex-row items-center justify-between">
          <Text className="text-lg text-white" style={{ fontFamily: "LatoBold" }}>
            Select Days
          </Text>
          <TouchableOpacity onPress={handleClose}>
            <Image
              source={require("../../../assets/commonAssets/cross.png")}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>

        <Text className='text-white text-xs mt-2' style={{ fontFamily: "Lato-Light" }}>
          Select the days of the month for your repeat setting.
        </Text>

        {/* Render days from 1 to 31 */}
        <View style={styles.daysContainer}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayBox,
                selectedDays.includes(day) && styles.selectedDayBox,
              ]}
              onPress={() => toggleDaySelection(day)}
            >
              <Text style={styles.dayText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Confirm button */}
        <View className='w-full flex justify-end items-end'>
          <TouchableOpacity onPress={handelConfirm} className='bg-[#46765f] w-1/3 items-center py-4 rounded-lg'>
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
    flexWrap: 'wrap',
    justifyContent: "flex-start",
    marginTop: 30,
  },
  dayBox: {
    width: 40,
    height: 40,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#1A1D3D',
    borderRadius: 5,
    borderWidth: 2,
  },
  selectedDayBox: {
    backgroundColor: '#815BF5', // Change color when selected
  },
  dayText: {
    color: 'white',
    fontFamily: 'Lato-Regular',
  },
});

export default MonthlyModal;