import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileButton from '~/components/profile/ProfileButton';
import Feather from 'react-native-vector-icons/Feather';
import { LinearGradient } from 'expo-linear-gradient';

type HomeScreenComponents = {
  title: string;
  id: string;
  screen: any;
  description: string;
};

const componentsData: HomeScreenComponents[] = [
  { id: '1', title: 'Zapllo Task', screen: '(routes)/HomeComponent/Tasks', description: 'Delegate one time and recurring task to your team' },
  { id: '2', title: 'Zapllo Attendance', screen: '(routes)/HomeComponent/Attendance', description: 'Track your Team Attendance & Breaks' },
  { id: '3', title: 'Zapllo Events', screen: '(routes)/HomeComponent/Events', description: 'Track your Team Attendance & Breaks' },
  { id: '4', title: 'Zapllo Intranet', screen: '(routes)/HomeComponent/Intranet', description: 'Manage all your Important Company Links' },
  { id: '5', title: 'Zapllo Workflows', screen: '(routes)/HomeComponent/Workflows', description: 'Automate, Integrate & Connect anything effortlessly' },
  { id: '6', title: 'Zapllo Leaves', screen: '(routes)/HomeComponent/Leaves', description: 'Track, Convert & Assign Leads to your Sales Team' },
  { id: '7', title: 'Zapllo CRM', screen: '(routes)/HomeComponent/CRM', description: 'Track, Convert & Assign Leads to your Sales Team' },
];

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const progress = 0.7; // Set progress (70%)

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="bg-primary flex-1 p-3">
        <ScrollView 
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        >
          <View className="w-full h-20 flex flex-row justify-between p-4 items-center ">
            <Image className="w-7 h-7" source={require("~/assets/home/logo.png")}/>
            <Text className=" text-xl pl-4 text-[#e3dcdc]">My Business Apps</Text>
            <ProfileButton/>
          </View>

          {/* Progress Bar with Gradient */}
          <View className=" w-full pt-5 pl-5 pr-5 my-3 bg-[#10122d] opacity-60 rounded-xl items-center flex h-44 border border-[#37384B]  flex-col gap-6">

            <View className='flex w-full  justify-between items-center flex-row'>
              <Text className='text-white text-lg '>App Usage Progress</Text>
              <TouchableOpacity className=' border-white bg-primary w-[50px] h-[40px] rounded-full items-center justify-center '>
                <Feather name="arrow-up-right" size={24} color="#e3dcdc" />
              </TouchableOpacity>
            </View>

            {/* //bar */}
            <View className=' w-full h-full'>
            <View style={{ width: "100%", height: 11, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 5 }}>
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
            <Text className=' text-xs font-thin text-[#787CA5]'>55% Completed</Text>
            </View>

          </View>

          {componentsData.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="p-4 pt-5 pl-12 pr-12 my-3 rounded-2xl items-start flex flex-row justify-center h-48 border border-[#37384B]"
              onPress={() => {
                console.log(`Navigating to: ${item.screen}`);
                router.push(item.screen);
              }} 
            >
              <View className='flex w-full items-start gap-3'>
                <Image className='h-14 w-14' source={require("~/assets/HomeComponents/Attendance.png")}/>
                <View className='w-ull'>
                  <Text className="text-lg text-[#e3dcdc]">{item.title}</Text>
                  <Text className="text-sm font-thin text-[#a9a9a9]">{item.description}</Text> 
                </View>
              </View>

              <TouchableOpacity className=' border border-white  w-[50px] h-[40px] rounded-full items-center justify-center '>
                <Feather name="arrow-up-right" size={24} color="#e3dcdc" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default HomeScreen;
