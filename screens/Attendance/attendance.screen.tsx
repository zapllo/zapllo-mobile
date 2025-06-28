
import { Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AllTaskScreen from '~/app/(routes)/HomeComponent/Tasks/AllTaskScreen';
import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { router } from 'expo-router';
import DashboardStack from '~/app/(routes)/HomeComponent/Attendance/Dashboard/DashboardStack';
import HomeStack from '~/app/(routes)/HomeComponent/Attendance/Home/HomeStack';
import MyLeavesStack from '~/app/(routes)/HomeComponent/Attendance/MyLeaves/MyLeavesStack';
import AllAttendenceScreen from './AllTask/AllAttendenceScreen';
import { LinearGradient } from 'expo-linear-gradient';
import HolidaysStack from '~/app/(routes)/HomeComponent/Attendance/Holiday/HolidaysStack';
import ApprovalStack from '~/app/(routes)/HomeComponent/Attendance/Approval';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import * as Haptics from 'expo-haptics';

const Tab = createBottomTabNavigator();

export default function AttendanceScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useSelector((state: RootState) => state.auth);

  const navigation = useNavigation<StackNavigationProp<any>>();
  
  // Fetch user role from API
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('https://zapllo.com/api/users/organization');
        const data = await response.json();
        
        if (data.message === "Users fetched successfully") {
          // Find current user by matching with userData from Redux
          const currentUserId = userData?.data?._id || userData?.user?._id;
          
          if (currentUserId) {
            const currentUser = data.data.find(user => user._id === currentUserId);
            
            if (currentUser) {
              const adminStatus = currentUser.isAdmin || currentUser.role === 'orgAdmin';
              console.log('User role from API:', currentUser.role, 'isAdmin:', adminStatus);
              setIsAdmin(adminStatus);
            } else {
              // Fallback to Redux data if user not found in API response
              const reduxAdminStatus = userData?.data?.role === "orgAdmin" || userData?.user?.role === "orgAdmin";
              console.log('User role from Redux:', userData?.data?.role || userData?.user?.role, 'isAdmin:', reduxAdminStatus);
              setIsAdmin(reduxAdminStatus);
            }
          } else {
            console.log('No user ID found in Redux state');
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Fallback to Redux data if API fails
        const reduxAdminStatus = userData?.data?.role === "orgAdmin" || userData?.user?.role === "orgAdmin";
        console.log('Fallback to Redux - User role:', userData?.data?.role || userData?.user?.role, 'isAdmin:', reduxAdminStatus);
        setIsAdmin(reduxAdminStatus);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserRole();
  }, [userData]);

  if (isLoading) {
    return (
      <View style={{ flex: 1 }} className="bg-primary flex items-center justify-center">
        <ActivityIndicator size="large" color="#5367CB" />
      </View>
    );
  }

  // Define tab icons and names based on user role
  const getTabConfig = (routeName: string, focused: boolean) => {
    let icon;
    let zName;

    switch (routeName) {
      case 'Home':
        icon = require('~/assets/tabBarImages/dashboard.png');
        zName = "Home";
        break;
      case 'My Attendance':
        icon = require('~/assets/Attendence/MyAttendence.png');
        zName = "Holidays";
        break;
      case 'Dashboard':
        icon = require('~/assets/Attendence/Dashboard.png');
        zName = "Dashboard";
        break;
      case 'My Leaves':
        icon = require('~/assets/Attendence/MyLeaves.png');
        zName = "My Leaves";
        break;
      case 'All Task':
        if (isAdmin) {
          icon = require('~/assets/tabBarImages/alltask.png');
          zName = "More";
        } else {
          icon = require('~/assets/Attendence/Approval.png');
          zName = "Approval";
        }
        break;
      default:
        icon = require('~/assets/tabBarImages/dashboard.png');
        zName = "Home";
    }

    return { icon, zName };
  };

  // Function to trigger haptic feedback
  const triggerHapticFeedback = () => {
    // Using selection feedback type which is suitable for tab navigation
    Haptics.selectionAsync();
  };

  return (
    <View style={{ flex: 1, zIndex: 50 }} className='bg-primary'>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarBackground: () => (
            <LinearGradient
              colors={['#0A0D28', '#37384B']}
              style={styles.tabBarBackground}
            />
          ),
          tabBarStyle: {
            borderWidth: 1,
            borderColor: '#5367CB',
            height: 55,
            position: 'absolute',
            bottom: 30,
            borderRadius: 30,
            marginHorizontal: 10,
            display: 'flex',
            borderTopWidth: 1,
            justifyContent: 'center',
          },
          tabBarIcon: ({ focused }) => {
            // Get tab configuration based on route name and user role
            const { icon, zName } = getTabConfig(route.name, focused);

            return (
              <View
                style={[
                  styles.imageContainer,
                  focused && styles.activeImageContainer,
                ]}
              >
                <View className='flex flex-col items-center h-9'>
                  <Image source={icon} style={styles.icon} />
                  <Text className='text-white w-full text-center text-[8px]' style={{ fontFamily: 'LatoRegular' }}>{zName}</Text>
                </View>
              </View>
            );
          },
          tabBarShowLabel: false,
        })}
        screenListeners={{
          tabPress: () => {
            // Trigger haptic feedback when a tab is pressed
            triggerHapticFeedback();
          },
        }}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="My Attendance" component={HolidaysStack} />
        <Tab.Screen name="Dashboard" component={DashboardStack} />
        <Tab.Screen name="My Leaves" component={MyLeavesStack} />
        <Tab.Screen
          name="All Task"
          component={isAdmin ? AllTaskScreen : ApprovalStack}
          listeners={{
            tabPress: (e) => {
              // Trigger haptic feedback
              triggerHapticFeedback();
              
              if (isAdmin) {
                e.preventDefault(); // Prevent default action for admin
                setModalVisible(true); // Show modal for admin
              }
              // For regular users, let the navigation happen to ApprovalScreen
            },
          }}
        />
      </Tab.Navigator>

      {isModalVisible && (
        <AllAttendenceScreen
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    borderRadius: 30,
  },
  icon: {
    width: 15, // Width of the icon image
    height: 17, // Height of the icon image
    resizeMode: 'contain',
  },
  imageContainer: {
    width: 60, // Default background width
    height: 40, // Default background height
    padding: 10,
    borderRadius: 30, // Make the background circular
    marginTop: 15,
    backgroundColor: 'transparent', // Default (non-focused) background color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeImageContainer: {
    width: 62, // Width of active tab background
    height: 42, // Height of active tab background
    borderRadius: 60, // Rounded background
    backgroundColor: '#FC842C', // Background color for active tab
    alignItems: 'center',
    justifyContent: 'center',
    display: "flex",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.55)",
  },
  fixedImage: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: "rgb(252 137 41)",
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center"
  },
});
