import React, { useCallback, useState } from 'react';
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

type HomeScreenComponents = {
  title: string;
  id: string;
  screen: any;
  description: string;
  image: any; // Add image property
};

interface ChecklistItem {
  _id: string; // Assuming each item has a unique `_id`
  name: string; // Example property, you can add more properties as needed
  image: any; // Add image property
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
    title: 'Zapllo Attendance',
    screen: '(routes)/HomeComponent/Attendance',
    description: 'Track your Team Attendance & Breaks',
    image: require('~/assets/HomeComponents/ZAttendance.png'), 
  },
  {
    id: '3',
    title: 'Zapllo Events',
    screen: '(routes)/HomeComponent/Events',
    description: 'Live Q&A Classes and Weekly Business Growth Sessions',
    image: require('~/assets/HomeComponents/ZEvents.png'), 
  },
  {
    id: '4',
    title: 'Zapllo Intranet',
    screen: '(routes)/settings',
    description: 'Manage all your Important Company Links',
    image: require('~/assets/HomeComponents/ZInternet.png'), 
  },
  {
    id: '5',
    title: 'Zapllo Workflows',
    screen: '(routes)/HomeComponent/Tasks/Workflows',
    description: 'Automate, Integrate & Connect anything effortlessly',
    image: require('~/assets/HomeComponents/ZWorkflow.png'), 
  },
  {
    id: '6',
    title: 'Zapllo Leaves',
    screen: '(routes)/HomeComponent/Leaves',
    description: 'Manage your Employee Leaves & Holidays',
    image: require('~/assets/HomeComponents/ZLeave.png'), 
  },
  {
    id: '7',
    title: 'Zapllo CRM',
    screen: '(routes)/HomeComponent/Tasks/TaskCategories',
    description: 'rack, Convert & Assign Leads to your Sales Team',
    image: require('~/assets/HomeComponents/ZCRM.png'), 
  },
  {
    id: '8',
    title: 'Zapllo AI Assistant',
    screen: '(routes)/HomeComponent/AIAssistant',
    description: 'Upgrade your experience by 10X with our proprietory AI Technology',
    image: require('~/assets/HomeComponents/ZAi.png'), 
  },
];

const HomeScreen: React.FC = () => {
  const router = useRouter();
  // const { isLoggedIn, token, userData } = useSelector((state: RootState) => state.auth);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]); // Typed state for checklist items
  const [progress, setProgress] = useState<string[]>([]); // Typed state for completed checklist item IDs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch checklist items from the API
  const fetchChecklistItems = useCallback(() => {
    axios
      .get(`${backend_Host}/checklist/get`)
      .then((response) => {
        setChecklistItems(response?.data?.checklistItems);
        console.log('object', response?.data?.checklistItems);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Use useFocusEffect to call fetchChecklistItems when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchChecklistItems(); // Trigger API call when the screen is focused
    }, [fetchChecklistItems]) // Dependency array ensures the effect only runs when focus changes
  );

  const calculateProgress = () => {
    if (!checklistItems.length) return 0;
    const completedCount = checklistItems.filter((item) => progress.includes(item._id)).length;
    const progressPercentage = (completedCount / checklistItems.length) * 100;
    return Math.round(progressPercentage);
  };

  const progressPercentage = calculateProgress();

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-primary">
      <Navbar title="My Business Apps" />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 ,padding:14}}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          

          {/* Progress Bar with Gradient */}
          <TouchableOpacity
          onPress={()=>router.push("/(routes)/profile/Checklist")}
          className=" my-3 flex h-36 w-full flex-col items-center gap-6 rounded-2xl border border-[#37384B] bg-[#10122d] bg-opacity-50 pl-5  pr-5 pt-5">
            <View className="flex w-full  flex-row items-center justify-between">
              <Text className="text-lg text-white " style={{fontFamily:"LatoBold"}}>App Usage Progress</Text>
              <TouchableOpacity className='border border-white w-8 h-8 items-center justify-center flex rounded-full'>
                <Image className='w-3 h-3' source={require("../../assets/HomeComponents/goto.png")}/>
              </TouchableOpacity>
            </View>

            {/* //bar */}
            <View className=" h-full w-full">
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
                      marginLeft: -20, // Adjust for centering
                      marginTop: -20, // Adjust for centering
                    }}
                  />
                ) : (
                  <LinearGradient
                    colors={['#815BF5', '#FC8929']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      width: `${progressPercentage}%`, // Dynamically set the width based on progress
                      height: '100%',
                      borderRadius: 5,
                    }}
                  />
                )}
              </View>
              <Text className="text-xs ml-1 mt-1 text-[#787CA5]" style={{fontFamily:"Lato-Light"}}>
                {loading ? 'Loading...' : `${progressPercentage}% Completed`}
              </Text>
            </View>
          </TouchableOpacity>

          {componentsData.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="my-3 flex h-44 flex-row items-start justify-center rounded-3xl border border-[#37384B] p-4 pl-12 pr-12 pt-5"
              onPress={() => {
                console.log(`Navigating to: ${item.screen}`);
                router.push(item.screen);
              }}>
              <View className="flex w-full items-start gap-3">
                <Image
                  className="h-14 w-14"
                  source={item.image}
                />
                <View className="w-ull">
                  <Text className="text-lg text-[#e3dcdc]" style={{fontFamily:"LatoBold"}}>{item.title}</Text>
                  <Text className="text-[13px] text-[#a9a9a9]" style={{fontFamily:"Lato-Light"}}>{item.description}</Text>
                </View>
              </View>

              <TouchableOpacity className='border mt-1 ml-5 border-white w-8 h-8 items-center justify-center flex rounded-full'>
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
