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
import DashboardCard from '~/components/TaskComponents/DashboardCard';
import DashboardCardTwo from '~/components/TaskComponents/DashboardCardTwo';
import DashboardThree from '~/components/TaskComponents/DashboardThree';

interface Task {
  _id: string;
  status: string;
  dueDate: string;
  completionDate: string | null;
  title: string;
  description: string;
  assignedUser: { firstName: string; lastName: string }[];
}
interface Emploees {
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
  const [assignedUsers, setAssignedUsers] = useState<Task[]>([]);
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [detailPageData, setDetailPageData] = useState();
  const [myReports, setMyReports] = useState();
  const [delegatedData, setDelegatedData] = useState();
  const [categoryTasks, setCategoryTasks] = useState([]);
  const [groupedCategory, setGroupedCategory] = useState([]);
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

  // console.log('❌❌❌❌❌❌', JSON.stringify(userData?.data?._id,null,2));

  const [selectedTeamSize, setSelectedTeamSize] = useState('This Week');
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();

  const groupedByCategory = tasks.reduce((acc:any, task) => {
    const categoryName = task.category.name;
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
          const delegatedTask = tasksData.filter(
            (task: { user: any; assignedUser: any; _id: any }) =>
              (task.user?._id === userData?.data?._id &&
                task.assignedUser?._id !== userData?.data?._id) ||
              task.assignedUser?._id === userData?.data?._id
          );

          const filteredEmployeeData = tasksData.map((v: any) => v.assignedUser);
          const uniqueData = Array.from(
            new Map(filteredEmployeeData.map((item: any) => [item._id, item])).values()
          );

          var newData = [];
          uniqueData.forEach((val: any) => {
            var userData: any[] = [];
            tasksData.forEach((user: { assignedUser: { _id: any } }) => {
              if (user?.assignedUser?._id === val?._id) {
                userData.push(user);
              }
            });
            newData.push(userData);
          });
          setDelegatedData(delegatedTask);
          setAssignedUsers(uniqueData);
          setDetailPageData(newData);
          // console.log('🙏🏻🙏🏻🙏🏻🙏🏻🙏🏻🙏🏻🙏🏻🙏🏻', uniqueData);
          // const filteredTask = tasksData.filter(
          //   (e: { assignedUser: any; _id: any }) => e?.assignedUser?._id === userData?.data?._id
          // );
          setTasks(tasksData);
          setTasksData(tasksData);
          setTaskCountsData(countStatuses(tasksData)); // Update task counts
          setTaskCounts(countStatuses(tasksData)); // Update task counts

          const filteredTasks = tasksData.filter(
            (task) => task.assignedUser?._id === userData?.data?._id
          );
          
          const categoryStatusCount = filteredTasks.reduce((acc, task) => {
            const categoryName = task.category?.name || "Uncategorized";
          
            if (!acc[categoryName]) {
              acc[categoryName] = {};
            }
          
            const status = task.status || "Unknown";
          
            if (!acc[categoryName][status]) {
              acc[categoryName][status] = 0;
            }
          
            acc[categoryName][status] += 1;
          
            return acc;
          }, {});
          const taskCountsArray = Object.entries(categoryStatusCount).map(([categoryName, data]) => ({
            categoryName,
            ...data
          }));

          setMyReports(taskCountsArray)
          
          console.log("+++++++++++++++++++++",taskCountsArray.length);

          const groupedTasks = tasksData.reduce((acc, task) => {
            if (!acc[task.status]) acc[task.status] = [];
            acc[task.status].push(task);
            return acc;
          }, {});

          const assignedToUser = (userId) =>
            tasksData.filter((task) => task.assignedUser._id === userId);
          
          console.log(assignedToUser("676ba9521364993ac8498b93"));
          
          
          

          const filterCategory = () => {
            // Group tasks by category
            const groupedByCategory = tasksData.reduce((acc, task) => {
              const categoryName = task.category?.name; // Get the category name
              if (!categoryName) return acc;

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
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };

      fetchTasks();
    }, [token])
  );

  const tasksByEmployee = tasks.reduce(
    (acc, task) => {
      const userId = task.assignedUser._id;
      if (!acc[userId]) {
        acc[userId] = {
          user: task.assignedUser,
          tasks: [],
        };
      }
      acc[userId].tasks.push(task);
      return acc;
    },
    {} as Record<string, { user: Task['assignedUser']; tasks: Task[] }>
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

  // const getCount = () => {
  //   var assigned = [];
  //   groupedCategory.forEach((cat) => {
  //     cat?.tasks?.forEach((e) => {
  //       if (e?.assignedUser?._id == userData?.data?._id) {
  //         console.log('❌❌❌❌>>>>>', JSON.stringify(e.category?.name, null, 2));

  //         assigned.push(e);
  //       }
  //     });
  //   });
  //   const filteredData = assigned.filter((item, index, array) => {
  //     const categoryName = item.category?.name;
  //     console.log('❌❌❌❌', JSON.stringify(categoryName, null, 2));
  //     return array.findIndex((obj) => obj.category?.name === categoryName) === index;
  //   });
  //   setMyReports(filteredData);

  //   // return count;
  // };

  // console.log(">>>>>>>>>>>>>>",myReports)

  // // useEffect(()=>{
  // //    getCount()
  // // },[groupedCategory])

  console.log("oooooasssssssss>>>>>>>>>>>>>oooo",groupedCategory)

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
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

            {/* Content */}
            <View className="p-4.2 mb-32 flex h-full w-full flex-col items-center gap-2.5 pt-1">
              <View className="mb-4 flex w-[90%] flex-col items-center gap-5">
                {/* 1st row */}
                <View className="flex flex-row items-center gap-5">
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/overdue.png')}
                    status="Overdue"
                    count={taskCounts?.Overdue}
                  />
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/Tasks/overdue.png')}
                    status="Pending"
                    count={taskCounts?.Pending}
                  />
                </View>
                {/* 2nd row */}
                <View className="flex flex-row items-center gap-5">
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/Progress.png')}
                    status="In Progress"
                    count={taskCounts?.InProgress}
                  />
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/Completed.png')}
                    status="Completed"
                    count={taskCounts?.Completed}
                  />
                </View>
                {/* 3rd row */}
                <View className="flex flex-row items-center gap-5">
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/inTime.png')}
                    status="In Time"
                    count={taskCounts['In Time']}
                  />
                  <TaskStatusCard
                    imageSource={require('../../../../../assets/commonAssets/Delayed.png')}
                    status="Delayed"
                    count={taskCounts?.Delayed}
                  />
                </View>
              </View>

              {userData?.data?.role === 'orgAdmin' ||
              userData?.data?.role === 'manager' ||
              userData?.user?.role === 'orgAdmin' ? (
                <>
                  <View className="mb-1 flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5">
                    <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#FC842C] p-5">
                      <TouchableOpacity className="h-full w-full">
                        <DashboardThree
                          title="Employee Wise"
                          count={assignedUsers.length}
                          date={'25th December, 2024'}
                          tasks={assignedUsers}
                          borderColor="#FC842C"
                          onPress={() => {
                            navigation.navigate('EmployeeWise', {
                              employeeWiseData: detailPageData,
                            });
                          }}
                        />
                      </TouchableOpacity>
                    </View>

                    <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#D85570] p-5">
                      <TouchableOpacity className="h-full w-full">
                        {/* Overdue Tasks */}
                        <DashboardCardTwo
                          title="Category Wise"
                          // count={taskCounts.Today}
                          count={groupedCategory.length}
                          date={'22-12-2024 to 28-12-2024'}
                          tasks={tasks}
                          status="Overdue"
                          borderColor="#D85570"
                          onPress={() => {
                            navigation.navigate('CategoryWise', {
                              employeeWiseData: groupedCategory,
                            });
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View className="mb-1 flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5">
                    <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#FDB314] p-5">
                      <TouchableOpacity className="h-full w-full">
                        <DashboardCardTwo
                          title="My Report"
                          count={myReports?.length}
                          tasks={tasks}
                          status="Pending"
                          borderColor="#FDB314"
                          colors={['#CCC', '#FFF']}
                          onPress={() => {
                            navigation.navigate('MyReports', { employeeWiseData: myReports });
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                    <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#A914DD] p-5">
                      <TouchableOpacity  onPress={() => {
                            navigation.navigate('Delegated', { employeeWiseData: delegatedData });
                          }} className="h-full w-full">
                        <DashboardCard
                          title="Delegated"
                          count={delegatedData?.length}
                          tasks={delegatedData}
                          status="Pending"
                          borderColor="#A914DD"
                          onPress={() => {
                            navigation.navigate('Delegated', { employeeWiseData: delegatedData });
                          }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : (
                <View className="mb-1 flex h-[14rem] w-[90%] flex-row items-start justify-center gap-2.5">
                  <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#FDB314] p-5">
                    <TouchableOpacity className="h-full w-full">
                      <DashboardCardTwo
                        title="My Report"
                        count={myReports?.length}
                        tasks={tasks}
                        status="Pending"
                        borderColor="#FDB314"
                        colors={['#CCC', '#FFF']}
                        onPress={() => {
                          navigation.navigate('MyReports', { employeeWiseData: myReports });
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  <View className="m-0.5 flex h-full w-1/2 flex-col rounded-3xl bg-[#A914DD] p-5">
                    <TouchableOpacity className="h-full w-full">
                      <DashboardCard
                        title="Delegated"
                        count={delegatedData?.length}
                        tasks={delegatedData}
                        status="Pending"
                        borderColor="#A914DD"
                        onPress={() => {
                          navigation.navigate('Delegated', { employeeWiseData: delegatedData });
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
