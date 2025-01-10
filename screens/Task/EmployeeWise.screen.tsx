import {
  View,
  Text,
  SafeAreaView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  TextInput,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import NavbarTwo from '~/components/navbarTwo';
import { useNavigation } from 'expo-router';
import CustomDropdown from '~/components/customDropDown';
import EmployeesDetaildComponent from '~/components/TaskComponents/EmployeesDetaildComponent';
import { RouteProp, useRoute } from '@react-navigation/native';

// Define the type for your navigation
type Props = StackScreenProps<DashboardStackParamList, 'EmployeeWise'>;
type EmployeeWiseScreenRouteProp = RouteProp<DashboardStackParamList, 'EmployeeWise'>;
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

const EmployeeWiseScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<EmployeeWiseScreenRouteProp>();
  const { employeeWiseData } = route.params;
  // const navigation = useNavigation<PendingTaskScreenRouteProp>();
  const [selectedTeamSize, setSelectedTeamSize] = useState(null);
  const [search, setSearch] = useState('');

  
  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Employee Wise" onBackPress={() => navigation.navigate('DashboardHome')} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="mb-20 flex-1 items-center">
            {/* Dropdown */}
            <View className="mb-3 mt-4 flex w-full items-center">
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

            {/* Search Bar for employee */}
            <View className="flex w-full flex-row items-center justify-center gap-5">
              <TextInput
                value={search}
                onChangeText={(value) => setSearch(value)}
                placeholder="Search Employee"
                className="w-[90%] rounded-full border border-[#37384B] p-4 text-[#787CA5]"
                placeholderTextColor="#787CA5"
              />
            </View>

            {employeeWiseData.map((employee) => {
              const pending = employee.filter((e: any) => e?.status === 'Pending');
              const completed = employee.filter((e: any) => e?.status === 'Completed');
              const inProgress = employee.filter((e: any) => e?.status === 'InProgress');
              const overdue = employee.filter((e: any) => e?.status === 'Overdue');

              return (
                <EmployeesDetaildComponent
                  name={`${employee[0]?.assignedUser?.firstName} ${employee[0]?.assignedUser?.lastName}`}
                  overdue={overdue?.length}
                  pending={pending.length}
                  completed={completed.length}
                  inProgress={inProgress?.length}
                />
              );
            })}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default EmployeeWiseScreen;
