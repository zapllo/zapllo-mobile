import { View, Text, SafeAreaView, Platform, ScrollView, StyleSheet, TouchableOpacity, Image, Animated, ImageSourcePropType } from "react-native";
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
import CategoryComponent from "./CategoryComponent";
import { LinearGradient } from "expo-linear-gradient";
import GradientButton from "~/components/GradientButton";

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
const exampleImage: ImageSourcePropType = require('../../../../assets/Tasks/addNew.png');
export default function TaskCategories() {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const [taskDescription, setTaskDescription] = useState("");
    const [isModalVisible, setModalVisible] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const toggleModal = () => {
      setModalVisible(!isModalVisible);
    };


  

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary ">
      <KeyboardAvoidingView
        className=" w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <NavbarTwo
          title="Task Categories"
          onBackPress={() => navigation.navigate('(routes)/home/index')}
        />
        <ScrollView
          className="h-full w-full flex-grow"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center pb-20">

            {/* task category */}
            <View
              style={[
                styles.input,
                { height: 57, justifyContent: 'flex-start', alignItems: 'flex-start',width:"90%",marginBottom:34,marginTop:20 },
              ]}>
              <TextInput
                multiline
                style={[
                  styles.inputSome,
                  { textAlignVertical: 'top', paddingTop: 10, width: '100%' },
                ]}
                value={taskDescription}
                onChangeText={(value) => setTaskDescription(value)}
                placeholder="Search Category"
                placeholderTextColor="#787CA5"></TextInput>
            </View> 
            
            {/* add category */}
            <CategoryComponent 
              title="Automation"
              onAddPress={toggleModal}
              onDeletePress={() => console.log('Delete pressed')}
            />

            <CategoryComponent 
              title="Customer Support"
              onAddPress={toggleModal}
              onDeletePress={() => console.log('Delete pressed')}
            />


                <GradientButton 
                  title="Add New Category"
                  onPress={() => console.log('Button pressed')}
                  imageSource={exampleImage}
                />  
          </View>
        </ScrollView>

        {/* Modal */}
      <Modal 
      isVisible={isModalVisible} 
      onBackdropPress={toggleModal}
      style={{ margin: 0, justifyContent: "flex-end" }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      >
        <View className="rounded-t-3xl bg-[#0A0D28] flex items-center flex-col pb-16 ">
                <View className="flex px-6 py-5 w-full items-center flex-row  justify-between">
                    <Text className="text-2xl font-bold text-white" style={{fontFamily:"Lato-Bold"}}>
                    Filters
                    </Text>

                    <Text className="text-lg text-white" style={{fontFamily:"Lato-Regular"}}>
                    Clear All
                    </Text>
                </View>

                

                <View className="flex flex-row w-full border-y-[#37384B] border mb-6 ">

                    <View className="w-[40%] border-r border-r-[#37384B] pb-20">
                    <TouchableOpacity className="bg-[#37384B] items-start w-full h-14">
                        <Text className="text-white px-6 p-4 h-full">Category</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className=" items-start w-full h-14 border-b border-b-[#37384B]">
                        <Text className="text-white px-6 p-4 h-full">Assigned to</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className=" items-start w-full h-14 border-b border-b-[#37384B]">
                        <Text className="text-white px-6 p-4 h-full">Frequency</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className=" items-start w-full h-14 border-b border-b-[#37384B]">
                        <Text className="text-white px-6 p-4 h-full">Priority</Text>
                    </TouchableOpacity>
                    </View>

                    <View className="w-[60%] p-4 flex flex-col gap-6 ">

                    <View
                    style={[
                      styles.input,
                      { height: 57,borderRadius:16 },
                    ]}>
                      <Image className="h-4 w-4  " source={require("../../../../assets/Tasks/search.png")}/>
                    <TextInput
                      multiline
                      style={[
                        styles.inputSome,
                        { textAlignVertical: 'top', paddingTop: 10, width: '100%' },
                      ]}
                      value={taskDescription}
                      onChangeText={(value) => setTaskDescription(value)}
                      placeholder="Search Category"
                      placeholderTextColor="#787CA5"></TextInput>
                    </View> 

                    
                        <View className="flex w-full flex-row gap-3 items-center">
                            <CheckboxTwo isChecked={isChecked} onPress={() => setIsChecked(!isChecked)}/>
                              <Text className="text-white text-lg" >Customer Support</Text>
                        </View>

                        <View className="flex w-full flex-row gap-3 items-center">
                            <CheckboxTwo isChecked={isChecked} onPress={() => setIsChecked(!isChecked)}/>
                              <Text className="text-white text-lg" >Marketing</Text>
                        </View>

                        <View className="flex w-full flex-row gap-3 items-center">
                            <CheckboxTwo isChecked={isChecked} onPress={() => setIsChecked(!isChecked)}/>
                              <Text className="text-white text-lg" >Marketing</Text>
                        </View>
                    </View>
                </View>


                <GradientButton 
                  title="Apply Filter"
                  onPress={() => console.log('Button pressed')}
                  imageSource={""}
                />                         
                
        </View>


      </Modal>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({


  inputSome: {
    flex: 1,
    padding: 8,
    color: '#787CA5',
    fontSize: 13,
    fontFamily:"lato-bold"
  },


  input: {
    borderWidth: 1,
    
    borderColor: '#37384B',
    padding: 10,
    
    borderRadius: 35,
    width: '100%',
    height: 57,
    position: 'relative',
    alignItems:"center",
    flexDirection:"row",
    gap:2
  },
 

})
