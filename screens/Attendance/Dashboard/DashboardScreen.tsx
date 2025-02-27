import React, { useState, useEffect } from "react";
import { Keyboard, KeyboardAvoidingView, SafeAreaView, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View,StyleSheet, Image } from "react-native";
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
import { LinearGradient } from "expo-linear-gradient";
import DateRangeDropdown from "~/components/DateRangeDropdown/DateRangeDropdown";
import Modal from 'react-native-modal';
import CustomDropdownComponentTwo from "~/components/customNavbarTwo";
import CustomDropdown from "~/components/customDropDown";

interface ChartData {
  value: number;
  color: string;
  label: string;
  focused: boolean;
}
type ReportOption = 'Present' | 'OnLeave' | 'Absent';
type ReportType = "Daily" | "Cumulative" | "Monthly";
type ReportOpctionAdmin = "All" | 'Present' | 'OnLeave' | 'Absent';

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
  const [selectedReport, setSelectedReport] = useState<ReportOption>('Present');
  const [selectedReportAdmin, setSelectedReportAdmin] = useState<ReportOpctionAdmin>('All');
  const [selectReportType, setSelectReportType] = useState<ReportType>("Daily");
  const userRole = "Admin";
  const [showBackendView, setShowBackendView] = useState(false);
  
  const chartProgress = useSharedValue(0);
  const chartScale = useSharedValue(1);
  const legendOpacity = useSharedValue(0);
  const [selectedOption, setSelectedOption] = useState('My');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isManagesSelect,setIsManagerSelect] = useState(null);
  const [isEmployeeSelect,setIsEmploeeSelect] = useState(null);
  

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
  const handleReportOptionPress = (option: ReportOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReport(option);
  };
  const handleReportOptionPressAdmin = (option: ReportOpctionAdmin) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReportAdmin(option);
  };

  const handleReportTypePress = (option: ReportType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectReportType(option);
  };

    const handleOptionPress = (option: string) => {
      setSelectedOption(option);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      if (option === 'My') {
        setShowBackendView(true);
      } else {
        setShowBackendView(false);
      }
    };

    const handleDateRangeChange = (range: DateRange) => {
      console.log('Selected date range:', range);
      console.log('Start date:', range.startDate);
      console.log('End date:', range.endDate);
      console.log('Label:', range.label);
      
      // Use the date range as needed
      // For example, filter tasks or fetch data for the selected period
    };
    const toggleFilterModal = () => {
      setFilterModalVisible(!isFilterModalVisible);
    };
  return (
    <SafeAreaView className="h-full flex-1 bg-primary ">
      <Navbar title="Dashboard" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center',paddingBottom:80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {
            selectedOption === 'My' &&
            <View className="w-full ml-10 mt-5">
            <DateRangeDropdown
                onRangeChange={handleDateRangeChange}
                initialValue="This Week"
                placeholder="Select Date Range"
                includeNext={true} // Set to false to exclude "Next Week/Month" options
              />
            </View>
          }


            <View className="items-center border border-[#676B93] w-[90%] px-1.5 py-1.5 rounded-full mt-4 mb-2">
            <View className="w-full flex flex-row items-center justify-between">
                <TouchableOpacity
                  className="w-1/2 items-center"
                  onPress={() => handleOptionPress('My')}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={selectedOption === 'My' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                    style={styles.tablet}
                  >
                    <Text className={`text-sm  ${selectedOption === 'My' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>My Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-1/2 items-center"
                  onPress={() => handleOptionPress('Team')}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={selectedOption === 'Team' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                    style={styles.tablet}
                  >
                    <Text className={`text-sm  ${selectedOption === 'Team' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Team Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>              
            </View>            
          

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


            {/* only for user */}
            {
                  userRole === "User" && (
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
                  )  
                }

            {/* only for admin */}
            

            {selectedOption === 'My' ?
            <View className="w-[93%] mt-9 h-full">
              <Text className="text-white text-lg mb-4" style={{fontFamily:"LatoBold"}}>My Report</Text>
              <View className="flex flex-row gap-5 items-center mb-4 ">
                <TouchableOpacity 
                  className="flex items-center justify-center flex-col w-1/5"
                  onPress={() => handleReportOptionPress('Present')}
                >
                  <Text 
                    className={`${selectedReport === 'Present' ? 'text-white' : 'text-[#787CA5]'} text-xs mb-2`}
                  >
                    Present
                  </Text>
                  {selectedReport === 'Present' && (
                    <View className="h-[2px] bg-white w-full" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex items-center justify-center flex-col w-1/5"
                  onPress={() => handleReportOptionPress('OnLeave')}
                >
                  <Text 
                    className={`${selectedReport === 'OnLeave' ? 'text-white' : 'text-[#787CA5]'} text-xs mb-2`}
                  >
                    On Leave
                  </Text>
                  {selectedReport === 'OnLeave' && (
                    <View className="h-[2px] bg-white" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex items-center justify-center flex-col w-1/5"
                  onPress={() => handleReportOptionPress('Absent')}
                >
                  <Text 
                    className={`${selectedReport === 'Absent' ? 'text-white' : 'text-[#787CA5]'} text-xs mb-2`}
                  >
                    Absent
                  </Text>
                  {selectedReport === 'Absent' && (
                    <View className="h-[2px] bg-white w-full" />
                  )}
                </TouchableOpacity>
              </View>

              <View className="flex flex-row justify-between p-5 rounded-3xl border border-[#37384B]">
              <View>
                <Text className="text-white text-lg">Monday</Text>
                <Text className="text-white text-sm">01/01/2025</Text>
              </View>
              <Text className="text-white self-center p-3 px-5 rounded-2xl text-xs bg-[#06D6A0]">Present</Text>
            </View>
            </View> :
            <View>
            <View className="w-full mt-7 flex flex-row justify-center pr-3">
            <View className="w-[80%]">
            <DateRangeDropdown
                onRangeChange={handleDateRangeChange}
                initialValue="This Week"
                placeholder="Select Date Range"
                includeNext={true} // Set to false to exclude "Next Week/Month" options
              />
            </View>
              
              {/* filter managaer */}
              <TouchableOpacity className="h-14 w-14 rounded-full bg-[#37384B] mt-3" onPress={toggleFilterModal}>
                <Image source={require('~/assets/commonAssets/filter.png')} className="h-full w-full" />
              </TouchableOpacity>
            </View>
              <View className="w-[95%] items-center">
              <View className="flex flex-row gap-5 items-center mb-7 mt-9 w-full">
                <TouchableOpacity 
                  className="flex items-center justify-center flex-col w-[29%]"
                  onPress={() => handleReportTypePress('Daily')}
                >
                  <Text 
                    className={`${selectReportType === 'Daily' ? 'text-white' : 'text-[#787CA5]'} text-xs mb-4`}
                    style={{ fontFamily: "LatoBold" }}
                  >
                    Daily Reports
                  </Text>
                  {selectReportType === 'Daily' && (
                    <View className="h-[2px] bg-white w-full" />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex items-center justify-center flex-col w-[31%]"
                  onPress={() => handleReportTypePress('Cumulative')}
                >
                  <Text 
                    className={`${selectReportType === 'Cumulative' ? 'text-white' : 'text-[#787CA5]'} text-xs mb-4 w-full`}
                    style={{ fontFamily: "LatoBold" }}
                  >
                  Cumulative Report
                  </Text>
                  {selectReportType === 'Cumulative' && (
                    <View className="h-[2px] bg-white w-full " />
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex items-center justify-center flex-col w-[27%]"
                  onPress={() => handleReportTypePress('Monthly')}
                >
                  <Text 
                    className={`${selectReportType === 'Monthly' ? 'text-white' : 'text-[#787CA5]'} text-xs mb-4`}
                    style={{ fontFamily: "LatoBold" }}
                  >
                    Monthly Report
                  </Text>
                  {selectReportType === 'Monthly' && (
                    <View className="h-[2px] bg-white w-full" />
                  )}
                </TouchableOpacity>
              </View> 

                <View className="flex w-full flex-row justify-between gap-7 items-center mb-4 ">
                  <TouchableOpacity 
                    className="flex items-center justify-center flex-col w-1/5"
                    onPress={() => handleReportOptionPressAdmin('All')}
                  >
                    <View className="flex flex-row gap-1 justify-end mb-4">
                      <Text 
                        className={`${selectedReportAdmin === 'All' ? 'text-white' : 'text-[#787CA5]'} text-xs `}
                      >
                        All
                      </Text>
                      <Text className="text-primary rounded-md bg-white p-0.5 text-xs" style={{ fontFamily: "Lato" }}>10</Text>
                    </View>

                    {selectedReportAdmin === 'All' && (
                      <View className="h-[2px] bg-white  w-[80%] " />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    className="flex items-center justify-center flex-col w-1/5"
                    onPress={() => handleReportOptionPressAdmin('Present')}
                  >
                    <View className="flex flex-row gap-1 justify-end mb-4">
                      <Text 
                        className={`${selectedReportAdmin === 'Present' ? 'text-white' : 'text-[#787CA5]'} text-xs `}
                      >
                        Present
                      </Text>
                      <Text className="text-primary rounded-md bg-[#06D6A0] p-0.5 text-xs" style={{ fontFamily: "Lato" }}>10</Text>
                    </View>

                    {selectedReportAdmin === 'Present' && (
                      <View className="h-[2px] bg-white w-full mr-2 " />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex items-center justify-center flex-col w-1/5"
                    onPress={() => handleReportOptionPressAdmin('OnLeave')}
                  >
                    <View className="flex flex-row gap-1 justify-end mb-4">
                    <Text 
                      className={`${selectedReportAdmin === 'OnLeave' ? 'text-white' : 'text-[#787CA5]'} text-xs `}
                    >
                      On Leave
                    </Text>
                    <Text className="text-primary bg-[#FDB314]  rounded-md p-0.5 text-xs" style={{ fontFamily: "Lato" }}>10</Text>
                    </View>
                    {selectedReportAdmin === 'OnLeave' && (
                      <View className="h-[2px] bg-white w-full mr-3 " />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex items-center justify-center flex-col w-1/5"
                    onPress={() => handleReportOptionPressAdmin('Absent')}
                  >
                    <View className="flex flex-row gap-1 justify-end mb-4">
                    <Text 
                      className={`${selectedReportAdmin === 'Absent' ? 'text-white' : 'text-[#787CA5]'} text-xs `}
                    >
                      Absent
                    </Text>
                    <Text className="text-primary rounded-md bg-[#EF4444] p-0.5 text-xs" style={{ fontFamily: "Lato" }}>10</Text>
                    </View>

                    {selectedReportAdmin === 'Absent' && (
                      <View className="h-[2px] bg-white w-full mr-2" />
                    )}
                  </TouchableOpacity>
                </View> 

                <View className="flex w-full flex-col gap-3 justify-between p-5 rounded-3xl border border-[#37384B]">
                  <View className="flex items-center gap-2 flex-row  w-full">
                    <Text className="text-white text-lg" style={{fontFamily:"LatoBold"}}>Subhodeep Banerjee</Text>
                    <Text className="text-white self-center p-2 px-4 rounded-xl text-xs bg-[#06D6A0]">Present</Text>
                  </View>
                  <View className="flex flex-row items-center justify-between w-full">
                    <View className="flex flex-col items-start gap-2">
                      <Text className="text-[#787CA5]" style={{fontFamily:"LatoBold"}}>Login Time</Text>
                      <Text className="text-[#EF4444] text-base" style={{fontFamily:"LatoBold"}}>N/A</Text>
                    </View>
                    <View className="flex flex-col items-start gap-2">
                      <Text className="text-[#787CA5]" style={{fontFamily:"LatoBold"}}>Logout Time</Text>
                      <Text className="text-white text-base" style={{fontFamily:"LatoBold"}}>N/A</Text>
                    </View>
                    <View className="flex flex-col items-start gap-2">
                      <Text className="text-[#787CA5]" style={{fontFamily:"LatoBold"}}>Total Duration</Text>
                      <Text className="text-white text-base" style={{fontFamily:"LatoBold"}}>N/A</Text>
                    </View>
                  </View>
                </View>

              </View>
            </View> }
            
            {/* FITER MODAL */}
            <Modal 
            isVisible={isFilterModalVisible} 
            onBackdropPress={toggleFilterModal}
            style={{ margin: 0, justifyContent: 'flex-end' }}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            >
              <View className="rounded-t-3xl bg-[#0A0D28] p-5">
                <View className="mb-5 mt-2 flex w-full flex-row items-center justify-between">
                  <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                  Filters 
                  </Text>
                  <TouchableOpacity onPress={toggleFilterModal}>
                    <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
                  </TouchableOpacity>
                </View>   
                
                <CustomDropdown
                  data={[
                    { label: "Manager 1", value: "manager1" },
                    { label: "Manager 2", value: "manager2" },
                  ]}
                  placeholder="Select Manager"
                  onSelect={(value) => setIsManagerSelect(value)}
                  selectedValue={isManagesSelect}
                />

                <CustomDropdown
                  data={[
                    { label: "Employee 1", value: "employee1" },
                    { label: "Employee 2", value: "employee2" },
                  ]}
                  placeholder="Select Employee"
                  onSelect={(value) => setIsEmploeeSelect(value)}
                  selectedValue={isEmployeeSelect}
                />

                 <View className='flex flex-row items-center justify-center gap-5 mt-8'>
                   <TouchableOpacity className='bg-[#37384B] p-4 rounded-full w-[45%] items-center'>
                     <Text className='text-white text-sm'>Clear All</Text>
                   </TouchableOpacity>
                   <TouchableOpacity className=' rounded-full w-[45%]  items-center'>
                     <LinearGradient
                       start={{ x: 0, y: 0 }}
                       end={{ x: 1, y: 1 }}
                       colors={["#815BF5", "#FC8929"]}
                       style={styles.gradient}
                     >
                       <Text className='text-white text-sm'>Apply</Text>
                     </LinearGradient>                   
                   </TouchableOpacity>
                 </View>
                  
              </View>
            </Modal>
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
    width:"100%",
    display:"flex",
    alignItems:"center",
  },
  messageModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  messageText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5, 
    flexDirection: "row", 
  },
});