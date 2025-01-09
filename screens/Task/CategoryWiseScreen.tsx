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
type Props = StackScreenProps<DashboardStackParamList, 'CategoryWise'>;
type CategoryWiseScreenRouteProp = RouteProp<DashboardStackParamList, 'CategoryWise'>;
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

const CategoryWiseScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<CategoryWiseScreenRouteProp>();
  const { employeeWiseData } = route.params;
  // const navigation = useNavigation<PendingTaskScreenRouteProp>();
  const [selectedTeamSize, setSelectedTeamSize] = useState(null);
  const [search, setSearch] = useState('');

  console.log('>>>>>EEEEEEEE', employeeWiseData);

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Category Wise" onBackPress={() => navigation.navigate('DashboardHome')} />

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

            <EmployeesDetaildComponent
              name="Shubhodeep Banerjee"
              overdue={3}
              pending={7}
              completed={10}
              inProgress={12}
            />
            <EmployeesDetaildComponent
              name="Deep Banerjee"
              overdue={10}
              pending={2}
              completed={5}
              inProgress={3}
            />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};
export default CategoryWiseScreen;
