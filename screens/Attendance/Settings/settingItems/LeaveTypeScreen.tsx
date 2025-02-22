import { Keyboard, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import React, { useState } from "react";
import NavbarTwo from "~/components/navbarTwo";
import { KeyboardAvoidingView } from "react-native";
import { Image } from "react-native";

import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import Modal from 'react-native-modal';
import InputContainer from "~/components/InputContainer";
import ToggleSwitch from "~/components/ToggleSwitch";




type ReportOpctionAdmin = "All" | 'Paid' | 'Unpaid' | 'Absent';


export default function LeaveTypeScreen() {
  const [selectedReportAdmin, setSelectedReportAdmin] = useState<ReportOpctionAdmin>('All');
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Reset');
  const [leaveTitle, setLeaveTitle] = useState("");
  const [description,setDescripction] = useState("");
  const [isDescriptionFocused, setDescriptionFocused] = useState(false);


  const handleFocus = () => setDescriptionFocused(true);
  const handleBlur = () => setDescriptionFocused(false);

  const handleReportOptionPressAdmin = (option: ReportOpctionAdmin) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReportAdmin(option);
  };

  const toggleModal = () => {
    setModalVisible(prevState => !prevState);
  };

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Leave Type" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-[90%] mt-8 flex">
              <View className="w-full  items-center flex flex-row justify-between">

                <TouchableOpacity className="w-12 h-12" onPress={toggleModal}>
                  <Image 
                    className="w-full h-full"
                    source={require("../../../../assets/Attendence/Add.png")}/>
                </TouchableOpacity>
                <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}                      
                        colors={['#815BF5', '#FC8929']}
                        style={styles.gradientBorder}
                      >
                <TouchableOpacity className='flex h-[3rem]  px-7 items-center justify-center rounded-full bg-primary'>
                    <Text className='text-white text-xs' style={{ fontFamily: 'LatoBold' }}>Update Leave Balance for 2025</Text>
                  
                </TouchableOpacity>
                </LinearGradient>

              </View>
              <View className="w-full items-end mt-2 flex mb-10 ">
              <Text className=" text-white  mr-4" style={{ fontFamily: 'LatoBold' }}>Total Leaves Alloted: 45</Text>
              </View>

              <View className="flex w-full flex-row justify-start items-center mb-4 ">
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
                        className="flex items-center justify-center flex-col w-1/5 mr-4"
                        onPress={() => handleReportOptionPressAdmin('Paid')}
                      >
                        <View className="flex flex-row gap-1 justify-end mb-4">
                          <Text 
                            className={`${selectedReportAdmin === 'Paid' ? 'text-white' : 'text-[#787CA5]'} text-xs `}
                          >
                            Paid
                          </Text>
                          <Text className="text-primary rounded-md bg-[#06D6A0] p-0.5 text-xs" style={{ fontFamily: "Lato" }}>10</Text>
                        </View>

                        {selectedReportAdmin === 'Paid' && (
                          <View className="h-[2px] bg-white w-full mr-2 " />
                        )}
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        className="flex items-center justify-center flex-col w-1/5"
                        onPress={() => handleReportOptionPressAdmin('Unpaid')}
                      >
                        <View className="flex flex-row gap-1 justify-end mb-4">
                        <Text 
                          className={`${selectedReportAdmin === 'Unpaid' ? 'text-white' : 'text-[#787CA5]'} text-xs `}
                        >
                          Unpaid
                        </Text>
                        <Text className="text-primary bg-[#FDB314]  rounded-md p-0.5 text-xs" style={{ fontFamily: "Lato" }}>10</Text>
                        </View>
                        {selectedReportAdmin === 'Unpaid' && (
                          <View className="h-[2px] bg-white w-full mr-3 " />
                        )}
                      </TouchableOpacity>
                      
                    
              </View> 

              <View className=" border border-[#37384B] p-5  rounded-xl ">
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row gap-4 items-center">
                <Text className="text-white text-lg ">Casual Leave</Text>
                <Text className="text-white bg-[#06D6A0] text-xs rounded-md p-1">Paid Leave</Text>
                </View>

                <View className="flex flex-row items-center gap-4">
                  <TouchableOpacity className="h-6 w-7">
                    <Image className="w-full h-full" source={require("../../../../assets/Tasks/addto.png")}/>
                  </TouchableOpacity>
                  <TouchableOpacity className="h-6 w-4">
                    <Image className="h-full w-full" source={require("../../../../assets/Tasks/deleteTwo.png")}/>
                  </TouchableOpacity>
                </View>
              </View>

              <Text className="text-white text-sm">Leaves Allotted: 12</Text>

              </View>
              

            </View>

            <Modal
              isVisible={isModalVisible}
              onBackdropPress={toggleModal}
              style={{ margin: 0, justifyContent: 'flex-end' }}
              animationIn="slideInUp"
              animationOut="slideOutDown"
            >
              <View className="rounded-t-3xl bg-[#0A0D28] py-5">
                <View className="px-5 mb-10 mt-2 flex w-full flex-row items-center justify-between">
                  <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                  New Leave Type
                  </Text>
                  <TouchableOpacity onPress={toggleModal}>
                    <Image source={require('../../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
                  </TouchableOpacity>
                </View>

                <View className="px-5">
                  <View className="items-center border border-[#676B93] w-full px-1.5 py-1.5 rounded-full  mb-4">
                    <View className="w-full flex flex-row items-center justify-between">
                        <TouchableOpacity
                          className="w-1/2 items-center"
                          onPress={() => handleOptionPress('Reset')}
                        >
                          <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            colors={selectedOption === 'Reset' ? ["#815BF5", "#FC8929"] : ["#0A0D28", "#0A0D28"]}
                            style={styles.tablet}
                          >
                            <Text className={`text-sm  ${selectedOption === 'Reset' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>All Reset</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="w-1/2 items-center"
                          onPress={() => handleOptionPress('Carry Forward')}
                        >
                          <LinearGradient
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            colors={selectedOption === 'Carry Forward' ? ["#815BF5", "#FC8929"] : ["#0A0D28", "#0A0D28"]}
                            style={styles.tablet}
                          >
                            <Text className={`text-sm  ${selectedOption === 'Carry Forward' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Carry Forward</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                    </View>
                  </View>
                </View>

                
                {/* Leave Title */}
                <View className="w-[100%] items-center flex flex-col ">
                <InputContainer
                  label="Leave Type"
                  value={leaveTitle}
                  onChangeText={(value) => setLeaveTitle(value)}
                  placeholder=""
                  className="flex-1  text-sm text-[#787CA5]"
                  passwordError={''}
                />
                {/* desc */}
                  <View
                    style={[
                      styles.input,
                      {
                        height: 100,
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        borderColor: isDescriptionFocused ? '#815BF5' : '#37384B',
                      },
                    ]}>
                
                    <TextInput
                      multiline
                      style={[
                        styles.inputSome,
                        { textAlignVertical: 'top', paddingTop: 5, width: '100%' },
                      ]}
                      value={description}
                      onChangeText={(value) => setDescripction(value)}
                      placeholder="description"
                      placeholderTextColor="#787CA5"
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </View>
                  
                  {/* Paid Leave */}
                  <InputContainer
                  label="Alloted Leaves"
                  value={leaveTitle}
                  onChangeText={(value) => setLeaveTitle(value)}
                  placeholder=""
                  className="flex-1  text-sm text-[#787CA5]"
                  passwordError={''}
                />
                <View className="flex w-full mx-7 mt-3 ">
                
                  <ToggleSwitch
                  title={"           Paid Leave         -----------------"}
                  />
                </View>
                  <View className="flex w-full mx-7  ">
                  
                  <ToggleSwitch
                  title={"           Paid Leave         -----------------"}
                  />
                </View>

                <View className="bg-primary w-full items-center justify-center pb-12">
                  {/* Backdated Leave Days */}
                  <InputContainer
                  label="Backdated Leave Days"
                  value={leaveTitle}
                  onChangeText={(value) => setLeaveTitle(value)}
                  placeholder=""
                  className="flex-1  text-sm text-[#787CA5]"
                  passwordError={''}
                />

                  {/* Advance Leave Days */}
                  <InputContainer
                  label="Advance Leave Days"
                  value={leaveTitle}
                  onChangeText={(value) => setLeaveTitle(value)}
                  placeholder=""
                  className="flex-1  text-sm text-[#787CA5]"
                  passwordError={''}
                />

                </View>

                
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
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 400,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5, 
    flexDirection: "row", 
  },
  gradientBorder: {
    borderRadius: 100,
    padding: 1 ,
    width:"75%",
  },
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%",
    display: "flex",
    alignItems: "center",
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
  inputSome: {
    flex: 1,
    padding: 8,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'LatoBold',
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
    fontFamily: 'lato',
  },
});
