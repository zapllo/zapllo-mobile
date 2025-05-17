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
import React, { useState, useEffect } from 'react';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import NavbarTwo from '~/components/navbarTwo';
import { useNavigation } from 'expo-router';
import CustomDropdown from '~/components/customDropDown';
import EmployeesDetaildComponent from '~/components/TaskComponents/EmployeesDetaildComponent';
import { RouteProp, useRoute } from '@react-navigation/native';

// Define the type for your navigation
type Props = StackScreenProps<DashboardStackParamList, 'Delegated'>;
type DelegatedScreenRouteProp = RouteProp<DashboardStackParamList, 'Delegated'>;

interface Task {
  _id: string;
  status: string;
  assignedUser: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePic?: string;
  };
}

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

const DelegatedScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<DelegatedScreenRouteProp>();
  const { employeeWiseData } = route.params;
  const [selectedTeamSize, setSelectedTeamSize] = useState("This Week");
  const [search, setSearch] = useState('');
  const [groupedByEmployee, setGroupedByEmployee] = useState<Record<string, Task[]>>({});
  const [filteredEmployees, setFilteredEmployees] = useState<string[]>([]);

  // Group tasks by employee
  useEffect(() => {
    if (!employeeWiseData || !Array.isArray(employeeWiseData)) {
      console.error("employeeWiseData is not an array:", employeeWiseData);
      return;
    }

    // Group tasks by assignedUser._id
    const grouped = employeeWiseData.reduce((acc: Record<string, Task[]>, task: Task) => {
      if (!task || !task.assignedUser || !task.assignedUser._id) {
        console.log("Invalid task:", task);
        return acc;
      }
      
      const userId = task.assignedUser._id;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(task);
      return acc;
    }, {});
    
    setGroupedByEmployee(grouped);
    setFilteredEmployees(Object.keys(grouped));
  }, [employeeWiseData]);

  // Filter employees based on search
  useEffect(() => {
    if (!search) {
      setFilteredEmployees(Object.keys(groupedByEmployee));
      return;
    }

    const filtered = Object.keys(groupedByEmployee).filter(employeeId => {
      const tasks = groupedByEmployee[employeeId];
      if (!tasks || !tasks.length) return false;
      
      const employee = tasks[0].assignedUser;
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
    
    setFilteredEmployees(filtered);
  }, [search, groupedByEmployee]);

  return (
    <SafeAreaView className="h-full flex-1 bg-primary pb-20">
      <NavbarTwo title="Delegated"/>

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

            {/* Display employees */}
            {filteredEmployees.length === 0 ? (
              <View className="flex-1 items-center justify-center p-5">
                <Text className="text-white text-lg">No delegated tasks found</Text>
              </View>
            ) : (
              filteredEmployees.map(employeeId => {
                const tasks = groupedByEmployee[employeeId] || [];
                if (!tasks.length || !tasks[0].assignedUser) return null;
                
                const employee = tasks[0].assignedUser;
                
                // Calculate status counts
                const statusCounts = tasks.reduce((counts, task) => {
                  const status = task.status || 'Unknown';
                  counts[status] = (counts[status] || 0) + 1;
                  return counts;
                }, {} as Record<string, number>);
                
                return (
                  <EmployeesDetaildComponent
                    key={employeeId}
                    name={`${employee.firstName} ${employee.lastName}`}
                    profilePic={employee.profilePic}
                    overdue={statusCounts['Overdue'] || 0}
                    pending={statusCounts['Pending'] || 0}
                    completed={statusCounts['Completed'] || 0}
                    inProgress={statusCounts['In Progress'] || 0}
                  />
                );
              })
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default DelegatedScreen;