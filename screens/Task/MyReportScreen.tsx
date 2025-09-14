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
  TouchableOpacity,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import NavbarTwo from '~/components/navbarTwo';
import { useNavigation } from 'expo-router';
import CustomDropdown from '~/components/customDropDown';
import EmployeesDetaildComponent from '~/components/TaskComponents/EmployeesDetaildComponent';
import { RouteProp, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import CategoryDetailComponent from '~/components/TaskComponents/CategoryDetailComponent';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

// Define the type for your navigation
type Props = StackScreenProps<DashboardStackParamList, 'MyReports'>;
type MyReportsScreenRouteProp = RouteProp<DashboardStackParamList, 'MyReports'>;

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

const MyReportScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<MyReportsScreenRouteProp>();
  const { employeeWiseData } = route.params;

  const [selectedTeamSize, setSelectedTeamSize] = useState("This Week");
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');

  console.log('🙏🏻🙏🏻🙏🏻🙏🏻🙏🏻🙏🏻🙏🏻🙏🏻🙏🏻E', JSON.stringify(employeeWiseData, null, 2));

  // Filter categories based on search and selected filter
  const filteredData = useMemo(() => {
    if (!employeeWiseData) return [];
    
    return employeeWiseData.filter((cat: any) => {
      // Search filter
      const matchesSearch = cat?.categoryName?.toLowerCase().includes(search.toLowerCase());
      
      // Category filter
      let matchesFilter = true;
      if (selectedFilter === 'pending' && cat?.Pending === 0) matchesFilter = false;
      if (selectedFilter === 'overdue' && cat?.Overdue === 0) matchesFilter = false;
      if (selectedFilter === 'completed' && cat?.Completed === 0) matchesFilter = false;
      
      return matchesSearch && matchesFilter;
    });
  }, [employeeWiseData, search, selectedFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D28" />
      <NavbarTwo title="My Reports" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Category Overview</Text>
            <Text style={styles.headerSubtitle}>
              {filteredData.length} categor{filteredData.length !== 1 ? 'ies' : 'y'} found
            </Text>
          </View>

          {/* Controls Section */}
          <View style={styles.controlsSection}>
            {/* Filter Dropdown */}
            <View style={styles.dropdownContainer}>
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedTeamSize}
                onSelect={(value) => setSelectedTeamSize(value)}
              />
            </View>

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
                  placeholder="Search categories..."
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


          </View>

          {/* Category List */}
          <View style={styles.categoryListContainer}>
            {filteredData.length > 0 ? (
              filteredData.map((cat, index) => {
                return (
                  <CategoryDetailComponent
                    key={`category-${cat?.categoryName}-${index}`}
                    name={cat?.categoryName}
                    overdue={cat?.Overdue || 0}
                    pending={cat?.Pending || 0}
                    completed={cat?.Completed || 0}
                    inProgress={cat?.InProgress || 0}
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
    </SafeAreaView>
  );
};

export default MyReportScreen;

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
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(55, 56, 75, 0.3)',
    alignItems: 'center',
  },
  filterButtonActive: {
    borderWidth: 1,
  },
  filterButtonAll: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonPending: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterButtonOverdue: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  filterButtonCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#787CA5',
    fontFamily: 'System',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  categoryListContainer: {
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