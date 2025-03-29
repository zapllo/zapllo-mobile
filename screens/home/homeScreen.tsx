
import React, { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  RefreshControl,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { router, useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Navbar from '~/components/navbar';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';

// Types
type HomeScreenComponents = {
  title: string;
  id: string;
  screen: string;
  description: string;
  image: any;
  comingSoon?: boolean;
};

interface ChecklistItem {
  _id: string;
  text: string;
  image?: any;
}

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  organization: string;
  isAdmin: boolean;
  role: string;
  isTaskAccess: boolean;
  isLeaveAccess: boolean;
}

interface OrganizationResponse {
  message: string;
  data: UserData[];
}

interface CompanyData {
  _id: string;
  logo: string | null;
  name: string;
  address: string;
  contact: string;
  emailOrWebsite: string;
}

interface PayslipResponse {
  success: boolean;
  data: CompanyData;
}

// Constants
const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 28;
const ANIMATION_DURATION = 600;

// Component data
const componentsData: HomeScreenComponents[] = [
  {
    id: '1',
    title: 'Zapllo Task',
    screen: '(routes)/HomeComponent/Tasks',
    description: 'Delegate one time and recurring task to your team',
    image: require('~/assets/HomeComponents/ZTask.png'),
  },
  {
    id: '2',
    title: 'Zapllo Attendance',
    screen: '(routes)/HomeComponent/Attendance',
    description: 'Track your Team Attendance & Breaks',
    image: require('~/assets/HomeComponents/ZAttendance.png'),
  },
  {
    id: '4',
    title: 'Zapllo Intranet',
    screen: '',
    description: 'Manage all your Important Company Links',
    image: require('~/assets/HomeComponents/ZInternet.png'),
    comingSoon: true,
  },
  {
    id: '8',
    title: 'Zapllo AI Assistant',
    screen: '',
    description: 'Upgrade your experience by 10X with our proprietory AI Technology',
    image: require('~/assets/HomeComponents/ZAi.png'),
    comingSoon: true,
  },
];

// Welcome Section Component
const WelcomeSection = ({ 
  userName, 
  companyName, 
  companyLogo,
  isAdmin,
  hasTaskAccess,
  hasLeaveAccess
}: { 
  userName: string, 
  companyName: string, 
  companyLogo: string | null,
  isAdmin: boolean,
  hasTaskAccess: boolean,
  hasLeaveAccess: boolean
}) => {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(20), []);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const userId = userData?.data?._id || "anonymous";
  
  // Function to check login and break status
const checkLoginStatus = async () => {
  try {
    if (!token) {
      setIsLoggedIn(false);
      setIsOnBreak(false);
      return;
    }

    // Check login status from the server using the token
    const loginResponse = await axios.get(`${backend_Host}/loginEntries`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (loginResponse.data.success && loginResponse.data.entries) {
      // Sort entries by timestamp in descending order (newest first)
      const sortedEntries = loginResponse.data.entries.sort(
        (a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Get today's entries
      const today = new Date();
      const todayEntries = sortedEntries.filter((entry: any) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate.getDate() === today.getDate() &&
          entryDate.getMonth() === today.getMonth() &&
          entryDate.getFullYear() === today.getFullYear();
      });

      if (todayEntries.length === 0) {
        // No entries for today
        setIsLoggedIn(false);
        setIsOnBreak(false);
      } else {
        // Get the most recent entry for today
        const latestEntry = todayEntries[0];
        
        // Update status based on latest entry
        if (latestEntry.action === 'login') {
          setIsLoggedIn(true);
          setIsOnBreak(false);
        } else if (latestEntry.action === 'logout') {
          setIsLoggedIn(false);
          setIsOnBreak(false);
        } else if (latestEntry.action === 'break_started') {
          setIsLoggedIn(true);
          setIsOnBreak(true);
        } else if (latestEntry.action === 'break_ended') {
          setIsLoggedIn(true);
          setIsOnBreak(false);
        }
      }
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    
    // If server request fails, try to fetch user status directly
    try {
      if (token) {
        const userStatusResponse = await axios.get(`${backend_Host}/users/status/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userStatusResponse.data && userStatusResponse.data.success) {
          setIsLoggedIn(userStatusResponse.data.isLoggedIn);
          setIsOnBreak(userStatusResponse.data.isOnBreak);
        }
      }
    } catch (statusError) {
      console.error('Error fetching user status:', statusError);
    }
  }
};
  
  // Get current time to display appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  // Get company initials for avatar if no logo
  const getCompanyInitials = () => {
    if (!companyName) return 'Z';
    
    const words = companyName.split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + (words.length > 1 ? words[1].charAt(0) : '')).toUpperCase();
  };
  
  // Get the appropriate attendance icon based on user status
  const getAttendanceIcon = () => {
    if (isLoggedIn) {
      if (isOnBreak) {
        // User is on break - return MaterialIcons component instead of image
        return (
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fc4949', 
          }}>
            <MaterialIcons name="timer-off" size={35} color="#423a3a" />
          </View>
        );
      } else {
        // User is logged in but not on break
        return (
          <Image 
            source={require("../../assets/Attendence/logout.png")} 
            className='w-full h-full'
          />
        );
      }
    } else {
      // User is not logged in
      return (
        <Image 
          source={require("../../assets/Attendence/login.png")} 
          className='w-full h-full'
        />
      );
    }
  };
  
  // Get the appropriate attendance label based on user status
  const getAttendanceLabel = () => {
    if (isLoggedIn) {
      if (isOnBreak) {
        return "End Break";
      } else {
        return "Log out";
      }
    } else {
      return "Log in";
    }
  };
  
  useEffect(() => {
    // Check login status when component mounts
    checkLoginStatus();
    
    // Set up interval to periodically check status
    const intervalId = setInterval(checkLoginStatus, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [token, userId]);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View 
      style={[
        styles.welcomeContainer,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(129, 91, 245, 0.15)', 'rgba(252, 137, 41, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeGradient}
      >
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeHeader}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()},</Text>
              <Text style={styles.nameText}>{userName || 'User'}</Text>
              <Text style={styles.companyText}>{companyName || 'Welcome to Zapllo'}</Text>
            </View>
            <View style={styles.avatarContainer}>
              {companyLogo ? (
                <Image 
                  source={{ uri: companyLogo }} 
                  resizeMode="contain"
                  style={styles.avatarImage}
                  defaultSource={require("../../assets/HomeComponents/ZTask.png")}
                />
              ) : (
                <LinearGradient
                  colors={['#815BF5', '#FC8929']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>{getCompanyInitials()}</Text>
                </LinearGradient>
              )}
            </View>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <TouchableOpacity
                onPress={() => router.push(isAdmin ? 
                  "(routes)/HomeComponent/Attendance/AllAttendence" : 
                  "/(routes)/HomeComponent/Tasks")}
                style={styles.iconWrapper}>
                {
                  isAdmin ?                 <Image 
                  source={require("../../assets/Attendence/AllAttendence.png")} 
                  style={styles.statIcon}
                /> : <Image 
                  source={require("../../assets/Attendence/Dashboard.png")} 
                  style={styles.statIcon}
                />
                }
            
              </TouchableOpacity>
              <Text style={styles.statLabel}>{isAdmin ? "Attendance" : "Dashboard"}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              {isAdmin && hasTaskAccess ? (
                <TouchableOpacity 
                  onPress={() => router.push("/HomeComponent/Tasks/AssignTask/AssignTaskScreen")} 
                  style={[ {
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }]}>
                 <LinearGradient
                colors={['#FC8929', '#f0be95']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >   
                  <Image 
                    source={require("../../assets/Tasks/addNew.png")} 
                    style={styles.statIcon}
                  />
                </LinearGradient>
                </TouchableOpacity>
              ) : (

             
                <TouchableOpacity 
                  onPress={() => router.push("/(routes)/HomeComponent/Attendance")} 
                  style={[{
                    width: 60,
                    height: 60,
                    borderRadius: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }]}>

                  
                  {typeof getAttendanceIcon() === 'object' ? 
                    getAttendanceIcon() : 
                    <Image 
                      source={getAttendanceIcon()} 
                      className='w-full h-full'
                    />
                  }
                
                </TouchableOpacity>

                
              )}
              <Text style={styles.statLabel}>{isAdmin && hasTaskAccess ? "Assign Task" : getAttendanceLabel()}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <TouchableOpacity 
                onPress={() => router.push(isAdmin ? 
                  "/(routes)/profile/billing" : 
                  "/(routes)/profile/tutorials")}
                style={styles.iconWrapper}>
                <Image 
                  source={isAdmin ? 
                    require("../../assets/Billing/Billing.png") : 
                    require("../../assets/HomeComponents/ZTutorials.png")} 
                  style={isAdmin ? {
                    width: 47,
                    height: 37,
                    resizeMode: 'contain',
                    marginTop: 7,
                  } : styles.statIcon}
                />
              </TouchableOpacity>
              <Text style={styles.statLabel}>{isAdmin ? "Premium" : "Tutorials"}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Progress Card Component
const ProgressCard = ({ 
  progressPercentage, 
  loading, 
  onPress 
}: { 
  progressPercentage: number, 
  loading: boolean, 
  onPress: () => void 
}) => {
  const animatedWidth = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.98), []);
  
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progressPercentage,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progressPercentage, animatedWidth]);

  const interpolatedWidth = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}>
      <Animated.View 
        style={[
          styles.progressCard,
          { 
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>App Usage Progress</Text>
          <View style={styles.iconContainer}>
            <Image style={styles.arrowIcon} source={require("../../assets/HomeComponents/goto.png")} />
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FC8929"
                style={styles.progressLoader}
              />
            ) : (
              <Animated.View style={[styles.progressBarFill, { width: interpolatedWidth }]}>
                <LinearGradient
                  colors={['#815BF5', '#FC8929']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressGradient}
                />
              </Animated.View>
            )}
          </View>
          <Text style={styles.progressText}>
            {loading ? 'Loading...' : `${progressPercentage}% Completed`}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// App Card Component
const AppCard = ({ 
  item, 
  onPress,
  index
}: { 
  item: HomeScreenComponents, 
  onPress: () => void,
  index: number
}) => {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const translateYAnim = useMemo(() => new Animated.Value(20), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.95), []);
  
  useEffect(() => {
    const delay = index * 100;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, translateYAnim, scaleAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.appCard,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: translateYAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
        <View style={styles.appCardContent}>
          <Image
            style={styles.appIcon}
            source={item.image}
            resizeMode="contain"
          />
          <View style={styles.appTextContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.appTitle}>{item.title}</Text>
              {item.comingSoon && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Coming Soon</Text>
                </View>
              )}
            </View>
            <Text style={styles.appDescription}>{item.description}</Text>
          </View>
        </View>

        {item.screen && (
          <View style={styles.arrowContainer}>
            <Image style={styles.arrowIcon} source={require("../../assets/HomeComponents/goto.png")} />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Error View Component
const ErrorView = ({ 
  message, 
  onRetry 
}: { 
  message: string, 
  onRetry: () => void 
}) => {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
      <Text style={styles.errorText}>Oops! Something went wrong</Text>
      <Text style={styles.errorSubtext}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Loading View Component
const LoadingView = () => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.loadingContainer}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <ActivityIndicator size="large" color="#FC8929" />
      </Animated.View>
      <Text style={styles.loadingText}>Loading your business apps...</Text>
    </View>
  );
};

// Main Component
const HomeScreen: React.FC = () => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const { userData, token } = useSelector((state: RootState) => state.auth);
  const userId = userData?.data?._id || "anonymous";
  
  // State for user and company information
  const [firstName, setFirstName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [hasTaskAccess, setHasTaskAccess] = useState<boolean>(false);
  const [hasLeaveAccess, setHasLeaveAccess] = useState<boolean>(false);
  
  // Use userId for checklist storage key
  const STORAGE_KEY = `@zapllo_checklist_${userId}`;
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollY] = useState(new Animated.Value(0));

  // Function to fetch organization users data to check admin status
  const fetchOrganizationUsers = useCallback(async () => {
    try {
      if (!token) {
        console.error("No auth token found for organization users fetch");
        return;
      }
      
      const response = await axios.get<OrganizationResponse>(`${backend_Host}/users/organization`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout: 10000 // Add timeout to prevent hanging requests
      });
      
      if (response.data && response.data.message === "Users fetched successfully" && response.data.data) {
        const users = response.data.data;
        
        // Find current user in the organization data
        const currentUser = users.find(user => user._id === userId);
        
        if (currentUser) {
          // Set user's first name
          setFirstName(currentUser.firstName);
          
          // Set admin status
          setIsAdmin(currentUser.isAdmin || currentUser.role === "orgAdmin");
          
          // Set task and leave access
          setHasTaskAccess(currentUser.isTaskAccess);
          setHasLeaveAccess(currentUser.isLeaveAccess);
        }
      }
    } catch (err) {
      console.error("Error fetching organization users:", err);
      // Default to non-admin if there's an error
      setIsAdmin(false);
    }
  }, [userId, token]);

  // Function to fetch company data from organization API
  const fetchCompanyData = useCallback(async () => {
    try {
      if (!token) {
        console.error("No auth token found for company data fetch");
        return;
      }
      
      const response = await axios.get(`${backend_Host}/organization/getById`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        timeout: 10000 // Add timeout to prevent hanging requests
      });
      
      if (response.data && response.data.data) {
        const companyData = response.data.data;
        
        // Set company name if it exists
        if (companyData.companyName) {
          setCompanyName(companyData.companyName);
        } else {
          setCompanyName("Your Workspace");
        }
        
        // Set company logo if it exists
        if (companyData.logo) {
          setCompanyLogo(companyData.logo);
        }
      }
    } catch (err) {
      console.error("Error fetching company data:", err);
      // Keep existing company name if there's an error
      setCompanyName(companyName || "Your Workspace");
    }
  }, [companyName, token]);

  // Function to fetch checklist progress from server
  const fetchChecklistProgress = useCallback(async () => {
    setChecklistLoading(true);
    try {
      if (!token) {
        console.error("No auth token found for checklist progress fetch");
        setProgressPercentage(0);
        return;
      }
      
      // Fetch both user data and checklist items in parallel
      const [userResponse, checklistResponse] = await Promise.all([
        axios.get(`${backend_Host}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000
        }).catch(error => {
          console.error("Error fetching user data:", error);
          return { data: { data: { checklistProgress: [] } } };
        }),
        axios.get(`${backend_Host}/checklist/get`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 10000
        }).catch(error => {
          console.error("Error fetching checklist items:", error);
          return { data: { checklistItems: [] } };
        })
      ]);
      
      // Process user data to get checked items
      if (userResponse.data && userResponse.data.data) {
        const userCheckedItems = userResponse.data.data.checklistProgress || [];
        setCheckedItemIds(userCheckedItems);
      }
      
      // Process checklist items
      if (checklistResponse.data && checklistResponse.data.checklistItems) {
        setChecklistItems(checklistResponse.data.checklistItems);
      }
      
      // Calculate progress percentage
      if (checklistResponse.data?.checklistItems?.length > 0) {
        const totalItems = checklistResponse.data.checklistItems.length;
        const checkedItems = userResponse.data?.data?.checklistProgress?.length || 0;
        const percentage = Math.round((checkedItems / totalItems) * 100);
        setProgressPercentage(percentage);
      } else {
        setProgressPercentage(0);
      }
    } catch (error) {
      console.error("Error fetching checklist progress:", error);
      setProgressPercentage(0);
    } finally {
      setChecklistLoading(false);
      setRefreshing(false);
    }
  }, [token]);
  
  // Modify the fetchChecklistData function to not block the UI
  const fetchChecklistData = useCallback(async (isRefreshing = false) => {
    if (!isRefreshing) setLoading(true);
    setError(null);
    
    try {
      // Set a timeout to ensure we don't block the UI for too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Checklist data fetch timeout"));
        }, 5000); // 5 second timeout
      });
      
      // Race between the actual fetch and the timeout
      await Promise.race([
        fetchChecklistProgress(),
        timeoutPromise
      ]);
      
    } catch (err: any) {
      console.error("Error or timeout fetching checklist data:", err);
      // Don't set error state to allow UI to load anyway
      setProgressPercentage(0);
    } finally {
      // Always complete loading to prevent UI from being stuck
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  }, [fetchChecklistProgress]);
  
  // Modify the useFocusEffect to handle errors better
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // Set a loading timeout to ensure the UI isn't blocked
          const loadingTimeout = setTimeout(() => {
            setLoading(false);
          }, 3000);
          
          // Try to fetch all data in parallel
          await Promise.allSettled([
            fetchChecklistProgress(),
            fetchOrganizationUsers(),
            fetchCompanyData()
          ]);
          
          clearTimeout(loadingTimeout);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setLoading(false);
        }
      };
      
      fetchData();
      
      // Set up an interval to periodically refresh checklist progress
      const intervalId = setInterval(() => {
        fetchChecklistProgress().catch(err => {
          console.error("Error in periodic checklist refresh:", err);
        });
      }, 30000); // Check every 30 seconds
      
      return () => {
        clearInterval(intervalId);
      };
    }, [fetchChecklistProgress, fetchOrganizationUsers, fetchCompanyData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChecklistProgress();
    fetchOrganizationUsers();
    fetchCompanyData();
  }, [fetchChecklistProgress, fetchOrganizationUsers, fetchCompanyData]);

  // Use useFocusEffect to call API functions when screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          await Promise.all([
            fetchChecklistProgress(),
            fetchOrganizationUsers(),
            fetchCompanyData()
          ]);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      
      fetchData();
      
      // Set up an interval to periodically refresh checklist progress
      const intervalId = setInterval(() => {
        fetchChecklistProgress();
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(intervalId);
    }, [fetchChecklistProgress, fetchOrganizationUsers, fetchCompanyData])
  );

  const handleAppPress = useCallback((item: HomeScreenComponents) => {
    if (item.screen) {
      router.push(item.screen);
    } else if (item.comingSoon) {
      // Could show a toast or modal here
      console.log(`${item.title} is coming soon!`);
    }
  }, [router]);

  // Parallax effect for header
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -20],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [1, 0.3, 0],
    extrapolate: 'clamp',
  });

  if (loading) {
    return <LoadingView />;
  }

  if (error) {
    return <ErrorView message={error} onRetry={fetchChecklistData} />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        
        <Navbar title="My Business Apps" />
        
        <Animated.ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FC8929']}
              tintColor="#FC8929"
              title="Pull to refresh"
              titleColor="#FC8929"
            />
          }>
          
          {/* Welcome Section with Parallax Effect */}
          <Animated.View
            style={{
              transform: [{ translateY: headerTranslateY }],
              opacity: headerOpacity,
            }}>
            <WelcomeSection 
              userName={firstName} 
              companyName={companyName}
              companyLogo={companyLogo}
              isAdmin={isAdmin}
              hasTaskAccess={hasTaskAccess}
              hasLeaveAccess={hasLeaveAccess}
            />
          </Animated.View>
          
          {/* Progress Card */}
          <ProgressCard 
            progressPercentage={progressPercentage}
            loading={checklistLoading}
            onPress={() => router.push("/(routes)/profile/Checklist")}
          />

          {/* Section Title */}
          <Text style={styles.sectionTitle}>Boost your productivity</Text>

          {/* App Cards */}
          {componentsData.map((item, index) => (
            <AppCard 
              key={item.id}
              item={item}
              index={index}
              onPress={() => handleAppPress(item)}
            />
          ))}
        </Animated.ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
    paddingBottom: 14,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Welcome Section Styles
  welcomeContainer: {
    marginTop: 10,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  welcomeGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop:10,
  },
  welcomeContent: {
    padding: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontFamily: 'Lato-Light',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  nameText: {
    fontFamily: 'LatoBold',
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 4,
  },
  companyText: {
    fontFamily: 'Lato-Light',
    fontSize: 14,
    color: '#FC8929',
    marginTop: 2,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: '#191B3A',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orangeBackground: {
    backgroundColor: "rgba(252, 137, 41, 0.8)",
  },
  statIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontFamily: 'LatoBold',
    fontSize: 22,
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: 'Lato-Light',
    fontSize: 12,
    color: '#A9A9A9',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  
  // Progress Card Styles
  progressCard: {
    marginVertical: 12,
    height: 120,
    width: CARD_WIDTH,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#37384B',
    backgroundColor: 'rgba(10, 13, 40, 0.8)',
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  arrowIcon: {
    width: 12,
    height: 12,
    tintColor: '#FFFFFF',
  },
  progressBarContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
    borderRadius: 6,
  },
  progressLoader: {
    alignSelf: 'center',
    marginTop: 4,
  },
  progressText: {
    fontFamily: 'Lato-Light',
    fontSize: 12,
    color: '#787CA5',
    marginTop: 6,
    marginLeft: 2,
  },
  
  // App Card Styles
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#37384B',
    backgroundColor: 'rgba(10, 13, 40, 0.9)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  appCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  appTextContainer: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  appTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#E3DCDC',
    marginBottom: 4,
  },
  appDescription: {
    fontFamily: 'Lato-Light',
    fontSize: 13,
    color: '#A9A9A9',
    lineHeight: 18,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 12,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(252, 137, 41, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(252, 137, 41, 0.3)',
  },
  comingSoonText: {
    fontFamily: 'Lato-Light',
    fontSize: 10,
    color: '#FC8929',
  },
  
  // Loading and Error Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0D28',
  },
  loadingText: {
    fontFamily: 'Lato-Light',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0D28',
    padding: 20,
  },
  errorText: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorSubtext: {
    fontFamily: 'Lato-Light',
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FC8929',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default HomeScreen;
