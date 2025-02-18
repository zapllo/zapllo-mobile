import React, { useState, useEffect } from "react";
import { Keyboard, KeyboardAvoidingView, SafeAreaView, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Navbar from "~/components/navbar";
import { PieChart } from 'react-native-gifted-charts';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  withSequence,
  withDelay
} from 'react-native-reanimated';

interface ChartData {
  value: number;
  color: string;
  label: string;
  focused: boolean;
}

export default function DashboardScreen() {
  const initialData: ChartData[] = [
    { value: 30, color: '#FDB314', label: 'In Office', focused: true },
    { value: 10, color: '#06D6A0', label: 'Holiday', focused: false },
    { value: 40, color: '#A914DD', label: 'WFH', focused: false },
    { value: 20, color: '#EF4444', label: 'On Leave', focused: false },
  ];

  const [data, setData] = useState<ChartData[]>(initialData);
  const [selectedSegment, setSelectedSegment] = useState<ChartData>(initialData[0]);
  const [animatedData, setAnimatedData] = useState<ChartData[]>(
    initialData.map(item => ({ ...item, value: 0 }))
  );
  
  const chartProgress = useSharedValue(0);
  const chartScale = useSharedValue(1);
  const legendOpacity = useSharedValue(0);

  useEffect(() => {
    // Initialize with actual values to prevent NaN
    setAnimatedData(initialData);
    
    // Start animations after a short delay to ensure data is properly initialized
    setTimeout(() => {
      chartProgress.value = withTiming(1, { duration: 1000 });
      chartScale.value = withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 200 })
      );
      legendOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

      // Animate each segment
      initialData.forEach((item, index) => {
        setTimeout(() => {
          setAnimatedData(prev => {
            const newData = [...prev];
            newData[index] = {
              ...newData[index],
              value: item.value // Use direct value instead of withTiming
            };
            return newData;
          });
        }, index * 300);
      });
    }, 100);
  }, []);

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chartScale.value }],
    opacity: chartProgress.value,
  }));

  const legendAnimatedStyle = useAnimatedStyle(() => ({
    opacity: legendOpacity.value,
    transform: [{
      translateX: interpolate(
        legendOpacity.value,
        [0, 1],
        [50, 0]
      )
    }]
  }));

  const handleChartPress = (index: number) => {
    if (index >= 0 && index < data.length) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Update focused state
      const updatedData = data.map((item, idx) => ({
        ...item,
        focused: idx === index
      }));
      setData(updatedData);
      setSelectedSegment(data[index]);

      // Scale animation
      chartScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <Navbar title="Dashboard" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            <View className="items-center w-[95%] mt-5 rounded-3xl justify-center bg-[#121435] flex flex-row p-6">
              <Animated.View style={[chartAnimatedStyle]} className="items-center">
                <PieChart
                  data={data}
                  showGradient
                  sectionAutoFocus
                  donut
                  radius={80}
                  innerRadius={60}
                  innerCircleColor="#05071E"
                  onPress={handleChartPress}
                  centerLabelComponent={() => (
                    <View className="items-center justify-center">
                      <Text className="text-white text-xl font-bold">
                        {selectedSegment?.value}%
                      </Text>
                      <Text className="text-white text-sm">
                        {selectedSegment?.label}
                      </Text>
                    </View>
                  )}
                />
              </Animated.View>

              <Animated.View 
                className="flex flex-col gap-5 ml-2"
                style={legendAnimatedStyle}
              >
                {data.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleChartPress(index)}
                    className="flex flex-row gap-2 p-2 rounded-lg"
                    style={{
                      backgroundColor: item.focused ? `${item.color}15` : 'transparent',
                    }}
                  >
                    <Text
                      className="text-base font-bold"
                      style={[{
                        color: item.color,
                        opacity: item.focused ? 1 : 0.7
                      }]}
                    >
                      {item.label}
                    </Text>
                    <Text 
                      className="text-xl font-extralight"
                      style={[{
                        color: item.focused ? item.color : "#787CA5",
                        opacity: item.focused ? 1 : 0.7
                      }]}
                    >
                      {animatedData[index].value}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
            <View className=" w-full items-center mt-10  ">
                <TouchableOpacity className=" mb-5 items-center bg-[#37384B] px-5 p-3 rounded-full">
                  <Text className="text-white text-sm">Wed, December 25</Text>
                </TouchableOpacity>
                <View className=" border border-[#37384B] w-[94%] rounded-3xl p-6 mb-5 bg-[#0d0e2b]">
                    <Text className="text-white text-xs ">Wed, December 25</Text>    
                    <Text className="text-white text-base mb-6">CS TEAM 9:30 AM - 06:30 PM </Text>
                    <View className="flex flex-row justify-between items-center">
                      <View className=" items-start flex flex-col gap-2">
                        <Text className="text-white text-xs ">Clock In</Text> 
                        <Text className="text-white ">09:20 AM</Text> 
                        <Text className="text-white text-xs">Effective hours 8h 29m</Text>
                      </View>
                      <View className=" items-end flex flex-col gap-2 ">
                        <Text className="text-white text-xs ">Clock Out</Text> 
                        <Text className="text-white ">06:41 PM</Text> 
                        <Text className="text-white text-xs ">Gross hours 9h 15m</Text>
                      </View>
                    </View>   
                       
                </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}