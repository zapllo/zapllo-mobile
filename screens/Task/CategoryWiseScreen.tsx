import {
  View,
  Text,
  SafeAreaView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  TextInput,
} from 'react-native';
import React, { useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import NavbarTwo from '~/components/navbarTwo';
import CustomDropdown from '~/components/customDropDown';
import CategoryDetailComponent from '~/components/TaskComponents/CategoryDetailComponent';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';

// Define navigation types
type Props = StackScreenProps<DashboardStackParamList, 'CategoryWise'>;
type CategoryWiseScreenRouteProp = RouteProp<DashboardStackParamList, 'CategoryWise'>;

// Dropdown filter options
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

  // State for dropdown selection and search filter
  const [selectedFilter, setSelectedFilter] = useState("This Week");
  const [search, setSearch] = useState('');

  console.log(employeeWiseData, 'Category Data');

  // Filter categories based on search input
  const filteredCategories = employeeWiseData.filter((cat) =>
    cat?.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="h-full flex-1 bg-primary  pb-20">
      <NavbarTwo title="Category Wise" />

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
                selectedValue={selectedFilter}
                onSelect={(value) => setSelectedFilter(value)}
              />
            </View>

            {/* Search Bar */}
            <View className="flex w-full flex-row items-center justify-center gap-5">
              <TextInput
                value={search}
                onChangeText={(value) => setSearch(value)}
                placeholder="Search Category"
                className="w-[90%] rounded-lg border border-[#37384B] p-4 text-white"
                placeholderTextColor="#787CA5"
              />
            </View>

            {/* Render Filtered Categories */}
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                console.log('Category Data:', cat);
                const pending = cat?.tasks?.filter((e: any) => e?.status === 'Pending');
                const completed = cat?.tasks?.filter((e: any) => e?.status === 'Completed');
                const inProgress = cat?.tasks?.filter((e: any) => e?.status === 'InProgress');
                const overdue = cat?.tasks?.filter((e: any) => e?.status === 'Overdue');

                return (
                  <CategoryDetailComponent
                    key={cat?.category} // Ensure a unique key
                    name={cat?.category}
                    overdue={overdue?.length ?? 0}
                    pending={pending?.length ?? 0}
                    completed={completed?.length ?? 0}
                    inProgress={inProgress?.length ?? 0}
                  />
                );
              })
            ) : (
              <Text className="text-white mt-5">No categories found</Text>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default CategoryWiseScreen;
