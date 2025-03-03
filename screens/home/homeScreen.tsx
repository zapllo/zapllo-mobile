import React, { useCallback, useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Navbar from '~/components/navbar';
import axios from 'axios';
import { backend_Host } from '~/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';

type HomeScreenComponents = {
  title: string;
  id: string;
  screen: any;
  description: string;
  image: any;
};

interface ChecklistItem {
  _id: string;
  text: string;
  image?: any;
}

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
    title: 'Zapllo Attendance (Coming Soon)',
    screen: '',
    //(routes)/HomeComponent/Attendance
    description: 'Track your Team Attendance & Breaks',
    image: require('~/assets/HomeComponents/ZAttendance.png'), 
  },
  // {
  //   id: '3',
  //   title: 'Zapllo Events',
  //   screen: '(routes)/HomeComponent/Events',
  //   description: 'Live Q&A Classes and Weekly Business Growth Sessions',
  //   image: require('~/assets/HomeComponents/ZEvents.png'), 
  // },
  {
    id: '4',
    title: 'Zapllo Intranet',
    screen: '',
    description: 'Manage all your Important Company Links',
    image: require('~/assets/HomeComponents/ZInternet.png'), 
  },
  // {
  //   id: '5',
  //   title: 'Zapllo Workflows',
  //   screen: '(routes)/HomeComponent/Tasks/Workflows',
  //   description: 'Automate, Integrate & Connect anything effortlessly',
  //   image: require('~/assets/HomeComponents/ZWorkflow.png'), 
  // },
  {
    id: '6',
    title: 'Zapllo Leaves (Coming Soon)',
    screen: '',
    //(routes)/HomeComponent/Leaves
    description: 'Manage your Employee Leaves & Holidays',
    image: require('~/assets/HomeComponents/ZLeave.png'), 
  },
  // {
  //   id: '7',
  //   title: 'Zapllo CRM',
  //   screen: '(routes)/HomeComponent/Tasks/TaskCategories',
  //   description: 'rack, Convert & Assign Leads to your Sales Team',
  //   image: require('~/assets/HomeComponents/ZCRM.png'), 
  // },
  {
    id: '8',
    title: 'Zapllo AI Assistant (Coming Soon)',
    screen: '',
    //(routes)/HomeComponent/AIAssistant
    description: 'Upgrade your experience by 10X with our proprietory AI Technology',
    image: require('~/assets/HomeComponents/ZAi.png'), 
  },
];

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { userData } = useSelector((state: RootState) => state.auth);
  const userId = userData?.data?._id || "anonymous";
  const STORAGE_KEY = `@zapllo_checklist_${userId}`;
  
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [checkedItems, setCheckedItems] = useState<boolean[]>([]);
  const [progressPercentage, setProgressPercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to load saved checklist state from AsyncStorage
  const loadSavedChecklistState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
      return null;
    } catch (error) {
      console.error("Error loading saved checklist state:", error);
      return null;
    }
  };

  // Function to fetch checklist items and checked state
  const fetchChecklistData = useCallback(async () => {
    setLoading(true);
    try {
      // First try to load saved state
      const savedState = await loadSavedChecklistState();
      
      // Fetch fresh data from API
      const response = await axios.get(`${backend_Host}/checklist/get`);
      const apiItems = response.data.checklistItems;
      
      setChecklistItems(apiItems);
      
      // If we have saved state and the number of items matches
      if (savedState && savedState.items.length === apiItems.length) {
        setCheckedItems(savedState.checked);
      } else {
        // Initialize all items as unchecked
        setCheckedItems(Array(apiItems.length).fill(false));
      }
      
      // Calculate progress percentage
      if (savedState && savedState.checked) {
        const checkedCount = savedState.checked.filter(Boolean).length;
        const totalItems = apiItems.length;
        const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
        setProgressPercentage(progress);
      }
      
    } catch (err) {
      console.error("Error fetching checklist data:", err);
      setError(err.message);
      
      // If API fails, try to use saved state as fallback
      const savedState = await loadSavedChecklistState();
      if (savedState) {
        setChecklistItems(savedState.items);
        setCheckedItems(savedState.checked);
        
        const checkedCount = savedState.checked.filter(Boolean).length;
        const totalItems = savedState.items.length;
        const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
        setProgressPercentage(progress);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Set up a listener for AsyncStorage changes
  useEffect(() => {
    const checkForStorageChanges = async () => {
      const savedState = await loadSavedChecklistState();
      if (savedState && savedState.checked && checklistItems.length > 0) {
        const checkedCount = savedState.checked.filter(Boolean).length;
        const progress = Math.round((checkedCount / checklistItems.length) * 100);
        setProgressPercentage(progress);
        setCheckedItems(savedState.checked);
      }
    };

    // Set up an interval to check for changes
    const intervalId = setInterval(checkForStorageChanges, 2000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [checklistItems]);

  // Use useFocusEffect to call fetchChecklistData when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchChecklistData();
    }, [fetchChecklistData])
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#FC8929" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <Text className="text-white">Error: {error}</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-primary pb-14">
      <Navbar title="My Business Apps" />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20, padding: 14 }}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          
          {/* Progress Bar with Gradient */}
          <TouchableOpacity
            onPress={() => router.push("/(routes)/profile/Checklist")}
            className="my-3 flex h-36 w-full flex-col items-center gap-6 rounded-2xl border border-[#37384B] bg-opacity-50 pl-5 pr-5 pt-5">
            <View className="flex w-full flex-row items-center justify-between">
              <Text className="text-lg text-white" style={{fontFamily: "LatoBold"}}>App Usage Progress</Text>
              <TouchableOpacity className='border border-white w-8 h-8 items-center justify-center flex rounded-full'>
                <Image className='w-3 h-3' source={require("../../assets/HomeComponents/goto.png")}/>
              </TouchableOpacity>
            </View>

            {/* Progress bar */}
            <View className="h-full w-full">
              <View
                style={{
                  width: '100%',
                  height: 11,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 5,
                }}>
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color="#FC8929"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginLeft: -20,
                      marginTop: -20,
                    }}
                  />
                ) : (
                  <LinearGradient
                    colors={['#815BF5', '#FC8929']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: `${progressPercentage}%`,
                      height: '100%',
                      borderRadius: 5,
                    }}
                  />
                )}
              </View>
              <Text className="text-xs ml-1 mt-1 text-[#787CA5]" style={{fontFamily: "Lato-Light"}}>
                {loading ? 'Loading...' : `${progressPercentage}% Completed`}
              </Text>
            </View>
          </TouchableOpacity>

          {componentsData.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="my-2 flex h-auto shadow-md flex-row items-start justify-center rounded-3xl border border-[#37384B] bg-[#0A0D28] p-4 pl-12 pr-12 pt-3"
              onPress={() => {
                console.log(`Navigating to: ${item.screen}`);
                {
                  item.screen ?
                  router.push(item.screen) :
                  ""
                }
              }}>
              <View className="flex w-full items-start gap-3">
                <Image
                  className="h-14 w-14"
                  source={item.image}
                />
                <View className="w-ull">
                  <Text className="text-lg text-[#e3dcdc]" style={{fontFamily: "LatoBold"}}>{item.title}</Text>
                  <Text className="text-[13px] text-[#a9a9a9]" style={{fontFamily: "Lato-Light"}}>{item.description}</Text>
                </View>
              </View>

              <TouchableOpacity className='border mt-1 ml-5 border-white shadow-md w-8 h-8 items-center justify-center flex rounded-full'>
                <Image className='w-3 h-3' source={require("../../assets/HomeComponents/goto.png")}/>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HomeScreen;