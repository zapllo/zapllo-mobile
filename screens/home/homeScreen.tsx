import React from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileButton from '~/components/profile/ProfileButton';
import Feather from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';
import Navbar from '~/components/navbar';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type HomeScreenComponents = {
  title: string;
  id: string;
  screen: any;
  description: string;
};

const componentsData: HomeScreenComponents[] = [
  {
    id: '1',
    title: 'Zapllo Task',
    screen: '(routes)/HomeComponent/Tasks',
    description: 'Delegate one time and recurring task to your team',
  },
  {
    id: '2',
    title: 'Zapllo Attendance',
    screen: '(routes)/HomeComponent/Attendance',
    description: 'Track your Team Attendance & Breaks',
  },
  {
    id: '3',
    title: 'Zapllo Events',
    screen: '(routes)/HomeComponent/Events',
    description: 'Track your Team Attendance & Breaks',
  },
  {
    id: '4',
    title: 'Zapllo Intranet',
    screen: '(routes)/HomeComponent/Intranet',
    description: 'Manage all your Important Company Links',
  },
  {
    id: '5',
    title: 'Zapllo Workflows',
    screen: '(routes)/HomeComponent/Workflows',
    description: 'Automate, Integrate & Connect anything effortlessly',
  },
  {
    id: '6',
    title: 'Zapllo Leaves',
    screen: '(routes)/HomeComponent/Leaves',
    description: 'Track, Convert & Assign Leads to your Sales Team',
  },
  {
    id: '7',
    title: 'Zapllo CRM',
    screen: '(routes)/HomeComponent/CRM',
    description: 'Track, Convert & Assign Leads to your Sales Team',
  },
];

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, token, userData } = useSelector((state: RootState) => state.auth);
  const progress = 0.7; // Set progress (70%)

  console.log('okkkkkkkk', isLoggedIn, token, userData);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-primary">
      <Navbar title="My Business Apps" />
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 ,padding:14}}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          

          {/* Progress Bar with Gradient */}
          <View className=" my-3 flex h-36 w-full flex-col items-center gap-6 rounded-2xl border border-[#37384B] bg-[#10122d] bg-opacity-50 pl-5  pr-5 pt-5">
            <View className="flex w-full  flex-row items-center justify-between">
              <Text className="text-lg text-white ">App Usage Progress</Text>
              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="arrow-top-right-thin-circle-outline"
                  size={35}
                  color="#e3dcdc"
                />
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
                <LinearGradient
                  colors={['#815BF5', '#FC8929']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: `${progress * 100}%`,
                    height: '100%',
                    borderRadius: 5,
                  }}
                />
              </View>
              <Text className=" text-xs font-thin text-[#787CA5]">55% Completed</Text>
            </View>
          </View>

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
                  source={require('~/assets/HomeComponents/Attendance.png')}
                />
                <View className="w-ull">
                  <Text className="text-lg text-[#e3dcdc]">{item.title}</Text>
                  <Text className="text-sm font-thin text-[#a9a9a9]">{item.description}</Text>
                </View>
              </View>

              <TouchableOpacity>
                <MaterialCommunityIcons
                  name="arrow-top-right-thin-circle-outline"
                  size={35}
                  color="#e3dcdc"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HomeScreen;
