import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import NavbarTwo from '~/components/navbarTwo';
import { router } from 'expo-router';
import axios from 'axios';

// Define types for our data
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePic?: string;
  reportingManager?: {
    _id: string;
    firstName: string;
    lastName: string;
  } | null;
  // Add working hours field
  workingHours?: number;
}

interface AttendanceEntry {
  _id: string;
  userId: User;
  action: string;
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

interface RegularizationEntry {
  _id: string;
  userId: User;
  action: string;
  timestamp: string;
  loginTime: string;
  logoutTime: string;
  remarks: string;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  approvedAt?: string;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  notes?: string;
}

// Helper function to get a color based on name
const getColorFromName = (name: string) => {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFC107', '#FF9800', '#FF5722'
  ];
  
  // Simple hash function to get a consistent color for a name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use the hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Profile Avatar component
const ProfileAvatar = ({ user, size = 48 }) => {
  if (user.profilePic) {
    return (
      <Image 
        source={{ uri: user.profilePic }} 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: size / 2 
        }}
      />
    );
  } else {
    const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    const backgroundColor = getColorFromName(`${user.firstName} ${user.lastName}`);
    
    return (
      <View 
        style={{ 
          width: size, 
          height: size, 
          borderRadius: size / 2, 
          backgroundColor, 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        <Text 
          style={{ 
            color: 'white', 
            fontSize: size / 2.5, 
            fontWeight: 'bold' 
          }}
        >
          {initials}
        </Text>
      </View>
    );
  }
};

// Helper function to process attendance data with dynamic working hours
const processAttendanceData = (entries: AttendanceEntry[], usersMap: Map<string, any>) => {
  // Group entries by user
  const userMap = new Map();
  
  entries.forEach(entry => {
    const userId = entry.userId._id;
    if (!userMap.has(userId)) {
      // Get additional user data from usersMap if available
      const userData = usersMap.get(userId);
      
      // Use working hours directly from the API
      const workingHours = userData?.workingHours;
      
      userMap.set(userId, {
        userId: userId,
        userName: `${entry.userId.firstName} ${entry.userId.lastName}`,
        firstName: entry.userId.firstName,
        lastName: entry.userId.lastName,
        profilePic: userData?.profilePic || null,
        workingHours: workingHours, // Store working hours for this user
        entries: [],
        loginCount: 0,
        logoutCount: 0,
        totalHours: 0,
        overtime: 0,
        // Store the full user data for passing to details screen
        fullUserData: userData
      });
    }
    
    const userData = userMap.get(userId);
    userData.entries.push(entry);
    
    if (entry.action === 'login') {
      userData.loginCount++;
    } else if (entry.action === 'logout') {
      userData.logoutCount++;
    }
  });
  
  // Calculate hours for each user
  userMap.forEach(userData => {
    // Sort entries by timestamp
    userData.entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    let totalMinutes = 0;
    let loginTime = null;
    
    // Calculate work hours based on login/logout pairs
    userData.entries.forEach(entry => {
      if (entry.action === 'login') {
        loginTime = new Date(entry.timestamp);
      } else if (entry.action === 'logout' && loginTime) {
        const logoutTime = new Date(entry.timestamp);
        const diffMinutes = (logoutTime.getTime() - loginTime.getTime()) / (1000 * 60);
        totalMinutes += diffMinutes;
        loginTime = null;
      }
    });
    
    // Convert minutes to hours
    userData.totalHours = Math.round(totalMinutes / 60);
    
    // Calculate overtime based on user's working hours
    userData.overtime = userData.totalHours > userData.workingHours ? userData.totalHours - userData.workingHours : 0;
    
    // Calculate progress percentage based on user's working hours
    userData.progress = Math.min((userData.totalHours / userData.workingHours) * 100, 100);
  });
  
  return Array.from(userMap.values());
};

// Helper function to process regularization data - show all users regardless of pending request count
const processRegularizationData = (regularizations: RegularizationEntry[], usersMap: Map<string, any>) => {
  // Group regularizations by user
  const userMap = new Map();
  
  regularizations.forEach(reg => {
    const userId = reg.userId._id;
    if (!userMap.has(userId)) {
      // Get additional user data from usersMap if available
      const userData = usersMap.get(userId);
      
      userMap.set(userId, {
        userId: userId,
        userName: `${reg.userId.firstName} ${reg.userId.lastName}`,
        firstName: reg.userId.firstName,
        lastName: reg.userId.lastName,
        profilePic: userData?.profilePic || null,
        regularizations: [],
        requestCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        // Store the full user data for passing to details screen
        fullUserData: userData
      });
    }
    
    const userData = userMap.get(userId);
    userData.regularizations.push(reg);
    userData.requestCount++;
    
    // Count by status
    if (reg.approvalStatus === 'Pending') {
      userData.pendingCount++;
    } else if (reg.approvalStatus === 'Approved') {
      userData.approvedCount++;
    } else if (reg.approvalStatus === 'Rejected') {
      userData.rejectedCount++;
    }
  });
  
  return Array.from(userMap.values());
};

export default function AllAttendenceScreen() {
  const [selectedOption, setSelectedOption] = useState('Attendance');
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [regularizationData, setRegularizationData] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Map<string, any>>(new Map());
  
  // Fetch all users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("https://zapllo.com/api/users/organization");
        if (response.data && response.data.data) {
          // Create a map of users by ID for quick lookup
          const map = new Map();
          response.data.data.forEach(user => {
            // Calculate total working hours from salaryDetails
            // This is just an example - adjust according to your actual data structure
            let totalSalaryAmount = 0;
            if (user.salaryDetails && user.salaryDetails.length > 0) {
              totalSalaryAmount = user.salaryDetails.reduce((total, item) => total + item.amount, 0);
            }
            
            // Store user data with working hours
            map.set(user._id, {
              ...user,
              workingHours: totalSalaryAmount // Use the total salary amount as working hours
            });
          });
          setUsersMap(map);
        }
      } catch (error) {
        console.error("Error fetching users:", error.response?.data || error.message);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Simple data fetching based on selected option
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        
        if (selectedOption === "Attendance") {
          const response = await axios.get("https://zapllo.com/api/get-all-attendance");
          if (response.data.success) {
            const processedData = processAttendanceData(response.data.entries, usersMap);
            setAttendanceData(processedData);
          }
        } else if (selectedOption === "Regularization") {
          const response = await axios.get("https://zapllo.com/api/all-regularization-approvals");
          if (response.data.success) {
            const processedData = processRegularizationData(response.data.regularizations, usersMap);
            setRegularizationData(processedData);
          }
        }
      } catch (error) {
        console.error(
          `Error fetching ${selectedOption} entries:`,
          error.response?.data || error.message
        );
        alert(
          `Failed to fetch ${selectedOption} entries: ${error.response?.data?.message || error.message}`
        );
      } finally {
        setLoading(false);
      }
    };

    if (usersMap.size > 0) {
      fetchEntries();
    }
  }, [selectedOption, usersMap]);

  const handleDateRangeChange = (range) => {
    console.log('Selected date range:', range);
    console.log('Start date:', range.startDate);
    console.log('End date:', range.endDate);
    console.log('Label:', range.label);
    
    // Here you would typically refetch data with the new date range
    // For now, we'll just log it
  };

  const handleOptionPress = (option) => {
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const getProgressColor = (progress: number) => {
    if (progress < 19) {
      return '#EF4444'; // Red
    } else if (progress < 70) {
      return '#F97520'; // Orange
    } else {
      return '#06D6A0'; // Green
    }
  };

  // Navigate to attendance details with enhanced params
  const navigateToAttendanceDetails = (userData) => {
    // Extract relevant data to pass as params
    const params = {
      userId: userData.userId,
      userName: userData.userName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      workingHours: userData.workingHours?.toString() || "40", // Default to 40 if not available
      totalHours: userData.totalHours.toString(),
      overtime: userData.overtime.toString(),
      profilePic: userData.profilePic || ""
    };
    
    router.push({
      pathname: "/(routes)/HomeComponent/Attendance/AllAttendence/AttendenceDetails",
      params
    });
  };

  // Navigate to regularization details with enhanced params
  const navigateToRegularizationDetails = (userData) => {
    // Extract relevant data to pass as params
    const params = {
      userId: userData.userId,
      userName: userData.userName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      pendingCount: userData.pendingCount.toString(),
      approvedCount: userData.approvedCount.toString(),
      rejectedCount: userData.rejectedCount.toString(),
      profilePic: userData.profilePic || ""
    };
    
    router.push({
      pathname: "/(routes)/HomeComponent/Attendance/AllAttendence/RegularizationDetails",
      params
    });
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="All Attendance" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="w-full flex ml-9">
         

              <View className="items-center border border-[#676B93] w-[90%] px-1.5 py-1.5 rounded-full mt-4 mb-6">
                <View className="w-full flex flex-row items-center justify-between">
                  <TouchableOpacity
                    className="w-1/2 items-center"
                    onPress={() => handleOptionPress('Attendance')}
                  >
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      colors={selectedOption === 'Attendance' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                      style={styles.tablet}
                    >
                      <Text className={`text-sm  ${selectedOption === 'Attendance' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>All Attendance</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-1/2 items-center"
                    onPress={() => handleOptionPress('Regularization')}
                  >
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      colors={selectedOption === 'Regularization' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                      style={styles.tablet}
                    >
                      <Text className={`text-sm  ${selectedOption === 'Regularization' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Regularization</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Loading indicator */}
              {loading ? (
                <View className="flex items-center justify-center py-4">
                  <ActivityIndicator size="large" color="#815BF5" />
                </View>
              ) : (
                /* view list */
                selectedOption === "Attendance" ? (
                  attendanceData.length > 0 ? (
                    // Map through attendance entries
                    attendanceData.map((userData, index) => (
                      <TouchableOpacity 
                        key={index}
                        onPress={() => navigateToAttendanceDetails(userData)} 
                        className="w-[90%] bg-[#10122d] border border-[#37384B] rounded-2xl flex flex-row items-center justify-center p-5 mb-4"
                      >
                        <ProfileAvatar 
                          user={{
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            profilePic: userData.profilePic
                          }}
                          size={48}
                        />
                        <View className="flex flex-col items-center ml-3 w-[80%]">
                          <View className="flex flex-row justify-between items-center mb-3 gap-1">
                            <Text className="text-white" style={{ fontFamily: "LatoBold" }}>
                              {userData.userName}
                            </Text>
                            <Text className="text-white text-xs" style={{ fontFamily: "Lato" }}>
                              Overtime {userData.overtime}hr
                            </Text>
                          </View>
                          {/* progress bar */}
                          <View style={{ width: '100%', height: 8, backgroundColor: '#37384B', borderRadius: 5 }}>
                            <View
                              style={{
                                width: `${userData.progress}%`,
                                height: '100%',
                                backgroundColor: getProgressColor(userData.progress),
                                borderRadius: 5,
                              }}
                            />
                          </View>
                          <View className='flex flex-row items-center justify-between w-full'>
                            <Text className='text-white text-xs'>{userData.totalHours}hr completed</Text>
                            <Text className='text-[#676B93] text-xs'>{userData.workingHours}hr</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    // Fallback message when no data
                    <View className="w-[90%] bg-[#10122d] border border-[#37384B] rounded-2xl p-5 items-center">
                      <Text className="text-white text-center" style={{ fontFamily: "LatoBold" }}>
                        No attendance records found
                      </Text>
                    </View>
                  )
                ) : (
                  regularizationData.length > 0 ? (
                    // Map through regularization entries - showing ALL users regardless of pending count
                    regularizationData.map((userData, index) => (
                      <TouchableOpacity 
                        key={index}
                        onPress={() => navigateToRegularizationDetails(userData)}
                        className='w-[90%] bg-[#10122d] border border-[#37384B] rounded-2xl flex flex-row items-center justify-center p-5 mb-4'
                      >
                        <ProfileAvatar 
                          user={{
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            profilePic: userData.profilePic
                          }}
                          size={48}
                        />
                        <View className="flex flex-col items-start ml-3 w-[80%]">
                          <Text className='text-white'>{userData.userName}</Text>
                          <View className='flex flex-row items-center justify-between w-full mt-1'>
                            <View className='flex items-center flex-row gap-1'>
                              <Image source={require("../../../assets/Attendence/message.png")} className='w-4 h-4' />
                              <Text className='text-white text-xs' style={{fontFamily:"lato"}}>
                                {userData.pendingCount > 0 
                                  ? `${userData.pendingCount} Pending Request(s)` 
                                  : "No Pending Requests"}
                              </Text>
                            </View>
                            <Text className='text-white text-xs' style={{fontFamily:"lato"}}>
                              View Details
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))
                  ) : (
                    // Fallback message when no regularizations
                    <View className="w-[90%] bg-[#10122d] border border-[#37384B] rounded-2xl p-5 items-center">
                      <Text className="text-white text-center" style={{ fontFamily: "LatoBold" }}>
                        No regularization requests found
                      </Text>
                    </View>
                  )
                )
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  loader: {
    height: 5,
    borderRadius: 25,
  },
});