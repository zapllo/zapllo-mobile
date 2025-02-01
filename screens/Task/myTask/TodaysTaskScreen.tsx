import React, { useState, useEffect, useMemo } from 'react';
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
  StyleSheet,
  FlatList,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import ProfileButton from '~/components/profile/ProfileButton';
import { AntDesign } from '@expo/vector-icons';
import CustomDropdown from '~/components/customDropDown';
import TaskDetailedComponent from '~/components/TaskComponents/TaskDetailedComponent';
import Modal from 'react-native-modal';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MyTasksStackParamList } from './MyTaskStack';
import CheckboxTwo from '~/components/CheckBoxTwo';
import GradientButton from '~/components/GradientButton';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import axios from 'axios';
import { backend_Host } from '~/config';
import moment from 'moment';
import { getDateRange } from '~/utils/GetDateRange';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';

type Props = StackScreenProps<MyTasksStackParamList, 'ToadysTask'>;
type TodaysTaskScreenRouteProp = RouteProp<MyTasksStackParamList, 'ToadysTask'>;

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

const frequencyOptions = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
];

const priorityOptions = [
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

const TodaysTaskScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<TodaysTaskScreenRouteProp>();
  const { todaysTasks } = route.params;
  const { token } = useSelector((state: RootState) => state.auth);

  const [selectedTeamSize, setSelectedTeamSize] = useState('This Week');
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>(todaysTasks);
  const [users, setUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Category');
  const [formattedDateRange, setFormattedDateRange] = useState('');
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  
    const formatWithSuffix = (date: any) => {
        // return moment(date).format('Do MMM, YYYY');
        return moment(date).format('MMM Do YY');
      };  
  
    useEffect(() => {
            // Update tasks based on selected date range
            if (selectedTeamSize === 'Custom') {
              // If custom is selected, open the modal and exit early
              setIsCustomDateModalVisible(true);
              return;
            }
            const dateRange = getDateRange(selectedTeamSize,todaysTasks,customStartDate,customEndDate);
        
            if (dateRange.startDate && dateRange.endDate) {
              const formattedStart = formatWithSuffix(dateRange.startDate);
              const formattedEnd = formatWithSuffix(dateRange.endDate);
        
              if (selectedTeamSize === 'Today' || selectedTeamSize === 'Yesterday') {
                setFormattedDateRange(formattedStart);
              } else {
                setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);
              }
            } else {
              setFormattedDateRange('Invalid date range');
            }
        
            // Filter tasks by date
            const filteredByDate = filterTasksByDate(todaysTasks, dateRange);
            setFilteredTasks(filteredByDate);
    }, [selectedTeamSize]);
          
  
    const handleCustomDateApply = (startDate: Date, endDate: Date) => {
        // Set custom date range state
        setCustomStartDate(startDate);
        setCustomEndDate(endDate);
  
        // Create a custom date range for filtering
        const customDateRange = {
            startDate: moment(startDate).startOf('day').toISOString(),
            endDate: moment(endDate).endOf('day').toISOString(),
        };
  
        // Filter tasks based on the custom date range
        const customFilteredTasks = filterTasksByDate(todaysTasks, customDateRange);
        setFilteredTasks(customFilteredTasks);
  
        // Format the custom date range for display
        const formattedStart = formatWithSuffix(moment(startDate));
        const formattedEnd = formatWithSuffix(moment(endDate));
        setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);
  
        setSelectedTeamSize('Custom');
        setIsCustomDateModalVisible(false);
    };
  
    // Helper function to filter tasks by date
    const filterTasksByDate = (tasks: any[], dateRange: { startDate: string; endDate: string }) => {
        const { startDate, endDate } = dateRange;

        return tasks.filter((task) => {
            const taskDueDate = moment(task?.dueDate);
            return (
                taskDueDate.isSameOrAfter(startDate, 'day') && taskDueDate.isSameOrBefore(endDate, 'day')
            );
        });
    };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backend_Host}/category/get`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setCategories(response.data.data);
      } catch (err: any) {
        console.error('API Error:', err.response || err.message);
      }
    };
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${backend_Host}/users/organization`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setUsers(response?.data?.data);
      } catch (err: any) {
        console.error('API Error:', err.response || err.message);
      }
    };
    fetchUsers();
    fetchCategories();
  }, [token]);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const handleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const applyFilter = () => {
    let tasksMatchingFilters = todaysTasks;

    // Filter by Categories
    if (selectedCategories.length > 0) {
      tasksMatchingFilters = tasksMatchingFilters.filter((task: any) =>
        selectedCategories.includes(task.category?._id)
      );
    }

    // Filter by Assigned To
    if (selectedAssignees.length > 0) {
      tasksMatchingFilters = tasksMatchingFilters.filter((task: any) =>
        selectedAssignees.includes(task.assignedUser?._id)
      );
    }

    // Filter by Frequency
    if (selectedFrequencies.length > 0) {
      tasksMatchingFilters = tasksMatchingFilters.filter((task: any) =>
        selectedFrequencies.includes(task?.repeatType)
      );
    }

    // Filter by Priority
    if (selectedPriorities.length > 0) {
      tasksMatchingFilters = tasksMatchingFilters.filter((task: any) =>
        selectedPriorities.includes(task?.priority)
      );
    }

    setFilteredTasks(tasksMatchingFilters);
    toggleModal(); // Close modal
  };

  // Search filtered tasks using `useMemo`
  const searchedTasks = useMemo(() => {
    return filteredTasks.filter((task: any) => {
      const searchLower = search.toLowerCase();
      return (
        task.category?.name.toLowerCase().includes(searchLower) || // Match category name
        task.assignedUser?.firstName.toLowerCase().includes(searchLower) || // Match assigned user
        task.assignedUser?.lastName.toLowerCase().includes(searchLower) || // Match assigned user last name
        task.frequency?.toLowerCase().includes(searchLower) // Match frequency (if applicable)
      );
    });
  }, [search, filteredTasks]);

  const getFilterBackgroundColor = (filter: string) => {
    return activeFilter === filter ? '#37384B' : '#0A0D28'; // Example colors
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <View className="flex h-20 w-full flex-row items-center justify-between p-5">
        <View className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full bg-[#37384B]">
          <TouchableOpacity onPress={() => navigation.navigate('DashboardHome')}>
            <AntDesign name="arrowleft" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text className="h-full pl-4 text-2xl font-semibold text-[#FFFFFF]">Today's Tasks</Text>
        <ProfileButton />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="mb-20 flex-1 items-center">
            <View className="mb-3 mt-4 flex w-full items-center">
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

            <View className="flex w-full flex-row items-center justify-center gap-5">
              <TextInput
                value={search}
                onChangeText={(value) => setSearch(value)}
                placeholder="Search"
                className="w-[72%] rounded-full border border-[#37384B] p-4 text-[#787CA5]"
                placeholderTextColor="#787CA5"
              />

              <TouchableOpacity
                className="h-14 w-14 rounded-full bg-[#37384B]"
                onPress={toggleModal}>
                <Image
                  source={require('~/assets/commonAssets/filter.png')}
                  className="h-full w-full"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
            className='mb-20'
            >
              {searchedTasks?.length > 0 ? (
                searchedTasks.map((task: any) => (
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
                <View className="flex items-center justify-center pt-10">
                  <Text className="font-[LatoBold] text-lg text-white">No tasks available!</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={{ margin: 0, justifyContent: 'flex-end' }}
        animationIn="slideInUp"
        animationOut="slideOutDown">
        <View className="flex flex-col items-center rounded-t-3xl bg-[#0A0D28] pb-16">
          <View className="flex w-full flex-row items-center justify-between px-6 py-5">
            <View>
              <Text className="text-2xl font-bold text-white" style={{ fontFamily: 'LatoBold' }}>
                Filters
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategories([]);
                setSelectedAssignees([]);
                setSelectedFrequencies([]);
                setSelectedPriorities([]);
              }}>
              <Text className="text-lg text-white" style={{ fontFamily: 'Lato-Regular' }}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6 flex w-full flex-row border border-y-[#37384B]">
            <View className="w-[40%] border-r border-r-[#37384B] pb-20">
              <TouchableOpacity
                onPress={() => setActiveFilter('Category')}
                className="h-14 w-full items-start"
                style={{ backgroundColor: getFilterBackgroundColor('Category') }}>
                <Text className="h-full p-4 px-6 text-white">Category</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="h-14 w-full items-start border-b border-b-[#37384B]"
                style={{ backgroundColor: getFilterBackgroundColor('AssignedTo') }}
                onPress={() => setActiveFilter('AssignedTo')}>
                <Text className="h-full p-4 px-6 text-white">Assigned to</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="h-14 w-full items-start border-b border-b-[#37384B]"
                style={{ backgroundColor: getFilterBackgroundColor('Frequency') }}
                onPress={() => setActiveFilter('Frequency')}>
                <Text className="h-full p-4 px-6 text-white">Frequency</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="h-14 w-full items-start border-b border-b-[#37384B]"
                style={{ backgroundColor: getFilterBackgroundColor('Priority') }}
                onPress={() => setActiveFilter('Priority')}>
                <Text className="h-full p-4 px-6 text-white">Priority</Text>
              </TouchableOpacity>
            </View>

            <View className="flex w-[60%] flex-col gap-6 p-4 h-96">
              <View style={[styles.input, { height: 57, borderRadius: 16 }]}>
                <Image
                  className="ml-2 mr-2 h-4 w-4"
                  source={require('../../../assets/Tasks/search.png')}
                />
                <TextInput
                  style={[styles.inputSome, { width: '85%' }]}
                  value={taskDescription}
                  onChangeText={(value) => setTaskDescription(value)}
                  placeholder="Search Category"
                  placeholderTextColor="#787CA5"></TextInput>
              </View>

              {activeFilter === 'Category' &&
                     <FlatList
                    
                     data={categories}
                     keyExtractor={(item) => item._id}
                     renderItem={({ item }) => (
                       <View className="flex w-full flex-row items-center gap-3 mb-5">
                         <CheckboxTwo
                           isChecked={selectedCategories.includes(item._id)}
                           onPress={() => handleCategorySelection(item._id)}
                         />
                         <Text className="text-lg text-white">{item.name}</Text>
                       </View>
                     )}
                   />}

                  {activeFilter === 'AssignedTo' && (
                        <FlatList
                          data={users}
                          keyExtractor={(user) => user._id}
                          renderItem={({ item: user }) => (
                            <View className="flex w-full flex-row items-center gap-3 mb-5">
                              <CheckboxTwo
                                isChecked={selectedAssignees.includes(user._id)}
                                onPress={() =>
                                  setSelectedAssignees((prev) =>
                                    prev.includes(user._id)
                                      ? prev.filter((id) => id !== user._id)
                                      : [...prev, user._id]
                                  )
                                }
                              />
                              <Text className="text-lg text-white">{`${user.firstName} ${user.lastName}`}</Text>
                            </View>
                          )}
                        />
                      )}

              {activeFilter === 'Frequency' &&
                frequencyOptions.map((freq) => (
                  <View key={freq.value} className="flex w-full flex-row items-center gap-3">
                    <CheckboxTwo
                      isChecked={selectedFrequencies.includes(freq.value)}
                      onPress={() =>
                        setSelectedFrequencies((prev) =>
                          prev.includes(freq.value)
                            ? prev.filter((f) => f !== freq.value)
                            : [...prev, freq.value]
                        )
                      }
                    />
                    <Text className="text-lg text-white">{freq.label}</Text>
                  </View>
                ))}

              {activeFilter === 'Priority' &&
                priorityOptions.map((priority) => (
                  <View key={priority.value} className="flex w-full flex-row items-center gap-3">
                    <CheckboxTwo
                      isChecked={selectedPriorities.includes(priority.value)}
                      onPress={() =>
                        setSelectedPriorities((prev) =>
                          prev.includes(priority.value)
                            ? prev.filter((p) => p !== priority.value)
                            : [...prev, priority.value]
                        )
                      }
                    />
                    <Text className="text-lg text-white">{priority.label}</Text>
                  </View>
                ))}
            </View>
          </View>

          <GradientButton title="Apply Filter          " onPress={applyFilter} imageSource={''} />
        </View>
      </Modal>

      <CustomDateRangeModal
        isVisible={isCustomDateModalVisible}
        onClose={() => {
          setIsCustomDateModalVisible(false);
          setSelectedTeamSize(selectedTeamSize);
        }}
        onApply={handleCustomDateApply}
        initialStartDate={customStartDate || new Date()}
        initialEndDate={customEndDate || new Date()}
      />
    </SafeAreaView> 
  );
};

export default TodaysTaskScreen;

const styles = StyleSheet.create({
  input: {
    borderColor: '#37384B',
    borderWidth: 1,
    borderRadius: 30,
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  inputSome: {
    color: 'white',
    fontFamily: 'Lato-Regular',
  },
});