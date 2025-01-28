import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import ProfileButton from '~/components/profile/ProfileButton';
import { AntDesign } from '@expo/vector-icons';
import CustomDropdown from '~/components/customDropDown';
import TaskDetailedComponent from '~/components/TaskComponents/TaskDetailedComponent';
import Modal from 'react-native-modal';
import { RouteProp, useRoute } from '@react-navigation/native';
import CheckboxTwo from '~/components/CheckBoxTwo';
import GradientButton from '~/components/GradientButton';
import { DelegatedTaskStackParamList } from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskStack';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';

type Props = StackScreenProps<DelegatedTaskStackParamList, 'ToadysTask'>;
type TodaysTaskScreenRouteProp = RouteProp<DelegatedTaskStackParamList, 'ToadysTask'>;

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

const DelegatedTodaysTaskScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<TodaysTaskScreenRouteProp>();
  const { todaysTasks } = route.params;
  const { token } = useSelector((state: RootState) => state.auth);

  const [selectedTeamSize, setSelectedTeamSize] = useState("This week");
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Category');

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

  const getFilterBackgroundColor = (filter: string) => {
    return activeFilter === filter ? '#37384B' : '#0A0D28'; // Example colors
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <View className="flex h-20 w-full flex-row items-center justify-between p-5">
        <View className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full bg-[#37384B]">
          <TouchableOpacity onPress={() => navigation.goBack()}>
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

            <ScrollView>
              {todaysTasks?.length > 0 ? (
                todaysTasks.map((task: any) => (
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
                <View className='flex justify-center items-center pt-10'>
                  <Text className=' text-white text-lg font-[LatoBold]' >No tasks available!</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={{ margin: 0, justifyContent: "flex-end" }}
        animationIn="slideInUp"
        animationOut="slideOutDown">
        <View className="rounded-t-3xl bg-[#0A0D28] flex items-center flex-col pb-16">
          <View className="flex px-6 py-5 w-full items-center flex-row justify-between">
            <Text className="text-2xl font-bold text-white" style={{ fontFamily: "LatoBold" }}>
              Filters
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategories([]);
                setSelectedAssignees([]);
                setSelectedFrequencies([]);
                setSelectedPriorities([]);
              }}>
              <Text className="text-lg text-white" style={{ fontFamily: "Lato-Regular" }}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex flex-row w-full border-y-[#37384B] border mb-6">
            <View className="w-[40%] border-r border-r-[#37384B] pb-20">
              <TouchableOpacity
                onPress={() => setActiveFilter('Category')}
                 style={{ backgroundColor: getFilterBackgroundColor('Category') }}
                className="bg-[#37384B] items-start w-full h-14">
                <Text className="text-white px-6 p-4 h-full"
                >Category</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-start w-full h-14 border-b border-b-[#37384B]"
                style={{ backgroundColor: getFilterBackgroundColor('AssignedTo') }}
                onPress={() => setActiveFilter('AssignedTo')}>
                <Text className="text-white px-6 p-4 h-full">Assigned to</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-start w-full h-14 border-b border-b-[#37384B]"
                style={{ backgroundColor: getFilterBackgroundColor('Frequency') }}
                onPress={() => setActiveFilter('Frequency')}>
                <Text className="text-white px-6 p-4 h-full">Frequency</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-start w-full h-14 border-b border-b-[#37384B]"
                style={{ backgroundColor: getFilterBackgroundColor('Priority') }}
                onPress={() => setActiveFilter('Priority')}>
                <Text className="text-white px-6 p-4 h-full">Priority</Text>
              </TouchableOpacity>
            </View>

            <View className="w-[60%] p-4 flex flex-col gap-6">
              <View
                style={[
                  styles.input,
                  { height: 57, borderRadius: 16 },
                ]}>
                <Image className="h-4 w-4 mr-2 ml-2" source={require("../../../assets/Tasks/search.png")} />
                <TextInput
                  style={[
                    styles.inputSome,
                    { width: '85%' },
                  ]}
                  value={taskDescription}
                  onChangeText={(value) => setTaskDescription(value)}
                  placeholder="Search Category"
                  placeholderTextColor="#787CA5"></TextInput>
              </View>

              {activeFilter === 'Category' &&
                categories.map((category) => (
                  <View key={category._id} className="flex w-full flex-row items-center gap-3">
                    <CheckboxTwo
                      isChecked={selectedCategories.includes(category._id)}
                      onPress={() => handleCategorySelection(category._id)}
                    />
                    <Text className="text-lg text-white">{category.name}</Text>
                  </View>
                ))}

              {activeFilter === 'AssignedTo' &&
                users.map((user) => (
                  <View key={user._id} className="flex w-full flex-row items-center gap-3">
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
                ))}

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

          <GradientButton title="Apply Filter" onPress={applyFilter} imageSource={''} />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DelegatedTodaysTaskScreen;

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