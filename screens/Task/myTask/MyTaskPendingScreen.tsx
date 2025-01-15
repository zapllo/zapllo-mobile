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
import * as DocumentPicker from 'expo-document-picker';

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

  const [selectedTeamSize, setSelectedTeamSize] = useState(null);
  const [search, setSearch] = useState('');
  const [showMainModal, setShowMainModal] = useState(true);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [triggerProgressModal, setTriggerProgressModal] = useState(false);
  const [description, setDescription] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<(string | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  console.log('00000000000', pendingTasks);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

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
  const handleFileSelect = async (index: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      console.log('Document Picker Result: ', result);

      if (result.canceled) {
        console.log('Document selection cancelled.');
      } else if (result.assets && result.assets.length > 0) {
        const { name, uri } = result.assets[0];

        // Update URIs in attachments state for the selected index
        setAttachments((prev) => {
          const updated = [...prev];
          updated[index] = uri;
          console.log('Updated Attachments URIs: ', updated);
          return updated;
        });

        // Update file names in fileNames state for the selected index
        setFileNames((prev) => {
          const updated = [...prev];
          updated[index] = name;
          console.log('Updated File Names: ', updated);
          return updated;
        });
      }
    } catch (err) {
      console.error('Error picking document: ', err);
    }
  };

  const updateTask = async () => {
    try {
      const payload = {
        id: pendingTasks[0]._id,
        status: 'InProgress',
        comment: description,
        userName: 'John Doe',
        fileUrl: attachments,
      };
      console.log('payyyy', payload);
      const response = await axios.patch(`${backend_Host}/tasks/update`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Task updated successfully:', response.data);
      setShowProgressModal(false);
      Alert.alert('Success', 'Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update the task.');
    }
  };

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
      <Modal
        isVisible={showMainModal}
        onBackdropPress={null as any} // Prevent closing when clicking outside
        style={{ margin: 0, justifyContent: 'flex-end' }}
        animationIn="slideInUp"
        animationOut="slideOutDown">
        <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-20">
          <View className="mb-14 mt-2 flex w-full flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-white">Task Progress</Text>
            <TouchableOpacity onPress={() => setShowMainModal(false)}>
              <Image source={require('~/assets/commonAssets/cross.png')} className="h-8 w-8" />
            </TouchableOpacity>
          </View>

          <View className="flex flex-col gap-5">
            <TouchableOpacity
              onPress={() => {
                handleMoveToProgress();
              }}
              className="items-center rounded-full bg-[#A914DD] p-4">
              <Text className="text-base font-medium text-white">Move to Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                handleMoveToProgress();
              }}
              className="items-center rounded-full bg-[#007B5B] p-4">
              <Text className="text-base font-medium text-white">Move to Completed</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Progress Modal */}
      <Modal
        isVisible={showProgressModal}
        onBackdropPress={null as any} // Prevent closing when clicking outside
        style={{ margin: 0, justifyContent: 'flex-end' }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver={false}>
        <View
          className="rounded-t-3xl bg-[#0A0D28] p-5 pb-20"
          style={{ marginBottom: keyboardHeight }}>
          <View className="mb-6 mt-2 flex w-full flex-row items-center justify-between">
            <Text className="text-xl font-semibold text-white">In Progress</Text>
            <TouchableOpacity onPress={() => setShowProgressModal(false)}>
              <Image source={require('~/assets/commonAssets/cross.png')} className="h-8 w-8" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View
            className="mb-8 rounded-2xl border border-[#37384B] pl-6 pr-6"
            style={{ height: 150, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
            <TextInput
              multiline
              className="text-white"
              value={description}
              onChangeText={setDescription}
              placeholder="Description"
              placeholderTextColor="#787CA5"
              style={{ textAlignVertical: 'top', paddingTop: 11, width: '100%', paddingBottom: 11 }}
            />
          </View>
          {/* file and image upload */}
          <View className="w-full ">
            <View className=" flex w-full flex-row items-center gap-2">
              <Image source={require('~/assets/commonAssets/fileLogo.png')} className="h-6 w-5" />
              <Text className="text-sm text-[#787CA5]">Files</Text>
            </View>

            <View className=" flex w-full flex-row items-center justify-center gap-5 pl-5 pt-1">
              {/* Upload file containers */}
              {['0', '1', '2'].map((index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleFileSelect(Number(index))}
                  className="flex h-24 w-24 items-center justify-center rounded-lg border border-[#37384B]">
                  {/* If file URI exists, show the file name, else show the placeholder image */}
                  {attachments[Number(index)] ? (
                    <Image
                      source={{ uri: attachments[Number(index)] }}
                      className="h-24 w-24 rounded-lg"
                    />
                  ) : (
                    <Image
                      source={require('~/assets/commonAssets/fileUploadContainer.png')}
                      className="h-24 w-24"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={updateTask}
            className=" mt-10 h-16 w-full items-center justify-center rounded-full bg-[#37384B]">
            <Text className=" text-xl text-white">Update Task</Text>
          </TouchableOpacity>
        </View>
      </Modal>

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
