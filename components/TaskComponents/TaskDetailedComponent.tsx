import React, { useState } from "react";
import { View, Text, Image, Button, TouchableOpacity, Linking, ScrollView } from "react-native";
import Modal from "react-native-modal";

interface TaskDetailedComponentProps {
  title: string;
  dueDate: string;
  assignedTo: string;
  assignedBy: string;
  category: string;
}

const TaskDetailedComponent: React.FC<TaskDetailedComponentProps> = ({
  title,
  dueDate,
  assignedTo,
  assignedBy,
  category,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <TouchableOpacity onPress={() => setModalVisible(true)}>
      <View className="w-[95%] self-center h-56 border border-[#37384B] p-4 rounded-3xl items-center mt-5 gap-6">
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={{ margin: 0, justifyContent: "flex-end",marginTop:120 }}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          useNativeDriver={false}
        >
          <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          >
            <View className="bg-[#0A0D28] p-5 rounded-t-3xl pb-20">

                {/* title */}
                <View className=" w-full flex flex-row justify-between items-center mb-7">
                  <Text className="text-white font-semibold text-xl">{title}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Image
                      source={require("../../assets/commonAssets/cross.png")}
                      className="w-8 h-8"
                    />              
                  </TouchableOpacity>

                </View>

                {/* assigned by an assigned to */}
                <View className="flex mb-6 flex-row w-full gap-12 items-center justify-start">
                
                  <View className="flex flex-col w-[40%]">
                    <Text className="text-[#787CA5] text-xs">Assigned by</Text>
                    <Text className="text-[#815BF5] text-sm" style={{fontFamily:"Lato-Bold"}}>{assignedBy}</Text>
                  </View>

                  <View className="flex flex-col w-[40%]">
                    <Text className="text-[#787CA5] text-xs">Assigned to</Text>
                    <Text className="text-[#D85570] text-sm">{assignedTo}</Text>
                  </View>
                </View>

                {/* created date */}
                <View className="w-full flex items-start gap-5 mb-6">
                  <View className="flex flex-col">
                    <Text className="text-[#787CA5] text-xs">Created date</Text>
                    <Text className="text-white text-lg">Wed, December 25 - 12:13 PM</Text>
                  </View>

                  <View className="flex flex-col">
                    <Text className="text-[#787CA5] text-xs">Due date</Text>
                    <Text className="text-[#EF4444] text-lg">Wed, December 25 - 12:13 PM</Text>
                  </View>
                </View>

                {/* features */}
                <View className="flex mb-6 flex-row w-full gap-12 items-center pr-14">
                  <View className="flex gap-3">
                    <View className="flex flex-col">
                      <Text className="text-[#787CA5] text-xs">Frequency</Text>
                      <Text className="text-white text-lg">Once</Text>
                    </View>

                    <View className="flex flex-col">
                      <Text className="text-[#787CA5] text-xs">Category</Text>
                      <Text className="text-white">Marketing</Text>
                    </View>
                  </View>

                  <View className="flex gap-3">
                    <View className="flex flex-col">
                      <Text className="text-[#787CA5] text-xs">Status</Text>
                      <Text className="text-[#815BF5] mt-1">Pending</Text>
                    </View>

                    <View className="flex flex-col mt-1">
                      <Text className="text-[#787CA5] text-xs">Priority</Text>
                      <Text className="text-[#EF4444]">High</Text>
                    </View>
                  </View>
                </View>

                {/*Description */}
                <View className=" w-full mb-6 flex flex-col gap-1">
                  <Text className="text-[#787CA5] text-xs">Description</Text>
                  <Text className="text-white text-sm" style={{fontFamily:"Lato-Thin"}}>
                  Figma ipsum component variant main layer. Ellipse edit ipsum selection italic distribute. Star vector selection distribute pencil hand community export background. Bullet line layer inspect list.
                  </Text>
                </View>

                {/* line */}
                <View className="h-0.5 w-full bg-[#37384B] mt-2 mb-8"></View>   
                
                {/* links */}
                <View className="flex flex-col gap-2 mb-6">
                  <View className="flex flex-row items-center justify-start gap-2">
                    <Image 
                    source={require("../../assets/commonAssets/links.png")}
                    className="w-5 h-5"/>
                    <Text className="text-[#787CA5] text-xs">Links</Text>
                  </View>

                  <View className="gap-2 ml-6">
                    <TouchableOpacity onPress={() => Linking.openURL('http://www.google.com')}>
                      <Text style={{ color: '#815BF5' }}>www.google.com</Text>
                    </TouchableOpacity> 
                              
                    <TouchableOpacity onPress={() => Linking.openURL('http://www.google.com')}>
                      <Text style={{ color: '#815BF5' }}>www.google.com</Text>
                    </TouchableOpacity>    
                  </View>                
                </View>

                {/* file and image upload */}
                <View className="w-full flex flex-col mb-6 ">
                  
                  <View className=" w-full gap-2 items-center flex flex-row">
                      <Image source={require("../../assets/commonAssets/fileLogo.png")} className="w-5 h-6"/>
                      <Text className="text-[#787CA5] text-xs">Files</Text>
                  </View>

                  <View className=" w-full flex flex-row items-center gap-3 pl-5 pt-1">
                    <Image source={require("../../assets/commonAssets/fileUploadContainer.png")} className="h-24 w-24"/>
                    <Image source={require("../../assets/commonAssets/fileUploadContainer.png")} className="h-24 w-24"/>
                    <Image source={require("../../assets/commonAssets/fileUploadContainer.png")} className="h-24 w-24"/>
                  </View>
                </View>

                {/* reminders */}
                <View className=" w-full flex-col gap-2 mb-6">
                  <View className=" w-full gap-2 items-center flex flex-row">
                    <Image source={require("../../assets/commonAssets/reminders.png")} className="w-5 h-6"/>
                    <Text className="text-[#787CA5] text-xs">Reminders</Text>
                  </View>
                  <Text className=" text-white text-lg">Wed, December 25 - 12:13 PM</Text>
                </View>

                {/* line */}
                <View className="h-0.5 w-full bg-[#37384B] mt-2 mb-8"></View>    

                {/* Task updates */}
                <View className=" w-full flex-col gap-2 mb-6">
                  <View className=" w-full gap-2 mb-6 items-center flex flex-row">
                    <Image source={require("../../assets/commonAssets/allTasks.png")} className="w-5 h-6"/>
                    <Text className="text-[#787CA5] text-xs">Task Updates</Text>
                  </View>
                  
                  <View className="w-full flex flex-row justify-between items-center">
                    <View className=" flex flex-row items-center-start gap-2">
                      <View className="bg-white w-10 h-10 rounded-full"></View>
                      <View>
                        <Text className="text-white text-lg">{assignedBy}</Text>
                        <Text className="text-[#787CA5] text-xs">a moment ago</Text>
                      </View>
                    </View>

                    <TouchableOpacity className="bg-[#815BF5] mb-4 items-center flex p-2 pl-4 pr-4 rounded-2xl">
                      <Text className="text-xs text-white">In Progress</Text>
                    </TouchableOpacity>
                  </View>
                 {/* line */}
                <View className="h-0.5 w-full bg-[#37384B] mt-3 mb-3"></View> 

                <View className="w-full flex flex-row justify-between items-center">
                    <View className=" flex flex-row items-center-start gap-2">
                      <View className="bg-white w-10 h-10 rounded-full"></View>
                      <View>
                        <Text className="text-white text-lg">{assignedBy}</Text>
                        <Text className="text-[#787CA5] text-xs">a moment ago</Text>
                      </View>
                    </View>

                    <TouchableOpacity className="bg-[#007B5B] mb-4 items-center flex p-2 pl-4 pr-4 rounded-2xl">
                      <Text className="text-xs text-white">Completed</Text>
                    </TouchableOpacity>
                </View>

                {/* line */}
                <View className="h-0.5 w-full bg-[#37384B] mt-3 mb-3"></View> 
                </View>

            </View>
          </ScrollView>  

        </Modal>

        <View className="flex items-center flex-row w-full justify-between">
          <Text className="text-white font-semibold ">{title}</Text>
          <Image
            source={require('../../assets/commonAssets/threeDot.png')}
            className="w-5 h-6"
          />
        </View>

        <View className="flex flex-row w-full gap-20 items-start">
          <View className="flex gap-3">
            <View className="flex flex-col">
              <Text className="text-[#787CA5] text-xs">Due Date</Text>
              <Text className="text-[#EF4444] ">{dueDate}</Text>
            </View>

            <View className="flex flex-col max-w-28">
              <Text className="text-[#787CA5] text-xs">Assigned to</Text>
              <Text className="text-[#D85570] w-[40vw]">{assignedTo}</Text>
            </View>
          </View>

          <View className="flex gap-3">
            <View className="flex flex-col max-w-28">
              <Text className="text-[#787CA5] text-xs">Assigned by</Text>
              <Text className="text-[#815BF5] w-[40vw]">{assignedBy}</Text>
            </View>

            <View className="flex flex-col ">
              <Text className="text-[#787CA5] text-xs">Category</Text>
              <Text className="text-[#FDB314]">{category}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TaskDetailedComponent;