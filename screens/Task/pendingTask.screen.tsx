import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  TextInput,
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

  // Function to handle opening progress modal
  const handleMoveToProgress = () => {
    setShowMainModal(false);
    setTimeout(() => {
      setShowProgressModal(true);
    }, 300); // Slight delay ensures smooth transition
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
        onBackdropPress={() => setShowMainModal(false)}
        style={{ margin: 0, justifyContent: "flex-end" }}
      >
        <View className="bg-[#0A0D28] p-5 rounded-t-3xl pb-20">
          <View className="flex flex-row justify-between items-center w-full h-20">
            <Text className="text-white text-xl font-semibold mb-4">Task Progress</Text>
            <TouchableOpacity onPress={() => setShowMainModal(false)}>
              <AntDesign name="close" size={15} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View className="flex gap-5 flex-col">
            <TouchableOpacity
              onPress={handleMoveToProgress}
              className="bg-[#A914DD] p-4 rounded-full items-center"
            >
              <Text className="text-white text-base font-medium">Move to Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#007B5B] p-4 rounded-full items-center"
            >
              <Text className="text-white text-base font-medium">Move to Completed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Progress Modal */}
      <Modal
        isVisible={showProgressModal}
        onBackdropPress={() => setShowProgressModal(false)}
        style={{ margin: 0, justifyContent: "flex-end" }}
      >
        <View className="bg-[#0A0D28] p-5 rounded-t-3xl pb-20">
          <View className="flex flex-row justify-between items-center w-full h-20">
            <Text className="text-white text-xl font-semibold mb-4">In Progress</Text>
            <TouchableOpacity onPress={() => setShowProgressModal(false)}>
              <AntDesign name="close" size={15} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-sm mb-4">
            The task has been successfully moved to progress.
          </Text>
          <TouchableOpacity
            onPress={() => setShowProgressModal(false)}
            className="bg-[#815BF5] p-4 rounded-full items-center"
          >
            <Text className="text-white text-base font-medium">Close</Text>
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
              <View className="bg-[#37384B] w-14 h-14 rounded-full"></View>
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
