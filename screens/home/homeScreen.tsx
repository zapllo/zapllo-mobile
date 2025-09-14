
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
import NavbarThree from '~/components/navbarThree';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { checkTrialStatus, formatDate,} from '~/services/TrailExpair';
import TrialExpirationModal from '~/components/TrialExpirationModal';
import { Entypo, MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';
import { Linking } from 'react-native';
import LoadingZapllo from '~/components/LoadingZapllo';
import MaskedView from '@react-native-masked-view/masked-view';

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
const teamManagementData: HomeScreenComponents[] = [
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
    screen: '(routes)/HomeComponent/Intranet',
    description: 'Manage all your Important Company Links',
    image: require('~/assets/HomeComponents/ZInternet.png'),
  },
];

const salesMarketingData: HomeScreenComponents[] = [
  {
    id: '5',
    title: 'Zapllo WABA',
    screen: 'https://zaptick.io/',
    description: 'Official WhatsApp Business API for professional communication',
    image: require('~/assets/HomeComponents/ZWABA.png'),
  },
  {
    id: '6',
    title: 'Zapllo CRM',
    screen: 'https://crm.zapllo.com/login',
    description: 'Track, convert and assign leads to your sales team effectively',
    image: require('~/assets/HomeComponents/ZCRM.png'),
  },
  {
    id: '7',
    title: 'Zapllo AI Agents',
    screen: 'https://ai.zapllo.com/',
    description: 'Upgrade your experience 10X with proprietary AI technology',
    image: require('~/assets/HomeComponents/ZInsta.png'),
  },
  {
    id: '8',
    title: 'Instagram Automations',
    screen: '',
    description: 'Automate your Instagram marketing with AI to grow your social media presence effortlessly.',
    image: require('~/assets/HomeComponents/ZAi.png'),
    comingSoon: true,
  },
];

const supportResourcesData: HomeScreenComponents[] = [
  {
    id: '9',
    title: 'Get Support',
    screen: '(routes)/profile/Tickits',
    description: 'Need help? Create a support ticket and our team will assist you',
    image: require('~/assets/HomeComponents/ZSupport.png'),
  },
  {
    id: '10',
    title: 'Video Tutorials',
    screen: '(routes)/profile/tutorials',
    description: 'Learn how to get the best out of your business workspace',
    image: require('~/assets/HomeComponents/ZTutorials.png'),
  },
  {
    id: '11',
    title: 'Live Events',
    screen: '(routes)/HomeComponent/Events',
    description: 'Live Q&A sessions and weekly business growth workshops',
    image: require('~/assets/HomeComponents/ZEvents.png'),
  },
];

// Welcome Section Component
const WelcomeSection = ({ 
  userName, 
  companyName, 
  companyLogo,
  isAdmin,
  hasTaskAccess,
  hasLeaveAccess,
  isTrialExpired,
  showTrialModal
}: { 
  userName: string, 
  companyName: string, 
  companyLogo: string | null,
  isAdmin: boolean,
  hasTaskAccess: boolean,
  hasLeaveAccess: boolean,
  isTrialExpired: boolean,
  showTrialModal: () => void
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
  
  // Handle attendance-related actions with trial check
  const handleAttendanceAction = () => {
    // If trial is expired, show the trial modal instead of performing the action
    if (isTrialExpired) {
      showTrialModal();
      return;
    }
    
    // Otherwise, navigate to the attendance screen
    router.push("/(routes)/HomeComponent/Attendance");
  };
  
  // Handle admin attendance navigation with trial check
  const handleAdminAttendanceNav = () => {
    // If trial is expired, show the trial modal instead of navigating
    if (isTrialExpired) {
      showTrialModal();
      return;
    }
    
    // Otherwise, navigate to the appropriate screen
    if (isAdmin) {
      router.push("(routes)/HomeComponent/Attendance/AllAttendence");
    } else {
      router.push("/(routes)/HomeComponent/Tasks");
    }
  };
  
  // Handle task assignment with trial check
  const handleTaskAssignment = () => {
    // If trial is expired, show the trial modal instead of navigating
    if (isTrialExpired) {
      showTrialModal();
      return;
    }
    
    // Otherwise, navigate to the task assignment screen
    router.push("/HomeComponent/Tasks/AssignTask/AssignTaskScreen");
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
      <View style={styles.welcomeGradient}>
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
                onPress={handleAdminAttendanceNav}
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
                  onPress={handleTaskAssignment} 
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
                  onPress={handleAttendanceAction} 
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
                {isAdmin ? (
                  <View className='bg-[#815BF5] w-7 h-7 rounded-full items-center justify-center'>
                    <Entypo name='wallet' color={"#ffffff"} size={13} />
                  </View>

                ) : (
                  <Image 
                    source={require("../../assets/HomeComponents/ZTutorials.png")} 
                    style={styles.statIcon}
                  />
                )}
              </TouchableOpacity>
              <Text style={styles.statLabel}>{isAdmin ? "Premium" : "Tutorials"}</Text>
            </View>
          </View>
        </View>
      </View>
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
    // Reset animation when loading changes to ensure proper animation
    if (!loading) {
      animatedWidth.setValue(0);
      Animated.timing(animatedWidth, {
        toValue: progressPercentage,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }
  }, [progressPercentage, animatedWidth, loading]);

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
              <LoadingZapllo 
                isVisible={true}
                size="small"
                showText={false}
                showBackground={false}
              />
            ) : (
              <Animated.View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: animatedWidth.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp'
                    }) 
                  }
                ]}
              >
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
  
  // Trial expiration state
  const [isTrialExpired, setIsTrialExpired] = useState<boolean>(false);
  const [trialExpiresDate, setTrialExpiresDate] = useState<string | null>(null);
  const [showTrialModal, setShowTrialModal] = useState<boolean>(false);
  
  // Use userId for checklist storage key
  const STORAGE_KEY = `@zapllo_checklist_${userId}`;
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false); // New state to track if all data is loaded
  const [initialDataLoaded, setInitialDataLoaded] = useState(false); // Track if we have any initial data
  const [checklistLoading, setChecklistLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollY] = useState(new Animated.Value(0));

  // Check trial expiration status
  const checkTrialExpiration = useCallback(async () => {
    try {
      // Always check trial status regardless of login time
      const status = await checkTrialStatus(token);
      
      setIsTrialExpired(status.isExpired);
      setTrialExpiresDate(status.trialExpiresDate);
      
      // Show the modal immediately if trial is expired, regardless of login time
      if (status.isExpired) {
        setShowTrialModal(true);
      }
      
      return status.isExpired;
    } catch (error) {
      console.error('Error checking trial expiration:', error);
      return false;
    }
  }, [token]);

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
  
  // Modify the useFocusEffect to handle errors better and check trial expiration
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // Check if we have essential data already (user name and company info)
          const hasEssentialData = firstName && companyName;
          
          // Only show loading screen if we don't have essential data
          if (!hasEssentialData && !initialDataLoaded) {
            setLoading(true);
            setDataLoaded(false);
          }
          
          // Check trial status first before loading other data
          await checkTrialExpiration();
          
          // Then load the rest of the data
          const results = await Promise.allSettled([
            fetchChecklistProgress(),
            fetchOrganizationUsers(),
            fetchCompanyData()
          ]);
          
          // Mark data as loaded
          setDataLoaded(true);
          setInitialDataLoaded(true);
          
          // If we were showing loading screen, hide it after data is loaded
          if (!hasEssentialData) {
            // Only wait minimum time if this is the first load
            const minLoadTime = initialDataLoaded ? 0 : 800;
            setTimeout(() => {
              setLoading(false);
            }, minLoadTime);
          } else {
            // If we already had data, don't show loading
            setLoading(false);
          }
          
        } catch (error) {
          console.error("Error fetching data:", error);
          setDataLoaded(true);
          setInitialDataLoaded(true);
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
    }, [fetchChecklistProgress, fetchOrganizationUsers, fetchCompanyData, checkTrialExpiration, firstName, companyName, initialDataLoaded])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchChecklistProgress();
    fetchOrganizationUsers();
    fetchCompanyData();
    checkTrialExpiration();
  }, [fetchChecklistProgress, fetchOrganizationUsers, fetchCompanyData, checkTrialExpiration]);

  // Handle app card press with trial expiration check
  const handleAppPress = useCallback((item: HomeScreenComponents) => {
    // Always check if trying to access restricted routes when trial is expired
    if (isTrialExpired && 
        (item.screen.includes('/Tasks') || item.screen.includes('/Attendance') || item.screen.includes('/Intranet') || item.screen.includes('/Events'))) {
      setShowTrialModal(true);
      return;
    }
    
    if (item.screen) {
      if (item.screen.startsWith('http')) {
        // Open external URL
        Linking.openURL(item.screen);
      } else {
        // Navigate to internal screen
        router.push(item.screen);
      }
    } else if (item.comingSoon) {
      // Could show a toast or modal here
      console.log(`${item.title} is coming soon!`);
    }
  }, [router, isTrialExpired]);

  // Handle upgrade button press
  const handleUpgradePress = () => {
    setShowTrialModal(false);
    // Navigate to subscription or upgrade screen
    router.push("/(routes)/profile/billing");
  };

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

  // Show loading screen until data is loaded
  if (loading || !dataLoaded) {
    return (
      <LoadingZapllo 
        isVisible={true}
        size="large"
        showText={true}
      />
    );
  }

  if (error) {
    return <ErrorView message={error} onRetry={() => {
      setLoading(true);
      setDataLoaded(false);
    }} />;
  }
 
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#04061e', '#0a0d2e']}
        style={styles.container}
      >
        <SafeAreaView style={styles.transparentContainer}>
        
        <NavbarThree title="My Business Apps" />
        
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
            <View style={styles.welcomeWrapper}>
              {/* Background gradient overlay */}
              <View style={styles.backgroundGradient} />
              
              {/* Decorative elements */}
              <View style={styles.decorativeElement1} />
              <View style={styles.decorativeElement2} />
              
              <WelcomeSection 
                userName={firstName} 
                companyName={companyName}
                companyLogo={companyLogo}
                isAdmin={isAdmin}
                hasTaskAccess={hasTaskAccess}
                hasLeaveAccess={hasLeaveAccess}
                isTrialExpired={isTrialExpired}
                showTrialModal={() => setShowTrialModal(true)}
              />
            </View>
          </Animated.View>
          
          {/* Progress Card */}
          <ProgressCard 
            progressPercentage={progressPercentage}
            loading={checklistLoading}
            onPress={() => router.push("/(routes)/profile/Checklist")}
          />

     

          {/* Team Management Section */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: 'rgba(59, 130, 246, 0.3)' }]}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.sectionTextContainer}>
              <Text style={styles.sectionTitle}>Team Management</Text>
              <Text style={styles.sectionSubtitle}>Manage your team, tasks, and workplace efficiency</Text>
            </View>
          </View>
          {teamManagementData.map((item, index) => (
            <AppCard 
              key={item.id}
              item={item}
              index={index}
              onPress={() => handleAppPress(item)}
            />
          ))}

          {/* Sales & Marketing Section */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.3)' }]}>
              <AntDesign name="barschart" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.sectionTextContainer}>
              <Text style={styles.sectionTitle}>Sales & Marketing</Text>
              <Text style={styles.sectionSubtitle}>Tools to grow your business and manage customer relationships</Text>
            </View>
          </View>
          {salesMarketingData.map((item, index) => (
            <AppCard 
              key={item.id}
              item={item}
              index={index}
              onPress={() => handleAppPress(item)}
            />
          ))}

          {/* Support & Resources Section */}
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: 'rgba(168, 85, 247, 0.2)', borderColor: 'rgba(168, 85, 247, 0.3)' }]}>
              <MaterialIcons name="support-agent" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.sectionTextContainer}>
              <Text style={styles.sectionTitle}>Support & Resources</Text>
              <Text style={styles.sectionSubtitle}>Get help, learn new features, and stay updated</Text>
            </View>
          </View>
          {supportResourcesData.map((item, index) => (
            <AppCard 
              key={item.id}
              item={item}
              index={index}
              onPress={() => handleAppPress(item)}
            />
          ))}
        </Animated.ScrollView>
        
        {/* Trial Expiration Modal */}
        <TrialExpirationModal
          visible={showTrialModal}
          onClose={() => setShowTrialModal(false)}
          onUpgrade={handleUpgradePress}
          trialExpiresDate={formatDate(trialExpiresDate)}
          companyName={companyName}
        />
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  transparentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingBottom: 60,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 3,
    borderWidth: 1,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontFamily: 'Lato-Light',
    fontSize: 13,
    color: '#A9A9A9',
    lineHeight: 18,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Welcome Section Styles
  welcomeWrapper: {
    position: 'relative',
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
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(129, 91, 245, 0.03)',
    borderRadius: 20,
  },
  decorativeElement1: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(129, 91, 245, 0.06)',
    borderRadius: 30,
    opacity: 0.7,
  },
  decorativeElement2: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderRadius: 25,
    opacity: 0.7,
  },
  welcomeContainer: {
    position: 'relative',
    zIndex: 1,
  },
  welcomeGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(224, 224, 224, 0.1)',
    marginTop: 10,
    backgroundColor: 'rgba(129, 91, 245, 0.05)',
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
    backgroundColor: '#04061e',
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
    backgroundColor: '#04061e',
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