import React, { useState } from 'react';
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
  
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import ProfileButton from '~/components/profile/ProfileButton';
import CustomDropdown from '~/components/customDropDown';
import TaskDetailedComponent from '~/components/TaskComponents/TaskDetailedComponent';

import { MyTasksStackParamList } from './myTask/MyTaskStack';

type Props = StackScreenProps<MyTasksStackParamList, 'PendingTask'>;
type PendingTaskScreenRouteProp = RouteProp<MyTasksStackParamList, 'PendingTask'>;

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

const PendingTaskScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<PendingTaskScreenRouteProp>();
  const { pendingTasks } = route.params;

  const [selectedTeamSize, setSelectedTeamSize] = useState(null);
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <View className="flex h-20 w-full flex-row items-center justify-between p-5">
        <View className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full bg-[#37384B]">
          <TouchableOpacity onPress={() => navigation.navigate('DashboardHome')}>
            <AntDesign name="arrowleft" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text className="h-full pl-4 text-2xl font-semibold text-[#FFFFFF]">Pending</Text>
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
              <View className="h-14 w-14 rounded-full bg-[#37384B]">
                <Image
                  source={require('../../assets/commonAssets/filter.png')}
                  className="h-full w-full"
                />
              </View>
            </View>

            <ScrollView>
              {pendingTasks?.length > 0 ? (
                pendingTasks.map((task) => (
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
                  />
                ))
              ) : (
                <Text className='text-white text-2xl mt-20 '>No pending tasks available.</Text>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default PendingTaskScreen;