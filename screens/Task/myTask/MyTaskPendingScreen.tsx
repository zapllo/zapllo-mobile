import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FlatList,
  Alert,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import ProfileButton from '~/components/profile/ProfileButton';
import { AntDesign } from '@expo/vector-icons';
import CustomDropdown from '~/components/customDropDown';
import TaskDetailedComponent from '~/components/TaskComponents/TaskDetailedComponent';
import Modal from 'react-native-modal';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MyTasksStackParamList } from './MyTaskStack';
import axios from 'axios';
import { backend_Host } from '~/config';

type Props = StackScreenProps<MyTasksStackParamList, 'PendingTask'>;
type PendingTaskScreenRouteProp = RouteProp<MyTasksStackParamList, 'PendingTask'>;

const daysData = [
  { label: 'Today', value: 'Overdue' },
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

const MyTaskPendingScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<PendingTaskScreenRouteProp>();
  const { pendingTasks } = route.params; // Safely access pendingTasks

  const [selectedTeamSize, setSelectedTeamSize] = useState("This week");
  const [search, setSearch] = useState('');
  // const [showMainModal, setShowMainModal] = useState(true);
  // const [showProgressModal, setShowProgressModal] = useState(false);
  // const [triggerProgressModal, setTriggerProgressModal] = useState(false);
 

  console.log('00000000000', pendingTasks);

  // useEffect(() => {
  //   const keyboardDidShowListener = Keyboard.addListener(
  //     'keyboardDidShow',
  //     (event: KeyboardEvent) => {
  //       setKeyboardHeight(event.endCoordinates.height);
  //     }
  //   );
  //   const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
  //     setKeyboardHeight(0);
  //   });

  //   return () => {
  //     keyboardDidShowListener.remove();
  //     keyboardDidHideListener.remove();
  //   };
  // }, []);

  // const handleShowProgressModal = useCallback(() => {
  //   setShowProgressModal(true);
  //   setTriggerProgressModal(false);
  // }, []);

  // useEffect(() => {
  //   if (triggerProgressModal) {
  //     timerRef.current = setTimeout(handleShowProgressModal, 500);
  //   }

  //   return () => {
  //     if (timerRef.current) {
  //       clearTimeout(timerRef.current);
  //       timerRef.current = null;
  //     }
  //   };
  // }, [triggerProgressModal, handleShowProgressModal]);

  // const handleMoveToProgress = () => {
  //   setShowMainModal(false);
  //   setTriggerProgressModal(true);
  // };
 

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      {/* Navbar */}
      <View className="flex h-20 w-full flex-row items-center justify-between p-5">
        <View className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full bg-[#37384B]">
          <TouchableOpacity onPress={() => navigation.navigate('DashboardHome')}>
            <AntDesign name="arrowleft" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text className="h-full pl-4 text-2xl font-semibold text-[#FFFFFF]">Pending</Text>
        <ProfileButton />
      </View>

      {/* Main Modal */}
     

      {/* Progress Modal */}
      

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="mb-20 flex-1 items-center">
            {/* Dropdown */}
            <View className="mb-3 mt-4 flex w-full items-center">
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

            {/* Search Bar */}
            <View className="flex w-full flex-row items-center justify-center gap-5">
              <TextInput
                value={search}
                onChangeText={(value) => setSearch(value)}
                placeholder="Search"
                className="w-[72%] rounded-full border border-[#37384B] p-4 text-[#787CA5]"
                placeholderTextColor="#787CA5"
              />
              <View className="h-14 w-14 rounded-full bg-[#37384B]">
                <Image
                  source={require('~/assets/commonAssets/filter.png')}
                  className="h-full w-full"
                />
              </View>
            </View>

            <ScrollView>
              {pendingTasks?.length > 0 ? (
                pendingTasks.map((task) => (
                  <TaskDetailedComponent
                    key={task._id}
                    title={task.title}
                    dueDate={new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    assignedTo={`${task.assignedUser?.firstName} ${task.assignedUser?.lastName}`}
                    assignedBy={`${task.user?.firstName} ${task.user?.lastName}`}
                    category={task.category?.name}
                    task={task}
                    taskId={task._id}
                  />
                ))
              ) : (
                <Text>No pending tasks available.</Text>
              )}
            </ScrollView>

            {/* <FlatList
              data={pendingTasks}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TaskDetailedComponent
                  title={item.title}
                  dueDate={new Date(item.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  assignedTo={`${item.assignedUser?.firstName} ${item.assignedUser?.lastName}`}
                  assignedBy={`${item.user?.firstName} ${item.user?.lastName}`}
                  category={item.category?.name}
                />
              )}
              ListEmptyComponent={<Text>No pending tasks available.</Text>}
            /> */}

            {/* Task Boxes */}
            {/* <TaskDetailedComponent
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
            /> */}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default MyTaskPendingScreen;
