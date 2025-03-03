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
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import { backend_Host } from '~/config';
import * as DocumentPicker from 'expo-document-picker';
import dayjs from 'dayjs';
import { ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { router, useNavigation } from 'expo-router';
import AwesomeAlertComponent from '../CustomAlert/CustomAlert';
import { XStack, YStack } from 'tamagui';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Entypo } from '@expo/vector-icons';
import UserAvatar from '../profile/UserAvatar';

interface TaskDetailedComponentProps {
  title: string;
  dueDate: string;
  assignedTo: string;
  assignedBy: string;
  category: string;
  task: any;
  taskId: any;
}

interface SelectedFile {
  uri: string;
  name: string;
  type?: string;
  base64?: string;
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
  const navigation = useNavigation()
  const [modalVisible, setModalVisible] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showMainModal, setShowMainModal] = useState(false);
  const [description, setDescription] = useState('');
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<(string | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [taskStatus, setTaskStatus] = useState('');
  const [taskStatusLoading, setTaskStatusLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  const [audioFinished, setAudioFinished] = useState(false);

// Add this to your useEffect cleanup
useEffect(() => {
  return () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (positionUpdateInterval.current) {
      clearInterval(positionUpdateInterval.current);
    }
    // Unload sound when component unmounts
    if (sound) {
      sound.unloadAsync();
    }
  };
}, [sound]);

// Load audio when component mounts or when audioUrl changes
useEffect(() => {
  if (task?.audioUrl) {
    loadAudio(task.audioUrl);
  }
}, [task?.audioUrl]);

// Add these functions for audio playback
const loadAudio = async (audioUrl: string) => {
  try {
    // Unload any existing sound
    if (sound) {
      await sound.unloadAsync();
    }
    
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: false },
      updatePlaybackStatus
    );
    
    setSound(newSound);
    const status = await newSound.getStatusAsync();
    setDuration(status.durationMillis || 0);
    setCurrentPosition(0);
    setAudioFinished(false);
    
    return newSound;
  } catch (error) {
    console.error('Error loading audio:', error);
    return null;
  }
};

const updatePlaybackStatus = (status: any) => {
  if (status.isLoaded) {
    setDuration(status.durationMillis || 0);
    setCurrentPosition(status.positionMillis || 0);
    
    if (status.didJustFinish) {
      setIsPlaying(false);
      setCurrentPosition(0);
      setAudioFinished(true);
      if (sound) {
        sound.setPositionAsync(0);
      }
    }
  }
};

const handlePlayPause = async () => {
  if (!sound && task?.audioUrl) {
    const newSound = await loadAudio(task.audioUrl);
    if (newSound) {
      await newSound.playAsync();
      setIsPlaying(true);
      setAudioFinished(false);
    }
  } else if (sound) {
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      // If audio has finished and user clicks play again, start from beginning
      if (audioFinished) {
        await sound.setPositionAsync(0);
        setCurrentPosition(0);
        setAudioFinished(false);
      }
      await sound.playAsync();
      setIsPlaying(true);
    }
  }
};

const handleSliderChange = async (value: number) => {
  if (sound) {
    await sound.setPositionAsync(value * 1000);
    setCurrentPosition(value * 1000);
    // If user manually changes position, reset the finished state
    if (value > 0 && value < duration / 1000) {
      setAudioFinished(false);
    }
  }
};

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
              navigation.goBack()
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
          onPress: () => handleDeleteConfirmation(),
        },
      ];
    }
    return [
      {
        text: 'Move to Progress',
        backgroundColor: '#815BF5',
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

  const handleFileSelect = async () => { // ✅ Add 'async' here
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true, // ✅ Allow multiple file selection
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || !result.assets.length) return;

      // Convert selected files into correct format
      const pickedFiles: SelectedFile[] = [];

      for (const file of result.assets) {
        let fileUri = file.uri;

        // ✅ Convert content:// URI to file:// for Android compatibility
        if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
          const fileInfo = await FileSystem.getInfoAsync(fileUri); // ✅ Works now
          if (!fileInfo.exists) {
            throw new Error('File does not exist');
          }
          fileUri = fileInfo.uri; // ✅ Convert content:// to file://
        }

        pickedFiles.push({
          uri: fileUri,
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
        });
      }

      console.log('Selected files:', pickedFiles);

      // Upload files and get URLs
      const uploadedUrls = await uploadFiles(pickedFiles);

      if (uploadedUrls) {
        setAttachments((prev) => [...prev, ...uploadedUrls]);
        setFileNames((prev) => [...prev, ...pickedFiles.map((f) => f.name)]);
      }
    } catch (err) {
      console.error('Error picking documents:', err);
      Alert.alert('Error', 'An error occurred while selecting the file.');
    }
  };




  const uploadFiles = async (files: SelectedFile[]) => {
    try {
      setLoading(true);
      const uploadEndpoint = `${backend_Host}/upload`;
      console.log("Uploading files to:", uploadEndpoint);

      const formData = new FormData();

      // ✅ Use `for...of` loop instead of `forEach`
      for (const file of files) {
        let fileUri = file.uri;

        // ✅ Convert content:// URI to file:// for Android compatibility
        if (Platform.OS === 'android' && fileUri.startsWith('content://')) {
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (!fileInfo.exists) {
            throw new Error('File does not exist');
          }
          fileUri = fileInfo.uri;
        }

        formData.append(`files`, {
          uri: fileUri,
          name: file.name,
          type: file.type || 'application/octet-stream',
        } as any);
      }

      console.log("FormData content:", [...formData]);

      const response = await axios.post(uploadEndpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log("Upload response:", response.status, response.data);

      if (response.status === 200) {
        return response.data.fileUrls; // ✅ Returns array of uploaded file URLs
      } else {
        console.error("Upload failed:", response.status, response.data);
        return null;
      }
    } catch (error) {
      console.error("Error uploading files:", error.response?.data || error.message);
      return null;
    } finally {
      setLoading(false);
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
        fileUrl: attachments, // Use uploaded file URLs
      };

      const response = await axios.patch(`${backend_Host}/tasks/update`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Task updated successfully:', response.data);
      setShowProgressModal(false);
      setAlertMessage("Task updated successfully!");
      setAlertType('success');
      // setShowAlert(true);
      navigation.goBack();

    } catch (error) {
      console.error('Error updating task:', error);
      setAlertMessage("Failed to update the task.");
      setAlertType('error');
      setShowAlert(true);
    } finally {
      setTaskStatusLoading(false);
      setDescription('');
      setAttachments([]); // Clear uploaded files after updating
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setFileNames((prev) => prev.filter((_, i) => i !== index));
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
      className='flex items-center w-full'
      animationOut="slideOutDown">
      <View className="rounded-t-3xl bg-[#0A0D28] p-4 w-full pb-20">
        <View className="mb-14 mt-2 flex w-full flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-white">Update Status</Text>
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
              className="items-center rounded-full p-4 w-full">
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
    <>
      <AwesomeAlertComponent
        visible={showAlert}
        message={alertMessage}
        type={alertType}
        onClose={() => setShowAlert(false)}
      />

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
                  <TouchableOpacity className="w-[10%]" onPress={() => setModalVisible(false)}>
                    <Image
                      source={require('~/assets/commonAssets/cross.png')}
                      className="h-8 w-8"
                    />
                  </TouchableOpacity>
                </View>

                {/* Assignment Details */}
                <View className="mb-6 flex w-full flex-row  gap-4 items-start justify-between ">
                  <View className="flex w-[50%]  flex-col">
                    <Text className="text-xs text-[#787CA5]">Assigned by</Text>
                    <Text className="text-  text-[#815BF5]" style={{ fontFamily: 'LatoBold' }}>
                      {assignedBy}
                    </Text>
                  </View>

                  <View className="flex w-[50%] flex-col">
                    <Text className="text-xs text-[#787CA5]">Assigned to</Text>
                    <Text className="  text-[#D85570]" style={{ fontFamily: 'LatoBold' }}>
                      {assignedTo}
                    </Text>
                  </View>
                </View>

                {/* Dates */}
                <View className="mb-6 flex w-full items-start gap-5 ">
                  <View className="flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Created date</Text>
                    <Text className=" text-white" style={{ fontFamily: 'LatoBold' }}>
                      {moment(task?.createdAt).format('ddd, MMMM D - hh:mm A')}
                    </Text>
                  </View>

                  <View className="flex flex-col">
                    <Text className="text-xs text-[#787CA5]">Due date</Text>
                    <Text className="text- text-[#EF4444]" style={{ fontFamily: 'LatoBold' }}>
                      {moment(task?.dueDate).format('ddd, MMMM D - hh:mm A')}
                    </Text>
                  </View>
                </View>

                {/* Task Metadata */}
                <View className="mb-6 flex w-full flex-row items-center justify-start gap-20">
                  <View className="flex w-[50%] gap-3">
                    <View className="flex flex-col">
                      <Text className="text-xs text-[#787CA5]">Frequency</Text>
                      <Text className="text text-white" style={{ fontFamily: 'LatoBold' }}>
                        {task?.repeat ? task?.repeatType : 'Once'}
                      </Text>
                    </View>

                    <View className="flex flex-col">
                      <Text className="text-xs text-[#787CA5]">Category</Text>
                      <Text className="text- text-white" style={{ fontFamily: 'LatoBold' }}>
                        {category}
                      </Text>
                    </View>
                  </View>

                  <View className="flex gap-3">
                    <View className="flex flex-col">
                      <Text className="text-xs text-[#787CA5]">Status</Text>
                      <Text
                        className="mt-1 text- text-[#815BF5]"
                        style={{ fontFamily: 'LatoBold' }}>
                        {task?.status}
                      </Text>
                    </View>

                    <View className="mt-1 flex flex-col">
                      <Text className="text-xs text-[#787CA5]">Priority</Text>
                      <Text className="text- text-[#EF4444]" style={{ fontFamily: 'LatoBold' }}>
                        {task?.priority}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Description */}
                <View className="mb-6 flex w-full flex-col gap-1">
                  <Text className="text-xs text-[#787CA5]">Description</Text>
                  <Text className="text- text-white">{task?.description}</Text>
                </View>

                <View className="mb-8 mt-2 h-0.5 w-full bg-[#37384B]"></View>

                {/* voice */}
                <View className="mb-6 flex flex-col gap-2">
                  <View className="flex flex-row items-center justify-start gap-2">
                    <Image
                      source={require('~/assets/Tasks/voice.png')}
                      className="h-6 w-6"
                    />
                    <Text className="text-xs text-[#787CA5]">Voice</Text>
                  </View>

                  <View className="flex w-full flex-row items-center gap-3 pl-5 pt-1">
                    {task?.audioUrl ? (
                      <View className="flex w-full justify-center rounded-2xl border border-dashed border-[#815BF5] p-4">
                        <View className="flex flex-row justify-between">
                          <View className="flex flex-col">
                            <Text className="text-sm text-white">Voice Note</Text>
                            <Text className="mb-1 text-sm text-white" style={{ fontFamily: 'Lato-Light' }}>
                              {Math.floor(currentPosition / 1000)}s / {Math.floor(duration / 1000)}s
                            </Text>
                          </View>

                          <View className="flex flex-row items-center gap-3">
                            <TouchableOpacity
                              className="h-10 w-10 items-center justify-center rounded-full bg-[#46765f]"
                              onPress={handlePlayPause}>
                              <Entypo
                                name={isPlaying ? 'controller-paus' : 'controller-play'}
                                size={24}
                                color="#FFF"
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <Slider
                          style={styles.slider}
                          minimumValue={0}
                          maximumValue={duration > 0 ? duration / 1000 : 0}
                          value={currentPosition / 1000}
                          minimumTrackTintColor="#815BF5"
                          maximumTrackTintColor="gray"
                          thumbTintColor="#ffffff"
                          onValueChange={handleSliderChange}
                        />
                      </View>
                    ) : (
                      <Text className="text-xs text-gray-400">No voice note attached!</Text>
                    )}
                  </View>
                </View>             

                {/* Links */}
                <View className="mb-6 flex flex-col gap-2">
                  <View className="flex flex-row items-center justify-start gap-2">
                    <Image
                      source={require('~/assets/commonAssets/links.png')}
                      className="h-5 w-5"
                    />
                    <Text className="text-xs text-[#787CA5]">Links</Text>
                  </View>

                  <View className="flex w-full flex-row items-center gap-3 pl-5 pt-1">
                    {
                      task?.links?.length ?
                      task?.links?.map((link, index) => (
                        <TouchableOpacity key={index} onPress={() => Linking.openURL(link)}>
                          <Text style={{ color: '#815BF5' }}>{link}</Text>
                        </TouchableOpacity>
                      )) :
                      <Text className="text-xs text-gray-400">No links attached!</Text>
                    }
                    
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
                      <Text className="text-center flex text-xs p-2 text-gray-400 text-">No file attached!</Text>
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
                  <Text className="text- px-5 text-white" style={{ fontFamily: 'LatoBold' }}>
                    {reminderText || 'No Reminder Set'}
                  </Text>
                </View>

                <View className="mb-8 mt-2 h-0.5 w-full bg-[#37384B]"></View>

                {/* Comments */}
                <View className="mb-6 w-full flex-col gap-2">
                  <View className='flex flex-row gap-2 items-center mb-3'>
                    <Image className='h-5 w-5' source={require("../../assets/Tasks/taskUpdate.png")} />
                    <Text className='text-xs text-[#787CA5]' style={{ fontFamily: 'LatoBold' }}>Task Updates</Text>

                  </View>
                  {task?.comments?.map((com, index) => (

                    <View className='flex flex-col items-center w-full'>

                      <View key={index} className="flex w-full flex-row items-center justify-between">
                        <View className="flex flex-row items-center gap-2">
                        <UserAvatar
                          imageUrl={com?.userImage} 
                          name={com?.userName || "User"} 
                          size={40} 
                          borderColor="#37384B" 
                        />
                          <View className='w-[60%]'>
                            <Text className="text-sm text-white">{com?.comment}</Text>
                            <Text className="text-xs text-[#787CA5]">{com?.userName}</Text>
                          </View>
                        </View>

                        <TouchableOpacity
                          className={` mb-4  flex items-center  rounded-xl p-2 pl-3 pr-3 ${com?.tag === 'Completed'
                            ? 'bg-[#007B5B]'
                            : com?.tag === 'Reopen'
                              ? 'bg-[#FDB314]'
                              : 'bg-[#815BF5]'
                            }`}
                        >
                          <Text className="text-xs text-white" style={{ fontFamily: 'LatoBold' }}>
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
                        <Text className="text-xl font-semibold text-white">Task Update</Text>

                        <TouchableOpacity onPress={() => setShowProgressModal(false)}>
                          <Image
                            source={require('~/assets/commonAssets/cross.png')}
                            className="h-8 w-8"
                          />
                        </TouchableOpacity>
                      </View>
                      <Text className='text-gray-400 text-xs w-full '>
                        Please add a note before marking the task as {taskStatus}
                      </Text>
                      {/* Description Input */}
                      <View
                        className="mb-4 rounded-2xl px-2 mt-2 border border-[#37384B]"
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
                      <View className="rounded-t-3xl  bg-[#0A0D28] p-5">


                        {/* File Upload Button */}
                        <View className="w-full ">
                          <TouchableOpacity onPress={handleFileSelect} className="mb-5">
                            <View className="flex h-32 w-full flex-row items-center justify-center gap-4 rounded-2xl border border-dashed border-[#815BF5]">

                              <Image source={require('~/assets/Tasks/selectImage.png')} className="h-9 w-9" />
                              <Text className="text-gray-400 text-xs">Attach File (All File Types Accepted)</Text>

                            </View>
                          </TouchableOpacity>


                          <YStack className='flex   flex-col'>
                            {attachments.length > 0 && (
                              <Text className="text-xs font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                                Attachments
                              </Text>
                            )}
                            {/* File List with Remove Option */}
                            {attachments.length > 0 && (
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false} // Hides the scrollbar for a clean UI
                                contentContainerStyle={{ flexGrow: 1, paddingVertical: 5 }}
                              >

                                <View className=" flex flex-row  gap-2">
                                  {attachments.map((uri, index) => {
                                    const fileName = uri.split('/').pop();
                                    const fileExtension = fileName?.split('.').pop();
                                    const trimmedFileName =
                                      fileName && fileName.length > 10
                                        ? `${fileName.substring(0, 6)}...${fileExtension}`
                                        : fileName;

                                    return (
                                      <View key={index} className="flex flex-row items-center justify-between px-2 py-2 border border-[#37384B] rounded-lg mb-2">
                                        <Text className="text-lg text-white">{trimmedFileName}</Text>
                                        <TouchableOpacity onPress={() => removeAttachment(index)}>
                                          <Text className="text-red-500 text-lg">❌</Text>
                                        </TouchableOpacity>
                                      </View>
                                    );
                                  })}
                                </View>
                              </ScrollView>
                            )}
                          </YStack>
                        </View>
                      </View>

                      {/* Update Button */}
                      <TouchableOpacity
                        disabled={taskStatusLoading}
                        onPress={updateTask}
                        className="mt-2 h-16 w-full items-center justify-center rounded-full bg-[#37384B]">
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


          {/* task card */}
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
      </TouchableOpacity >


    </>

  );
};

const styles = StyleSheet.create({
  shadowButton: {
    backgroundColor: '#37384B',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5, // Android
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default TaskDetailedComponent;