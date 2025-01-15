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
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView } from 'react-native';
import NavbarTwo from '~/components/navbarTwo';
import { useNavigation } from 'expo-router';
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
import CustomDropdownComponentFour from '~/components/customDropDownFour';
import { AntDesign } from '@expo/vector-icons';

//delete the data :)
const daysData = [
  { label: 'Today', value: 'Today' },
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

const selectRepetType = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
];

export default function AssignTaskScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token, userData } = useSelector((state: RootState) => state.auth);
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backend_Host}/category/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // console.log('>>>>>>>>>>', response?.data?.data, token);
      const formattedData = processCategoryData(response.data.data);
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
    }));
  };
  const processCategoryData = (data) => {
    return data.map((cat) => ({
      value: cat?._id,
      label: cat?.name,
    }));
  };

  const handleChange = (date: Date) => {
    if (mode === 'date') {
      // Update selected date
      setSelectedDate(date);
      setMode('time'); // Switch to time picker
    } else {
      // Update selected time and combine with selected date
      setSelectedTime(date);
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(date.getHours());
      combinedDate.setMinutes(date.getMinutes());
      setDueDate(combinedDate); // Update due date
      setShowPicker(false); // Close modal
      // console.log('Mode:', mode);
      // console.log('Selected Date:', selectedDate);
      // console.log('Selected Time:', selectedTime);
      // console.log('Combined Due Date:', dueDate);
    }
  };
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

  const handleWeeklyTap = () => {
    setWeeklyModalVisible(true);
  };

  const handleMonthlyTap = () => {
    setMonthlyModalVisible(true);
  };

  const assignTask = async () => {
    await handleCreateTask();
    if (!isOn) {
      navigation.goBack(); // Navigate back only if the toggle is off
    } else {
      resetForm(); // Reset the form if the toggle is on
    }
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

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) {
      Alert.alert('Validation Error', 'Task Title is required.');
      return;
    }

    if (!taskDescription.trim()) {
      Alert.alert('Validation Error', 'Task Description is required.');
      return;
    }

    if (!activeButton) {
      Alert.alert('Validation Error', 'Priority level must be selected.');
      return;
    }

    if (!selectedUser) {
      Alert.alert('Validation Error', 'A user must be assigned.');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Validation Error', 'Category is required.');
      return;
    }

    if (!dueDate) {
      Alert.alert('Validation Error', 'A due date must be selected.');
      return;
    }

    setTaskLoading(true);
    const payload = {
      title: taskTitle,
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
      // console.log('Task Created:', response.data);
      Alert.alert('Task successfully created!');
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      Alert.alert('Failed to create task. Please try again.');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleCreateCategory = async (cat:string) => {
    console.log('Category created:❌❌❌❌❌❌❌❌❌❌❌❌❌❌111111');
    if (!cat) {
      Alert.alert('Validation Error', 'Enter new category');
      return;
    }
    setIsLoading(true)
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
      console.log('Category created:❌❌❌❌❌❌❌❌❌❌❌❌❌❌',updatedData);
      setCategory(newCategoryy.id);
      Alert.alert('New Category Addedsssss');
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Failed to create category. Please try again.');
    }finally{
      setIsLoading(false)
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
        <NavbarTwo title="Assign New Task" onBackPress={() => navigation.goBack()} />
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
                <Text style={[styles.baseName, { fontFamily: 'Lato-Bold' }]}>Select User</Text>
                <CustomDropdownComponentTwo
                  data={users}
                  selectedValue={selectedUser}
                  onSelect={(value) => setSelectedUser(value)}
                  placeholder="Select a user"
                  renderItem={(item) => renderDropdownItem(item, 'user')}
                />
              </View>

              <View style={styles.input}>
                <Text style={[styles.baseName, { fontFamily: 'Lato-Bold' }]}>Select Category</Text>
                <CustomDropdownComponentFour
                  data={categoryData}
                  selectedValue={category}
                  onSelect={(value) => setCategory(value)}
                  placeholder=""
                  onCreateCategory={(newCategoryName:string) => handleCreateCategory(newCategoryName)}
                  setCategoryData={setCategoryData}
                  isLoading={isLoading}
                />
              </View>
              {userData?.data?.role === 'orgAdmin' || userData?.user?.role === 'orgAdmin' ? (
                <View style={styles.searchContainer}>
                  <InputContainer
                    label="Create Category"
                    value={newCategory}
                    onChangeText={setNewCategory}
                    placeholder=""
                    className="flex-1  text-sm text-[#787CA5]"
                    passwordError={''}
                  />

                  <TouchableOpacity onPress={handleCreateCategory}>
                    <AntDesign  className='mt-8' name="pluscircleo" size={30} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                ''
              )}
            </View>

            {/* Task priority */}
            <View className="mt-6 flex w-[90%] flex-col items-start justify-start gap-3">
              <Text className="text-white " style={{ fontFamily: 'LatoBold' }}>
                Task Priority
              </Text>
              <View className="flex flex-row ">
                <TouchableOpacity
                  className={
                    activeButton === 'High'
                      ? 'rounded-l-xl border border-[#37384B] bg-[#815BF5] '
                      : 'rounded-l-xl border border-[#37384B] bg-[#05071E]'
                  }
                  onPress={() => handleButtonPress('High')}>
                  <Text
                    className={
                      activeButton === 'High'
                        ? 'p-3 text-sm text-white'
                        : 'p-3 text-sm text-[#787CA5]'
                    }
                    style={{ fontFamily: 'Lato-Thin' }}>
                    High
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={
                    activeButton === 'Medium'
                      ? 'border border-[#37384B] bg-[#815BF5] '
                      : 'border border-[#37384B] bg-transparent '
                  }
                  onPress={() => handleButtonPress('Medium')}>
                  <Text
                    className={
                      activeButton === 'Medium'
                        ? 'p-3 text-sm text-white'
                        : 'p-3 text-sm text-[#787CA5]'
                    }
                    style={{ fontFamily: 'Lato-Thin' }}>
                    Medium
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={
                    activeButton === 'Low'
                      ? 'rounded-r-xl border border-[#37384B] bg-[#815BF5] '
                      : 'rounded-r-xl border border-[#37384B]  bg-transparent '
                  }
                  onPress={() => handleButtonPress('Low')}>
                  <Text
                    className={
                      activeButton === 'Low'
                        ? 'p-3 text-sm text-white'
                        : 'p-3 text-sm text-[#787CA5] '
                    }
                    style={{ fontFamily: 'Lato-Thin' }}>
                    Low
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-6 flex w-[90%] flex-row items-center justify-start gap-4">
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
                  }
                }}
              />
            ) : (
              ''
            )}

            <View className="relative">
              <TouchableOpacity
              onPress={() => {
                setShowPicker(true);
                setMode('date'); // Open date picker first
              }}
              style={{ width: '100%' }} // Ensure the touchable area covers the entire input
            >
              <InputContainer
                label="Due Date"
                value={dueDate ? moment(dueDate).format('MMMM Do YYYY, h:mm a') : ''}
                onChangeText={() => {}} // No-op since input is not editable
                placeholder=""
                className="flex-1 text-sm text-[#787CA5]"
                passwordError={''}
                style={{ paddingEnd: 45 }}
                editable={false} // Make the input non-editable
              />
            </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowPicker(true);
                  setMode('date');
                }}>
                <Image
                  className="absolute bottom-6 right-6 h-6 w-6"
                  source={require('../../../../../assets/Tasks/calender.png')}
                />
              </TouchableOpacity>
              {showPicker && (
                <SelectDateModal
                  visible={showPicker}
                  mode={mode}
                  selectedDate={mode === 'date' ? selectedDate : selectedTime}
                  onChange={handleChange}
                  onCancel={() => setShowPicker(false)}
                />
              )}
            </View>

            <View className=" mt-6 flex w-[90%] flex-row items-center gap-3">
              <TouchableOpacity onPress={() => setLinkModalVisible(true)}>
                <Image
                  className="h-12 w-12"
                  source={require('../../../../../assets/Tasks/link.png')}
                />
                <Text className="text-sm text-white">
                  {links.length > 0 ? `${links.length} Link` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFileModalVisible(true)}>
                <Image
                  className="h-12 w-12"
                  source={require('../../../../../assets/Tasks/file.png')}
                />
                <Text className="ml-1.5 text-sm text-white">
                  {attachments.length > 0 ? `${attachments.length} File` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setReminderModalVisible(true)}>
                <Image
                  className="h-12 w-12"
                  source={require('../../../../../assets/Tasks/Reminder.png')}
                />
                <Text className="mt-1 text-xs text-white" style={{ fontFamily: 'LatoBold' }}>
                  {links.length > 0 ? `` : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAudioModalVisible(true)}>
                <Image
                  className="h-12 w-12"
                  source={require('../../../../../assets/Tasks/Audio.png')}
                />
                <Text className="text-sm text-white">
                  {links.length > 0 ? `` : ''}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-10 mt-6 flex w-[90%] flex-row items-center justify-between">
              <Text className="text-white" style={{ fontFamily: 'LatoBold' }}>
                Assign More Task
              </Text>
              <View
                className="relative flex h-10 w-20 justify-center rounded-3xl bg-white"
                style={[
                  { backgroundColor: isOn ? 'white' : '#a9b0bd' }, // Use gray color when off
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
                  style={{ fontFamily: 'Lato-Bold' }}>
                  Assign Task
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modals */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    width: 76,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
  },

  inputSome: {
    flex: 1,
    padding: 8,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'LatoBold',
    
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedDropdownItemStyle: {
    backgroundColor: '#4e5278', // Background color for selected item
  },

  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 25,
    borderRadius: 35,
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
    gap:5,
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
