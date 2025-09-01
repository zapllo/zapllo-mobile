import {
  View,
  Text,
  SafeAreaView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ActivityIndicator,
  Modal,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';
import NavbarTwo from '~/components/navbarTwo';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import InputContainer from '~/components/InputContainer';
import { TextInput } from 'react-native';
import CustomDropdown from '~/components/customDropDown';
import CheckboxTwo from '~/components/CheckBoxTwo';
import * as Haptics from 'expo-haptics';
import ReminderModal from '~/components/TaskComponents/assignNewTaskComponents/ReminderModal';
import AudioModal from '~/components/TaskComponents/assignNewTaskComponents/AudioModal';
import FileModal from '~/components/TaskComponents/assignNewTaskComponents/FileModal';
import AddLinkModal from '~/components/TaskComponents/assignNewTaskComponents/AddLinkModal';
import CustomDropdownComponentTwo from '~/components/customNavbarTwo';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Button } from 'react-native';
import WeeklyModal from '~/components/TaskComponents/assignNewTaskComponents/WeeklyModal';
import MonthlyModal from '~/components/TaskComponents/assignNewTaskComponents/MonthlyModal';
import SelectDateModal from '~/components/TaskComponents/assignNewTaskComponents/SelectDateModal';
import { AntDesign } from '@expo/vector-icons';
import CustomDropdownWithSearchAndAdd from '~/components/customDropDownFour';
import CustomAlert from '~/components/CustomAlert/CustomAlert';
import { XStack } from 'tamagui';
import CustomSplashScreen from '~/components/CustomSplashScreen';



const selectRepetType = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
];

export default function AssignTaskScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const params = useLocalSearchParams();
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [activeButton, setActiveButton] = useState('High');
  const [isChecked, setIsChecked] = useState(false);
  const [isOn, setIsOn] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLinkModalVisible, setLinkModalVisible] = useState(false);
  const [isFileModalVisible, setFileModalVisible] = useState(false);
  const [isReminderModalVisible, setReminderModalVisible] = useState(false);
  const [isAudioModalVisible, setAudioModalVisible] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [category, setCategory] = useState('');
  const [weekDays, setWeekDays] = useState([]);
  const [monthDays, setMonthDays] = useState([]);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [links, setLinks] = useState([]);
  const [comments, setComments] = useState([]);
  const [addedReminder, setAddedReminders] = useState([]);
  const [isDescriptionFocused, setDescriptionFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWeeklyModalVisible, setWeeklyModalVisible] = useState(false);
  const [isMonthlyModalVisible, setMonthlyModalVisible] = useState(false);
  const [repeatType, setRepeatType] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);
  const [showPicker, setShowPicker] = React.useState(false);
  const [mode, setMode] = React.useState<'date' | 'time'>('date');
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<Date>(new Date());
  const [dueDate, setDueDate] = React.useState<Date | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<'success' | 'error' | 'loading'>('success');
  const [showSplashScreen, setShowSplashScreen] = useState(false);

  const selectRepetType = [
    { label: 'Daily', value: 'Daily' },
    { label: 'Weekly', value: 'Weekly' },
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Yearly', value: 'Yearly' },
    { label: 'Periodically', value: 'Periodically' },
  ];

  const [repeatInterval, setRepeatInterval] = useState<number | ''>(''); // Stores Periodically days
  const [isPeriodicallyModalVisible, setPeriodicallyModalVisible] = useState(false);

  const handleFocus = () => setDescriptionFocused(true);
  const handleBlur = () => setDescriptionFocused(false);

  const position = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${backend_Host}/users/organization`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const formattedData = processUserData(response.data.data);
        setUsers(formattedData);
      } catch (err: any) {
        setError('Failed to fetch tasks. Please try again.');
        console.error('API Error:', err.response || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
    fetchCategories();
  }, [token]);

  // Handle template data and AI suggestion data
  useEffect(() => {
    if (params.templateData) {
      try {
        const template = JSON.parse(params.templateData as string);
        console.log('Template data received:', template);
        console.log('Template links:', template.links);
        console.log('Template attachments:', template.attachments);
        console.log('Template reminders:', template.reminders);
        console.log('Template audioUrl:', template.audioUrl);
        
        // Pre-fill form with template data
        if (template.title) setTaskTitle(template.title);
        if (template.description) setTaskDescription(template.description);
        if (template.priority) setActiveButton(template.priority);
        if (template.category?._id) setCategory(template.category._id);
        if (template.repeat !== undefined) setIsChecked(template.repeat);
        if (template.repeatType) setRepeatType(template.repeatType);
        if (template.days) setWeekDays(template.days);
        
        // Pre-fill additional template data (links, files, reminders, audio)
        if (template.links && Array.isArray(template.links)) {
          setLinks(template.links.filter(link => link && link.trim()));
        }
        
        // Convert attachment URIs back to proper attachment objects for AssignTask
        if (template.attachments && Array.isArray(template.attachments)) {
          const formattedAttachments = template.attachments.map((att: any) => {
            if (typeof att === 'string') {
              // If it's just a URI string, return it as is for AssignTask (it expects string URIs)
              return att;
            }
            return att.uri || att; // If it's an object, extract the URI
          });
          setAttachments(formattedAttachments);
        }
        
        if (template.reminders && Array.isArray(template.reminders)) {
          setAddedReminders(template.reminders);
        }
        
        if (template.audioUrl) {
          setAudioUrl(template.audioUrl);
        }
        
        // Show success message
        setCustomAlertVisible(true);
        setCustomAlertMessage('Template loaded successfully! You can modify the details before assigning.');
        setCustomAlertType('success');
      } catch (error) {
        console.error('Error parsing template data:', error);
        setCustomAlertVisible(true);
        setCustomAlertMessage('Error loading template data.');
        setCustomAlertType('error');
      }
    }

    if (params.aiSuggestion) {
      try {
        const aiData = JSON.parse(params.aiSuggestion as string);
        console.log('AI suggestion data received:', aiData);
        
        // Pre-fill form with AI suggestion data
        if (aiData.title) setTaskTitle(aiData.title);
        if (aiData.description) setTaskDescription(aiData.description);
        if (aiData.priority) setActiveButton(aiData.priority);
        if (aiData.category?._id) setCategory(aiData.category._id);
        if (aiData.assignedUser?.id) setSelectedUser(aiData.assignedUser.id);
        
        // Handle due date from AI suggestion
        if (aiData.dueDate) {
          const suggestedDate = new Date(aiData.dueDate);
          if (aiData.dueTime) {
            // Parse time and set it to the date
            const [hours, minutes] = aiData.dueTime.split(':');
            suggestedDate.setHours(parseInt(hours), parseInt(minutes));
          }
          setDueDate(suggestedDate);
          setSelectedDate(suggestedDate);
          setSelectedTime(suggestedDate);
        }
        
        // Show success message
        setCustomAlertVisible(true);
        setCustomAlertMessage('AI suggestion loaded successfully! Review and modify as needed.');
        setCustomAlertType('success');
      } catch (error) {
        console.error('Error parsing AI suggestion data:', error);
        setCustomAlertVisible(true);
        setCustomAlertMessage('Error loading AI suggestion data.');
        setCustomAlertType('error');
      }
    }
  }, [params.templateData, params.aiSuggestion]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backend_Host}/category/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // console.log('>>>>>>>>>>', response?.data?.data, token);
      const formattedData = processCategoryData(response?.data?.data);
      console.log(">>>>catttt", formattedData)
      setCategoryData(formattedData);
    } catch (err: any) {
      setError('Failed to fetch tasks. Please try again.');
      console.error('API Error:', err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const processUserData = (data) => {
    return data.map((user) => ({
      value: user._id,
      label: `${user.firstName} ${user.lastName}`,
      image: user.profilePic || null,
    }));
  };
  const processCategoryData = (data) => {
    return data.map((cat) => ({
      value: cat?._id,
      label: cat?.name,
    }));
  };
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const handleChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTempDate(selectedDate);
      if (mode === 'date') {
        setMode('time'); // Switch to time picker after date is selected
      } else {
        const combinedDate = new Date(tempDate);
        combinedDate.setHours(selectedDate.getHours());
        combinedDate.setMinutes(selectedDate.getMinutes());
        setDueDate(combinedDate);
        setShowPicker(false); // Close picker after time is selected
      }
    }
  };

  // Combine date and time into dueDate whenever they change
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(selectedTime.getHours());
      combinedDate.setMinutes(selectedTime.getMinutes());
      setDueDate(combinedDate);
      console.log('Combined Due Date:', combinedDate); // Debugging log
    }
  }, [selectedDate, selectedTime]);
  console.log('Formatted Due Date:', moment(dueDate).format('MMMM Do YYYY, h:mm a'));

  const handleButtonPress = (button: string) => {
    setActiveButton(button);
    Haptics.selectionAsync();
  };
  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setActiveButton('High');
    setIsChecked(false);
    setSelectedUser(null);
    setCategory('');
    setDueDate(null);
    setWeekDays([]);
    setMonthDays([]);
    setAttachments([]);
    setAudioUrl(null);
    setLinks([]);
    setComments([]);
    setAddedReminders([]);
    setRepeatType('');
  };

  const translateX = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 32],
  });



  const assignTask = async () => {
    await handleCreateTask();
    // Navigation is now handled in the CustomSplashScreen's onDismiss callback
  };

  const toggleSwitch = () => {
    setIsOn((previousState) => !previousState);
    Animated.timing(position, {
      toValue: isOn ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    Haptics.selectionAsync();
  };

  console.log('object', category);

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Task Title is required.');
      setCustomAlertType('error');
      return;
    }

    if (!taskDescription.trim()) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Task Description is required..');
      setCustomAlertType('error');
      return;
    }

    if (!activeButton) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Priority level must be selected.');
      setCustomAlertType('error');

      return;
    }

    if (!selectedUser) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('A user must be assigned.');
      setCustomAlertType('error');

      return;
    }

    if (!category.trim()) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Category is required.');
      setCustomAlertType('error');

      return;
    }

    if (!dueDate) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('A due date must be selected.');
      setCustomAlertType('error');

      return;
    }

    setTaskLoading(true);
    const payload = {
      title: taskTitle,
      repeatInterval,
      description: taskDescription,
      priority: activeButton,
      repeat: isChecked,
      repeatType: repeatType,
      days: weekDays,
      dates: monthDays,
      dueDate: dueDate,
      completionDate: '',
      category: category,
      assignedUser: selectedUser,
      status: 'Pending',
      organization: userData?.data?.organization,
      attachment: attachments,
      audioUrl: audioUrl,
      links: links,
      comments,
      reminders: addedReminder,
    };

    try {
      const response = await axios.post(`${backend_Host}/tasks/create`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Show splash screen instead of alert
      setShowSplashScreen(true);
      return true;

    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      setCustomAlertVisible(true);
      setCustomAlertMessage('Failed to create task. Please try again.');
      setCustomAlertType('error');
      return false;
    } finally {
      setTaskLoading(false);
    }
  };

  const handleCreateCategory = async (cat: string) => {
    console.log('Category created:❌❌❌❌❌❌❌❌❌❌❌❌❌❌111111');
    if (!cat) {
      setCustomAlertVisible(true);
      setCustomAlertMessage('Enter new category');
      setCustomAlertType('error');

      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${backend_Host}/category/create`,
        {
          name: cat, // Assuming "name" is required by the API
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newCategoryy = response.data; // Access the new category details from the response

      // Update category data


      fetchCategories();
      const updatedData = [...categoryData, { label: newCategoryy.name, value: newCategoryy.id }];
      setCategoryData(updatedData);
      console.log('Category created:❌❌❌❌❌❌❌❌❌❌❌❌❌❌', updatedData);
      setCategory(newCategoryy.id);
      setCustomAlertVisible(true);
      setCustomAlertMessage('New Category Added');
      setCustomAlertType('success');
    } catch (error) {
      console.error('Error creating category:', error);
      setCustomAlertVisible(true);
      setCustomAlertMessage('Failed to create category. Please try again.');
      setCustomAlertType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDropdownItem = (
    item: { label: string; value: any },
    type: 'user' | 'category',
    isCreateOption: boolean = false // Flag for the "Create Category" option
  ) => {
    // Determine if the item is selected
    const isSelected = type === 'user' ? item.value === selectedUser : item.value === category;

    return (
      <TouchableOpacity
        style={[
          styles.itemStyle,
          isSelected && styles.selectedDropdownItemStyle, // Highlight if selected
          isCreateOption && styles.createCategoryStyle, // Style for the "Create" option
        ]}
        onPress={() => {
          if (isCreateOption) {
            onCreateCategory(item.label); // Handle category creation
          } else {
            if (type === 'user') {
              setSelectedUser(item.value);
            } else {
              setCategory(item.value);
            }
          }
        }}>
        <Text
          style={[
            styles.itemTextStyle,
            isSelected && styles.selectedTextStyle, // Apply text style for selected
            isCreateOption && styles.createCategoryTextStyle, // Text style for "Create"
          ]}>
          {isCreateOption ? `Create Category: "${item.label}"` : item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="h-full w-full flex-1 items-center bg-primary ">
      <KeyboardAvoidingView
        className=" w-full"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <NavbarTwo 
          title={
            params.templateData ? "Create Task from Template" : 
            params.aiSuggestion ? "Create Task from AI" : 
            "Assign New Task"
          } 
        />
        <ScrollView
          className="h-full w-full flex-grow"
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <View className="h-full w-full items-center pb-20">
            {/* task title */}
            <InputContainer
              label="Task Title"
              value={taskTitle}
              onChangeText={(value) => setTaskTitle(value)}
              placeholder=""
              className="flex-1  text-sm text-[#787CA5]"
              passwordError={''}
            />

            {/* Task desc */}
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
              <Text style={[styles.baseName, { fontFamily: 'Lato-Bold' }]}>Task Description</Text>
              <TextInput
                multiline
                style={[
                  styles.inputSome,
                  { textAlignVertical: 'top', paddingTop: 5, width: '100%' },
                ]}
                value={taskDescription}
                onChangeText={(value) => setTaskDescription(value)}
                placeholder=""
                placeholderTextColor="#787CA5"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </View>

            {/* selected users */}
            <View className="mt-2 flex w-full flex-col items-center gap-2">
              <View style={styles.input}>
                {/* <Text style={[styles.baseName, { fontFamily: 'Lato-Bold' }]}>Select User</Text> */}
                <CustomDropdownComponentTwo
                  data={users}
                  selectedValue={selectedUser}
                  onSelect={(value) => setSelectedUser(value)}
                  placeholder="Select User"
                  renderItem={(item) => renderDropdownItem(item, 'user')}
                />
              </View>

              <View style={styles.input}>
                {/* <Text style={[styles.baseName, { fontFamily: 'Lato-Bold' }]}>Select Category</Text> */}
                <CustomDropdownWithSearchAndAdd
                  data={categoryData}
                  selectedValue={category}
                  onSelect={(value) => setCategory(value)}
                  placeholder="Select category"
                  onCreateCategory={(newCategoryName: string) =>
                    handleCreateCategory(newCategoryName)
                  }
                  setCategoryData={setCategoryData}
                  isLoading={isLoading}
                />
              </View>
            </View>

            {/* Task priority */}
            <XStack alignItems="center" maxWidth={'85%'} justifyContent="space-between" marginTop={12} width="100%">
              {/* Task Priority Label */}
              <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                Task Priority
              </Text>

              {/* Priority Buttons */}
              <XStack flex={1} justifyContent="flex-end">
                <TouchableOpacity
                  className={`border border-[#37384B] p-3 ${activeButton === 'High' ? 'bg-[#815BF5] rounded-l-lg' : 'bg-[#05071E] rounded-l-lg'}`}
                  onPress={() => handleButtonPress('High')}>
                  <Text className={`text-sm ${activeButton === 'High' ? 'text-white' : 'text-[#787CA5]'}`} style={{ fontFamily: 'Lato-Thin' }}>
                    High
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`border border-[#37384B] p-3 ${activeButton === 'Medium' ? 'bg-[#815BF5]' : 'bg-transparent'}`}
                  onPress={() => handleButtonPress('Medium')}>
                  <Text className={`text-sm ${activeButton === 'Medium' ? 'text-white' : 'text-[#787CA5]'}`} style={{ fontFamily: 'Lato-Thin' }}>
                    Medium
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`border border-[#37384B] p-3 ${activeButton === 'Low' ? 'bg-[#815BF5] rounded-r-lg' : 'bg-transparent rounded-r-lg'}`}
                  onPress={() => handleButtonPress('Low')}>
                  <Text className={`text-sm ${activeButton === 'Low' ? 'text-white' : 'text-[#787CA5]'}`} style={{ fontFamily: 'Lato-Thin' }}>
                    Low
                  </Text>
                </TouchableOpacity>
              </XStack>
            </XStack>


            <View className="mt-6 flex w-[85%] flex-row items-center justify-start gap-4">
              <CheckboxTwo isChecked={isChecked} onPress={() => setIsChecked(!isChecked)} />
              <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                Repeat
              </Text>
            </View>

            {isChecked ? (
              <CustomDropdown
                data={selectRepetType}
                placeholder="Select Repeat Type"
                selectedValue={repeatType}
                onSelect={(value) => {
                  setRepeatType(value);

                  if (value === 'Weekly') {
                    setWeeklyModalVisible(true);
                  } else if (value === 'Monthly') {
                    setMonthlyModalVisible(true);
                  } else if (value === 'Periodically') {
                    setPeriodicallyModalVisible(true);
                  }
                }}
              />
            ) : (
              ''
            )}
            <TouchableOpacity 
                onPress={() => {
                  setShowPicker(true);
                  setMode('date'); // Start with date picker
                }}            
            className="relative">
              <TouchableOpacity
                onPress={() => {
                  setShowPicker(true);
                  setMode('date'); // Start with date picker
                }}
                style={{ width: '100%' }} // Ensure the touchable area covers the entire input
              >
                <InputContainer
                  label="Due Date"
                  value={dueDate ? moment(dueDate).format('MMMM Do YYYY, h:mm a') : ''}
                  onChangeText={() => { }} // No-op since input is not editable
                  placeholder=""
                  className="flex-1 text-sm text-[#787CA5]"
                  passwordError={''}
                  style={{ paddingEnd: 45 }}
                  editable={false} // Make the input non-editable
                  onPress={() => {
                  setShowPicker(true);
                  setMode('date'); // Start with date picker
                }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowPicker(true);
                  setMode('date'); // Start with date picker
                }}>
                <Image
                  className="absolute bottom-6 right-6 h-6 w-6"
                  source={require('../../../../../assets/Tasks/calender.png')}
                />
              </TouchableOpacity>
              {showPicker && Platform.OS === 'ios' && (
                <SelectDateModal
                  visible={showPicker}
                  selectedDate={tempDate}
                  onChange={(date) => {
                    setTempDate(date);
                    setDueDate(date);
                    setShowPicker(false);
                  }}
                  onCancel={() => setShowPicker(false)}
                />
              )}
              {showPicker && Platform.OS === 'android' && (
                <DateTimePicker
                  value={tempDate}
                  mode={mode}
                  display={'default'}
                  onChange={handleChange}
                  textColor='white'
                  style={{ backgroundColor: '#191B3A' }} 
                />
              )}
            </TouchableOpacity>

            <View className=" mt-6 flex w-[90%] flex-row items-center gap-3">
              <TouchableOpacity  onPress={() => setLinkModalVisible(true)}>
                <Image
                  className="h-12 w-12"
                  source={require('../../../../../assets/Tasks/link.png')}
                />
                <Text className="text-xs text-white">
                  {links.length > 0 ? `${links.length} Link` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={() => setFileModalVisible(true)}>
                <Image
                  className="h-12 w-12"
                  source={require('../../../../../assets/Tasks/file.png')}
                />
                <Text className="ml-1.5 text-xs text-white">
                  {attachments.length > 0 ? `${attachments.length} File` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={() => setReminderModalVisible(true)}>
                <Image
                  className="h-12 w-12"
                  source={require('../../../../../assets/Tasks/Reminder.png')}
                />
                <Text className="mt-1 text-xs text-white" style={{ fontFamily: 'LatoBold' }}>
                  {addedReminder.length > 0 ? `${addedReminder.length} Nod` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity  onPress={() => setAudioModalVisible(true)}>
                <Image
                  className="h-12 w-12"
                  source={require('../../../../../assets/Tasks/Audio.png')}
                />
                <Text className="text-xs text-white">{audioUrl ? `added` : ''}</Text>
              </TouchableOpacity>
            </View>
     

            <View className="mb-10 mt-6 flex w-[90%] flex-row items-center justify-between">
              <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                Assign More Task
              </Text>
              <View
                className="relative flex h-10 w-20 justify-center rounded-3xl bg-white"
                style={[
                  { backgroundColor: isOn ? 'white' : '#37384B' }, // Use gray color when off
                ]}>
                <TouchableOpacity onPress={toggleSwitch}>
                  <Animated.View style={{ transform: [{ translateX }] }}>
                    <Image
                      className="mx-1 h-9 w-9"
                      source={require('../../../../../assets/Tasks/onOffBall.png')}
                    />
                  </Animated.View>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={assignTask}
              disabled={taskLoading}
              className={`mb-10  flex h-[4rem] w-[90%] items-center justify-center rounded-full bg-[#37384B] p-5`}>
              {taskLoading ? (
                <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 20 }} />
              ) : (
                <Text
                  className="text-center  font-semibold text-white"
                  style={{ fontFamily: 'LatoBold' }}>
                  Assign Task
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modals */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isPeriodicallyModalVisible}
          onRequestClose={() => setPeriodicallyModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Periodic Interval</Text>
              <TextInput
                keyboardType="numeric"
                value={repeatInterval.toString()}
                onChangeText={(text) => setRepeatInterval(text === '' ? '' : Number(text))}
                placeholder="Enter interval in days"
                placeholderTextColor="#787CA5"
                style={styles.input}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setPeriodicallyModalVisible(false)}
                  style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (repeatInterval) {
                      setPeriodicallyModalVisible(false);
                    }
                  }}
                  style={styles.saveButton}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* add link Modal */}
        <AddLinkModal
          isLinkModalVisible={isLinkModalVisible}
          setLinkModalVisible={setLinkModalVisible}
          setLinks={setLinks}
          links={links}
        />
        {/* File Modal */}
        <FileModal
          isFileModalVisible={isFileModalVisible}
          setFileModalVisible={setFileModalVisible}
          attachments={attachments}
          setAttachments={setAttachments}
        />

        {/* Reminder Modal */}
        <ReminderModal
          isReminderModalVisible={isReminderModalVisible}
          setReminderModalVisible={setReminderModalVisible}
          setAddedReminders={setAddedReminders}
        />

        {/* Audio Modal */}
        <AudioModal
          isAudioModalVisible={isAudioModalVisible}
          setAudioModalVisible={setAudioModalVisible}
          audioUrl={audioUrl}
          setAudioUrl={setAudioUrl}
        />

        {/* Weekly Modal */}
        <WeeklyModal
          isVisible={isWeeklyModalVisible}
          onClose={() => setWeeklyModalVisible(false)}
          setWeekDays={setWeekDays}
        />

        {/* Monthly Modal */}
        <MonthlyModal
          isVisible={isMonthlyModalVisible}
          onClose={() => setMonthlyModalVisible(false)}
          setMonthDays={setMonthDays}
        />
      </KeyboardAvoidingView>
      <CustomAlert
        visible={customAlertVisible}
        message={customAlertMessage}
        type={customAlertType}
        onClose={() => setCustomAlertVisible(false)}
      />
      <CustomSplashScreen
        visible={showSplashScreen}
        lottieSource={require('../../../../../assets/Animation/success.json')}
        mainText="Task Created Successfully!"
        subtitle="Your task has been assigned successfully"
        onComplete={() => {
          console.log('Splash animation completed');
        }}
        onDismiss={() => {
          setShowSplashScreen(false);
          // Always navigate back after splash screen
          navigation.goBack();
        }}
        duration={3000}
        gradientColors={["#05071E", "#0A0D28"]}
        textGradientColors={["#815BF5", "#FC8929"]}
        condition={{
          type: 'custom',
          status: true,
          successAnimation: require('../../../../../assets/Animation/success.json')
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 12,
    color: 'white',
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'LatoBold',
    marginBottom: 10,
  },
  // input: {
  //   borderWidth: 1,
  //   borderColor: '#37384B',
  //   padding: 10,
  //   width: '100%',
  //   borderRadius: 8,
  //   color: 'white',
  //   fontSize: 14,
  //   backgroundColor: '#05071E',
  //   textAlign: 'center',
  // },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#37384B',
    marginRight: 5,
  },
  cancelText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'LatoBold',
  },
  saveButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#815BF5',
    marginLeft: 5,
  },
  saveText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'LatoBold',
  },
  switchContainer: {
    width: 76,
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
  },

  inputSome: {
    flex: 1,
    padding: 8,
    color: '#fff',
    fontSize: 13,
    borderRadius: 5,
    fontFamily: 'LatoBold',
  },

  selectedDropdownItemStyle: {
    backgroundColor: '#4e5278', // Background color for selected item
  },

  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 15,
    borderRadius: 15,
    color: 'white',
    width: '90%',
    height: 57,
    position: 'relative',
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

  dropdown: {
    position: 'absolute',
    width: '100%',
    height: 50,
  },
  itemStyle: {
    padding: 15,
    borderBottomColor: '#37384B',
    borderBottomWidth: 1,
  },
  itemTextStyle: {
    color: '#787CA5',
  },
  selectedItemStyle: {
    backgroundColor: '#4e5278',
  },

  placeholderStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: 300,
    paddingLeft: 22,
  },
  selectedTextStyle: {
    fontSize: 13,
    color: '#787CA5',
    fontWeight: 300,
    paddingLeft: 22,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    marginRight: 5,
    borderColor: 'white',
    width: 10,
  },
  dropdownMenu: {
    backgroundColor: '#05071E',
    borderColor: '#37384B',
    borderWidth: 1,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
    margin: 8,
  },
  dropdownMenuTwo: {
    backgroundColor: '#05071E',
    borderColor: '#37384B',
    borderWidth: 1,
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
    margin: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#05071E',
    gap: 5,
    borderBottomColor: '#37384B',
    marginHorizontal: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFFFFF',
  },
});
