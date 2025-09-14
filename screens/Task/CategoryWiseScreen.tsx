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
import { StackScreenProps } from '@react-navigation/stack';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import NavbarTwo from '~/components/navbarTwo';
import CustomDropdown from '~/components/customDropDown';
import CategoryDetailComponent from '~/components/TaskComponents/CategoryDetailComponent';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';

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
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);

  console.log(employeeWiseData, 'Category Data');

  // Handle category press to navigate to CategoryTasks screen
  const handleCategoryPress = (categoryData: any, categoryName: string) => {
    navigation.navigate('CategoryTasks', {
      categoryData: categoryData,
      categoryName: categoryName,
    });
  };

  // Filter categories based on search and selected filter
  const filteredData = useMemo(() => {
    if (!employeeWiseData) return [];
    
    return employeeWiseData.filter((cat: any) => {
      // Search filter
      const matchesSearch = cat?.category?.toLowerCase().includes(search.toLowerCase());
      
      // Calculate task counts
      const pending = cat?.tasks?.filter((e: any) => e?.status === 'Pending')?.length || 0;
      const completed = cat?.tasks?.filter((e: any) => e?.status === 'Completed')?.length || 0;
      const overdue = cat?.tasks?.filter((e: any) => e?.status === 'Overdue')?.length || 0;
      
      // Status filter
      let matchesFilter = true;
      if (selectedStatusFilter === 'pending' && pending === 0) matchesFilter = false;
      if (selectedStatusFilter === 'overdue' && overdue === 0) matchesFilter = false;
      if (selectedStatusFilter === 'completed' && completed === 0) matchesFilter = false;
      
      return matchesSearch && matchesFilter;
    });
  }, [employeeWiseData, search, selectedStatusFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D28" />
      <NavbarTwo title="Category Wise" />

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

            {/* Filter Dropdown */}
            <View style={styles.dropdownContainer}>
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedFilter}
                onSelect={(value) => {
                  if (value === 'Custom') {
                    setIsCustomDateModalOpen(true);
                  } else {
                    setSelectedFilter(value);
                  }
                }}
              />
            </View>
          </View>

          {/* Category List */}
          <View style={styles.categoryListContainer}>
            {filteredData.length > 0 ? (
              filteredData.map((cat, index) => {
                const pending = cat?.tasks?.filter((e: any) => e?.status === 'Pending');
                const completed = cat?.tasks?.filter((e: any) => e?.status === 'Completed');
                const inProgress = cat?.tasks?.filter((e: any) => e?.status === 'InProgress');
                const overdue = cat?.tasks?.filter((e: any) => e?.status === 'Overdue');

                return (
                  <CategoryDetailComponent
                    key={`category-${cat?.category}-${index}`}
                    name={cat?.category}
                    overdue={overdue?.length ?? 0}
                    pending={pending?.length ?? 0}
                    completed={completed?.length ?? 0}
                    inProgress={inProgress?.length ?? 0}
                    onPress={() => handleCategoryPress(cat, cat?.category)}
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
          setSelectedFilter('Custom');
          setIsCustomDateModalOpen(false);
        }}
        initialStartDate={new Date()}
        initialEndDate={new Date()}
      />
    </SafeAreaView>
  );
};

export default CategoryWiseScreen;

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