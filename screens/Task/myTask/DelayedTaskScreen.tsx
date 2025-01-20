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
  StyleSheet,
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

type Props = StackScreenProps<MyTasksStackParamList, 'DelayedTask'>;
type DelayedTaskScreenRouteProp = RouteProp<MyTasksStackParamList, 'DelayedTask'>;

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

const DelayedTaskScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<DelayedTaskScreenRouteProp>();
  const { delayedTasks } = route.params;

  const [selectedTeamSize, setSelectedTeamSize] = useState("This week");
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
   const [isChecked, setIsChecked] = useState(false);

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <View className="flex h-20 w-full flex-row items-center justify-between p-5">
        <View className="flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-full bg-[#37384B]">
          <TouchableOpacity onPress={() => navigation.navigate('DashboardHome')}>
            <AntDesign name="arrowleft" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text className="h-full pl-4 text-2xl font-semibold text-[#FFFFFF]">Delayed Tasks</Text>
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
              {delayedTasks?.length > 0 ? (
                delayedTasks.map((task:any) => (
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
            <Text className="text-lg text-white" style={{ fontFamily: "Lato-Regular" }}>
              Clear All
            </Text>
          </View>

          <View className="flex flex-row w-full border-y-[#37384B] border mb-6">
            <View className="w-[40%] border-r border-r-[#37384B] pb-20">
              <TouchableOpacity className="bg-[#37384B] items-start w-full h-14">
                <Text className="text-white px-6 p-4 h-full">Category</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-start w-full h-14 border-b border-b-[#37384B]">
                <Text className="text-white px-6 p-4 h-full">Assigned to</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-start w-full h-14 border-b border-b-[#37384B]">
                <Text className="text-white px-6 p-4 h-full">Frequency</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-start w-full h-14 border-b border-b-[#37384B]">
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

              <View className="flex w-full flex-row gap-3 items-center">
                <CheckboxTwo isChecked={isChecked} onPress={() => setIsChecked(!isChecked)} />
                <Text className="text-white text-lg">Customer Support</Text>
              </View>

              <View className="flex w-full flex-row gap-3 items-center">
                <CheckboxTwo isChecked={isChecked} onPress={() => setIsChecked(!isChecked)} />
                <Text className="text-white text-lg">Marketing</Text>
              </View>

              <View className="flex w-full flex-row gap-3 items-center">
                <CheckboxTwo isChecked={isChecked} onPress={() => setIsChecked(!isChecked)} />
                <Text className="text-white text-lg">Marketing</Text>
              </View>
            </View>
          </View>

          <GradientButton
            title="Apply Filter"
            onPress={() => console.log('Button pressed')}
            imageSource={""}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DelayedTaskScreen;
const styles = StyleSheet.create({
  input: {
    borderColor: '#37384B',
    borderWidth: 1,
    borderRadius: 30,
    padding: 10,
 
    display:"flex",
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    gap:5,

  },
  inputSome: {
    color: 'white',
    fontFamily: 'Lato-Regular',

  },
});
