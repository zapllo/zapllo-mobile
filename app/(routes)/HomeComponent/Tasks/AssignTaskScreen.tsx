import { View, Text, SafeAreaView, Platform, ScrollView, StyleSheet, TouchableOpacity, Image, Animated } from "react-native";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView } from "react-native";
import NavbarTwo from "~/components/navbarTwo";
import { useNavigation } from "expo-router";
import { StackNavigationProp } from "@react-navigation/stack";
import InputContainer from "~/components/InputContainer";
import { TextInput } from "react-native";
import CustomDropdown from "~/components/customDropDown";
import CheckboxTwo from "~/components/CheckBoxTwo";
import * as Haptics from 'expo-haptics';
import Modal from 'react-native-modal';
import ReminderModal from "~/components/TaskComponents/assignNewTaskComponents/ReminderModal";
import AudioModal from "~/components/TaskComponents/assignNewTaskComponents/AudioModal";
import FileModal from "~/components/TaskComponents/assignNewTaskComponents/FileModal";
import AddLinkModal from "~/components/TaskComponents/assignNewTaskComponents/AddLinkModal";
import { Dropdown } from "react-native-element-dropdown";
import CustomDropdownComponentTwo from "~/components/customNavbarTwo";
import WeeklyModal from "~/components/TaskComponents/assignNewTaskComponents/WeeklyModal";
import MonthlyModal from "~/components/TaskComponents/assignNewTaskComponents/MonthlyModal";

//delete the data :)
const daysData = [
  { label: 'Today', value: 'Today' },
  { label: 'Yesterday', value: 'Yesterday' },
  { label: 'This Week', value: 'This Week' },
  { label: 'Last Week', value: 'Last Week' },
  { label: 'Next Week', value: 'Next Week' },
  { label: 'This Month', value: 'This Month' },
  { label: 'Next Month', value: 'Next Month' },
  { label: 'This Year', value: 'This Year' },
  { label: 'All Time', value: 'All Time' },
  { label: 'Custom', value: 'Custom' },
];

const selectRepetType = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
]

export default function AssignTaskScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedTeamSize, setSelectedTeamSize] = useState('');
  const [activeButton, setActiveButton] = useState('firstHalf'); 
  const [isChecked, setIsChecked] = useState(false);
  const [isOn, setIsOn] = useState(false);

  const [isLinkModalVisible, setLinkModalVisible] = useState(false);
  const [isFileModalVisible, setFileModalVisible] = useState(false);
  const [isReminderModalVisible, setReminderModalVisible] = useState(false);
  const [isAudioModalVisible, setAudioModalVisible] = useState(false);
  const [repeatType, setRepeatType] = useState('');
  const [isWeeklyModalVisible, setWeeklyModalVisible] = useState(false);
  const [isMonthlyModalVisible, setMonthlyModalVisible] = useState(false);

  


  //demo state change the state while adding 
  const [selectedIndustry, setSelectedIndustry] = useState(null); 
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);

  const position = useRef(new Animated.Value(0)).current;

  const handleButtonPress = (button: string) => {
    setActiveButton(button);
    Haptics.selectionAsync();
  };

  const toggleSwitch = () => {
    setIsOn((previousState) => !previousState);
    Animated.timing(position, {
      toValue: isOn ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Haptics.selectionAsync();
  };

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 32],
  });

  const handleWeeklyTap = () => {
    setWeeklyModalVisible(true);
  };

  const handleMonthlyTap = () => {
    setMonthlyModalVisible(true);
  };

  // fake data
  const industryData = [
    { label: 'Retail/E-Commerce', value: 'Retail/E-Commerce' },
    { label: 'Technology', value: 'Technology' },
    { label: 'Service Provider', value: 'Service Provider' },
    {
      label: 'Healthcare(Doctors/Clinics/Physicians/Hospital)',
      value: 'Healthcare(Doctors/Clinics/Physicians/Hospital)',
    },
    { label: 'Logistics', value: 'Logistics' },
    { label: 'Financial Consultants', value: 'Financial Consultants' },
    { label: 'Trading', value: 'Trading' },
    { label: 'Education', value: 'Education' },
    { label: 'Manufacturing', value: 'Manufacturing' },
    {
      label: 'Real Estate/Construction/Interior/Architects',
      value: 'Real Estate/Construction/Interior/Architects',
    },
    { label: 'Others', value: 'Others' },
  ];

    const renderIndustryItem = (item: any) => {
      const isSelected = item.value === selectedIndustry;
  
      return (
        <TouchableOpacity
          style={[
            styles.itemStyle,
            isSelected && styles.selectedDropdownItemStyle, // Apply selected item style
          ]}
          onPress={() => setSelectedIndustry(item.value)} // Update selected item
        >
          <Text
            style={[
              styles.itemTextStyle,
              isSelected && styles.selectedTextStyle, // Apply selected text style
            ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      );
    };

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary ">
      <KeyboardAvoidingView
        className=" w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <NavbarTwo
          title="Assign New Task"
          onBackPress={() => navigation.navigate('(routes)/home/index')}
        />
        <ScrollView
          className="h-full w-full flex-grow"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center pb-20">
            <InputContainer
              label="Task Title"
              value={taskTitle}
              onChangeText={(value) => setTaskTitle(value)}
              placeholder=""
              className="flex-1  text-sm text-[#787CA5]"
              passwordError={''}
            />

            <View
              style={[
                styles.input,
                { height: 100, justifyContent: 'flex-start', alignItems: 'flex-start' },
              ]}>
              <TextInput
                multiline
                style={[
                  styles.inputSome,
                  { textAlignVertical: 'top', paddingTop: 5, width: '100%' },
                ]}
                value={taskDescription}
                onChangeText={(value) => setTaskDescription(value)}
                placeholder="Description of the task"
                placeholderTextColor="#787CA5"></TextInput>
            </View> 
            

            {/* selected users */}
            <View className="flex flex-col items-center w-full mt-2 gap-2">
              <View style={styles.input}>
                <Text style={[styles.baseName, { fontFamily: 'Lato-Bold' }]}>
                Select User
                </Text>
                <CustomDropdownComponentTwo
                  data={industryData}
                  selectedValue={selectedIndustry}
                  onSelect={(value) => setSelectedIndustry(value)}
                  placeholder=""
                  renderItem={renderIndustryItem}
                />
              </View>

              <View style={styles.input}>
                <Text style={[styles.baseName, { fontFamily: 'Lato-Bold' }]}>
                Select Category
                </Text>
                <CustomDropdownComponentTwo
                  data={industryData}
                  selectedValue={selectedIndustry}
                  onSelect={(value) => setSelectedIndustry(value)}
                  placeholder=""
                  renderItem={renderIndustryItem}
                />
              </View>
              
            </View>
            

            {/* Task priority */}
            <View className="flex gap-3 justify-start flex-col mt-6 items-start w-[90%]">
              <Text className="text-white " style={{fontFamily:"lato-bold"}}>Task Priority</Text>
              <View className="flex flex-row">
                <TouchableOpacity
                  className={activeButton === 'firstHalf' ? "bg-[#815BF5] border border-[#37384B] rounded-l-xl " : "bg-transparent border border-[#37384B] rounded-l-xl "}
                  onPress={() => handleButtonPress('firstHalf')}>
                  <Text className={activeButton === 'firstHalf' ? "text-white p-3 text-sm" : "text-[#787CA5] p-3 text-sm"} style={{fontFamily:"Lato-Thin"}}>High</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={activeButton === 'secondHalf' ? "bg-[#815BF5] border border-[#37384B] " : "bg-transparent border border-[#37384B] "}
                  onPress={() => handleButtonPress('secondHalf')}>
                  <Text className={activeButton === 'secondHalf' ? "text-white p-3 text-sm" : "text-[#787CA5] p-3 text-sm"} style={{fontFamily:"Lato-Thin"}}>medium</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={activeButton === 'thirdHalf' ? "bg-[#815BF5] rounded-r-xl border border-[#37384B] " : "bg-transparent border border-[#37384B]  rounded-r-xl "}
                  onPress={() => handleButtonPress('thirdHalf')}>
                  <Text className={activeButton === 'thirdHalf' ? "text-white p-3 text-sm" : "text-[#787CA5] p-3 text-sm "} style={{fontFamily:"Lato-Thin"}}>Low</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex items-center flex-row w-[90%] justify-start mt-6 gap-4">
              <CheckboxTwo isChecked={isChecked} onPress={() => setIsChecked(!isChecked)}/>
              <Text className="text-white" style={{fontFamily:"Lato-Bold"}}>Repeat</Text>
            </View>

            {
              isChecked ? <CustomDropdown
              data={selectRepetType}
              placeholder="Select Repeat Type"
              selectedValue={repeatType}
              onSelect={(value) => {
                setRepeatType(value);
                if (value === 'Weekly') {
                  setWeeklyModalVisible(true);
                } else if (value === 'Monthly') {
                  setMonthlyModalVisible(true);
                }
              }}
              />:""
            }
            

            <View className=" relative">
              <InputContainer
                label="Due Date"
                value={taskTitle}
                onChangeText={(value) => setTaskTitle(value)}
                placeholder=""
                className="flex-1  text-sm text-[#787CA5]"
                passwordError={''}
                style={{paddingEnd:45}}
              />
              <TouchableOpacity>
                <Image className=" absolute w-6 h-6 bottom-6 right-6" source={require("../../../../assets/Tasks/calender.png")}/>
              </TouchableOpacity>
            </View>


            <View className=" flex items-center gap-3 flex-row w-[90%] mt-6">
              <TouchableOpacity onPress={() => setLinkModalVisible(true)}>
                <Image className="h-12 w-12" source={require("../../../../assets/Tasks/link.png")} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFileModalVisible(true)}>
                <Image className="h-12 w-12" source={require("../../../../assets/Tasks/file.png")} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setReminderModalVisible(true)}>
                <Image className="h-12 w-12" source={require("../../../../assets/Tasks/Reminder.png")} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAudioModalVisible(true)}>
                <Image className="h-12 w-12" source={require("../../../../assets/Tasks/Audio.png")} />
              </TouchableOpacity>
            </View>

            <View className="flex items-center justify-between w-[90%] flex-row mt-6 mb-10">
      <Text className="text-white" style={{ fontFamily: "Lato-Bold" }}>Assign More Task</Text>
      <View
      className="bg-white w-20 h-10 rounded-3xl relative justify-center flex"
        style={[
          
          { backgroundColor: isOn ? 'white' : '#a9b0bd' }, // Use gray color when off
        ]}
      >
        <TouchableOpacity onPress={toggleSwitch}>
          <Animated.View style={{ transform: [{ translateX }] }}>
            <Image
              className="h-9 w-9 mx-1"
              source={require("../../../../assets/Tasks/onOffBall.png")}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>

            <TouchableOpacity
              className={`mb-10  flex h-[4rem] w-[90%] items-center justify-center rounded-full p-5 bg-[#37384B]`}>
              <Text className="text-center  font-semibold text-white"  style={{fontFamily:"Lato-Bold"}}>Assign Task</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      {/* add link Modal */}
      <AddLinkModal
        isLinkModalVisible={isLinkModalVisible}
        setLinkModalVisible={setLinkModalVisible}
      />
      {/* File Modal */}
      <FileModal
        isFileModalVisible={isFileModalVisible}
        setFileModalVisible={setFileModalVisible}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isReminderModalVisible={isReminderModalVisible}
        setReminderModalVisible={setReminderModalVisible}
      />
      
      {/* Audio Modal */}
      <AudioModal
        isAudioModalVisible={isAudioModalVisible}
        setAudioModalVisible={setAudioModalVisible}
      />

                  {/* Weekly Modal */}
                  <WeeklyModal
              isVisible={isWeeklyModalVisible}
              onClose={() => setWeeklyModalVisible(false)}
            />

            {/* Monthly Modal */}
            <MonthlyModal
              isVisible={isMonthlyModalVisible}
              onClose={() => setMonthlyModalVisible(false)}
            />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: 76,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
  },

  inputSome: {
    flex: 1,
    padding: 8,
    color: '#787CA5',
    fontSize: 13,
    fontFamily:"lato-bold"
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedDropdownItemStyle: {
    backgroundColor: '#4e5278', // Background color for selected item
  },

  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 25,
    borderRadius: 35,
    width: '90%',
    height: 57,
    position: 'relative',
  },
  baseName: {
    color: '#787CA5',
    position: 'absolute',
    top: -9,
    left: 25,
    backgroundColor: '#05071E',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 13,
    fontWeight: 400,
    fontFamily:"lato"

  },


  dropdown: {
    position: 'absolute',
    width: '100%',
    height: 50,
  },
  itemStyle: {
    padding: 15,
    borderBottomColor: '#37384B',
    borderBottomWidth: 1,
  },
  itemTextStyle: {
    color: '#787CA5',
  },
  selectedItemStyle: {
    backgroundColor: '#4e5278',
  },

  placeholderStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: 300,
    paddingLeft: 22,
  },
  selectedTextStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: 300,
    paddingLeft: 22,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    marginRight: 5,
    borderColor: 'white',
    width:10
  },
  dropdownMenu: {
    backgroundColor: '#05071E',
    borderColor: '#37384B',
    borderWidth: 1,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
    margin: 8,
  },
  dropdownMenuTwo: {
    backgroundColor: '#05071E',
    borderColor: '#37384B',
    borderWidth: 1,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
    margin: 8,
  },

})
