import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Image,
  TouchableOpacity,
} from "react-native";
import Navbar from "~/components/navbar";
import CustomDropdown from "~/components/customDropDown";
import { NavigationProp } from "@react-navigation/core"; // Type for navigation
import { useNavigation } from "@react-navigation/native"; // Import navigation hook\
import { DashboardStackParamList } from "./DashboardStack";

const TasksCountData = [
  { id: "1", count: 0, items: "Overdue" },
  { id: "2", count: 0, items: "Pending" },
  { id: "3", count: 0, items: "InProgress" },
  { id: "4", count: 0, items: "Completed" },
  { id: "5", count: 0, items: "In Time" },
  { id: "6", count: 0, items: "Delayed" },
];
const daysData = [
  { label: "Today", value: "Overdue" },
  { label: "Yesterday", value: "Yesterday" },
  { label: "This Week", value: "This Week" },
  { label: "Last Week", value: "Last Week" },
  { label: "Next Week", value: "Next Week" },
  { label: "This Month", value: "This Month" },
  { label: "Next Month", value: "Next Month" },
  { label: "This Year", value: "This Year" },
  { label: "All Time", value: "All Time" },
  { label: "Custom", value: "Custom" },
];

export default function DashboardScreen() {
  const [selectedTeamSize, setSelectedTeamSize] = useState(null);
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-primary h-full">
      <Navbar title="Dashboard" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Dropdown */}
            <View className="items-center w-full flex mt-4 mb-3">
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

            {/* Content */}
            <View className="flex gap-2.5 flex-col h-full items-center w-full p-4.2 pt-1 mb-32">
              {/* Row 1 */}
              <View className="flex-row flex items-start gap-2.5 justify-center w-[90%] h-[14rem]">
                <View className="w-1/2 h-full bg-[#FC842C] rounded-3xl p-5 flex flex-col ">

                  <View className="flex items-start "> 
                    <Text className="text-white font-medium">Today’s Task</Text>
                    <Text className=" text-white font-semibold" style={{fontSize:34}}>34</Text>
                    <Text className=" text-xs text-white pt-2 w-[40vw]">25th December, 2024</Text>
                  </View>

                  <View className="flex items-start flex-row mt-3">
                  <View className="flex w-full pt-9 flex-row gap-20 justify-center items-center">
                    <View className="flex relative flex-row ">
                      <View className="bg-red-600 w-9 h-9 rounded-full border border-[#FC842C] "></View>
                      <View className="bg-slate-700 w-9 h-9 rounded-full absolute left-7 z-10 border border-[#FC842C]"></View>
                      <View className="bg-white flex items-center justify-center w-9 h-9 rounded-full absolute left-14 z-20 border border-[#FC842C]">
                        <Text className="text-black text-center text-sm font-semibold">+1</Text>
                      </View>
                    </View>

                    <View className=" border flex items-center justify-center border-white w-9 h-9 rounded-full ">
                      <Image className=" w-4 h-4" source={require("~/assets/Tasks/goto.png")}/>
                    </View>
                  </View>
                  </View>
                </View>

                <View className="w-1/2 h-full bg-[#D85570] rounded-3xl p-5 flex flex-col ">

                  <View className="flex items-start "> 
                    <Text className="text-white font-medium">Pending Tasks</Text>
                    <Text className=" text-white font-semibold" style={{fontSize:34}}>26</Text>
                    <Text className=" text-xs text-white pt-2 w-[40vw]">25th December, 2024</Text>
                  </View>

                  <View className="flex items-start flex-row mt-3">
                  <View className="flex w-full pt-9 flex-row gap-20 justify-center items-center">
                    <View className="flex relative flex-row ">
                      <View className="bg-red-600 w-9 h-9 rounded-full border border-[#D85570]"></View>
                      <View className="bg-slate-700 w-9 h-9 rounded-full absolute left-7 z-10 border border-[#D85570]"></View>
                      <View className="bg-white flex items-center justify-center w-9 h-9 rounded-full absolute left-14 z-20 border border-[#D85570]">
                        <Text className="text-black text-center text-sm font-semibold">+1</Text>
                      </View>
                    </View>

                    <View className=" border flex items-center justify-center border-white w-9 h-9 rounded-full ">
                      <Image className=" w-4 h-4" source={require("~/assets/Tasks/goto.png")}/>
                    </View>
                  </View>
                  </View>
                </View>
              </View>

              {/* Row 2 */}
              <View className="flex-row flex items-start gap-2.5 justify-center w-[90%] h-[14rem]">
                
                <View className="w-1/2 h-full bg-[#FDB314] rounded-3xl p-5 flex flex-col ">
                <TouchableOpacity className="" onPress={() => navigation.navigate("PendingTask")}>
                  <View className="flex items-start "> 
                    <Text className="text-white font-medium">Pending Tasks</Text>
                    <Text className=" text-white font-semibold" style={{fontSize:34}}>134</Text>
                    <Text className=" text-xs text-white pt-2
                     w-[40vw]">25th December, 2024</Text>
                  </View>

                  <View className="flex items-start flex-row mt-3">
                  <View className="flex w-full pt-9 flex-row gap-20 justify-center items-center">
                    <View className="flex relative flex-row ">
                      <View className="bg-red-600 w-9 h-9 rounded-full border border-[#FDB314]"></View>
                      <View className="bg-slate-700 w-9 h-9 rounded-full absolute left-7 z-10 border border-[#FDB314]"></View>
                      <View className="bg-white flex items-center justify-center w-9 h-9 rounded-full absolute left-14 z-20 border border-[#FDB314]">
                        <Text className="text-black text-center text-sm font-semibold">+1</Text>
                      </View>
                    </View>

                    <View className=" border flex items-center justify-center border-white w-9 h-9 rounded-full ">
                      <Image className=" w-4 h-4" source={require("~/assets/Tasks/goto.png")}/>
                    </View>
                  </View>
                  </View>
                  </TouchableOpacity>
                </View>
                
                <View className="w-1/2 h-full bg-[#A914DD] rounded-3xl p-5 flex flex-col ">

                  <View className="flex items-start "> 
                    <Text className="text-white font-medium w-[50vh]">In Progress Tasks</Text>
                    <Text className=" text-white font-semibold" style={{fontSize:34}}>55</Text>
                    <Text className=" text-xs text-white pt-2 w-[40vw]">25th December, 2024</Text>
                  </View>

                  <View className="flex items-start flex-row mt-3">
                  <View className="flex w-full pt-9 flex-row gap-20 justify-center items-center">
                    <View className="flex relative flex-row ">
                      <View className="bg-red-600 w-9 h-9 rounded-full border border-[#A914DD] "></View>
                      <View className="bg-slate-700 w-9 h-9 rounded-full absolute left-7 z-10 border border-[#A914DD]"></View>
                      <View className="bg-white flex items-center justify-center w-9 h-9 rounded-full absolute left-14 z-20 border border-[#A914DD]">
                        <Text className="text-black text-center text-sm font-semibold">+1</Text>
                      </View>
                    </View>

                    <View className=" border flex items-center justify-center border-white w-9 h-9 rounded-full ">
                      <Image className=" w-4 h-4" source={require("~/assets/Tasks/goto.png")}/>
                    </View>
                  </View>
                  </View>
                </View>
              </View>



              {/* Full Width Card */}
              <View className="w-[93%] bg-[#007B5B] h-[160px] mt-2 p-4 mb-2 rounded-3xl">
                <View className=" w-full items-center justify-between flex flex-row">
                  <Text className="text-white ">Completed Tasks</Text>
                  <Text className="text-white text-xs">22-12-2024 to 28-12-2024</Text>
                </View>
                <Text className=" text-white font-semibold mt-2" style={{fontSize:34}}>56</Text>
          
                  <View className="flex w-full pt-5 flex-row gap-20 justify-between items-center">
                    <View className="flex relative flex-row ">
                      <View className="bg-red-600 w-9 h-9 z-0 rounded-full border border-[#007B5B]"></View>
                      <View className="bg-slate-700 w-9 h-9 rounded-full absolute left-[1.2rem] z-10 border border-[#007B5B]"></View>
                      <View className="bg-orange-600 w-9 h-9 rounded-full absolute left-[2.4rem] z-20 border border-[#007B5B]"></View>
                      <View className="bg-yellow-600 w-9 h-9 rounded-full absolute left-[3.6rem] z-30 border border-[#007B5B]"></View>
                      <View className="bg-blue-400 w-9 h-9 rounded-full absolute left-[4.8rem] z-40 border border-[#007B5B]"></View>
                      <View className="bg-slate-400 w-9 h-9 rounded-full absolute left-[6rem] z-50 border border-[#007B5B]"></View>
                      <View className="bg-white flex items-center justify-center w-9 h-9 rounded-full absolute left-[7.2rem] z-[60] border border-[#007B5B]">
                        <Text className="text-black text-center text-sm font-semibold">+1</Text>
                      </View>
                    </View>

                    <View className=" border flex items-center justify-center border-white w-9 h-9 rounded-full ">
                      <Image className=" w-4 h-4" source={require("~/assets/Tasks/goto.png")}/>
                    </View>
                 
                  </View>
              </View>




              {/* Row 3 */}
              <View className="flex-row flex items-start gap-2.5 justify-center w-[90%] h-[14rem]">
                <View className="w-1/2 h-full bg-[#815BF5] rounded-3xl p-5 flex flex-col ">

                  <View className="flex items-start "> 
                    <Text className="text-white font-medium">In Time Taskss</Text>
                    <Text className=" text-white font-semibold" style={{fontSize:34}}>39</Text>
                    <Text className="  text-xs text-white pt-2
                     w-[40vw]">25th December, 2024</Text>
                  </View>

                  <View className="flex items-start flex-row mt-3">
                  <View className="flex w-full pt-9 flex-row gap-20 justify-center items-center">
                    <View className="flex relative flex-row ">
                      <View className="bg-red-600 w-9 h-9 rounded-full border border-[#815BF5]"></View>
                      <View className="bg-slate-700 w-9 h-9 rounded-full absolute left-7 z-10 border border-[#815BF5]"></View>
                      <View className="bg-white flex items-center justify-center w-9 h-9 rounded-full absolute left-14 z-20 border border-[#815BF5]">
                        <Text className="text-black text-center text-sm font-semibold">+1</Text>
                      </View>
                    </View>

                    <View className=" border flex items-center justify-center border-white w-9 h-9 rounded-full ">
                      <Image className=" w-4 h-4" source={require("~/assets/Tasks/goto.png")}/>
                    </View>
                  </View>
                  </View>
                </View>
                <View className="w-1/2 h-full bg-[#DE7560] rounded-3xl p-5 flex flex-col ">

                  <View className="flex items-start "> 
                    <Text className="text-white font-medium w-[50vh]">Dalayed Tasks</Text>
                    <Text className=" text-white font-semibold" style={{fontSize:34}}>26</Text>
                    <Text className=" text-xs text-white pt-2 w-[40vw]">25th December, 2024</Text>
                  </View>

                  <View className="flex items-start flex-row mt-3">
                  <View className="flex w-full pt-9 flex-row gap-20 justify-center items-center">
                    <View className="flex relative flex-row ">
                      <View className="bg-red-600 w-9 h-9 rounded-full border border-[#DE7560] "></View>
                      <View className="bg-slate-700 w-9 h-9 rounded-full absolute left-7 z-10 border border-[#DE7560]"></View>
                      <View className="bg-white flex items-center justify-center w-9 h-9 rounded-full absolute left-14 z-20 border border-[#DE7560]">
                        <Text className="text-black text-center text-sm font-semibold">+1</Text>
                      </View>
                    </View>

                    <View className=" border flex items-center justify-center border-white w-9 h-9 rounded-full ">
                      <Image className=" w-4 h-4" source={require("~/assets/Tasks/goto.png")}/>
                    </View>
                  </View>
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
