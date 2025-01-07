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
import getDateRange from '~/utils/GetDateRange';
import TaskCard from '~/components/TaskComponents/TaskCard';
import TaskStatusCard from '~/components/TaskComponents/TaskCountSection';

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

export default function DashboardScreen() {
  const { isLoggedIn, token, userData } = useSelector((state: RootState) => state.auth);
  const [tasks, setTasks] = useState<Task[]>([]); // Store tasks fetched from API
  const [tasksData, setTasksData] = useState<Task[]>([]);
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

  const [selectedTeamSize, setSelectedTeamSize] = useState('');
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();

  const filterTasksByDate = (tasks: Task[], dateRange: any) => {
    const { startDate, endDate } = dateRange;
    if (!Object.keys(startDate).length || !Object.keys(endDate).length) {
      return tasks;
    }
    return tasks.filter((task) => {
      const taskDueDate = moment(task.dueDate);
      return taskDueDate.isSameOrAfter(startDate) && taskDueDate.isBefore(endDate);
    });
  };

  useEffect(() => {
    const dateRange = getDateRange(selectedTeamSize);
    const myTasksByDate = filterTasksByDate(tasksData, dateRange);
    setTasks(myTasksByDate);
    setTaskCounts(countStatuses(myTasksByDate));
  }, [selectedTeamSize]);

  // const myTasksCounts = countStatuses(myTasks

  //*****Delegated */
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

          // console.log(
          //   'Tasks fetched:😀😀😀😀😀😀',
          //   JSON.stringify(
          //     filteredTask,
          //     null,
          //     2
          //   )
          // );
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
                placeholder="Select Filters"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

            {/* Content */}
            <View className="flex gap-2.5 flex-col h-full items-center w-full p-4.2 pt-1 mb-32">

              <View className="flex flex-col items-center w-[90%] mb-4 gap-5">
                {/* 1st row */}
                <View className="flex flex-row gap-5 items-center">
                  <TaskStatusCard
                    imageSource={require("../../../../../assets/commonAssets/overdue.png")}
                    status="Overdue"
                    count="07"
                  />
                  <TaskStatusCard
                    imageSource={require("../../../../../assets/Tasks/overdue.png")}
                    status="Pending"
                    count="07"
                  />
                </View>
                {/* 2nd row */}
                <View className="flex flex-row gap-5 items-center">
                  <TaskStatusCard
                    imageSource={require("../../../../../assets/commonAssets/Progress.png")}
                    status="In Progress"
                    count="07"
                  />
                  <TaskStatusCard
                    imageSource={require("../../../../../assets/commonAssets/Completed.png")}
                    status="Completed"
                    count="07"
                  />
                </View>
                {/* 3rd row */}
                <View className="flex flex-row gap-5 items-center">
                  <TaskStatusCard
                    imageSource={require("../../../../../assets/commonAssets/inTime.png")}
                    status="In Time"
                    count="07"
                  />
                  <TaskStatusCard
                    imageSource={require("../../../../../assets/commonAssets/Delayed.png")}
                    status="Delayed"
                    count="07"
                  />
                </View>
              </View>





              {/* Row 1 */}
              <View className="flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5 mb-1">

                {/* Today’s Task */}
                {/* Pending Tasks */}
                <TaskCard
                title="Today’s Task"
                count={taskCounts.Today}
                tasks={tasks}
                status="Today"
                backgroundColor="#FC842C"
                borderColor="#FC842C"
                />
                

                {/* Overdue Tasks */}
                <TaskCard
                title="Overdue Tasks"
                count={taskCounts.Today}
                tasks={tasks}
                status="Overdue"
                backgroundColor="#D85570"
                borderColor="#D85570"
                />
              </View>
              {/* row 2 */}
              <View className="flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5 mb-1">
                {/* Pending Tasks */}
                <TaskCard
                title="Pending Tasks"
                count={taskCounts.Pending}
                tasks={tasks}
                status="Pending"
                backgroundColor="#FDB314"
                borderColor="#FDB314"
              />

                {/* In Progress Tasks */}
                <TaskCard
                title="In Progress Tasks"
                count={taskCounts.Overdue}
                tasks={tasks}
                status="Pending"
                backgroundColor="#A914DD"
                borderColor="#A914DD"
              />
              </View>

              {/* Full Width Card */}
              <View className="mb-2 mt-2 h-[167px] w-[93%] rounded-3xl bg-[#007B5B] p-5 pt-7 pb-7 ">
                <View className=" flex w-full flex-row items-center justify-between">
                  <Text className="text-white " style={{fontFamily:"Lato-Bold"}} >Completed Tasks</Text>
                  <Text className="text-[10px] text-white" style={{fontFamily:"Lato-Bold"}}>22-12-2024 to 28-12-2024</Text>
                </View>
                <Text className=" mt-2  text-white"style={{ fontSize: 32,fontFamily:"Lato-Bold",lineHeight:38.4}}>
                  {taskCounts.Completed}
                </Text>

                <View className="flex w-full flex-row items-center justify-between gap-20 pt-5">
                  <View className="relative flex flex-row ">
                    {tasks
                      .filter((task) => task.status === 'Completed') // Filter by status
                      .slice(0, 2) // Show only the first two users
                      .map((task, index) => (
                        <View key={task._id} className="relative flex flex-row">
                          <View
                            className="-m-1.5 h-9 w-9 rounded-full border-2 border-[#007B5B]"
                            style={{
                              borderColor:"#007B5B",
                              backgroundColor: colors[index % colors.length], // Set background color
                            }}>
                            <Text className=" mt-1 text-center text-sm  text-black">
                              {getInitials(task?.assignedUser)} {/* Display initials */}
                            </Text>
                          </View>
                        </View>
                      ))}
                    {tasks.filter((task) => task.status === 'Completed').length > 2 && (
                      <View className="relative -mt-1 flex flex-row">
                        <View
                          className="h-8 w-8 items-center justify-center rounded-full"
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

                  <View className=" flex h-8 w-8 items-center justify-center rounded-full border border-white ">
                    <Image className="h-4 w-4" source={require('~/assets/Tasks/goto.png')} />
                  </View>
                </View>
              </View>

              {/* row 3  */}
              <View className="flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5">

                {/* In Time Task */}
                <TaskCard
                title="In Time Task"
                count={taskCounts.Today}
                tasks={tasks}
                status="Pending"
                backgroundColor="#815BF5"
                borderColor="#815BF5"
              />
                
                {/* Delayed Tasks */}
                <TaskCard
                title="Delayed Tasks"
                count={taskCounts.Today}
                tasks={tasks}
                status="Pending"
                backgroundColor="#DE7560"
                borderColor="#DE7560"
              />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
