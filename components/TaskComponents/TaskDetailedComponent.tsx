import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import Modal from 'react-native-modal';
import { backend_Host } from '~/config';
import * as DocumentPicker from 'expo-document-picker';
import dayjs from 'dayjs';
import { ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';

interface TaskDetailedComponentProps {
  title: string;
  dueDate: string;
  assignedTo: string;
  assignedBy: string;
  category: string;
  task: any;
  taskId: any;
}

const TaskDetailedComponent: React.FC<TaskDetailedComponentProps> = ({
  title,
  dueDate,
  assignedTo,
  assignedBy,
  category,
  task,
  taskId,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [description, setDescription] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<(string | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [taskStatus, setTaskStatus] = useState('');
  const [taskStatusLoading, setTaskStatusLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleDeleteConfirmation = () => {
    const payload = {
      id: task?._id,
      status: 'Deleted',
      userName: assignedTo,
    };

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this task?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setTaskStatusLoading(false);
            setShowMainModal(false);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setTaskStatusLoading(true);
              await axios.patch(`${backend_Host}/tasks/update`, payload, {
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              setShowMainModal(false);
              Alert.alert('Success', 'Task deleted successfully!');
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Error', 'Failed to delete the task.');
            } finally {
              setTaskStatusLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  const handleMoveToReopen = () => {
    setTaskStatus('Reopen');
    setShowMainModal(false);
    timerRef.current = setTimeout(() => {
      setShowProgressModal(true);
    }, 500);
  };

  const getStatusOptions = () => {
    if (task?.status === 'Completed') {
      return [
        {
          text: 'Move to Reopen',
          backgroundColor: '#FDB314',
          onPress: () => handleMoveToReopen(),
        },
        {
          text: 'Move to Deleted',
          backgroundColor: '#EF4444',
          onPress: ()=>handleDeleteConfirmation(),
        },
      ];
    }
    return [
      {
        text: 'Move to Progress',
        backgroundColor: '#A914DD',
        onPress: () => handleMoveToProgress(),
      },
      {
        text: 'Move to Completed',
        backgroundColor: '#007B5B',
        onPress: () => handleMoveToCompleted(),
      },
    ];
  };

  const handleMoveToProgress = () => {
    setTaskStatus('In Progress');
    setShowMainModal(false);
    timerRef.current = setTimeout(() => {
      setShowProgressModal(true);
    }, 500);
  };

  const handleMoveToCompleted = () => {
    setTaskStatus('Completed');
    setShowMainModal(false);
    timerRef.current = setTimeout(() => {
      setShowProgressModal(true);
    }, 500);
  };

  const handleFileSelect = async (index: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
      });

      if (result.canceled) {
        console.log('Document selection cancelled.');
      } else if (result.assets && result.assets.length > 0) {
        const { name, uri } = result.assets[0];

        setAttachments((prev) => {
          const updated = [...prev];
          updated[index] = uri;
          return updated;
        });

        setFileNames((prev) => {
          const updated = [...prev];
          updated[index] = name;
          return updated;
        });
      }
    } catch (err) {
      console.error('Error picking document: ', err);
    }
  };

  const updateTask = async () => {
    setTaskStatusLoading(true);
    try {
      const payload = {
        id: task?._id,
        status: taskStatus,
        comment: description,
        userName: assignedTo,
        fileUrl: attachments,
      };

      const response = await axios.patch(`${backend_Host}/tasks/update`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Task updated successfully:', response.data);
      setShowProgressModal(false);
      Alert.alert('Success', 'Task updated successfully!',);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update the task.');
    } finally {
      setTaskStatusLoading(false);
      setDescription('');
      setAttachments([]);
    }
  };

  const formatReminder = (dueDate: any, reminder: any) => {
    if (!dueDate || !reminder) return null;

    const dueDateTime = dayjs(dueDate);
    let reminderDateTime = dueDateTime;

    switch (reminder.type) {
      case 'minutes':
        reminderDateTime = dueDateTime.subtract(reminder.value, 'minute');
        break;
      case 'hours':
        reminderDateTime = dueDateTime.subtract(reminder.value, 'hour');
        break;
      case 'days':
        reminderDateTime = dueDateTime.subtract(reminder.value, 'day');
        break;
      default:
        return null;
    }

    return reminderDateTime.format('ddd, MMMM D - h:mm A');
  };

  const reminder = task?.reminders?.[0];
  const reminderText = formatReminder(task?.dueDate, reminder);

  const renderStatusModal = () => (
    <Modal
      isVisible={showMainModal}
      onBackdropPress={() => setShowMainModal(false)}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      animationIn="slideInUp"
      animationOut="slideOutDown">
      <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-20">
        <View className="mb-14 mt-2 flex w-full flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-white">Task Progress</Text>
          <TouchableOpacity onPress={() => setShowMainModal(false)}>
            <Image
              source={require('~/assets/commonAssets/cross.png')}
              className="h-8 w-8"
            />
          </TouchableOpacity>
        </View>

        <View className="flex flex-col gap-5">
          {getStatusOptions().map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={option.onPress}
              style={{ backgroundColor: option.backgroundColor }}
              className="items-center rounded-full p-4">
              <Text className="text-base font-medium text-white">
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  return (
    <TouchableOpacity onPress={() => setModalVisible(true)}>
      <View className="mt-5 w-[95%] items-center gap-6 self-center rounded-3xl border border-[#37384B] p-4">
        <Modal
          isVisible={modalVisible}
          onBackdropPress={() => setModalVisible(false)}
          style={{ margin: 0, justifyContent: 'flex-end', marginTop: 10 }}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          useNativeDriver={false}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View className="mt-16 rounded-t-3xl bg-[#0A0D28] p-5 pb-20">
              {/* Task Details Header */}
              <View className="mb-7 flex w-full flex-row items-center justify-between">
                <Text
                  className="w-[90%] text-xl font-semibold text-white"
                  style={{ fontFamily: 'LatoBold' }}>
                  {title}
                </Text>
                <TouchableOpacity className='w-[10%]' onPress={() => setModalVisible(false)}>
                  <Image
                    source={require('~/assets/commonAssets/cross.png')}
                    className="h-8 w-8"
                  />
                </TouchableOpacity>
              </View>

              {/* Assignment Details */}
              <View className="mb-6 flex w-full flex-row items-start justify-start gap-20">
                <View className="flex w-[40%] flex-col">
                  <Text className="text-xs text-[#787CA5]">Assigned by</Text>
                  <Text className="text-lg text-[#815BF5]" style={{ fontFamily: 'LatoBold' }}>
                    {assignedBy}
                  </Text>
                </View>

                <View className="flex w-[60%] flex-col">
                  <Text className="text-xs text-[#787CA5]">Assigned to</Text>
                  <Text className="w-[90%] text-lg text-[#D85570]" style={{ fontFamily: 'LatoBold' }}>
                    {assignedTo}
                  </Text>
                </View>
              </View>

              {/* Dates */}
              <View className="mb-6 flex w-full items-start gap-5">
                <View className="flex flex-col">
                  <Text className="text-xs text-[#787CA5]">Created date</Text>
                  <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                    {moment(task?.createdAt).format('ddd, MMMM D - hh:mm A')}
                  </Text>
                </View>

                <View className="flex flex-col">
                  <Text className="text-xs text-[#787CA5]">Due date</Text>
                  <Text className="text-lg text-[#EF4444]" style={{ fontFamily: 'LatoBold' }}>
                    {moment(task?.dueDate).format('ddd, MMMM D - hh:mm A')}
                  </Text>
                </View>
              </View>

              {/* Task Metadata */}
              <View className="mb-6 flex w-full flex-row items-center justify-start gap-20">
                <View className="flex w-[40%] gap-3">
                  <View className="flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Frequency</Text>
                    <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                      {task?.repeat ? task?.repeatType : 'Once'}
                    </Text>
                  </View>

                  <View className="flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Category</Text>
                    <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                      {category}
                    </Text>
                  </View>
                </View>

                <View className="flex gap-3">
                  <View className="flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Status</Text>
                    <Text
                      className="mt-1 text-lg text-[#815BF5]"
                      style={{ fontFamily: 'LatoBold' }}>
                      {task?.status}
                    </Text>
                  </View>

                  <View className="mt-1 flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Priority</Text>
                    <Text className="text-lg text-[#EF4444]" style={{ fontFamily: 'LatoBold' }}>
                      {task?.priority}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View className="mb-6 flex w-full flex-col gap-1">
                <Text className="text-xs text-[#787CA5]">Description</Text>
                <Text className="text-base text-white">{task?.description}</Text>
              </View>

              <View className="mb-8 mt-2 h-0.5 w-full bg-[#37384B]"></View>

              {/* Links */}
              <View className="mb-6 flex flex-col gap-2">
                <View className="flex flex-row items-center justify-start gap-2">
                  <Image
                    source={require('~/assets/commonAssets/links.png')}
                    className="h-5 w-5"
                  />
                  <Text className="text-xs text-[#787CA5]">Links</Text>
                </View>

                <View className="ml-6 gap-2">
                  {task?.links?.map((link, index) => (
                    <TouchableOpacity key={index} onPress={() => Linking.openURL(link)}>
                      <Text style={{ color: '#815BF5' }}>{link}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Files */}
              <View className="mb-6 flex w-full flex-col">
                <View className="flex w-full flex-row items-center gap-2">
                  <Image
                    source={require('~/assets/commonAssets/fileLogo.png')}
                    className="h-6 w-5"
                  />
                  <Text className="text-xs text-[#787CA5]">Files</Text>
                </View>

                <View className="flex w-full flex-row items-center gap-3 pl-5 pt-1">
                  {task?.attachment?.length ? (
                    task.attachment.map((att, index) => (
                      <View
                        key={index}
                        className="flex h-24 w-24 items-center justify-center rounded-lg border border-[#37384B]">
                        <Image source={{ uri: att }} className="h-24 w-24 rounded-lg" />
                      </View>
                    ))
                  ) : (
                    <Text className="text-center text-sm text-white">No file attached!</Text>
                  )}
                </View>
              </View>

              {/* Reminders */}
              <View className="mb-6 w-full flex-col gap-2">
                <View className="flex w-full flex-row items-center gap-2">
                  <Image
                    source={require('~/assets/commonAssets/reminders.png')}
                    className="h-6 w-5"
                  />
                  <Text className="text-xs text-[#787CA5]">Reminders</Text>
                </View>
                <Text className="text-lg text-white" style={{ fontFamily: 'LatoBold' }}>
                  {reminderText || 'No Reminder Set'}
                </Text>
              </View>

              <View className="mb-8 mt-2 h-0.5 w-full bg-[#37384B]"></View>

              {/* Comments */}
              <View className="mb-6 w-full flex-col gap-2">
                <View className='flex flex-row gap-2 items-center mb-3'>
                    <Image className='h-5 w-5' source={require("../../assets/Tasks/taskUpdate.png")}/>
                    <Text className='text-xs text-[#787CA5]' style={{ fontFamily: 'LatoBold' }}>Task Updates</Text>
                        
                </View>
                {task?.comments?.map((com, index) => (

                  <View className='flex flex-col items-center w-full'>

                    <View key={index} className="flex w-full flex-row items-center justify-between">
                    <View className="flex flex-row items-center gap-2">
                      <View className="h-10 w-10 rounded-full bg-white"></View>
                      <View className='w-[60%]'>
                        <Text className="text-lg text-white">{com?.comment}</Text>
                        <Text className="text-xs text-[#787CA5]">{com?.userName}</Text>
                      </View>
                    </View>

                    <TouchableOpacity 
                        className={` mb-4 w-[30%] flex items-center rounded-xl p-2 pl-3 pr-3 ${
                          com?.tag === 'Completed' 
                            ? 'bg-[#007B5B]' 
                            : com?.tag === 'Reopen' 
                            ? 'bg-[#FDB314]' 
                            : 'bg-[#815BF5]'
                        }`}
                      >
                      <Text className="text-[11px] text-white" style={{ fontFamily: 'LatoBold' }}>
                        {com?.tag}
                      </Text>
                    </TouchableOpacity>
                    
                  </View>
                  <View className="mb-3 mt-3 h-0.5 w-full bg-[#37384B]"></View>
                  </View>
                  
                ))}
                

                {/* Update Status Button */}
                <TouchableOpacity
                  onPress={() => setShowMainModal(true)}
                  className="mt-3 w-full self-center rounded-3xl bg-gray-700 p-3 py-5">
                  <Text className="text-center font-medium text-white">Update task status</Text>
                </TouchableOpacity>
              </View>

              {renderStatusModal()}

              {/* Progress Modal */}
              <Modal
                isVisible={showProgressModal}
                onBackdropPress={() => setShowProgressModal(false)}
                style={{ margin: 0, justifyContent: 'flex-end' }}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                useNativeDriver={false}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={{ flex: 1, justifyContent: 'flex-end' }}>
                  <View className="rounded-t-3xl bg-[#0A0D28] p-5 pb-20">
                    <View className="mb-6 mt-2 flex w-full flex-row items-center justify-between">
                      <Text className="text-xl font-semibold text-white">{taskStatus}</Text>
                      <TouchableOpacity onPress={() => setShowProgressModal(false)}>
                        <Image
                          source={require('~/assets/commonAssets/cross.png')}
                          className="h-8 w-8"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Description Input */}
                    <View
                      className="mb-8 rounded-2xl border border-[#37384B] pl-6 pr-6"
                      style={{
                        height: 150,
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                      }}>
                      <TextInput
                        multiline
                        className="text-white"
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Description"
                        placeholderTextColor="#787CA5"
                        style={{
                          textAlignVertical: 'top',
                          paddingTop: 11,
                          width: '100%',
                          paddingBottom: 11,
                        }}
                      />
                    </View>

                    {/* File Upload Section */}
                    <View className="w-full">
                      <View className="flex w-full flex-row items-center gap-2">
                        <Image
                          source={require('~/assets/commonAssets/fileLogo.png')}
                          className="h-6 w-5"
                        />
                        <Text className="text-sm text-[#787CA5]">Files</Text>
                      </View>

                      <View className="flex w-full flex-row items-center justify-center gap-5 pl-5 pt-1">
                        {['0', '1', '2'].map((index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleFileSelect(Number(index))}
                            className="flex h-24 w-24 items-center justify-center rounded-lg border border-[#37384B]">
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

                    {/* Update Button */}
                    <TouchableOpacity
                      disabled={taskStatusLoading}
                      onPress={updateTask}
                      className="mt-10 h-16 w-full items-center justify-center rounded-full bg-[#37384B]">
                      {taskStatusLoading ? (
                        <ActivityIndicator size={'small'} color={'#fff'} />
                      ) : (
                        <Text className="text-xl text-white">Update Task</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </KeyboardAvoidingView>
              </Modal>
            </View>
          </ScrollView>
        </Modal>

        {/* Task Card Preview */}
        <View className="flex w-full flex-row items-center justify-between">
          <Text className="w-[95%] font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
            {title}
          </Text>
          <Image source={require('~/assets/commonAssets/threeDot.png')} className="h-6 w-5" />
        </View>

        <View className="flex w-full flex-row items-start gap-20">
          <View className="flex w-36 gap-3">
            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Due Date</Text>
              <Text className="text-[#EF4444]" style={{ fontFamily: 'LatoBold' }}>
                {dueDate}
              </Text>
            </View>

            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Assigned to</Text>
              <Text className="text-[#D85570]" style={{ fontFamily: 'LatoBold' }}>
                {assignedTo}
              </Text>
            </View>
          </View>

          <View className="flex w-32 gap-3">
            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Assigned by</Text>
              <Text className="text-[#815BF5]" style={{ fontFamily: 'LatoBold' }}>
                {assignedBy}
              </Text>
            </View>

            <View className="flex flex-col">
              <Text className="text-xs text-[#787CA5]">Category</Text>
              <Text className="text-[#FDB314]" style={{ fontFamily: 'LatoBold' }}>
                {category}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TaskDetailedComponent;