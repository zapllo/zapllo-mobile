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
  FlatList,
} from 'react-native';
import React, { useState, useMemo } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import NavbarTwo from '~/components/navbarTwo';
import CustomDropdown from '~/components/customDropDown';
import TaskCard from '~/components/TaskComponents/TaskCard';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Define navigation types
type Props = StackScreenProps<DashboardStackParamList, 'CategoryTasks'>;
type CategoryTasksScreenRouteProp = RouteProp<DashboardStackParamList, 'CategoryTasks'>;

// Status filter options
const statusFilters = [
  { label: 'All Tasks', value: 'all' },
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'InProgress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Overdue', value: 'Overdue' },
];

// Priority filter options
const priorityFilters = [
  { label: 'All Priorities', value: 'all' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

const CategoryTasksScreen: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<CategoryTasksScreenRouteProp>();
  const { categoryData, categoryName } = route.params;

  // State for filters and search
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');

  console.log('Category Tasks Data:', categoryData);
  console.log('Category Name:', categoryName);

  // Filter tasks based on search, status, and priority
  const filteredTasks = useMemo(() => {
    if (!categoryData?.tasks) return [];
    
    return categoryData.tasks.filter((task: any) => {
      // Search filter
      const matchesSearch = 
        task?.title?.toLowerCase().includes(search.toLowerCase()) ||
        task?.description?.toLowerCase().includes(search.toLowerCase()) ||
        task?.assignedUser?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
        task?.assignedUser?.lastName?.toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      const matchesStatus = selectedStatusFilter === 'all' || task?.status === selectedStatusFilter;
      
      // Priority filter
      const matchesPriority = selectedPriorityFilter === 'all' || task?.priority === selectedPriorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [categoryData?.tasks, search, selectedStatusFilter, selectedPriorityFilter]);

  // Calculate task statistics
  const taskStats = useMemo(() => {
    if (!categoryData?.tasks) return { total: 0, pending: 0, inProgress: 0, completed: 0, overdue: 0 };
    
    const tasks = categoryData.tasks;
    const now = new Date();
    
    return {
      total: tasks.length,
      pending: tasks.filter((task: any) => task?.status === 'Pending').length,
      inProgress: tasks.filter((task: any) => task?.status === 'InProgress' || task?.status === 'In Progress').length,
      completed: tasks.filter((task: any) => task?.status === 'Completed').length,
      overdue: tasks.filter((task: any) => 
        new Date(task?.dueDate) < now && task?.status !== 'Completed'
      ).length,
    };
  }, [categoryData?.tasks]);

  const renderTaskItem = ({ item }: { item: any }) => (
    <View style={styles.taskItemContainer}>
      <TaskCard
        task={item}
        onPress={() => {
          // Navigate to task details if needed
          console.log('Task pressed:', item.title);
        }}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <LinearGradient
        colors={['rgba(55, 56, 75, 0.8)', 'rgba(46, 46, 70, 0.6)']}
        style={styles.emptyStateCard}
      >
        <Ionicons name="document-outline" size={48} color="#787CA5" />
        <Text style={styles.emptyStateTitle}>No tasks found</Text>
        <Text style={styles.emptyStateSubtitle}>
          {search 
            ? 'Try adjusting your search criteria or filters'
            : 'No tasks available in this category'
          }
        </Text>
        {(search || selectedStatusFilter !== 'all' || selectedPriorityFilter !== 'all') && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setSearch('');
              setSelectedStatusFilter('all');
              setSelectedPriorityFilter('all');
            }}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0D28" />
      <NavbarTwo title={`${categoryName} Tasks`} />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.mainContainer}>
          {/* Header Section with Stats */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>{categoryName}</Text>
            <Text style={styles.headerSubtitle}>
              {filteredTasks.length} of {taskStats.total} tasks
            </Text>
            
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{taskStats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{taskStats.inProgress}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{taskStats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#EF4444' }]}>{taskStats.overdue}</Text>
                <Text style={styles.statLabel}>Overdue</Text>
              </View>
            </View>
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
                  placeholder="Search tasks..."
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

            {/* Filter Dropdowns */}
            <View style={styles.filtersRow}>
              <View style={styles.filterContainer}>
                <CustomDropdown
                  data={statusFilters}
                  placeholder="Status"
                  selectedValue={selectedStatusFilter}
                  onSelect={(value) => setSelectedStatusFilter(value)}
                />
              </View>
              <View style={styles.filterContainer}>
                <CustomDropdown
                  data={priorityFilters}
                  placeholder="Priority"
                  selectedValue={selectedPriorityFilter}
                  onSelect={(value) => setSelectedPriorityFilter(value)}
                />
              </View>
            </View>
          </View>

          {/* Tasks List */}
          <View style={styles.tasksListContainer}>
            <FlatList
              data={filteredTasks}
              renderItem={renderTaskItem}
              keyExtractor={(item, index) => `task-${item._id || index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyState}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default CategoryTasksScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  mainContainer: {
    flex: 1,
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
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(55, 56, 75, 0.3)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 12,
    color: '#A0A5C3',
    fontWeight: '500',
    fontFamily: 'System',
    marginTop: 4,
  },
  controlsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    width: '100%',
    marginBottom: 16,
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
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterContainer: {
    flex: 1,
  },
  tasksListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 100,
  },
  taskItemContainer: {
    marginBottom: 12,
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
    marginBottom: 16,
  },
  clearFiltersButton: {
    backgroundColor: '#A914DD',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  clearFiltersText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});