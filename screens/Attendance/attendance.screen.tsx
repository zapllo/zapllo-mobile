import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AllTaskScreen from '~/app/(routes)/HomeComponent/Tasks/AllTaskScreen';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { router } from 'expo-router';
import DashboardStack from '~/app/(routes)/HomeComponent/Attendance/Dashboard/DashboardStack';
import MyAttendanceStack from '~/app/(routes)/HomeComponent/Attendance/MyAttendance/MyAttendanceStack';
import HomeStack from '~/app/(routes)/HomeComponent/Attendance/Home/HomeStack';
import MyLeavesStack from '~/app/(routes)/HomeComponent/Attendance/MyLeaves/MyLeavesStack';

const Tab = createBottomTabNavigator();


export default function AttendanceScreen (){
  const [isModalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#05071E', // Tab bar background
          borderWidth: 1,
          borderColor: '#815BF5',
          height: 52,
          position: 'absolute',
          bottom: 30,
          borderRadius: 30,
          marginHorizontal: 10,
          display: 'flex',
          borderTopWidth:1,
          justifyContent: 'center',
        },
        tabBarIcon: ({ focused }) => {
          // Set images for each tab
          let icon;
          let zName;
          if (route.name === 'Home') {
            icon = require('~/assets/tabBarImages/dashboard.png');
            zName = "Home";
          } else if (route.name === 'My Attendance') {
            icon = require('~/assets/Attendence/MyAttendence.png');
            zName = "My Attendance";
          } else if (route.name === 'Dashboard') {
            icon = require('~/assets/Attendence/Dashboard.png');
            zName = "dashboard";
          } else if (route.name === 'My Leaves') {
            icon = require('~/assets/Attendence/MyLeaves.png');
            zName = "My Leaves";
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
            <Text  className='text-white w-full text-[8px]' style={{ fontFamily: 'LatoRegular' }}>{zName}</Text>
            </View>
          </View>
            );
            },
          tabBarShowLabel: false,
          })}
          >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="My Attendance" component={MyAttendanceStack} />
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="My Leaves" component={MyLeavesStack} />
      <Tab.Screen
          name="All Task"
          component={AllTaskScreen}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // Prevent default action
              setModalVisible(true); // Show modal
            },
          }}
        />

        
    </Tab.Navigator>


    </View>
    
  );
}

const styles = StyleSheet.create({
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
    marginTop: 12,
    backgroundColor: 'transparent', // Default (non-focused) background color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  activeImageContainer: {
    width: 65, // Width of active tab background
    height: 42, // Height of active tab background
    borderRadius: 60, // Rounded background
    backgroundColor: '#815BF5', // Background color for active tab
    alignItems: 'center',
    justifyContent: 'center',
    display:"flex",
    
  
  },
  fixedImage: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor:"rgb(252 137 41)",
    borderRadius:"50%",
    alignItems:"center",
    justifyContent:"center"
  },
});



