import {
  View,
  Text,
  SafeAreaView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  TextInput,
  StyleSheet,
  StatusBar,
} from 'react-native';
import React, { useState } from 'react';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import NavbarTwo from '~/components/navbarTwo';
import { useNavigation } from 'expo-router';
import CustomDropdown from '~/components/customDropDown';
import EmployeesDetaildComponent from '~/components/TaskComponents/EmployeesDetaildComponent';
import { RouteProp, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';

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
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);

  // Filter employees based on search input
  const filteredEmployees = employeeWiseData.filter((employee) => {
    const employeeName = `${employee[0]?.assignedUser?.firstName} ${employee[0]?.assignedUser?.lastName}`;
    return employeeName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D28" />
      <NavbarTwo title="Employee Wise" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Team Overview</Text>
            <Text style={styles.headerSubtitle}>
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          {/* Controls Section */}
          <View style={styles.controlsSection}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <LinearGradient
                colors={['rgba(55, 56, 75, 0.8)', 'rgba(46, 46, 70, 0.6)']}
                style={styles.searchInputContainer}
              >
                <Ionicons name="search" size={20} color="#787CA5" style={styles.searchIcon} />
                <TextInput
                  value={search}
                  onChangeText={(value) => setSearch(value)}
                  placeholder="Search employees..."
                  style={styles.searchInput}
                  placeholderTextColor="#787CA5"
                />
                {search.length > 0 && (
                  <TouchableWithoutFeedback onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={20} color="#787CA5" />
                  </TouchableWithoutFeedback>
                )}
              </LinearGradient>
            </View>

            {/* Filter Dropdown */}
            <View style={styles.dropdownContainer}>
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedTeamSize}
                onSelect={(value) => {
                  if (value === 'Custom') {
                    setIsCustomDateModalOpen(true);
                  } else {
                    setSelectedTeamSize(value);
                  }
                }}
              />
            </View>
          </View>

          {/* Employee List */}
          <View style={styles.employeeListContainer}>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => {
                const pending = employee.filter((e: any) => e?.status === 'Pending');
                const completed = employee.filter((e: any) => e?.status === 'Completed');
                const inProgress = employee.filter((e: any) => e?.status === 'InProgress');
                const overdue = employee.filter((e: any) => e?.status === 'Overdue');

                return (
                  <EmployeesDetaildComponent
                    key={`${employee[0]?.assignedUser?._id}-${index}`}
                    name={`${employee[0]?.assignedUser?.firstName} ${employee[0]?.assignedUser?.lastName}`}
                    profilePic={employee[0]?.assignedUser?.profilePic || ''}
                    userId={employee[0]?.assignedUser?._id}
                    overdue={overdue.length}
                    pending={pending.length}
                    completed={completed.length}
                    inProgress={inProgress.length}
                  />
                );
              })
            ) : (
              <View style={styles.emptyStateContainer}>
                <LottieView
                  source={require('~/assets/Animation/no-data.json')}
                  loop
                  style={styles.lottieAnimation}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      
      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        isVisible={isCustomDateModalOpen}
        onClose={() => setIsCustomDateModalOpen(false)}
        onApply={(startDate: Date, endDate: Date) => {
          setSelectedTeamSize('Custom');
          setIsCustomDateModalOpen(false);
        }}
        initialStartDate={new Date()}
        initialEndDate={new Date()}
      />
    </SafeAreaView>
  );
};

export default EmployeeWiseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'System',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A0A5C3',
    fontWeight: '500',
    fontFamily: 'System',
  },
  controlsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dropdownContainer: {
    marginBottom: 0,
  },
  searchContainer: {
    width: '100%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '500',
  },
  employeeListContainer: {
    paddingHorizontal: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 60,
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '500',
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
});
