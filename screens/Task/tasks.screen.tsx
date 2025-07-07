import { Image, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DelegatedTaskScreen from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskScreen ';
import AllTaskScreen from '~/app/(routes)/HomeComponent/Tasks/AllTaskScreen';
import DashboardStack from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import MyAppsScreen from '~/app/(routes)/HomeComponent/Tasks/MyAppsScreen';
import DelegatedTaskStack from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskStack';
import MyTasksStack from './myTask/MyTaskStack';
import { useEffect, useRef, useState } from 'react';
import Modal from "react-native-modal";
import AllTaskModalScreen from '../../app/(routes)/HomeComponent/Tasks/AllTaskModalScreen';
// Removed AiSuggestionScreen import since we'll navigate to it instead of using as modal
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { router } from 'expo-router';
import HomeScreen from '../home/homeScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import * as Haptics from 'expo-haptics'; // Import Haptics

const Tab = createBottomTabNavigator();

export default function TasksScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  // Removed isAiModalVisible since we'll navigate to AiSuggestionScreen instead

  const navigation = useNavigation<StackNavigationProp<any>>();
  const fabLabelAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useSelector((state: RootState) => state.auth);

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
  
  const [showFabLabel, setShowFabLabel] = useState(true);
  
  useEffect(() => {
    // Start by showing the label with animation
    Animated.timing(fabLabelAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  
    // Hide the FAB label after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fabLabelAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowFabLabel(false));
    }, 3000);
  
    return () => clearTimeout(timer);
  }, []);

  // Function to trigger haptic feedback
  const triggerHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={{ flex: 1 }} className='bg-primary'>
      <Tab.Navigator
        initialRouteName="Dashboard"
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
            // Set images for each tab
            let icon;
            let zName;
            if (route.name === 'Dashboard') {
              icon = require('~/assets/tabBarImages/dashboard.png');
              zName = "Home";
            } else if (route.name === 'My Task') {
              icon = require('~/assets/tabBarImages/mytask.png');
              zName = "My Tasks";
            } else if (route.name === 'Home Screen') {
              icon = require('~/assets/tabBarImages/delegatedtask.png');
              zName = "My Apps";
            } else if (route.name === 'Delegated Task') {
              icon = require('~/assets/tabBarImages/Frame.png');
              zName = "Delegated";
            } else if (route.name === 'All Task' && isAdmin) {
              icon = require('~/assets/tabBarImages/alltask.png');
              zName = "More";
            }

            return (
              <View
                style={[
                  styles.imageContainer,
                  focused && styles.activeImageContainer,
                ]}
              >
                <View className='flex flex-col items-center h-9'>
                  <Image source={icon} style={styles.icon} />
                  <Text className='text-white w-full text-[8px]' style={{ fontFamily: 'LatoRegular' }}>{zName}</Text>
                </View>
              </View>
            );
          },
          tabBarShowLabel: false,
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardStack} 
          listeners={{
            tabPress: () => {
              triggerHapticFeedback();
            },
          }}
        />
        <Tab.Screen 
          name="My Task" 
          component={MyTasksStack} 
          listeners={{
            tabPress: () => {
              triggerHapticFeedback();
            },
          }}
        />
        <Tab.Screen 
          name="Home Screen" 
          component={HomeScreen} 
          listeners={{
            tabPress: () => {
              triggerHapticFeedback();
            },
          }}
        />
        <Tab.Screen 
          name="Delegated Task" 
          component={DelegatedTaskStack} 
          listeners={{
            tabPress: () => {
              triggerHapticFeedback();
            },
          }}
        />
        {isAdmin && (
          <Tab.Screen
            name="All Task"
            component={AllTaskScreen}
            listeners={{
              tabPress: (e) => {
                e.preventDefault(); // Prevent default action
                triggerHapticFeedback(); // Add haptic feedback
                setModalVisible(true); // Show modal
              },
            }}
          />
        )}
      </Tab.Navigator>

      <AllTaskModalScreen
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Removed AiSuggestionScreen modal since we now navigate to it as a proper screen */}

       {/* Ai suggestion button - Only visible to admin users */}
      {isAdmin && (
        <View style={styles.fabContainerAi}>
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {
                triggerHapticFeedback(); // Add haptic feedback to FAB
                router.push('/(routes)/HomeComponent/Tasks/AiSuggestion/AiSuggestionScreen'); // Navigate to AI screen
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4929fc', '#a395f0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >
                <MaterialIcons name="auto-awesome" size={28} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
        </View>
      )}

      {/* Assign task button */}
      <View style={styles.fabContainer}>
        {showFabLabel && (
          <Animated.View 
            style={[
              styles.fabLabelContainer,
              {
                opacity: fabLabelAnim,
                transform: [
                  { translateX: fabLabelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['#ebdba5', '#d7ae48']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.fabLabel}
            >
              <MaterialIcons name='assignment-add' size={20} color={"000000"}/>
              <Text style={styles.fabLabelText}>Assign a task</Text>
            </LinearGradient>
          </Animated.View>
        )}
        
        <Animated.View 
          style={{
            transform: [{ scale: fabAnim }]
          }}
        >
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              triggerHapticFeedback(); // Add haptic feedback to FAB
              router.push('/(routes)/HomeComponent/Tasks/AssignTask/AssignTaskScreen');
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FC8929', '#f0be95']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              <MaterialIcons name="add" size={28} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

    fabContainerAi: {
    position: 'absolute',
    bottom: 170,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fabLabelContainer: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fabLabel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    display:"flex",
    flexDirection:"row",
    alignItems:"center",
    gap:3
  },
  fabLabelText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'LatoBold',
    letterSpacing: 0.3,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});