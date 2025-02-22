import React, { useState } from 'react';
  import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, StyleSheet, Image } from 'react-native';
  import { LinearGradient } from 'expo-linear-gradient';
  import * as Haptics from 'expo-haptics';
  import NavbarTwo from '~/components/navbarTwo';
  import DateRangeDropdown from '~/components/DateRangeDropdown/DateRangeDropdown';
import { router } from 'expo-router';

  export default function AllAttendenceScreen() {
    const [selectedOption, setSelectedOption] = useState('Attendance');
    const [showBackendView, setShowBackendView] = useState(false);
   
    const totalItems = 14;
    const [workHour, setWorkHour] = useState(Array(totalItems).fill(false));
  

    const calculateProgress = () => {
      const checkedCount = workHour.filter(Boolean).length;
      return (checkedCount / totalItems) * 100;
    };

    const handleDateRangeChange = (range) => {
      console.log('Selected date range:', range);
      console.log('Start date:', range.startDate);
      console.log('End date:', range.endDate);
      console.log('Label:', range.label);
    };

    const handleOptionPress = (option) => {
      setSelectedOption(option);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if (option === 'Attendance') {
        setShowBackendView(true);
      } else {
        setShowBackendView(false);
      }
    };

    const getProgressColor = (progress: number) => {
      if (progress < 19) {
        return '#EF4444'; // Red
      } else if (progress < 70) {
        return '#F97520'; // Orange
      } else {
        return '#06D6A0'; // Gray
      }
    };

    return (
      <SafeAreaView className="h-full flex-1 bg-primary">
        <NavbarTwo title="All Attendance" />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="w-full flex ml-9">
                <DateRangeDropdown
                  onRangeChange={handleDateRangeChange}
                  initialValue="This Week"
                  placeholder="Select Date Range"
                  includeNext={true}
                />

                <View className="items-center border border-[#676B93] w-[90%] px-1.5 py-1.5 rounded-full mt-4 mb-6">
                  <View className="w-full flex flex-row items-center justify-between">
                    <TouchableOpacity
                      className="w-1/2 items-center"
                      onPress={() => handleOptionPress('Attendance')}
                    >
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        colors={selectedOption === 'Attendance' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                        style={styles.tablet}
                      >
                        <Text className={`text-sm  ${selectedOption === 'Attendance' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>All Attendance</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-1/2 items-center"
                      onPress={() => handleOptionPress('Regularization')}
                    >
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        colors={selectedOption === 'Regularization' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                        style={styles.tablet}
                      >
                        <Text className={`text-sm  ${selectedOption === 'Regularization' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Regularization</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>


              {/* view list */}
              {selectedOption === "Attendance" ? (
                <TouchableOpacity onPress={()=>router.push("/(routes)/HomeComponent/Attendance/AllAttendence/AttendenceDetails")} className="w-[90%] bg-[#10122d] border border-[#37384B] rounded-2xl flex flex-row items-center justify-center p-5">
                <View className="w-12 h-12 rounded-full bg-white "></View>
                <View className="flex flex-col items-center ml-3 w-[80%]">
                  <View className="flex flex-row justify-between  items-center mb-3 gap-1">
                    <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Subhodeep Banerjee</Text>
                    <Text className="text-white text-xs" style={{ fontFamily: "Lato" }}>Overtime 4hr</Text>
                  </View>
                  {/* progress bar */}
                  <View style={{ width: '100%', height: 8, backgroundColor: '#37384B', borderRadius: 5 }}>
                    <View
                      style={{
                        width: `${70}%`,
                        height: '100%',
                        backgroundColor: getProgressColor(calculateProgress()),
                        borderRadius: 5,
                      }}
                    />
                  </View>
                  <View className='flex flex-row items-center justify-between w-full'>
                    <Text className='text-white text-xs '>35hr completed</Text>
                    <Text className='text-[#676B93] text-xs '>40hr</Text>
                    
                  </View>
                </View>
              </TouchableOpacity>
              ):(
                <TouchableOpacity 
                
                className='w-[90%] bg-[#10122d] border border-[#37384B] rounded-2xl flex flex-row items-center justify-center p-5'>
                  <View className="w-12 h-12 rounded-full bg-white "></View>
                  <View className="flex flex-col items-start ml-3 w-[80%]">
                    <Text className='text-white'>Subhodeep Banerjee</Text>
                    <View className='flex flex-row items-center justify-between w-full mt-1'>
                      <View className='flex items-center flex-row gap-1'>
                      <Image source={require("../../../assets/Attendence/message.png")} className='w-4 h-4' />
                      <Text className='text-white text-xs'style={{fontFamily:"lato"}}>2 Request(s)</Text>
                      </View>

                      <Text className='text-white text-xs'style={{fontFamily:"lato"}}>0 Pending</Text>
                      <Text className='text-white text-xs'style={{fontFamily:"lato"}}>0 Approved</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}



              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  const styles = StyleSheet.create({
    tablet: {
      borderRadius: 9999,
      paddingVertical: 8,
      paddingHorizontal: 16,
      width: "100%",
      display: "flex",
      alignItems: "center",
    },
    loader: {
      height: 5,
      borderRadius: 25,
    },
  });