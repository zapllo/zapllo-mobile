import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Navbar from '~/components/navbar';
import CustomDropdown from '~/components/customDropDown';
import { NavigationProp } from '@react-navigation/core';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { useFocusEffect } from 'expo-router';
import axios from 'axios';
import { backend_Host } from '~/config';
import { Image } from 'react-native';
import moment from 'moment';
import { getDateRange } from '~/utils/GetDateRange';
import TaskStatusCard from '~/components/card/TaskStatusCard';
import TaskCard from '~/components/TaskComponents/TaskCard';
import { MyTasksStackParamList } from '~/screens/Task/myTask/MyTaskStack';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';
interface Task {
  _id: string;
  status: string;
  dueDate: string;
  completionDate: string | null;
  title: string;
  description: string;
  assignedUser: { firstName: string; lastName: string }[];
}

type TaskStatus = 'Overdue' | 'Pending' | 'InProgress' | 'Completed' | 'In Time' | 'Delayed';

interface TaskStatusCounts {
  Overdue: number;
  Pending: number;
  InProgress: number;
  Completed: number;
  'In Time': number;
  Delayed: number;
  Today: number; // Add Today to the interface
}
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

export default function MyTaskScreen() {
  const screenHeight = Dimensions.get('window').height;
  const { isLoggedIn, token, userData } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<Task[]>([]); // Store tasks fetched from API
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [formattedDateRange, setFormattedDateRange] = useState('');
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [taskCounts, setTaskCounts] = useState<TaskStatusCounts>({
    Overdue: 0,
    Pending: 0,
    InProgress: 0,
    Completed: 0,
    'In Time': 0,
    Delayed: 0,
    Today: 0,
  });
  const [tasksCountData, setTaskCountsData] = useState<TaskStatusCounts>({
    Overdue: 0,
    Pending: 0,
    InProgress: 0,
    Completed: 0,
    'In Time': 0,
    Delayed: 0,
    Today: 0,
  });

  // task?.assignedUser?._id === currentUser?._id;

  // console.log('useerrrr>🧑🏻‍🦳🧑🏻‍🦳🧑🏻‍🦳🧑🏻‍🦳🧑🏻‍🦳🧑🏻‍🦳', JSON.stringify(userData?.data?._id, null, 2));

  const [selectedTeamSize, setSelectedTeamSize] = useState('This Week');
  const navigation = useNavigation<NavigationProp<MyTasksStackParamList>>();



  const filterTasksByDate = (tasks: Task[], dateRange: any) => {
    const { startDate, endDate } = dateRange;
    if (!Object.keys(startDate).length || !Object.keys(endDate).length) {
      return tasks;
    }
    return tasks.filter((task) => {
      const taskDueDate = moment(task?.dueDate);
      return taskDueDate.isSameOrAfter(startDate) && taskDueDate.isBefore(endDate);
    });
  };
  const formatWithSuffix = (date: any) => {
    // return moment(date).format('Do MMM, YYYY');
    return moment(date).format("MMM Do YY");
  };

  useEffect(() => {
    if (selectedTeamSize === 'Custom') {
      // If custom is selected, open the modal and exit early
      setIsCustomDateModalVisible(true);
      return;
    }
    const dateRange = getDateRange(selectedTeamSize, tasksData, customStartDate, customEndDate);

    if (dateRange.startDate && dateRange.endDate) {
      if (selectedTeamSize === 'Today' || selectedTeamSize === 'Yesterday') {
        // For single dates (Today or Yesterday)
        setFormattedDateRange(formatWithSuffix(dateRange.startDate));
      } else {
        // For ranges (Week, Month, Year, etc.)
        const formattedStart = formatWithSuffix(dateRange.startDate);
        const formattedEnd = formatWithSuffix(dateRange.endDate);
        setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);
      }
    } else {
      setFormattedDateRange('Invalid date range');
    }
    const myTasksByDate = filterTasksByDate(tasksData, dateRange);
    setTasks(myTasksByDate);
    setTaskCounts(countStatuses(myTasksByDate));
  }, [selectedTeamSize]);


  // const myTasksCounts = countStatuses(myTasks

  //*Delegated */
  // (task.user?._id === currentUser?._id &&
  //   task.assignedUser?._id !== currentUser?._id) ||
  // task.assignedUser?._id === currentUser?._id;

  const countStatuses = (tasks: Task[]): TaskStatusCounts => {
    return tasks.reduce(
      (counts, task) => {
        const dueDate = new Date(task.dueDate);
        const completionDate = task.completionDate ? new Date(task.completionDate) : null;
        const now = new Date();

        // Count overdue tasks
        if (dueDate < now && task.status !== 'Completed') {
          counts['Overdue'] = (counts['Overdue'] || 0) + 1;
        }
        // Count completed tasks as either "In Time" or "Delayed"
        if (task.status === 'Completed' && completionDate) {
          if (completionDate <= dueDate) {
            counts['In Time'] = (counts['In Time'] || 0) + 1;
          } else {
            counts['Delayed'] = (counts['Delayed'] || 0) + 1;
          }
        }
        // Count task status
        counts[task.status as TaskStatus] = (counts[task.status as TaskStatus] || 0) + 1;

        // Count tasks with today's due date
        if (isToday(task.dueDate)) {
          counts['Today'] = (counts['Today'] || 0) + 1;
        }

        return counts;
      },
      {
        Overdue: 0,
        Pending: 0,
        InProgress: 0,
        Completed: 0,
        'In Time': 0,
        Delayed: 0,
        Today: 0, // Add a count for Today's tasks
      } as TaskStatusCounts
    );
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchTasks = async () => {
        try {
          const response = await axios.get(`${backend_Host}/tasks/organization`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const tasksData = Array.isArray(response.data?.data) ? response.data?.data : [];
          const filteredTask = tasksData.filter(
            (e: { assignedUser: any; _id: any }) => e?.assignedUser?._id === userData?.data?._id
          );
          console.log('++👵🏻👵🏻👵🏻👵🏻👵🏻', JSON.stringify(filteredTask, null, 2));

          setTasks(filteredTask);
          setTasksData(filteredTask);
          setTaskCountsData(countStatuses(filteredTask)); // Update task counts
          setTaskCounts(countStatuses(filteredTask)); // Update task counts
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };

      fetchTasks();
    }, [token])
  );

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short', // 'Mon'
      year: 'numeric', // '2024'
      month: 'short', // 'Dec'
      day: 'numeric', // '25'
    });
  };


  const getInitials = (assignedUser: { firstName?: string; lastName?: string }): string => {
    const firstInitial = assignedUser?.firstName ? assignedUser.firstName[0].toUpperCase() : ''; // Check if firstName exists
    const lastInitial = assignedUser?.lastName ? assignedUser.lastName[0].toUpperCase() : ''; // Check if lastName exists
    return firstInitial + lastInitial;
  };
  const colors = ['#c3c5f7', '#ccc', '#fff', '#3399FF', '#FF33A6']; // Define a list of colors

  const isToday = (dueDate: string): boolean => {
    const today = new Date();
    const taskDueDate = new Date(dueDate);
    return (
      today.getDate() === taskDueDate.getDate() &&
      today.getMonth() === taskDueDate.getMonth() &&
      today.getFullYear() === taskDueDate.getFullYear()
    );
  };

  const handleCustomDateApply = (startDate: Date, endDate: Date) => {
    // Set custom date range state
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);

    // Create a custom date range for filtering
    const customDateRange = {
      startDate: moment(startDate).startOf('day').toDate(),
      endDate: moment(endDate).endOf('day').toDate(),
    };

    // Filter tasks based on the custom date range
    const customFilteredTasks = filterTasksByDate(tasksData, customDateRange);
    setTasks(customFilteredTasks);
    setTaskCounts(countStatuses(customFilteredTasks));

    // Format the custom date range for display
    const formattedStart = formatWithSuffix(moment(startDate));
    const formattedEnd = formatWithSuffix(moment(endDate));
    setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);

    setSelectedTeamSize(formattedDateRange)
    setIsCustomDateModalVisible(false);
  };

  const today = new Date();
  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <Navbar title="My Tasks" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* Dropdown */}
            <View className="mb-3 mt-4 flex w-full items-center">
              <CustomDropdown
                data={daysData}
                placeholder="This Week"
                selectedValue={selectedTeamSize}
                onSelect={(value) => {
                  setSelectedTeamSize(value);
                  if (value === 'Custom') {
                    setIsCustomDateModalVisible(true); // Open custom date modal
                  } else {
                    setIsCustomDateModalVisible(false); // Close modal for predefined filters
                  }
                }}
              />
            </View>

            {/* Content */}
            <View className="p-4.2 mb-40 flex h-full w-full flex-col items-center gap-2.5 pt-1">
              <View className="mb-1 flex h-[12rem]  flex-row items-start justify-center gap-2.5">
                <TouchableOpacity
                  onPress={() => {
                    // Filter overdue tasks dynamically
                    const overdueTasks = tasks.filter(
                      (task) => new Date(task.dueDate) < today && task.status !== 'Completed'
                    );
                    navigation.navigate('OverdueTask', { overdueTasks });
                  }}
                  className="my-1 h-[167px] w-[93%] rounded-3xl bg-[#CE423B] p-5 pb-7 pt-7 ">
                  <View className=" flex w-full flex-row items-center justify-between">
                    <Text className="text-white " style={{ fontFamily: 'LatoBold' }}>Overdue Tasks</Text>
                    <Text className="text-xs text-white">{formattedDateRange}</Text>
                  </View>
                  <Text className="mt-2  text-5xl text-white " style={{ fontFamily: 'LatoBold' }}>
                    {taskCounts.Overdue}
                  </Text>
                  <View className={`flex w-full flex-row items-center justify-between ${screenHeight > 900 ? 'pt-7' : 'pt-5'
                    }`}>
                    <View className="relative flex flex-row ">
                      {tasks
                        .filter((task) => new Date(task.dueDate) < today && task.status !== 'Completed')// Filter by status
                        .slice(0, 6) // Show only the first two users
                        .map((task, index) => (
                          <View key={task._id} className="relative rounded-full flex flex-row ">
                            <View
                              className="-m-2 flex h-11 w-11 items-center justify-center rounded-full border-2"
                              style={{
                                borderColor: '#CE423B',
                                backgroundColor: colors[index % colors.length], // Set background color
                              }}>
                              <Text className="text-center text-sm  text-black">
                                {getInitials(task?.assignedUser)} {/* Display initials */}
                              </Text>
                            </View>
                          </View>
                        ))}

                      {tasks.filter((task) => new Date(task.dueDate) < today && task.status !== 'Completed').length > 2 && (
                        <View className="relative rounded-full flex flex-row">
                          <View
                            className="-m-2 h-11 w-11 border-2 border-[#CE423B] items-center justify-center rounded-full "
                            style={{
                              backgroundColor: colors[2 % colors.length], // Assign a color for the + circle
                            }}>
                            <Text className="text-center font-medium text-black">
                              +{tasks.filter((task) => new Date(task.dueDate) < today && task.status !== 'Completed').length - 2}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        // Get today's date
                        const today = new Date();

                        // Filter overdue tasks dynamically
                        const overdueTasks = tasks.filter(
                          (task) => new Date(task.dueDate) < today && task.status !== 'Completed'
                        );

                        // Navigate to the OverdueTask screen with filtered overdue tasks
                        navigation.navigate('OverdueTask', { overdueTasks });
                      }}
                      className="-mt-4 flex h-11 w-11 items-center justify-center self-end rounded-full border border-white">

                      <Image className="h-4 w-4" source={require('~/assets/Tasks/goto.png')} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>

              <View className="mb-1 flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5">
                <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#FDB314] p-5">
                  <TouchableOpacity
                    className="h-full w-full"
                    onPress={() => {
                      const pendingTasks = tasks.filter((task) => task.status === 'Pending');
                      navigation.navigate('PendingTask', { pendingTasks });
                    }}>
                    <TaskCard
                      title="Pending Tasks"
                      count={taskCounts.Pending}
                      tasks={tasks}
                      date={formattedDateRange}
                      status="Pending"
                      backgroundColor="#FDB314" // Changed from colors to backgroundColor
                      borderColor="#FDB31430" // Added transparency to border color
                      onPress={() => {
                        const pendingTasks = tasks.filter((task) => task.status === 'Pending');
                        navigation.navigate('PendingTask', { pendingTasks });
                      }}
                    />
                  </TouchableOpacity>
                </View>
                <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#A914DD] p-5">
                  <TouchableOpacity
                    className="h-full w-full"
                    onPress={() => {
                      const inProgressTasks = tasks.filter((task) => task.status === 'In Progress');
                      navigation.navigate('InprogressTask', { inProgressTasks });
                    }}>
                    <TaskCard
                      title="In Progress Tasks"
                      count={taskCounts['In Progress']}
                      tasks={tasks}
                      date={formattedDateRange}
                      status="In Progress"
                      borderColor="#A914DD"
                      onPress={() => {
                        const inProgressTasks = tasks.filter((task) => task.status === 'In Progress');
                        navigation.navigate('InprogressTask', { inProgressTasks });
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  const completedTasks = tasks.filter((task) => task.status === 'Completed');
                  navigation.navigate('CompletedTask', { completedTasks });
                }}
                className="my-1 h-[167px] w-[93%] rounded-3xl bg-[#007B5B] p-5 pb-7 pt-7 ">
                <View className=" flex w-full flex-row items-center justify-between">
                  <Text className="text-white " style={{ fontFamily: 'LatoBold' }}>Completed Tasks</Text>
                  <Text className="text-xs text-white">{formattedDateRange}</Text>
                </View>
                <Text className="mt-2  text-5xl text-white " style={{ fontFamily: 'LatoBold' }}>
                  {taskCounts.Completed}
                </Text>

                <View className={`flex w-full flex-row items-center justify-between ${screenHeight > 900 ? 'pt-7' : 'pt-5'
                  }`}>
                  <View className="relative flex flex-row ">
                    {tasks
                      .filter((task) => task.status === 'Completed') // Filter by status
                      .slice(0, 6) // Show only the first two users
                      .map((task, index) => (
                        <View key={task._id} className="relative rounded-full flex flex-row ">
                          <View
                            className="-m-2 flex h-11 w-11 items-center justify-center rounded-full border-2"
                            style={{
                              borderColor: '#007B5B',
                              backgroundColor: colors[index % colors.length], // Set background color
                            }}>
                            <Text className="text-center text-sm  text-black">
                              {getInitials(task?.assignedUser)} {/* Display initials */}
                            </Text>
                          </View>
                        </View>
                      ))}
                    {tasks.filter((task) => task.status === 'Completed').length > 2 && (
                      <View className="relative rounded-full flex flex-row">
                        <View
                          className="-m-2 h-11 w-11 border-2 border-[#007B5B] items-center justify-center rounded-full "
                          style={{
                            backgroundColor: colors[2 % colors.length], // Assign a color for the + circle
                          }}>
                          <Text className="text-center font-medium text-black">
                            +{tasks.filter((task) => task.status === 'Completed').length - 2}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      const completedTasks = tasks.filter((task) => task.status === 'Completed');
                      navigation.navigate('CompletedTask', { completedTasks });
                    }}
                    className="-mt-4 flex h-11 w-11 items-center justify-center self-end rounded-full border border-white">
                    <Image className="h-4 w-4" source={require('~/assets/Tasks/goto.png')} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <View className="flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5">
                {/* In Time Tasks */}
                <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#815BF5] p-5">
                  <TouchableOpacity
                    className="h-full w-full"
                    onPress={() => {
                      const inTimeTasks = tasks.filter(
                        (task) => task.completionDate && new Date(task.completionDate) <= new Date(task.dueDate)
                      );
                      navigation.navigate('InTimeTask', { inTimeTasks });
                    }}>
                    <TaskCard
                      title="In Time Tasks"
                      count={tasks.filter(
                        (task) => task.completionDate && new Date(task.completionDate) <= new Date(task.dueDate)
                      ).length} // Count In-Time tasks
                      tasks={tasks}
                      date={formattedDateRange}
                      status="In Time"
                      colors={['#CCC', '#FFF']}
                      borderColor="#815BF5"
                      onPress={() => {
                        const inTimeTasks = tasks.filter(
                          (task) => task.completionDate && new Date(task.completionDate) <= new Date(task.dueDate)
                        );
                        navigation.navigate('InTimeTask', { inTimeTasks });
                      }}
                    />
                  </TouchableOpacity>
                </View>

                {/* Delayed Tasks */}
                <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#DE7560] p-5">
                  <TouchableOpacity
                    className="h-full w-full"
                    onPress={() => {
                      const delayedTasks = tasks.filter(
                        (task) => task.completionDate && new Date(task.completionDate) > new Date(task.dueDate)
                      );
                      navigation.navigate('DelayedTask', { delayedTasks });
                    }}>
                    <TaskCard
                      title="Delayed Tasks"
                      count={tasks.filter(
                        (task) => task.completionDate && new Date(task.completionDate) > new Date(task.dueDate)
                      ).length} // Count Delayed tasks
                      tasks={tasks}
                      date={formattedDateRange}
                      status="Delayed"
                      colors={['#CCC', '#FFF']}
                      borderColor="#DE7560"
                      onPress={() => {
                        const delayedTasks = tasks.filter(
                          (task) => task.completionDate && new Date(task.completionDate) > new Date(task.dueDate)
                        );
                        navigation.navigate('DelayedTask', { delayedTasks });
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
}