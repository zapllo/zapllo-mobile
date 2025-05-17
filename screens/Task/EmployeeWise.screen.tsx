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
  const [selectedTeamSize, setSelectedTeamSize] = useState("This Week");
  const [search, setSearch] = useState('');

  console.log(employeeWiseData, 'data?');

  // Filter employees based on search input
  const filteredEmployees = employeeWiseData.filter((employee) => {
    const employeeName = `${employee[0]?.assignedUser?.firstName} ${employee[0]?.assignedUser?.lastName}`;
    return employeeName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SafeAreaView className="h-full flex-1 bg-primary  pb-20">
      <NavbarTwo title="Employee Wise" />

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

            {/* Search Bar */}
            <View className="flex w-full flex-row items-center justify-center gap-5">
              <TextInput
                value={search}
                onChangeText={(value) => setSearch(value)}
                placeholder="Search Employee"
                className="w-[90%] rounded-lg border border-[#37384B] p-4 text-white"
                placeholderTextColor="#787CA5"
              />
            </View>

            {/* Render Filtered Employees */}
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                console.log('Employee Data:', employee);
                console.log('Assigned User:', employee[0]?.assignedUser);
                console.log('Profile Pic:', employee[0]?.assignedUser?.profilePic);
                const pending = employee.filter((e: any) => e?.status === 'Pending');
                const completed = employee.filter((e: any) => e?.status === 'Completed');
                const inProgress = employee.filter((e: any) => e?.status === 'InProgress');
                const overdue = employee.filter((e: any) => e?.status === 'Overdue');

                return (
                  <EmployeesDetaildComponent
                    key={employee[0]?.assignedUser?.firstName} // Ensure a unique key
                    name={`${employee[0]?.assignedUser?.firstName} ${employee[0]?.assignedUser?.lastName}`}
                    profilePic={employee[0]?.assignedUser?.profilePic || ''}
                    overdue={overdue.length}
                    pending={pending.length}
                    completed={completed.length}
                    inProgress={inProgress.length}
                  />
                );
              })
            ) : (
              <Text className="text-white mt-5">No employees found</Text>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default EmployeeWiseScreen;
