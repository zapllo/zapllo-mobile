import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  TextInput,
  Image,
  KeyboardEvent,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { DashboardStackParamList } from "~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack";
import ProfileButton from "~/components/profile/ProfileButton";
import { AntDesign } from "@expo/vector-icons";
import CustomDropdown from "~/components/customDropDown";
import TaskDetailedComponent from "~/components/TaskComponents/TaskDetailedComponent";
import Modal from "react-native-modal";

type Props = StackScreenProps<DashboardStackParamList, "PendingTask">;

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

const PendingTaskScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedTeamSize, setSelectedTeamSize] = useState(null);
  const [search, setSearch] = useState("");
  const [showMainModal, setShowMainModal] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [triggerProgressModal, setTriggerProgressModal] = useState(false);
  const [description, setDescription] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event: KeyboardEvent) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleShowProgressModal = useCallback(() => {
    setShowProgressModal(true);
    setTriggerProgressModal(false);
  }, []);

  useEffect(() => {
    if (triggerProgressModal) {
      timerRef.current = setTimeout(handleShowProgressModal, 500);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [triggerProgressModal, handleShowProgressModal]);

  const handleMoveToProgress = () => {
    setShowMainModal(false);
    setTriggerProgressModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary h-full">
      {/* Navbar */}
      <View className="w-full h-20 flex flex-row justify-between p-5 items-center">
        <View className="flex h-[3.2rem] w-[3.2rem] bg-[#37384B] items-center justify-center rounded-full">
          <TouchableOpacity onPress={() => navigation.navigate("DashboardHome")}>
            <AntDesign name="arrowleft" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text className="text-2xl font-semibold pl-4 h-full text-[#FFFFFF]">Pending</Text>
        <ProfileButton />
      </View>

      {/* Main Modal */}
      <Modal
        isVisible={showMainModal}
        onBackdropPress={null as any} // Prevent closing when clicking outside
        style={{ margin: 0, justifyContent: "flex-end" }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View className="bg-[#0A0D28] p-5 rounded-t-3xl pb-20">
          <View className="flex flex-row justify-between items-center w-full mb-14 mt-2">
            <Text className="text-white text-xl font-semibold">Task Progress</Text>
            <TouchableOpacity onPress={() => setShowMainModal(false)}>
              <Image
                source={require("../../assets/commonAssets/cross.png")}
                className="w-8 h-8"
              />
            </TouchableOpacity>
          </View>

          <View className="flex gap-5 flex-col">
            <TouchableOpacity
              onPress={handleMoveToProgress}
              className="bg-[#A914DD] p-4 rounded-full items-center"
            >
              <Text className="text-white text-base font-medium">Move to Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-[#007B5B] p-4 rounded-full items-center">
              <Text className="text-white text-base font-medium">Move to Completed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Progress Modal */}
      <Modal
        isVisible={showProgressModal}
        onBackdropPress={null as any} // Prevent closing when clicking outside
        style={{ margin: 0, justifyContent: "flex-end" }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={false}
      >
        <View
          className="bg-[#0A0D28] p-5 rounded-t-3xl pb-20"
          style={{ marginBottom: keyboardHeight }}
        >
          <View className="flex flex-row justify-between items-center w-full mb-6 mt-2">
            <Text className="text-white text-xl font-semibold">In Progress</Text>
            <TouchableOpacity onPress={() => setShowProgressModal(false)}>
              <Image
                source={require("../../assets/commonAssets/cross.png")}
                className="w-8 h-8"
              />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View
            className="border-[#37384B] border rounded-2xl pl-6 pr-6 mb-8"
            style={{ height: 150, justifyContent: "flex-start", alignItems: "flex-start" }}
          >
            <TextInput
              multiline
              className="text-white"
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor="#787CA5"
              style={{ textAlignVertical: 'top', paddingTop: 11, width: "100%", paddingBottom: 11 }}
            />


          </View>
          {/* file and image upload */}
          <View className="w-full ">
            
            <View className=" w-full gap-2 items-center flex flex-row">
                <Image source={require("../../assets/commonAssets/fileLogo.png")} className="w-5 h-6"/>
                <Text className="text-[#787CA5] text-sm">Files</Text>
            </View>

            <View className=" w-full flex flex-row items-center gap-3 pl-5 pt-1">
              <Image source={require("../../assets/commonAssets/fileUploadContainer.png")} className="h-24 w-24"/>
              <Image source={require("../../assets/commonAssets/fileUploadContainer.png")} className="h-24 w-24"/>
              <Image source={require("../../assets/commonAssets/fileUploadContainer.png")} className="h-24 w-24"/>
            </View>
          </View>

          <TouchableOpacity className=" w-full h-16 bg-[#37384B] mt-10 items-center justify-center rounded-full">
            <Text className=" text-white text-xl">Update Task</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 items-center mb-20">
            {/* Dropdown */}
            <View className="items-center w-full flex mt-4 mb-3">
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

            {/* Search Bar */}
            <View className="w-full flex items-center justify-center flex-row gap-5">
              <TextInput
                value={search}
                onChangeText={(value) => setSearch(value)}
                placeholder="Search"
                className="w-[72%] border border-[#37384B] p-4 text-[#787CA5] rounded-full"
                placeholderTextColor="#787CA5"
              />
              <View className="bg-[#37384B] w-14 h-14 rounded-full">
                <Image
                  source={require("../../assets/commonAssets/filter.png")}
                  className="w-full h-full"
                />
              </View>
            </View>

            {/* Task Boxes */}
            <TaskDetailedComponent
              title="Zapllo design wireframe"
              dueDate="Dec 25, 2024"
              assignedTo="Deep Patel"
              assignedBy="Subhadeep Banerjee"
              category="Marketing"
            />
            <TaskDetailedComponent
              title="New Marketing Campaign"
              dueDate="Dec 28, 2024"
              assignedTo="Alice Johnson"
              assignedBy="John Smith"
              category="Design"
            />
            <TaskDetailedComponent
              title="Final Presentation"
              dueDate="Jan 5, 2025"
              assignedTo="Mike Ross"
              assignedBy="Harvey Specter"
              category="Sales"
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default PendingTaskScreen;