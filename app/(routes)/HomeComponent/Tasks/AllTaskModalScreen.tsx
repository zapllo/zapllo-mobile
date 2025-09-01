import { router, useNavigation } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { Alert, Image, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import Modal from "react-native-modal";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import { BlurView } from 'expo-blur';
import { AntDesign, Entypo, Octicons, MaterialIcons, Ionicons } from "@expo/vector-icons";
import VoiceTaskModal from "~/components/voiceTaskModal/VoiceTaskModal";

interface AllTaskModalProps {
  isVisible: boolean;
  onClose: () => void;
  onVoiceTask: () => void;
  isAdmin: boolean;
}

const AllTaskModalScreen: React.FC<AllTaskModalProps> = ({ isVisible, onClose, onVoiceTask, isAdmin }) => {
  const navigation = useNavigation();

  const handleNavigation = (route: string, isAdminOnly: boolean = false) => {
    if (isAdminOnly && !isAdmin) {
      Alert.alert("Access Denied", "Only admins can access this section.");
      return;
    }
    onClose();
    router.push(route);
  };

  const handleVoiceTask = () => {
    onVoiceTask();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={{ justifyContent: "flex-end", margin: 0 }}
    >
      <BlurView intensity={15} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View className="bg-transparent">
          <View className="flex items-end flex-col gap-5 justify-around mb-10 mr-7">

            {isAdmin && (
              <View className="flex flex-row items-center gap-2">
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/all-task", true)}>
                  <Text className="text-white" style={{ fontFamily: "LatoBold" }}>All Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/all-task", true)} className=" bg-[#815BF5] rounded-full p-4">
                  <MaterialIcons name="task" size={25} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {isAdmin && (
              <View className="flex flex-row items-center gap-2">
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/teams")}>
                  <Text className="text-white" style={{ fontFamily: "LatoBold" }}>My Team</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/teams")} className=" bg-[#815BF5] rounded-full p-4">
                  <Ionicons name="people" size={25} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {isAdmin && (
              <View className="flex flex-row items-center gap-2">
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/categories")}>
                  <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Categories</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/categories")} className=" bg-[#815BF5] rounded-full p-4">
                  <MaterialIcons name="category" size={25} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {/* Task Templates - Available for all users */}
            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/HomeComponent/Tasks/TaskTemplates", isAdmin)}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Task Templates</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/HomeComponent/Tasks/TaskTemplates", isAdmin)} className=" bg-[#815BF5] rounded-full p-4">
                <AntDesign name="layout" size={25} color="white" />
              </TouchableOpacity>
            </View>

            {/* Task Directory - Available for all users */}
            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/HomeComponent/Tasks/TaskDirectory")} >
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Task Directory</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleNavigation("/(routes)/HomeComponent/Tasks/TaskDirectory")} className=" bg-[#815BF5] rounded-full p-4">
                <Entypo name="folder" size={25} color="white" />
              </TouchableOpacity>
            </View>

            {/* Voice Task - Available for all users */}
            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={handleVoiceTask}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Voice Task</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleVoiceTask} className=" bg-[#815BF5] rounded-full p-4">
                <MaterialIcons name="mic" size={25} color="white" />
              </TouchableOpacity>
            </View>

            {isAdmin && (
              <View className="flex flex-row items-center gap-2">
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/settings", true)}>
                  <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleNavigation("/(routes)/settings", true)} className=" bg-[#815BF5] rounded-full p-4">
                  <Ionicons name="settings" size={25} color="white" />
                </TouchableOpacity>
              </View>
            )}

            <View className="flex flex-row items-center gap-2 mb-1">
              <TouchableOpacity onPress={onClose} className="bg-gray-600 rounded-full p-3 mr-1">
                <AntDesign name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default AllTaskModalScreen;