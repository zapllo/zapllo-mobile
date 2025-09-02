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
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import Modal from 'react-native-modal';
import { backend_Host } from '~/config';
import * as DocumentPicker from 'expo-document-picker';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { router, useNavigation } from 'expo-router';
import ToastAlert from '../ToastAlert';
import { XStack, YStack } from 'tamagui';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Entypo, MaterialIcons, MaterialCommunityIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import UserAvatar from '../profile/UserAvatar';
import { LinearGradient } from 'expo-linear-gradient';
import { rgba } from '@tamagui/core';

// Enable relative time plugin for dayjs
dayjs.extend(relativeTime);

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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

    // Check if audioUrl is valid
    if (!audioUrl) {
      console.log('No audio URL provided');
      return null;
    }

    // Configure audio mode first
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { 
        shouldPlay: false,
        progressUpdateIntervalMillis: 100,
      },
      updatePlaybackStatus
    );
    
    setSound(newSound);
    const status = await newSound.getStatusAsync();
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setCurrentPosition(0);
      setAudioFinished(false);
    }
    
    return newSound;
  } catch (error) {
    console.log('Error loading audio:', error);
    setDuration(0);
    setCurrentPosition(0);
    setSound(null);
    return null;
  }
};

const updatePlaybackStatus = (status: any) => {
  try {
    if (!status.isLoaded) {
      if (status.error) {
        console.log(`Encountered a fatal error during playback: ${status.error}`);
      }
      return;
    }

    setDuration(status.durationMillis || 0);
    setCurrentPosition(status.positionMillis || 0);
    
    if (status.didJustFinish) {
      setIsPlaying(false);
      setCurrentPosition(0);
      setAudioFinished(true);
      if (sound) {
        sound.setPositionAsync(0).catch(console.error);
      }
    }
  } catch (error) {
    console.log('Error updating playback status:', error);
  }
};

const handlePlayPause = async () => {
  try {
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
        if (audioFinished) {
          await sound.setPositionAsync(0);
          setCurrentPosition(0);
          setAudioFinished(false);
        }
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  } catch (error) {
    console.log('Error handling play/pause:', error);
    setIsPlaying(false);
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
              setModalVisible(false);
              setAlertMessage("Task deleted successfully!");
              setAlertType('success');
              setShowAlert(true);
              
              // Navigate back after a short delay to allow the toast to show
              setTimeout(() => {
                navigation.goBack();
              }, 1500);
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

      console.log("FormData prepared for upload");

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
    } catch (error: any) {
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
      setModalVisible(false);
      setAlertMessage("Task updated successfully!");
      setAlertType('success');
      setShowAlert(true);
      
      // Navigate back after a short delay to allow the toast to show
      setTimeout(() => {
        navigation.goBack();
      }, 1500);

    } catch (error: any) {
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
      style={styles.statusModalContainer}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.75}
      useNativeDriver={true}>
      <View style={styles.statusModalContent}>
        <View style={styles.modalHandle} />
        
        <View style={styles.statusModalHeader}>
          <Text style={styles.statusModalTitle}>Update Status</Text>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowMainModal(false)}
            hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
            <Entypo name="cross" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.statusOptionsContainer}>
          {getStatusOptions().map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={option.onPress}
              style={styles.statusOptionButton}
              activeOpacity={0.75}>
              <LinearGradient
                colors={[
                  `${option.backgroundColor}80`, // 50% opacity
                  option.backgroundColor
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statusOptionGradient}>
                <View style={styles.statusOptionContent}>
                  <MaterialIcons 
                    name={
                      option.text.includes('Completed') ? 'check-circle' : 
                      option.text.includes('Reopen') ? 'refresh' : 
                      option.text.includes('Deleted') ? 'delete' : 'trending-up'
                    } 
                    size={20} 
                    color="#FFFFFF" 
                    style={styles.statusOptionIcon} 
                  />
                  <Text style={styles.statusOptionText}>
                    {option.text}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  // Add this useEffect for keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Add this function to handle dismissing the keyboard
  const handleDonePress = () => {
    Keyboard.dismiss();
  };

  return (
    <>
      <ToastAlert
        visible={showAlert}
        type={alertType}
        title={alertMessage}
        onHide={() => setShowAlert(false)}
      />

      <TouchableOpacity 
        activeOpacity={0.85} 
        onPress={() => setModalVisible(true)}
        style={styles.taskCardContainer}
      >
        <LinearGradient
          colors={['rgba(29, 29, 70, 0.95)', '#0b0e27']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
      
          
        

          {/* Task Card Header */}
          <View style={styles.cardHeader}>
            <View className='flex flex-row w-full items-center justify-between'>
            <Text style={styles.titleText} >
              {title}
            </Text>
            <Text style={styles.dueDateValue}>{dueDate}</Text>

            </View>

      
          </View>

          {/* Due date prominent display */}
          <View style={styles.dueDateContainer}>
           
            
          </View>
         

    

          {/* Task Card Info - Hidden initially, only shown in modal */}
          
          {/* Action button with ripple effect */}
          <TouchableOpacity 
            style={styles.actionButton}
            activeOpacity={0.7}
            onPress={() => setModalVisible(true)}
          >
            
            <MaterialIcons name="arrow-forward-ios" size={20} color="#FFFFFF" />
          </TouchableOpacity>

        </LinearGradient>
      </TouchableOpacity>


      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        style={{ margin: 0, justifyContent: 'flex-end', marginTop: 10 }}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.75}
        backdropTransitionOutTiming={300}
        useNativeDriver={true}>
        <ScrollView              
         contentContainerStyle={{ flexGrow: 1 }}
         showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.modalHandle} />
          <View
          className="mt-16 rounded-t-3xl bg-[#0A0D28] p-5 pb-20"
            >
            
            {/* Task Details Header */}
            <View style={styles.taskHeaderContainer}>
              <Text style={styles.taskTitle} numberOfLines={2}>
                {title}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setModalVisible(false)}
                hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                <Entypo name="cross" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Assignment Details Section */}
            <View style={styles.detailSection}>
              <View style={styles.assignmentColumn}>
                <Text style={styles.sectionLabel}>Assigned by</Text>
                <Text style={styles.assignedByText}>{assignedBy}</Text>
              </View>

              <View style={styles.assignmentColumn}>
                <Text style={styles.sectionLabel}>Assigned to</Text>
                <Text style={styles.assignedToText}>{assignedTo}</Text>
              </View>
            </View>

            {/* Dates Section */}
            <View style={styles.detailSection}>
              <View style={styles.dateColumn}>
                <Text style={styles.sectionLabel}>Created date</Text>
                <Text style={styles.dateText}>
                  {moment(task?.createdAt).format('ddd, MMMM D - hh:mm A')}
                </Text>
              </View>

              <View style={styles.dateColumn}>
                <Text style={styles.sectionLabel}>Due date</Text>
                <Text style={styles.dueDateText}>
                  {moment(task?.dueDate).format('ddd, MMMM D - hh:mm A')}
                </Text>
              </View>
            </View>

            {/* Task Metadata */}
            <View style={styles.metadataContainer}>
              <View style={styles.metadataColumn}>
                <View style={styles.metadataItem}>
                  <Text style={styles.sectionLabel}>Frequency</Text>
                  <Text style={styles.metadataText}>
                    {task?.repeat ? task?.repeatType : 'Once'}
                  </Text>
                </View>

                <View style={styles.metadataItem}>
                  <Text style={styles.sectionLabel}>Category</Text>
                  <Text style={styles.metadataText}>{category}</Text>
                </View>
              </View>

              <View style={styles.metadataColumn}>
                <View style={styles.metadataItem}>
                  <Text style={styles.sectionLabel}>Status</Text>
                
                    <Text style={[styles.statusText, {
                      color: task?.status === 'Completed' 
                        ? '#007B5B' 
                        : task?.status === 'In Progress' 
                          ? '#815BF5' 
                          : '#FDB314'
                    }]}>
                      {task?.status}
                    </Text>
                  </View>
               

                <View style={styles.metadataItem}>
                  <Text style={styles.sectionLabel}>Priority</Text>
               
                    <Text style={[styles.priorityText, {
                      color: task?.priority === 'High' 
                        ? '#EF4444' 
                        : task?.priority === 'Medium' 
                          ? '#FDB314' 
                          : '#007B5B'
                    }]}>
                      {task?.priority}
                    </Text>
                  </View>
                
              </View>
            </View>

            {/* Description Section */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{task?.description || 'No description provided'}</Text>
            </View>

            <View style={styles.sectionDivider} />

            {/* Voice Section */}
            <View style={styles.attachmentSection}>
              <View style={styles.attachmentHeader}>

              <MaterialIcons 
              className='p-1.5 mr-2 rounded-full '
              name="mic" size={12} color={"#787CA5"} style={{backgroundColor:"rgba(129, 91, 245, 0.2)"}}/>
                
                <Text style={styles.attachmentTitle}>Voice</Text>
              </View>

              {task?.audioUrl ? (
                <View style={styles.audioContainer}>
                  <View style={styles.audioControlsRow}>
                    <View style={styles.audioTextContainer}>
                      <Text style={styles.audioTitle}>Voice Note</Text>
                      <Text style={styles.audioTimestamp}>
                        {Math.floor(currentPosition / 1000)}s / {Math.floor(duration / 1000)}s
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={handlePlayPause}>
                      <Entypo
                        name={isPlaying ? 'controller-paus' : 'controller-play'}
                        size={22}
                        color="#FFF"
                      />
                    </TouchableOpacity>
                  </View>

                  <Slider
                    style={styles.sliderStyle}
                    minimumValue={0}
                    maximumValue={duration > 0 ? duration / 1000 : 0}
                    value={currentPosition / 1000}
                    minimumTrackTintColor="#815BF5"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.15)"
                    thumbTintColor="#ffffff"
                    onValueChange={handleSliderChange}
                  />
                </View>
              ) : (
                <Text style={styles.emptyAttachmentText}>No voice note attached!</Text>
              )}
            </View>

            {/* Links Section */}
            <View style={styles.attachmentSection}>
              <View style={styles.attachmentHeader}>
              <Entypo style={{backgroundColor:"rgba(129, 91, 245, 0.2)"}} name="link" size={12} color={"#787CA5"} className='p-1.5 mr-2 rounded-full '/>
                <Text style={styles.attachmentTitle}>Links</Text>
              </View>

              {task?.links?.length ? (
                <View style={styles.linksContainer}>
                  {task?.links?.map((link: string, index: number) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.linkItem}
                      onPress={() => Linking.openURL(link)}>
                      <Ionicons name="link" size={16} color="#815BF5" />
                      <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">{link}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyAttachmentText}>No links attached!</Text>
              )}
            </View>

            {/* Files Section */}
            <View style={styles.attachmentSection}>
              <View style={styles.attachmentHeader}>
              <AntDesign style={{backgroundColor:"rgba(129, 91, 245, 0.2)"}} name="file1" size={12} color={"#787CA5"} className='p-1.5 mr-2 rounded-full '/>
                <Text style={styles.attachmentTitle}>Files</Text>
              </View>

              {task?.attachment?.length ? (
                <ScrollView 
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filesScrollContainer}>
                  {task.attachment.map((att: string, index: number) => {
                    const fileName = att.split('/').pop() || 'file';
                    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.enhancedFileItem}
                        activeOpacity={0.7}
                        onPress={() => {
                          console.log("Opening file URL:", att);
                          Alert.alert(
                            "File Action",
                            "What would you like to do with this file?",
                            [
                              {
                                text: "Cancel",
                                style: "cancel"
                              },
                              {
                                text: "Open",
                                onPress: () => {
                                  Linking.openURL(att)
                                    .catch(err => {
                                      console.error("Error opening file:", err);
                                      Alert.alert("Error", "Couldn't open this file. Please try again later.");
                                    });
                                }
                              },
                              {
                                text: "Download",
                                onPress: () => {
                                  Linking.openURL(att)
                                    .catch(err => {
                                      console.error("Error downloading file:", err);
                                      Alert.alert("Error", "Couldn't download this file. Please try again later.");
                                    });
                                }
                              }
                            ]
                          );
                        }}>
                        <View style={styles.fileContentContainer}>
                          {isImage ? (
                            <View style={styles.imageFileContainer}>
                              <Image 
                                source={{ uri: att }} 
                                style={styles.filePreview}
                                resizeMode="cover" 
                              />
                              <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.7)']}
                                style={styles.fileImageGradient}
                              />
                            </View>
                          ) : (
                            <View style={[
                              styles.fileIconContainer,
                              { 
                                backgroundColor: 
                                  fileExt === 'pdf' ? 'rgba(239, 68, 68, 0.2)' : 
                                  fileExt === 'doc' || fileExt === 'docx' ? 'rgba(59, 130, 246, 0.2)' : 
                                  fileExt === 'xls' || fileExt === 'xlsx' ? 'rgba(16, 185, 129, 0.2)' : 
                                  fileExt === 'ppt' || fileExt === 'pptx' ? 'rgba(245, 158, 11, 0.2)' : 
                                  fileExt === 'zip' || fileExt === 'rar' ? 'rgba(139, 92, 246, 0.2)' : 
                                  'rgba(129, 91, 245, 0.2)'
                              }
                            ]}>
                              <View style={[
                                styles.fileTypeIconBadge, 
                                { 
                                  backgroundColor: 
                                    fileExt === 'pdf' ? '#EF4444' : 
                                    fileExt === 'doc' || fileExt === 'docx' ? '#3B82F6' : 
                                    fileExt === 'xls' || fileExt === 'xlsx' ? '#10B981' : 
                                    fileExt === 'ppt' || fileExt === 'pptx' ? '#F59E0B' : 
                                    fileExt === 'zip' || fileExt === 'rar' ? '#8B5CF6' : 
                                    '#815BF5'
                                }
                              ]}>
                                <MaterialIcons 
                                  name={
                                    fileExt === 'pdf' ? "picture-as-pdf" :
                                    fileExt === 'doc' || fileExt === 'docx' ? "description" :
                                    fileExt === 'xls' || fileExt === 'xlsx' ? "table-chart" :
                                    fileExt === 'ppt' || fileExt === 'pptx' ? "slideshow" :
                                    fileExt === 'zip' || fileExt === 'rar' ? "folder-zip" :
                                    fileExt === 'mp3' || fileExt === 'wav' ? "audio-file" :
                                    fileExt === 'mp4' || fileExt === 'mov' ? "video-file" :
                                    "insert-drive-file"
                                  } 
                                  size={28} 
                                  color="#FFFFFF" 
                                />
                              </View>
                              <Text style={styles.fileExtText}>
                                {fileExt.toUpperCase()}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.fileInfoContainer}>
                          <Text style={styles.fileNameText} numberOfLines={1}>
                            {fileName.length > 10 ? fileName.substring(0, 8) + '...' : fileName}
                          </Text>
                          <View style={styles.downloadBadge}>
                            <MaterialIcons name="file-download" size={12} color="#FFFFFF" />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text style={styles.emptyAttachmentText}>No file attached!</Text>
              )}
            </View>

            {/* Reminders Section */}
            <View style={styles.attachmentSection}>
              <View style={styles.attachmentHeader}>
              <MaterialCommunityIcons style={{backgroundColor:"rgba(129, 91, 245, 0.2)"}} name="bell" size={12} color={"#787CA5"} className='p-1.5 mr-2 rounded-full '/>
                <Text style={styles.attachmentTitle}>Reminders</Text>
              </View>

              <View style={styles.reminderContainer}>
                <Text style={reminderText ? styles.reminderText : styles.emptyAttachmentText}>
                  {reminderText || 'No Reminder Set'}
                </Text>
              </View>
            </View>

            <View style={styles.sectionDivider} />

            {/* Task Updates */}
            <View style={styles.taskUpdatesSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderLeft}>
                  <Image 
                    source={require("../../assets/Tasks/taskUpdate.png")} 
                    style={styles.sectionHeaderIcon} 
                  />
                  <Text style={styles.sectionHeaderTitle}>TASK UPDATES</Text>
                </View>
                {task?.comments?.length > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{task?.comments?.length}</Text>
                  </View>
                )}
              </View>

              {task?.comments?.length ? (
                <View style={styles.commentsContainer}>
                  {task?.comments?.map((com: any, index: number) => {
                    // Extract user ID from the comment if available
                    const userId = com?.userId || null;
                    
                    return (
                      <View key={index} style={styles.commentContainer}>
                        <View style={styles.commentHeader}>
                          <View style={styles.commentUser}>
                            <UserAvatar
                              imageUrl={com?.profilePic || com?.userImage} 
                              name={com?.userName || "User"} 
                              size={36} 
                              borderColor="#37384B"
                              userId={com?.userId} // Pass the userId to UserAvatar for profile pic fetch
                            />
                            <View style={styles.commentUserInfo}>
                              <Text style={styles.commentUserName}>{com?.userName}</Text>
                              <Text style={styles.commentText}>{com?.comment}</Text>
                              
                              {/* Render comment attachments */}
                              {com?.fileUrl && com?.fileUrl.length > 0 && (
                                <View style={styles.commentFilesContainer}>
                                  {com.fileUrl.map((fileUrl: string, fileIndex: number) => {
                                    const fileName = fileUrl.split('/').pop() || 'file';
                                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                                    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
                                    
                                    return (
                                      <TouchableOpacity 
                                        key={fileIndex}
                                        style={styles.enhancedCommentFileItem}
                                        activeOpacity={0.7}
                                        onPress={() => {
                                          Alert.alert(
                                            "File Action",
                                            "What would you like to do with this file?",
                                            [
                                              {
                                                text: "Cancel",
                                                style: "cancel"
                                              },
                                              {
                                                text: "Open",
                                                onPress: () => {
                                                  Linking.openURL(fileUrl)
                                                    .catch(err => {
                                                      console.error("Error opening file:", err);
                                                      Alert.alert("Error", "Couldn't open this file. Please try again later.");
                                                    });
                                                }
                                              },
                                              {
                                                text: "Download",
                                                onPress: () => {
                                                  Linking.openURL(fileUrl)
                                                    .catch(err => {
                                                      console.error("Error downloading file:", err);
                                                      Alert.alert("Error", "Couldn't download this file. Please try again later.");
                                                    });
                                                }
                                              }
                                            ]
                                          );
                                        }}>
                                        {isImage ? (
                                          <View style={styles.commentFileImageContainer}>
                                            <Image 
                                              source={{ uri: fileUrl }} 
                                              style={styles.commentFilePreview} 
                                              resizeMode="cover"
                                            />
                                            <LinearGradient
                                              colors={['transparent', 'rgba(0,0,0,0.7)']}
                                              style={styles.imageGradientOverlay}
                                            />
                                            <View style={styles.imageActionOverlay}>
                                              <View style={styles.commentFileActionButton}>
                                                <MaterialIcons name="file-download" size={18} color="#FFFFFF" />
                                              </View>
                                            </View>
                                          </View>
                                        ) : (
                                          <View style={styles.commentFileContentContainer}>
                                            <View style={[
                                              styles.commentFileTypeIndicator, 
                                              { 
                                                backgroundColor: 
                                                  fileExt === 'pdf' ? '#EF4444' : 
                                                  fileExt === 'doc' || fileExt === 'docx' ? '#3B82F6' : 
                                                  fileExt === 'xls' || fileExt === 'xlsx' ? '#10B981' : 
                                                  fileExt === 'ppt' || fileExt === 'pptx' ? '#F59E0B' : 
                                                  fileExt === 'zip' || fileExt === 'rar' ? '#8B5CF6' : 
                                                  '#64748B'
                                              }
                                            ]}>
                                              <MaterialIcons 
                                                name={
                                                  fileExt === 'pdf' ? "picture-as-pdf" :
                                                  fileExt === 'doc' || fileExt === 'docx' ? "description" :
                                                  fileExt === 'xls' || fileExt === 'xlsx' ? "table-chart" :
                                                  fileExt === 'ppt' || fileExt === 'pptx' ? "slideshow" :
                                                  fileExt === 'zip' || fileExt === 'rar' ? "folder-zip" :
                                                  fileExt === 'mp3' || fileExt === 'wav' ? "audio-file" :
                                                  fileExt === 'mp4' || fileExt === 'mov' ? "video-file" :
                                                  "insert-drive-file"
                                                } 
                                                size={20} 
                                                color="#FFFFFF" 
                                              />
                                            </View>
                                            <View style={styles.commentFileInfoContainer}>
                                              <Text style={styles.commentFileName} numberOfLines={1}>
                                                {fileName.length > 15 ? fileName.substring(0, 12) + '...' : fileName}
                                              </Text>
                                              <Text style={styles.commentFileType}>
                                                {fileExt.toUpperCase()}
                                              </Text>
                                            </View>
                                            <TouchableOpacity 
                                              style={styles.commentFileActionContainer}
                                              hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}>
                                              <MaterialIcons name="file-download" size={18} color="#815BF5" />
                                            </TouchableOpacity>
                                          </View>
                                        )}
                                      </TouchableOpacity>
                                    );
                                  })}
                                </View>
                              )}
                            </View>
                          </View>

                          <View style={[styles.commentTagContainer, {
                            backgroundColor: com?.tag === 'Completed'
                              ? 'rgba(0, 123, 91, 0.9)'
                              : com?.tag === 'Reopen'
                                ? 'rgba(253, 179, 20, 0.9)'
                                : 'rgba(129, 91, 245, 0.9)'
                          }]}>
                            <MaterialIcons 
                              name={
                                com?.tag === 'Completed' ? 'check-circle' : 
                                com?.tag === 'Reopen' ? 'refresh' : 'trending-up'
                              } 
                              size={12} 
                              color="#FFFFFF" 
                              style={{marginRight: 4}}
                            />
                            <Text style={styles.commentTagText}>{com?.tag}</Text>
                          </View>
                        </View>
                        {index < (task?.comments?.length - 1) && (
                          <View style={styles.commentDivider} />
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyCommentsContainer}>
                  <MaterialIcons name="chat-bubble-outline" size={24} color="#787CA5" />
                  <Text style={styles.emptyCommentsText}>No updates yet</Text>
                </View>
              )}


            </View>


            
              {/* Update Status Button */}
              <TouchableOpacity
                onPress={() => setShowMainModal(true)}
                style={styles.updateButton}
                activeOpacity={0.75}>
                <LinearGradient
                  colors={['rgba(129, 91, 245, 0.1)', 'rgba(129, 91, 245, 0.3)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.updateButtonGradient}>
                  <MaterialIcons name="update" size={18} color="#FFFFFF" style={styles.updateButtonIcon} />
                  <Text style={styles.updateButtonText}>Update task status</Text>
                </LinearGradient>
              </TouchableOpacity>
          </View>
        </ScrollView >

        {renderStatusModal()}

        {/* Progress Modal */}
        <Modal
          isVisible={showProgressModal}
          onBackdropPress={() => setShowProgressModal(false)}
          style={styles.progressModalContainer}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropOpacity={0.75}
          useNativeDriver={true}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}>
            <View style={styles.progressModalContent}>
              <View style={styles.modalHandle} />
              
              <View style={styles.progressModalHeader}>
                <Text style={styles.progressModalTitle}>Task Update</Text>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setShowProgressModal(false)}
                  hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
                <Entypo name="cross" size={20} color="white" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.progressModalSubtitle}>
                Please add a note before marking the task as {taskStatus}
              </Text>
              
              {/* Description Input */}
              <View style={styles.descriptionInputContainer}>
                <TextInput
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Add your comments here..."
                  placeholderTextColor="#787CA5"
                  style={styles.descriptionInput}
                />
              </View>

              {/* File Upload Section - Hide when keyboard is visible */}
              {!keyboardVisible && (
                <View style={styles.fileUploadSection}>
                  {/* File Upload Button */}
                  <TouchableOpacity 
                    onPress={handleFileSelect} 
                    style={styles.fileSelectButton}
                    activeOpacity={0.8}>
                    <Image 
                      source={require('~/assets/Tasks/selectImage.png')} 
                      style={styles.fileSelectIcon} 
                    />
                    <Text style={styles.fileSelectText}>
                      Attach File (All File Types Accepted)
                    </Text>
                  </TouchableOpacity>

                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <View style={styles.attachmentsListContainer}>
                      <Text style={styles.attachmentsTitle}>Attachments</Text>
                      
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.attachmentsScrollContent}>
                        {attachments.map((uri, index) => {
                          if (uri === null) return null;
                          const fileName = uri.split('/').pop() || '';
                          const fileExtension = fileName?.split('.').pop() || '';
                          const trimmedFileName =
                            fileName.length > 10
                              ? `${fileName.substring(0, 6)}...${fileExtension}`
                              : fileName;

                          return (
                            <View key={index} style={styles.attachmentItem}>
                              <Text style={styles.attachmentFileName}>{trimmedFileName}</Text>
                              <TouchableOpacity 
                                onPress={() => removeAttachment(index)}
                                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                                <MaterialIcons name="cancel" size={16} color="#EF4444" />
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              {/* Show Done button when keyboard is visible */}
              {keyboardVisible ? (
                <TouchableOpacity
                  onPress={handleDonePress}
                  style={styles.keyboardDoneButton}
                  activeOpacity={0.7}>
                  <Text style={styles.keyboardDoneButtonText}>Done</Text>
                </TouchableOpacity>
              ) : (
                /* Update Button - Hide when keyboard is visible */
                <TouchableOpacity
                  disabled={taskStatusLoading}
                  onPress={updateTask}
                  style={[
                    styles.taskUpdateButton,
                    {opacity: taskStatusLoading ? 0.7 : 1}
                  ]}
                  activeOpacity={0.9}>
                  {taskStatusLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.taskUpdateButtonText}>Update Task</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </Modal>


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
  sliderStyle: {
    width: '100%',
    height: 36,
  },
  // Enhanced professional styles for task card
  taskCardContainer: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'center',
    marginHorizontal: 8,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    width: '100%',
    maxWidth: '100%',
    padding: 16,
    paddingTop: 10,
    paddingBottom: 16,
    borderRadius: 16,
    position: 'relative',
    flexShrink: 1,
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'LatoBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardHeader: {
    alignItems:"flex-start",
    marginBottom: 12,
   
    width: '100%',
  },
  titleText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'LatoBold',
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 56, 75, 0.4)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dueDateLabel: {
    color: '#787CA5',
    fontSize: 12,
    marginLeft: 4,
  },
  dueDateValue: {
    color: '#EF4444',
    fontFamily: 'LatoBold',
    fontSize: 10,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(55, 56, 75, 0.6)',
    marginBottom: 14,
  },
  verticalDivider: {
    width: 1,
    backgroundColor: 'rgba(55, 56, 75, 0.6)',
    alignSelf: 'stretch',
    marginHorizontal: 10,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    width: '100%',
  },
  infoColumn: {
    flex: 1,
    gap: 14,
  },
  infoItem: {
    gap: 3,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelText: {
    color: '#787CA5',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  assigneeValue: {
    color: '#D85570',
    fontFamily: 'LatoBold',
    fontSize: 13,
    marginLeft: 22,
    paddingRight: 4,
  },
  assignerValue: {
    color: '#815BF5',
    fontFamily: 'LatoBold',
    fontSize: 13,
    marginLeft: 22,
    paddingRight: 4,
  },
  categoryValue: {
    color: '#FDB314',
    fontFamily: 'LatoBold',
    fontSize: 13,
    marginLeft: 22,
    paddingRight: 4,
  },
  frequencyValue: {
    color: '#4ECDC4',
    fontFamily: 'LatoBold',
    fontSize: 13,
    marginLeft: 22,
    paddingRight: 4,
  },
  actionButton: {
    backgroundColor: 'rgba(129, 91, 245, 0.15)',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 1000,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: 'rgba(129, 91, 245, 0.4)',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    fontSize: 10,
    marginRight: 6,
  },
  
  /* Modal Styles */
  modalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
    height: '90%',
  },
  modalContent: {
    backgroundColor: '#0A0D28',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '100%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 24,
  },
  modalHandle: {
    width: 60,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  taskHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 6,
  },
  taskTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    flexShrink: 1,
    width: '85%',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  closeButton: {
    padding: 4,
    marginTop: 2,
    backgroundColor: 'rgba(55, 56, 75, 0.5)',
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    height: 16,
    width: 16,
    tintColor: 'rgba(255, 255, 255, 0.9)',
  },
  
  /* Detail Section Styles */
  detailSection: {
    flexDirection: 'row',
    marginBottom: 22,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(55, 56, 75, 0.2)',
    borderRadius: 16,
    padding: 14,
  },
  assignmentColumn: {
    width: '48%',
  },
  sectionLabel: {
    fontSize: 11,
    color: '#787CA5',
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  assignedByText: {
    fontSize: 14,
    color: '#815BF5',
    fontFamily: 'LatoBold',
    letterSpacing: 0.2,
  },
  assignedToText: {
    fontSize: 14,
    color: '#D85570',
    fontFamily: 'LatoBold',
    letterSpacing: 0.2,
  },
  dateColumn: {
    width: '48%',
  },
  dateText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    letterSpacing: 0.2,
  },
  dueDateText: {
    fontSize: 13,
    color: '#EF4444',
    fontFamily: 'LatoBold',
    letterSpacing: 0.2,
  },
  
  /* Metadata Styles */
  metadataContainer: {
    flexDirection: 'row',
    marginBottom: 22,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(55, 56, 75, 0.2)',
    borderRadius: 16,
    padding: 14,
  },
  metadataColumn: {
    width: '48%',
  },
  metadataItem: {
    marginBottom: 16,
  },
  metadataText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    letterSpacing: 0.2,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  priorityPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: 'LatoBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    
  },
  
  /* Description Styles */
  descriptionContainer: {
    marginBottom: 22,
    backgroundColor: 'rgba(55, 56, 75, 0.2)',
    borderRadius: 16,
    padding: 14,
  },
  descriptionText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
    letterSpacing: 0.3,
  },
  
  /* Divider Styles */
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 22,
  },
  
  /* Attachment Styles */
  attachmentSection: {
    marginBottom: 22,
  },
  attachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
   
  },
  attachmentIcon: {
    width: 12,
    height: 12,
    marginRight: 8,
    tintColor: '#787CA5',
    backgroundColor: '#815BF5',
    borderRadius: 100,
    padding: 10,
  },
  attachmentTitle: {
    fontSize: 10,
    color: '#787CA5',
    fontFamily: 'latoBold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  emptyAttachmentText: {
    fontSize: 12,
    color: '#787CA5',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  
  /* Audio Player Styles */
  audioContainer: {
    borderWidth: 1,
    borderColor: '#815BF5',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 14,
    marginLeft: 6,
    backgroundColor: 'rgba(129, 91, 245, 0.05)',
  },
  audioControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  audioTextContainer: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  audioTimestamp: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.7,
    fontFamily: 'Lato-Light',
    marginTop: 2,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007B5B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  
  /* Links Styles */
  linksContainer: {
    paddingLeft: 6,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(129, 91, 245, 0.08)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#815BF5',
  },
  linkText: {
    color: '#815BF5',
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
    letterSpacing: 0.2,
  },
  
  /* Files Styles - Enhanced */
  filesScrollContainer: {
    paddingVertical: 12,
    paddingLeft: 6,
  },
  enhancedFileItem: {
    width: 110,
    height: 140,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(55, 56, 75, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  fileContentContainer: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  imageFileContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  fileImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  fileIconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  fileTypeIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileExtText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    opacity: 0.9,
  },
  filePreview: {
    width: '100%',
    height: '100%',
  },
  fileInfoContainer: {
    height: 36,
    backgroundColor: 'rgba(17, 17, 50, 0.95)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  fileNameText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    flex: 1,
  },
  downloadBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#815BF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  /* Reminder Styles */
  reminderContainer: {
    marginLeft: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  reminderText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    letterSpacing: 0.2,
  },
  
  /* Task Updates Styles - Modern & Professional */
  taskUpdatesSection: {
    marginBottom: 24,
    backgroundColor: 'rgba(55, 56, 75, 0.15)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#815BF5',
  },
  sectionHeaderTitle: {
    fontSize: 12,
    color: '#815BF5',
    fontFamily: 'LatoBold',
    letterSpacing: 1,
  },
  badgeContainer: {
    backgroundColor: '#815BF5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'LatoBold',
  },
  commentsContainer: {
    marginBottom: 5,
  },
  commentContainer: {
    marginBottom: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  commentUserInfo: {
    marginLeft: 10,
    flex: 1,
    borderRadius: 12,
  },
  commentUserName: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    letterSpacing: 0.2,
  },
  commentText: {
    fontSize: 12,
    color: '#FFFFFF',
    flexShrink: 1,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  commentTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  commentTagText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  commentDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 2,
  },
  emptyCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'rgba(55, 56, 75, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
    borderStyle: 'dashed',
  },
  emptyCommentsText: {
    fontSize: 12,
    color: '#787CA5',
    marginTop: 8,
    fontStyle: 'italic',
  },
  updateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  updateButtonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'LatoBold',
    letterSpacing: 0.5,
  },
  
  /* Progress Modal Styles */
  progressModalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  progressModalContent: {
    backgroundColor: '#0A0D28',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 24,
  },
  progressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressModalTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    letterSpacing: 0.2,
  },
  progressModalSubtitle: {
    fontSize: 12,
    color: '#787CA5',
    marginBottom: 16,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  descriptionInputContainer: {
    borderWidth: 1,
    borderColor: '#37384B',
    borderRadius: 16,
    padding: 14,
    height: 140,
    marginBottom: 20,
    backgroundColor: 'rgba(55, 56, 75, 0.2)',
  },
  descriptionInput: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    height: '100%',
    letterSpacing: 0.2,
  },
  fileUploadSection: {
    marginBottom: 20,
  },
  fileSelectButton: {
    borderWidth: 1,
    borderColor: '#815BF5',
    borderStyle: 'dashed',
    borderRadius: 16,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(129, 91, 245, 0.05)',
  },
  fileSelectIcon: {
    width: 32,
    height: 32,
    marginBottom: 10,
    opacity: 0.8,
  },
  fileSelectText: {
    fontSize: 12,
    color: '#787CA5',
    letterSpacing: 0.3,
  },
  attachmentsListContainer: {
    marginTop: 8,
  },
  attachmentsTitle: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  attachmentsScrollContent: {
    paddingBottom: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#37384B',
    borderRadius: 10,
    marginRight: 10,
    minWidth: 120,
    backgroundColor: 'rgba(55, 56, 75, 0.3)',
  },
  attachmentFileName: {
    fontSize: 12,
    color: '#FFFFFF',
    marginRight: 10,
    letterSpacing: 0.2,
  },
  taskUpdateButton: {
    backgroundColor: '#815BF5',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  taskUpdateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'LatoBold',
    letterSpacing: 0.5,
  },
  
  /* Status Modal Styles */
  statusModalContainer: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  statusModalContent: {
    backgroundColor: '#0A0D28',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 24,
  },
  statusModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusModalTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    letterSpacing: 0.2,
  },
  statusOptionsContainer: {
    marginTop: 10,
    gap: 16,
  },
  statusOptionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  statusOptionGradient: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  statusOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionIcon: {
    marginRight: 10,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    letterSpacing: 0.3,
  },
  commentFilesContainer: {
    marginTop: 12,
    paddingBottom: 8,
  },
  enhancedCommentFileItem: {
    width: 170,
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(55, 56, 75, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 5,
  },
  commentFileImageContainer: {
    width: '100%',
    height: 100,
    position: 'relative',
  },
  commentFileContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  commentFilePreview: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  imageActionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  commentFileActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(129, 91, 245, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  commentFileTypeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentFileInfoContainer: {
    marginLeft: 10,
    flex: 1,
  },
  commentFileName: {
    fontSize: 11,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  commentFileType: {
    fontSize: 9,
    color: '#787CA5',
    marginTop: 2,
  },
  commentFileActionContainer: {
    padding: 8,
    backgroundColor: 'rgba(129, 91, 245, 0.15)',
    borderRadius: 8,
  },
  commentFileItem: {
    width: 80,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(55, 56, 75, 0.5)',
  },
  commentFileIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
  },
  keyboardDoneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(129, 91, 245, 0.15)',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 91, 245, 0.4)',
  },
  keyboardDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'LatoBold',
    letterSpacing: 0.5,
  },
});

export default TaskDetailedComponent;