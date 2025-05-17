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
  Dimensions,
} from 'react-native';
import Navbar from '~/components/navbar';
import CustomDropdown from '~/components/customDropDown';
import { NavigationProp } from '@react-navigation/core';
import { useNavigation } from '@react-navigation/native';
import { DashboardStackParamList } from './DashboardStack';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { useFocusEffect } from 'expo-router';
import axios from 'axios';
import { backend_Host } from '~/config';
import { Image } from 'react-native';
import moment from 'moment';
import { getDateRange } from '~/utils/GetDateRange';
import TaskCard from '~/components/TaskComponents/TaskCard';
import TaskStatusCard from '~/components/TaskComponents/TaskCountSection';
import DashboardCard from '~/components/TaskComponents/DashboardCard';
import DashboardCardTwo from '~/components/TaskComponents/DashboardCardTwo';
import DashboardThree from '~/components/TaskComponents/DashboardThree';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';
import LottieView from 'lottie-react-native';
import { ActivityIndicator } from 'react-native';

interface Task {
  _id: string;
  status: string;
  dueDate: string;
  completionDate: string | null;
  title: string;
  description: string;
  assignedUser: { firstName: string; lastName: string; _id: string };
  category?: { name: string; _id: string };
  user?: { _id: string };
}

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
}

// Match the enum from the backend model
enum TaskStatus {
  Pending = 'Pending',
  InProgress = 'In Progress',
  Completed = 'Completed',
  Reopen = 'Reopen',
}

interface TaskStatusCounts {
  Overdue: number;
  [TaskStatus.Pending]: number;
  [TaskStatus.InProgress]: number;
  [TaskStatus.Completed]: number;
  [TaskStatus.Reopen]: number;
  'In Time': number;
  Delayed: number;
  Today: number;
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

export default function DashboardScreen() {
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<Task[]>([]); // Store tasks fetched from API
  const [assignedUsers, setAssignedUsers] = useState<Employee[]>([]);
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [detailPageData, setDetailPageData] = useState<any[]>([]);
  const [myReports, setMyReports] = useState<any[]>([]);
  const [delegatedData, setDelegatedData] = useState<Task[]>([]);
  const [categoryTasks, setCategoryTasks] = useState<any[]>([]);
  const [groupedCategory, setGroupedCategory] = useState<any[]>([]);
  const [formattedDateRange, setFormattedDateRange] = useState('');
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const [taskCounts, setTaskCounts] = useState<TaskStatusCounts>({
    Overdue: 0,
    [TaskStatus.Pending]: 0,
    [TaskStatus.InProgress]: 0,
    [TaskStatus.Completed]: 0,
    [TaskStatus.Reopen]: 0,
    'In Time': 0,
    Delayed: 0,
    Today: 0,
  });
  
  const [tasksCountData, setTaskCountsData] = useState<TaskStatusCounts>({
    Overdue: 0,
    [TaskStatus.Pending]: 0,
    [TaskStatus.InProgress]: 0,
    [TaskStatus.Completed]: 0,
    [TaskStatus.Reopen]: 0,
    'In Time': 0,
    Delayed: 0,
    Today: 0,
  });

  // Lottie animation component for loading
  const LoadingAnimation = () => (
    <View className="flex-1 justify-center items-center bg-primary">
    <ActivityIndicator size="large" color="#eb9029" />
    <Text className="text-white mt-4 text-lg">Loading dashboard data...</Text>
  </View>
  );

  // Lottie animation component for error
  const ErrorAnimation = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <View className="flex-1 justify-center items-center bg-primary p-6">
      <LottieView
        source={require('../../../../../assets/Animation/error.json')}
        autoPlay
        loop={false}
        style={{ width: 150, height: 150 }}
      />
      <Text className="text-white text-lg text-center mb-4 mt-2">{message}</Text>
      <TouchableOpacity 
        className="bg-[#A914DD] py-3 px-6 rounded-full"
        onPress={onRetry}
      >
        <Text className="text-white font-bold">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const [selectedTeamSize, setSelectedTeamSize] = useState('This Week');
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();

  const groupedByCategory = tasks.reduce((acc: any, task) => {
    const categoryName = task?.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(task);
    return acc;
  }, {});

  useEffect(() => {
    const groupedArray = Object.entries(groupedByCategory).map(([category, tasks]) => ({
      category,
      tasks,
    }));
    setGroupedCategory(groupedArray);
  }, [tasks]);

  const filterTasksByDate = (tasks: Task[], dateRange: any) => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate || !Object.keys(startDate).length || !Object.keys(endDate).length) {
      return tasks;
    }
    return tasks.filter((task) => {
      const taskDueDate = moment(task.dueDate);
      return taskDueDate.isSameOrAfter(startDate) && taskDueDate.isBefore(endDate);
    });
  };

  const formatWithSuffix = (date: any) => {
    return moment(date).format('MMM Do YY');
  };

  useEffect(() => {
    if (selectedTeamSize === 'Custom') {
      // If custom is selected, open the modal and exit early
      setIsCustomDateModalVisible(true);
      return;
    }

    // Get the date range for the selected option (non-custom options)
    const dateRange = getDateRange(selectedTeamSize, tasksData, customStartDate, customEndDate);

    if (dateRange.startDate && dateRange.endDate) {
      // Format and set the date range display
      if (selectedTeamSize === 'Today' || selectedTeamSize === 'Yesterday') {
        setFormattedDateRange(formatWithSuffix(dateRange.startDate));
      } else {
        const formattedStart = formatWithSuffix(dateRange.startDate);
        const formattedEnd = formatWithSuffix(dateRange.endDate);
        setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);
      }

      // Filter tasks based on the selected date range
      const filteredTasks = filterTasksByDate(tasksData, dateRange);
      setTasks(filteredTasks);
      setTaskCounts(countStatuses(filteredTasks));
    } else {
      setFormattedDateRange('Invalid date range');
    }
  }, [selectedTeamSize, tasksData]);

  const countStatuses = (tasks: Task[]): TaskStatusCounts => {
    // Debug the actual status values coming from the API
    const uniqueStatuses = [...new Set(tasks.map(task => task.status))];
    console.log("Unique status values in tasks:", uniqueStatuses);

    return tasks.reduce(
      (counts, task) => {
        const dueDate = new Date(task.dueDate);
        const completionDate = task.completionDate ? new Date(task.completionDate) : null;
        const now = new Date();

        // Count overdue tasks
        if (dueDate < now && task.status !== 'Completed') {
          counts.Overdue = (counts.Overdue || 0) + 1;
        }
        
        // Count tasks by status - using string comparison instead of enum
        // This handles both formats: "In Progress" and "InProgress"
        if (task.status === 'Pending') {
          counts[TaskStatus.Pending] = (counts[TaskStatus.Pending] || 0) + 1;
        } 
        else if (task.status === 'In Progress' || task.status === 'InProgress') {
          counts[TaskStatus.InProgress] = (counts[TaskStatus.InProgress] || 0) + 1;
        } 
        else if (task.status === 'Completed') {
          counts[TaskStatus.Completed] = (counts[TaskStatus.Completed] || 0) + 1;
          
          // Also count completed tasks as either "In Time" or "Delayed"
          if (completionDate) {
            if (completionDate <= dueDate) {
              counts['In Time'] = (counts['In Time'] || 0) + 1;
            } else {
              counts.Delayed = (counts.Delayed || 0) + 1;
            }
          }
        } 
        else if (task.status === 'Reopen') {
          counts[TaskStatus.Reopen] = (counts[TaskStatus.Reopen] || 0) + 1;
        }

        // Count tasks with today's due date
        if (isToday(task.dueDate)) {
          counts.Today = (counts.Today || 0) + 1;
        }

        return counts;
      },
      {
        Overdue: 0,
        [TaskStatus.Pending]: 0,
        [TaskStatus.InProgress]: 0,
        [TaskStatus.Completed]: 0,
        [TaskStatus.Reopen]: 0,
        'In Time': 0,
        Delayed: 0,
        Today: 0,
      } as TaskStatusCounts
    );
  };

  // Helper function to retry data fetching
  const retryFetchData = () => {
    setIsLoading(true);
    setLoadingError(null);
    fetchTasks();
  };

  // Extract fetchTasks function to be able to call it from retry button
  const fetchTasks = async () => {
    setIsLoading(true);
    setLoadingError(null);
    
    try {
      const response = await axios.get(`${backend_Host}/tasks/organization`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const tasksData = Array.isArray(response.data?.data) ? response.data?.data : [];
      
      // Ensure we have valid data before processing
      if (!tasksData.length) {
        console.log('No tasks data received');
        setLoadingError('No tasks found. Please try again later.');
        setIsLoading(false);
        return;
      }
      
      // Filter delegated tasks
      const delegatedTask = tasksData.filter(
        (task: Task) => {
          const userIdMatches = task.user?._id === userData?.data?._id;
          const assignedUserIdDiffers = task.assignedUser?._id !== userData?.data?._id;
          const isAssignedToUser = task.assignedUser?._id === userData?.data?._id;
          
          return (userIdMatches && assignedUserIdDiffers) || isAssignedToUser;
        }
      );

      const filteredEmployeeData = tasksData.map((v: any) => v.assignedUser).filter(Boolean);
      const uniqueData = Array.from(
        new Map(filteredEmployeeData.map((item: any) => [item._id, item])).values()
      );

      var newData: any[] = [];
      uniqueData.forEach((val: any) => {
        var userData: any[] = [];
        tasksData.forEach((user: Task) => {
          if (user?.assignedUser?._id === val?._id) {
            userData.push(user);
          }
        });
        newData.push(userData);
      });
      
      setDelegatedData(delegatedTask);
      setAssignedUsers(uniqueData);
      setDetailPageData(newData);
      setTasks(tasksData);
      setTasksData(tasksData);
      setTaskCountsData(countStatuses(tasksData));
      setTaskCounts(countStatuses(tasksData));

      // Log task status distribution for debugging
      logTaskStatusDistribution(tasksData);

      const filteredTasks = tasksData.filter(
        (task) => task.assignedUser?._id === userData?.data?._id
      );

      const categoryStatusCount = filteredTasks.reduce((acc: any, task) => {
        const categoryName = task.category?.name || 'Uncategorized';

        if (!acc[categoryName]) {
          acc[categoryName] = {};
        }

        const status = task.status || 'Unknown';

        if (!acc[categoryName][status]) {
          acc[categoryName][status] = 0;
        }

        acc[categoryName][status] += 1;

        return acc;
      }, {});
      
      const taskCountsArray = Object.entries(categoryStatusCount).map(
        ([categoryName, data]: [string, any]) => ({
          categoryName,
          ...data,
        })
      );

      setMyReports(taskCountsArray);

      // Group tasks by category
      const filterCategory = () => {
        const groupedByCategory = tasksData.reduce((acc: any[], task) => {
          const categoryName = task.category?.name || 'Uncategorized';

          // Find the category object or create it if it doesn't exist
          const categoryIndex = acc.findIndex((category) => category.name === categoryName);

          if (categoryIndex === -1) {
            acc.push({
              name: categoryName,
              tasks: [task], // Initialize the tasks array with this task
            });
          } else {
            acc[categoryIndex].tasks.push(task); // Add the task to the existing category
          }

          return acc;
        }, []);

        // Now, update the state with the grouped data
        setCategoryTasks(groupedByCategory);
      };

      // Call the filterCategory function to group tasks by category
      filterCategory();
      
      setIsLoading(false); // End loading after all data is processed
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoadingError('Failed to load tasks. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTasks();
    }, [token])
  );

  // Helper function to debug task status distribution
  const logTaskStatusDistribution = (tasks: Task[]) => {
    // Count tasks by status
    const statusCounts = tasks.reduce((counts: Record<string, number>, task) => {
      const status = task.status || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});

    console.log('Task status distribution:', statusCounts);
    
    // Check for any tasks with In Progress status
    const inProgressTasks = tasks.filter(task => 
      task.status === 'In Progress' || task.status === 'InProgress'
    );
    
    console.log(`Found ${inProgressTasks.length} tasks with In Progress status`);
    if (inProgressTasks.length > 0) {
      console.log('Sample In Progress task:', inProgressTasks[0]);
    }
    
    // Check for any tasks with Completed status
    const completedTasks = tasks.filter(task => task.status === 'Completed');
    console.log(`Found ${completedTasks.length} tasks with Completed status`);
    if (completedTasks.length > 0) {
      console.log('Sample Completed task:', completedTasks[0]);
    }
  };

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
      startDate: moment(startDate).startOf('day'),
      endDate: moment(endDate).endOf('day'),
    };

    // Filter tasks based on the custom date range
    const customFilteredTasks = filterTasksByDate(tasksData, customDateRange);
    setTasks(customFilteredTasks);
    setTaskCounts(countStatuses(customFilteredTasks));

    // Format the custom date range for display
    const formattedStart = formatWithSuffix(moment(startDate));
    const formattedEnd = formatWithSuffix(moment(endDate));
    setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);

    setIsCustomDateModalVisible(false);
  };

  // Debug logging to help identify issues
  console.log("Task counts:", {
    Overdue: taskCounts?.Overdue || 0,
    Pending: taskCounts?.[TaskStatus.Pending] || 0,
    InProgress: taskCounts?.[TaskStatus.InProgress] || 0,
    Completed: taskCounts?.[TaskStatus.Completed] || 0,
    Reopen: taskCounts?.[TaskStatus.Reopen] || 0,
    InTime: taskCounts?.['In Time'] || 0,
    Delayed: taskCounts?.Delayed || 0
  });

  // If loading, show loading animation
  if (isLoading) {
    return <LoadingAnimation />;
  }

  // If there's an error, show error animation
  if (loadingError) {
    return <ErrorAnimation message={loadingError} onRetry={retryFetchData} />;
  }

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <Navbar title="Dashboard" />
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
                placeholder="Select Filters"
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
              <View className="mb-6 w-full px-4">
                <View className="flex-row flex-wrap justify-between gap-y-4">
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/overdue.png')}
                    status="Overdue"
                    count={taskCounts?.Overdue || 0}
                    color="#FF595E"
                  />
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/Tasks/overdue.png')}
                    status="Pending"
                    count={taskCounts?.[TaskStatus.Pending] || 0}
                    color="#FDB314"
                  />
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/Progress.png')}
                    status="In Progress"
                    count={taskCounts?.[TaskStatus.InProgress] || 0}
                    color="#A914DD"
                  />
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/Completed.png')}
                    status="Completed"
                    count={taskCounts?.[TaskStatus.Completed] || 0}
                    color="#00A36C"
                  />
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/inTime.png')}
                    status="In Time"
                    count={taskCounts?.['In Time'] || 0}
                    color="#4CAF50"
                  />
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/Delayed.png')}
                    status="Delayed"
                    count={taskCounts?.Delayed || 0}
                    color="#E44444"
                  />
                </View>
              </View>

              {userData?.data?.role === 'orgAdmin' ||
              userData?.data?.role === 'manager' ||
              userData?.user?.role === 'orgAdmin' ? (
                <>
                  <View className="mb-1 flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5">
                    <TouchableOpacity 
                      className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#FC842C] p-5"
                      onPress={() => {
                        navigation.navigate('EmployeeWise', {
                          employeeWiseData: detailPageData,
                        });
                      }}
                    >
                      <View className="h-full w-full">
                        <DashboardThree
                          title="Employee Wise"
                          count={assignedUsers.length}
                          date={formattedDateRange}
                          tasks={assignedUsers}
                          borderColor="#FC842C"
                        />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('CategoryWise', {
                          employeeWiseData: groupedCategory,
                        });
                      }}                    
                      className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#D85570] p-5"
                    >
                      <View className="h-full w-full">
                        <DashboardCardTwo
                          title="Category Wise"
                          count={groupedCategory.length}
                          date={formattedDateRange}
                          tasks={tasks}
                          borderColor="#D85570"
                        />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View className="mb-1 flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5">
                    <TouchableOpacity 
                      className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#FDB314] p-5"
                      onPress={() => {
                        navigation.navigate('MyReports', { employeeWiseData: myReports });
                      }}                    
                    >
                      <View className="h-full w-full">
                        <DashboardCardTwo
                          title="My Report"
                          count={myReports?.length || 0}
                          tasks={tasks}
                          date={formattedDateRange}
                          borderColor="#FDB314"
                        />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate('Delegated', { employeeWiseData: delegatedData });
                      }}                    
                      className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#A914DD] p-5"
                    >
                      <View className="h-full w-full">
                        <DashboardCard
                          title="Delegated"
                          count={delegatedData?.length || 0}
                          tasks={delegatedData}
                          date={formattedDateRange}
                          borderColor="#A914DD"
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View className="mb-1 flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5">
                  <TouchableOpacity 
                    className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#FDB314] p-5"
                    onPress={() => {
                      navigation.navigate('MyReports', { employeeWiseData: myReports });
                    }}
                  >
                    <View className="h-full w-full">
                      <DashboardCardTwo
                        title="My Report"
                        count={myReports?.length || 0}
                        date={formattedDateRange}
                        tasks={tasks}
                        borderColor="#FDB314"
                      />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#A914DD] p-5"
                    onPress={() => {
                      navigation.navigate('Delegated', { employeeWiseData: delegatedData });
                    }}
                  >
                    <View className="h-full w-full">
                      <DashboardCard
                        title="Delegated"
                        count={delegatedData?.length || 0}
                        date={formattedDateRange}
                        tasks={delegatedData}
                        borderColor="#A914DD"
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <CustomDateRangeModal
        isVisible={isCustomDateModalVisible}
        onClose={() => {
          setIsCustomDateModalVisible(false);
        }}
        onApply={handleCustomDateApply}
        initialStartDate={customStartDate || new Date()}
        initialEndDate={customEndDate || new Date()}
      />
    </SafeAreaView>
  );
}