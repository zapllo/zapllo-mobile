import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DelegatedTaskScreen from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskScreen ';
import AllTaskScreen from '~/app/(routes)/HomeComponent/Tasks/AllTaskScreen';
import DashboardStack from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import MyAppsScreen from '~/app/(routes)/HomeComponent/Tasks/MyAppsScreen';
import DelegatedTaskStack from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskStack';
import MyTasksStack from './myTask/MyTaskStack';
import { useState } from 'react';
import Modal from "react-native-modal";
import AllTaskModalScreen from '../../app/(routes)/HomeComponent/Tasks/AllTaskModalScreen';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { router } from 'expo-router';
import HomeScreen from '../home/homeScreen';
<<<<<<< HEAD
=======
import { LinearGradient } from 'expo-linear-gradient';
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d

const Tab = createBottomTabNavigator();

export default function TasksScreen() {
  const [isModalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
<<<<<<< HEAD
    <View style={{ flex: 1 }}>
=======
    <View style={{ flex: 1 }} className='bg-primary'>
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
      <Tab.Navigator
        initialRouteName="Dashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
<<<<<<< HEAD
          tabBarStyle: {
            backgroundColor: '#815bf5', // Tab bar background
            borderWidth: 1,
            borderColor: '#815BF5',
            height: 52,
=======
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
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
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
        <Tab.Screen name="Dashboard" component={DashboardStack} />
        <Tab.Screen name="My Task" component={MyTasksStack} />
        <Tab.Screen name="Home Screen" component={HomeScreen} />
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

<<<<<<< HEAD

      </Tab.Navigator>

=======
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
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
<<<<<<< HEAD

=======
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
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
<<<<<<< HEAD

=======
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
  },
  activeImageContainer: {
    width: 62, // Width of active tab background
    height: 42, // Height of active tab background
    borderRadius: 60, // Rounded background
<<<<<<< HEAD
    backgroundColor: '#000000', // Background color for active tab
    alignItems: 'center',
    justifyContent: 'center',
    display: "flex",


=======
    backgroundColor: '#FC842C', // Background color for active tab
    alignItems: 'center',
    justifyContent: 'center',
    display: "flex",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.55)",
>>>>>>> 321b547dd1c81cfb2641642ba0f4e434885ddb5d
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
});
