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
            
            <View className="flex flex-col items-center w-full mt-5 gap-2">
              <CustomDropdown
                data={daysData}
                placeholder="Select User"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
              <CustomDropdown
                data={daysData}
                placeholder="Select Category"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
              <CustomDropdown
                data={daysData}
                placeholder="Subscribe to task"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

            <View className="flex gap-3 justify-start flex-col mt-3 items-start w-[90%]">
              <Text className="text-white " style={{fontFamily:"lato-bold"}}>Task Priority</Text>
              <View className="flex flex-row">
                <TouchableOpacity
                  className={activeButton === 'firstHalf' ? "bg-[#815BF5] border border-[#37384B] rounded-l-xl rounded" : "bg-transparent border border-[#37384B] rounded-l-xl rounded"}
                  onPress={() => handleButtonPress('firstHalf')}>
                  <Text className={activeButton === 'firstHalf' ? "text-white p-3 text-sm" : "text-[#787CA5] p-3 text-sm"} style={{fontFamily:"Lato-Thin"}}>First Half</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={activeButton === 'secondHalf' ? "bg-[#815BF5] border border-[#37384B] rounded" : "bg-transparent border border-[#37384B] rounded"}
                  onPress={() => handleButtonPress('secondHalf')}>
                  <Text className={activeButton === 'secondHalf' ? "text-white p-3 text-sm" : "text-[#787CA5] p-3 text-sm"} style={{fontFamily:"Lato-Thin"}}>Second Half</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={activeButton === 'thirdHalf' ? "bg-[#815BF5] border border-[#37384B] rounded" : "bg-transparent border border-[#37384B] rounded rounded-r-xl "}
                  onPress={() => handleButtonPress('thirdHalf')}>
                  <Text className={activeButton === 'thirdHalf' ? "text-white p-3 text-sm" : "text-[#787CA5] p-3 text-sm "} style={{fontFamily:"Lato-Thin"}}>Second Half</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex items-center flex-row w-[90%] justify-start mt-6 gap-4">
              <CheckboxTwo isChecked={isChecked} onPress={() => setIsChecked(!isChecked)}/>
              <Text className="text-white" style={{fontFamily:"Lato-Bold"}}>Task Priority</Text>
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
              <View className="bg-white w-20 h-10 rounded-3xl relative justify-center flex">
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 25,
    borderRadius: 25,
    width: '90%',
    height: 60,
    position: 'relative',
    paddingLeft:14,
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

})
