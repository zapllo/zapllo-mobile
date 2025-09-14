import { Image, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DelegatedTaskScreen from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskScreen ';
import AllTaskScreen from '~/app/(routes)/HomeComponent/Tasks/AllTaskScreen';
import DashboardStack from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import MyAppsScreen from '~/app/(routes)/HomeComponent/Tasks/MyAppsScreen';
import DelegatedTaskStack from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskStack';
import MyTasksStack from './myTask/MyTaskStack';
import { useEffect, useRef, useState, useMemo } from 'react';
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
import LoadingZapllo from '~/components/LoadingZapllo';
import VoiceTaskModal from '~/components/voiceTaskModal/VoiceTaskModal';

const Tab = createBottomTabNavigator();

export default function TasksScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentTab, setCurrentTab] = useState('Dashboard'); // Track current active tab
  const [showDataLoading, setShowDataLoading] = useState(true); // Show loading only when data is being fetched
  const voiceModalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Removed isAiModalVisible since we'll navigate to it instead of using as modal

  const navigation = useNavigation<StackNavigationProp<any>>();
  const fabLabelAnim = useRef(new Animated.Value(0)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  const fabRotateAnim = useRef(new Animated.Value(0)).current;

  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { userData } = useSelector((state: RootState) => state.auth);

  // Fetch user role from API
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        setShowDataLoading(true); // Show loading when starting data fetch
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
        setShowDataLoading(false); // Hide loading when data fetch is complete
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

  useEffect(() => {
    return () => {
      if (voiceModalTimeoutRef.current) {
        clearTimeout(voiceModalTimeoutRef.current);
      }
    };
  }, []);

  // Function to trigger haptic feedback
  const triggerHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Direct navigation to home without loading screen
  const navigateToHome = () => {
    router.push('/(routes)/home');
  };

  // Memoize tab bar style to prevent useInsertionEffect warning
  const tabBarStyle = useMemo(() => ({
    borderWidth: 1,
    borderColor: '#5367CB',
    height: 55,
    position: 'absolute' as const,
    bottom: 30,
    borderRadius: 30,
    marginHorizontal: isAdmin ? 10 : 20,
    display: 'flex' as const,
    borderTopWidth: 1,
    justifyContent: 'center' as const,
  }), [isAdmin]);

  return (
    <View style={{ flex: 1 }} className='bg-primary'>
      {/* Data Loading when fetching user role */}
      <LoadingZapllo 
        isVisible={showDataLoading}
        size="large"
        showText={true}
      />

      
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
          tabBarStyle: tabBarStyle,
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
            } else if (route.name === 'All Task') {
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
              setCurrentTab('Dashboard');
            },
          }}
        />
        <Tab.Screen 
          name="My Task" 
          component={MyTasksStack} 
          listeners={{
            tabPress: () => {
              triggerHapticFeedback();
              setCurrentTab('My Task');
            },
          }}
        />
        <Tab.Screen 
          name="Home Screen" 
          component={HomeScreen} 
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // Prevent default tab navigation
              triggerHapticFeedback();
              // Direct navigation without loading screen
              navigateToHome();
            },
          }}
        />
        <Tab.Screen 
          name="Delegated Task" 
          component={DelegatedTaskStack} 
          listeners={{
            tabPress: () => {
              triggerHapticFeedback();
              setCurrentTab('Delegated Task');
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

      {/* Hide AllTaskModalScreen when on My Apps tab */}
      {currentTab !== 'Home Screen' && (
        <AllTaskModalScreen
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          isAdmin={isAdmin}
          onVoiceTask={() => {
            console.log('Voice task clicked');
            setModalVisible(false);
            
            if (voiceModalTimeoutRef.current) {
              clearTimeout(voiceModalTimeoutRef.current);
            }
            
            voiceModalTimeoutRef.current = setTimeout(() => {
              setShowVoiceModal(true);
              console.log('Voice modal opened after timeout');
              voiceModalTimeoutRef.current = null;
            }, 400);
          }}
        />
      )}

      {/* Voice Task Modal - Always available */}
      <VoiceTaskModal
        isVisible={showVoiceModal}
        onClose={() => {
          console.log('Closing voice modal');
          setShowVoiceModal(false);
        }}
        onTaskCreated={(taskData) => {
          console.log('Task created from voice:', taskData);
          // You can navigate to task creation screen or show success message
          setShowVoiceModal(false);
        }}
      />

      {/* Add Task Options Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <BlurView 
            intensity={15} 
            style={styles.modalBackdrop}
          >
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              onPress={() => {
                setShowAddModal(false);
                Animated.timing(fabRotateAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }}
              activeOpacity={1}
            />
          </BlurView>
          <View className="flex items-end flex-col gap-4 justify-around mb-48 mr-7">
            
            {/* AI Task Assistant */}
            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => {
                triggerHapticFeedback();
                setShowAddModal(false);
                Animated.timing(fabRotateAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
                router.push('/(routes)/HomeComponent/Tasks/AiSuggestion/AiSuggestionScreen');
              }}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>AI Task</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  triggerHapticFeedback();
                  setShowAddModal(false);
                  Animated.timing(fabRotateAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                  router.push('/(routes)/HomeComponent/Tasks/AiSuggestion/AiSuggestionScreen');
                }} 
                style={styles.modalButton}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#cc9bfb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalButtonGradient}
                >
                  <MaterialIcons name="auto-awesome" size={25} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Voice Task */}
            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => {
                triggerHapticFeedback();
                setShowAddModal(false);
                Animated.timing(fabRotateAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
                setTimeout(() => setShowVoiceModal(true), 400);
              }}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Voice Task</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  triggerHapticFeedback();
                  setShowAddModal(false);
                  Animated.timing(fabRotateAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                  setTimeout(() => setShowVoiceModal(true), 400);
                }} 
                style={styles.modalButton}
              >
                <LinearGradient
                  colors={['#EC4899', '#f984c1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalButtonGradient}
                >
                  <MaterialIcons name="mic" size={25} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* New Task */}
            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => {
                triggerHapticFeedback();
                setShowAddModal(false);
                Animated.timing(fabRotateAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
                router.push('/(routes)/HomeComponent/Tasks/AssignTask/AssignTaskScreen');
              }}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>New Task</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  triggerHapticFeedback();
                  setShowAddModal(false);
                  Animated.timing(fabRotateAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                  router.push('/(routes)/HomeComponent/Tasks/AssignTask/AssignTaskScreen');
                }} 
                style={styles.modalButton}
              >
                <LinearGradient
                  colors={['#2a73e8', '#60A5FA']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalButtonGradient}
                >
                  <MaterialIcons name="add-task" size={25} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Task Templates */}
            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => {
                triggerHapticFeedback();
                setShowAddModal(false);
                Animated.timing(fabRotateAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
                router.push('/(routes)/HomeComponent/Tasks/TaskTemplates');
              }}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Task Templates</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  triggerHapticFeedback();
                  setShowAddModal(false);
                  Animated.timing(fabRotateAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                  router.push('/(routes)/HomeComponent/Tasks/TaskTemplates');
                }} 
                style={styles.modalButton}
              >
                <LinearGradient
                  colors={['#3bf667', '#3f94fc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalButtonGradient}
                >
                  <MaterialIcons name="description" size={25} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Task Directory */}
            <View className="flex flex-row items-center gap-2">
              <TouchableOpacity onPress={() => {
                triggerHapticFeedback();
                setShowAddModal(false);
                Animated.timing(fabRotateAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
                router.push('/(routes)/HomeComponent/Tasks/TaskDirectory');
              }}>
                <Text className="text-white" style={{ fontFamily: "LatoBold" }}>Task Directory</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  triggerHapticFeedback();
                  setShowAddModal(false);
                  Animated.timing(fabRotateAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                  }).start();
                  router.push('/(routes)/HomeComponent/Tasks/TaskDirectory');
                }} 
                style={styles.modalButton}
              >
                <LinearGradient
                  colors={['#f92516', '#fca786']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalButtonGradient}
                >
                  <MaterialIcons name="folder" size={25} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>


          </View>
        </View>
      )}

      {/* Add/Close FAB Button */}
      {currentTab !== 'Home Screen' && (      
        <View style={[styles.fabContainer, { zIndex: 9999 }]}>
          {!showAddModal && showFabLabel && (
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
                <Text style={styles.fabLabelText}>Add Task</Text>
              </LinearGradient>
            </Animated.View>
          )}
          
          <Animated.View 
            style={{
              transform: [
                { scale: fabAnim },
                { 
                  rotate: fabRotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg']
                  })
                }
              ]
            }}
          >
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {
                triggerHapticFeedback();
                const toValue = showAddModal ? 0 : 1;
                Animated.timing(fabRotateAnim, {
                  toValue,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
                setShowAddModal(!showAddModal);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FC8929', '#f0be95']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >
                <MaterialIcons 
                  name="add" 
                  size={28} 
                  color="#FFFFFF" 
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
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
    width: 60,
    height: 40,
    padding: 10,
    borderRadius: 30,
    marginTop: 15,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeImageContainer: {
    width: 62,
    height: 42,
    borderRadius: 60,
    backgroundColor: '#FC842C',
    alignItems: 'center',
    justifyContent: 'center',
    display: "flex",
    shadowColor: '#FC842C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});