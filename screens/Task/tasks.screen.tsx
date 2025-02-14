import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DelegatedTaskScreen from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskScreen ';
import AllTaskScreen from '~/app/(routes)/HomeComponent/Tasks/AllTaskScreen';
import DashboardStack from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
// import TaskStack from '~/app/(routes)/HomeComponent/Tasks/TaskStack';
import MyAppsScreen from '~/app/(routes)/HomeComponent/Tasks/MyAppsScreen';
import DelegatedTaskStack from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskStack';
import MyTasksStack from './myTask/MyTaskStack';
import { useState } from 'react';
import Modal from "react-native-modal";
import AllTaskModalScreen from './AllTaskModalScreen';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AssignTaskScreen from '../../app/(routes)/HomeComponent/Tasks/AssignTask/AssignTaskScreen';
import { router } from 'expo-router';

const Tab = createBottomTabNavigator();

export default function TasksScreen() {
  const [isModalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <View style={{ flex: 1 }}>
    <Tab.Navigator
      initialRouteName="Dashboard"
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
          if (route.name === 'Dashboard') {
            icon = require('~/assets/tabBarImages/dashboard.png');
            zName = "Home";
          } else if (route.name === 'My Task') {
            icon = require('~/assets/tabBarImages/mytask.png');
            zName = "My Tasks";
          } else if (route.name === 'My Apps') {
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
            <Text  className='text-white w-full text-[8px]' style={{ fontFamily: 'LatoRegular' }}>{zName}</Text>
            </View>
          </View>
            );
            },
          tabBarShowLabel: false,
          })}
          >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="My Task" component={MyTasksStack} />
      <Tab.Screen name="My Apps" component={MyAppsScreen} />
      <Tab.Screen name="Delegated Task" component={DelegatedTaskStack} />
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

    <AllTaskModalScreen
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />


      {/* add task */}
      <TouchableOpacity
        style={styles.fixedImage}
        onPress={() => router.push('/(routes)/HomeComponent/Tasks/AssignTask/AssignTaskScreen')}
      >
        <Image
          source={require("../../assets/Tasks/addIcon.png")}
          className='w-8 h-8'
        />
      </TouchableOpacity>

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
