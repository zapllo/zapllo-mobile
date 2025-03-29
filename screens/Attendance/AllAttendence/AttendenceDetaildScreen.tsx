import React, { useState, useEffect } from "react";
import { 
  Image, 
  Keyboard, 
  SafeAreaView, 
  StyleSheet, 
  Text, 
  TouchableWithoutFeedback, 
  View,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Animated
} from "react-native";
import NavbarTwo from "~/components/navbarTwo";
import { KeyboardAvoidingView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import moment from "moment";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomDropdown from "~/components/customDropDown";
import CustomDateRangeModal from "~/components/Dashboard/CustomDateRangeModal";
import LottieView from "lottie-react-native";

// Define date filter options
const daysData = [
  { label: 'Today', value: 'Today' },
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

// Define types for our data
interface AttendanceEntry {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  action: "login" | "logout";
  lat: number;
  lng: number;
  timestamp: string;
  loginTime?: string;
  logoutTime?: string;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProcessedDay {
  date: string;
  formattedDate: string;
  login: {
    timestamp: string;
  } | null;
  logout: {
    timestamp: string;
  } | null;
  totalHours: number;
  overtime: number;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.9;
const HEADER_MAX_HEIGHT = 180; // Maximum height of header (profile + dropdown)
const HEADER_MIN_HEIGHT = 0; // Minimum height when collapsed
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function AttendenceDetailsScreen() {
  const params = useLocalSearchParams();
  const { 
    userId, 
    userName, 
    firstName, 
    lastName,
    workingHours: workingHoursParam,
    totalHours: totalHoursParam,
    overtime: overtimeParam,
    profilePic
  } = params;
  
  // Parse numeric values from params
  const workingHours = workingHoursParam ? parseInt(workingHoursParam as string, 10) : 40;
  
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<ProcessedDay[]>([]);
  const [displayName, setDisplayName] = useState(userName as string || `${firstName} ${lastName}` || "User");
  const scrollY = new Animated.Value(0);
  const [selectedFilter, setSelectedFilter] = useState('This Week');
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Get date range based on selected filter
  const getDateRange = () => {
    const now = new Date();
    
    switch (selectedFilter) {
      case 'Today':
        return {
          startDate: moment().startOf('day'),
          endDate: moment().endOf('day')
        };
      case 'Yesterday':
        return {
          startDate: moment().subtract(1, 'days').startOf('day'),
          endDate: moment().subtract(1, 'days').endOf('day')
        };
      case 'This Week':
        return {
          startDate: moment().startOf('week'),
          endDate: moment().endOf('week')
        };
      case 'Last Week':
        return {
          startDate: moment().subtract(1, 'weeks').startOf('week'),
          endDate: moment().subtract(1, 'weeks').endOf('week')
        };
      case 'Next Week':
        return {
          startDate: moment().add(1, 'weeks').startOf('week'),
          endDate: moment().add(1, 'weeks').endOf('week')
        };
      case 'This Month':
        return {
          startDate: moment().startOf('month'),
          endDate: moment().endOf('month')
        };
      case 'Next Month':
        return {
          startDate: moment().add(1, 'months').startOf('month'),
          endDate: moment().add(1, 'months').endOf('month')
        };
      case 'This Year':
        return {
          startDate: moment().startOf('year'),
          endDate: moment().endOf('year')
        };
      case 'Custom':
        if (customStartDate && customEndDate) {
          return {
            startDate: moment(customStartDate).startOf('day'),
            endDate: moment(customEndDate).endOf('day')
          };
        }
        // Fall through to default if no custom dates set
      default:
        return {
          startDate: moment().subtract(1, 'year'),
          endDate: moment()
        };
    }
  };

  // Fetch attendance data from the main API and filter for this user
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        
        // Get date range based on selected filter
        const dateRange = getDateRange();
        
        // Use the main attendance API with date range parameters
        const response = await axios.get("https://zapllo.com/api/get-all-attendance", {
          params: {
            startDate: dateRange.startDate.toISOString(),
            endDate: dateRange.endDate.toISOString()
          }
        });
        
        if (response.data && response.data.success) {
          const allEntries = response.data.entries || [];
          
          // Filter entries for the specific user
          const userEntries = allEntries.filter((entry: AttendanceEntry) => 
            entry.userId && entry.userId._id === userId
          );
          
          const processedData = processAttendanceData(userEntries, workingHours);
          setAttendanceData(processedData);
        } else {
          Alert.alert("Error", "Failed to fetch attendance data");
        }
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        Alert.alert("Error", "An error occurred while fetching attendance data");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAttendanceData();
    } else {
      setLoading(false);
    }
  }, [userId, workingHours, selectedFilter, customStartDate, customEndDate]);

  // Process raw attendance data into daily records
  const processAttendanceData = (entries: AttendanceEntry[], userWorkingHours: number): ProcessedDay[] => {
    // Group entries by date
    const entriesByDate = new Map<string, AttendanceEntry[]>();
    
    entries.forEach(entry => {
      const date = moment(entry.timestamp).format('YYYY-MM-DD');
      if (!entriesByDate.has(date)) {
        entriesByDate.set(date, []);
      }
      entriesByDate.get(date)?.push(entry);
    });
    
    // Process each day's entries
    const processedDays: ProcessedDay[] = [];
    
    entriesByDate.forEach((dayEntries, date) => {
      // For "Today" filter, only include today's data
      if (selectedFilter === 'Today' && !moment(date).isSame(moment(), 'day')) {
        return;
      }
      
      // For "Yesterday" filter, only include yesterday's data
      if (selectedFilter === 'Yesterday' && !moment(date).isSame(moment().subtract(1, 'day'), 'day')) {
        return;
      }
      
      // Sort entries by timestamp
      dayEntries.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Find first login and last logout
      let firstLogin: AttendanceEntry | null = null;
      let lastLogout: AttendanceEntry | null = null;
      
      for (const entry of dayEntries) {
        if (entry.action === 'login' && (!firstLogin || new Date(entry.timestamp) < new Date(firstLogin.timestamp))) {
          firstLogin = entry;
        }
        if (entry.action === 'logout' && (!lastLogout || new Date(entry.timestamp) > new Date(lastLogout.timestamp))) {
          lastLogout = entry;
        }
      }
      
      // Calculate total hours
      let totalHours = 0;
      if (firstLogin && lastLogout) {
        const loginTime = new Date(firstLogin.timestamp);
        const logoutTime = new Date(lastLogout.timestamp);
        const diffMs = logoutTime.getTime() - loginTime.getTime();
        totalHours = diffMs / (1000 * 60 * 60);
      }
      
      // Calculate overtime based on the user's working hours
      const overtime = Math.max(0, totalHours - userWorkingHours);
      
      // Format the date for display
      const formattedDate = moment(date).format('ddd, MMMM D');
      
      processedDays.push({
        date,
        formattedDate,
        login: firstLogin ? { timestamp: firstLogin.timestamp } : null,
        logout: lastLogout ? { timestamp: lastLogout.timestamp } : null,
        totalHours,
        overtime
      });
    });
    
    // Sort by date (newest first)
    processedDays.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return processedDays;
  };

  // Format time for display
  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return "N/A";
    return moment(timestamp).format('hh:mm A');
  };

  // Format hours and minutes
  const formatHours = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}hr ${minutes}min`;
  };

  // Get color based on hours worked
  const getHoursColor = (hours: number) => {
    if (hours >= 8) {
      return "#06D6A0"; // Green for 8+ hours
    } else if (hours >= 6) {
      return "#F97520"; // Orange for 6-8 hours
    } else {
      return "#EF4444"; // Red for less than 6 hours
    }
  };

  // Render profile avatar
  const renderProfileAvatar = () => {
    if (profilePic) {
      return (
        <Image 
          source={{ uri: profilePic as string }} 
          style={styles.profileImage}
        />
      );
    } else {
      // Generate initials and background color
      const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
      const getColorFromName = (name: string) => {
        const colors = [
          '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
          '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
          '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
          hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
      };
      
      const backgroundColor = getColorFromName(displayName);
      
      return (
        <View style={[styles.profileInitials, { backgroundColor }]}>
          <Text style={styles.initialsText}>
            {initials}
          </Text>
        </View>
      );
    }
  };

  // Render each attendance day item
  const renderAttendanceItem = ({ item, index }: { item: ProcessedDay, index: number }) => {
    // Determine if the day is today
    const isToday = moment(item.date).isSame(moment(), 'day');
    
    return (
      <Animated.View 
        style={[
          styles.cardContainer,
          {
            transform: [
              { 
                scale: scrollY.interpolate({
                  inputRange: [-50, 0, 100 * index, 100 * (index + 2)],
                  outputRange: [1, 1, 1, 0.9],
                  extrapolate: 'clamp'
                }) 
              }
            ],
            opacity: scrollY.interpolate({
              inputRange: [100 * (index - 1), 100 * index, 100 * (index + 1)],
              outputRange: [1, 1, 0.7],
              extrapolate: 'clamp'
            })
          }
        ]}
      >
        <LinearGradient
          colors={isToday ? ['#4A3B8B', '#2D2A4A'] : ['#2D2A4A', '#1F1D36']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Date header with badge for today */}
          <View style={styles.dateHeader}>
            <Text style={styles.dateText}>{item.formattedDate}</Text>
            {isToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>TODAY</Text>
              </View>
            )}
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Time logs section */}
          <View style={styles.timeLogsContainer}>
            {/* Login section */}
            <View style={styles.timeSection}>
              <View style={styles.timeHeaderRow}>
                <View style={styles.iconContainer}>
                  <Image 
                    source={require("../../../assets/Attendence/loginLogout.png")} 
                    className="w-5 h-5"
                  />
                </View>
                <Text style={styles.timeLabel}>Log In</Text>
              </View>
              
              <Text style={styles.timeValue}>{formatTime(item.login?.timestamp)}</Text>
            </View>
            
            {/* Center divider */}
            <View style={styles.centerDivider} />
            
            {/* Logout section */}
            <View style={styles.timeSection}>
              <View style={styles.timeHeaderRow}>
                <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                <Image 
                    source={require("../../../assets/Attendence/loginLogout.png")} 
                    className="w-5 h-5"
                  />
                </View>
                <Text style={styles.timeLabel}>Log Out</Text>
              </View>
              
              <Text style={styles.timeValue}>{formatTime(item.logout?.timestamp)}</Text>
            </View>
          </View>
          
          {/* Stats section */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Hours</Text>
              <Text style={[styles.statValue, { color: getHoursColor(item.totalHours) }]}>
                {formatHours(item.totalHours)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Overtime</Text>
              {item.overtime > 0 ? (
                <Text style={[styles.statValue, { color: "#06D6A0" }]}>
                  {formatHours(item.overtime)}
                </Text>
              ) : (
                <Text style={styles.statValueNA}>N/A</Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  // Render empty list component
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>

                <LottieView
                source={require('../../../assets/Animation/no-data.json')}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />

          <Text className="text-[#787CA5]  text-center" style={{ fontFamily: "LatoBold" }}>No attendance records found.</Text>
      <Text style={styles.emptySubtext}>
        Attendance records will appear here once logged
      </Text>
    </View>
  );

  // Render list header with summary
  const renderListHeader = () => {
    if (attendanceData.length === 0) return null;
    
    // Calculate total hours and days
    const totalDays = attendanceData.length;
    const totalHours = attendanceData.reduce((sum, day) => sum + day.totalHours, 0);
    const totalOvertime = attendanceData.reduce((sum, day) => sum + day.overtime, 0);
    
    return (
      <View style={styles.summaryContainer}>
        <LinearGradient
          colors={['#4A3B8B', '#2D2A4A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryGradient}
        >
          <Text style={styles.summaryTitle}>Attendance Summary</Text>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{totalDays}</Text>
              <Text style={styles.summaryStatLabel}>Days</Text>
            </View>
            
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{Math.round(totalHours)}</Text>
              <Text style={styles.summaryStatLabel}>Hours</Text>
            </View>
            
            <View style={styles.summaryStat}>
              <Text style={styles.summaryStatValue}>{Math.round(totalOvertime)}</Text>
              <Text style={styles.summaryStatLabel}>Overtime</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  // Add handleCustomDateApply function
  const handleCustomDateApply = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setIsCustomDateModalVisible(false);
  };

  // Calculate header animations
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -HEADER_MAX_HEIGHT],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <NavbarTwo title="Attendance Details" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={styles.content}>
          <Animated.View style={[
            styles.headerContainer,
            {
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity,
            }
          ]}>
            <View style={[styles.profileContainer, { height: HEADER_MAX_HEIGHT }]}>
              {renderProfileAvatar()}
              <Text style={styles.profileName}>{displayName}</Text>
              <View style={styles.workingHoursContainer}>
                <Text style={styles.workingHoursLabel}>Working Hours: </Text>
                <Text style={styles.workingHoursValue}>{workingHours}hr</Text>
              </View>
            </View>

            <View style={styles.dropdownContainer}>
              <CustomDropdown
                data={daysData}
                placeholder="Select Filters"
                selectedValue={selectedFilter}
                onSelect={(value) => {
                  setSelectedFilter(value);
                  if (value === 'Custom') {
                    setIsCustomDateModalVisible(true);
                  }
                }}
              />
            </View>
          </Animated.View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#815BF5" />
            </View>
          ) : (
            <Animated.FlatList
              data={attendanceData}
              renderItem={renderAttendanceItem}
              keyExtractor={(item) => item.date}
              ListEmptyComponent={renderEmptyList}
              ListHeaderComponent={renderListHeader}
              contentContainerStyle={[
                styles.listContent,
                { paddingTop: HEADER_MAX_HEIGHT + 80 } // Increased padding to account for header and dropdown
              ]}
              showsVerticalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                { useNativeDriver: true }
              )}
              scrollEventThrottle={16}
            />
          )}

          {/* Add CustomDateRangeModal */}
          <CustomDateRangeModal
            isVisible={isCustomDateModalVisible}
            onClose={() => setIsCustomDateModalVisible(false)}
            onApply={handleCustomDateApply}
            initialStartDate={customStartDate || new Date()}
            initialEndDate={customEndDate || new Date()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E', // Darker primary background
  },
  content: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A2E',
    overflow: 'hidden',
    zIndex: 999,
  },
  profileContainer: {
    width: '100%',
    alignItems: 'center',
   
    paddingTop: 14,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#815BF5',
  },
  profileInitials: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#815BF5',
  },
  initialsText: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  workingHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  workingHoursLabel: {
    color: '#676B93',
    fontSize: 14,
  },
  workingHoursValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 80,
    paddingTop: 8,
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  todayBadge: {
    backgroundColor: '#815BF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  timeLogsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeSection: {
    flex: 1,
    alignItems: 'center',
  },
  timeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoutIconContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    transform: [{ rotate: '180deg' }],
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: 'white',
  },
  timeLabel: {
    color: '#A0A0C8',
    fontSize: 14,
  },
  timeValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  centerDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#A0A0C8',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statValueNA: {
    color: '#676B93',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#676B93',
    fontSize: 14,
    textAlign: 'center',
  },
  summaryContainer: {
    width: cardWidth,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 16,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryStatValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryStatLabel: {
    color: '#A0A0C8',
    fontSize: 14,
    marginTop: 4,
  },
  dropdownContainer: {
    width: '100%',
    alignItems: 'center',
    
  },
});
