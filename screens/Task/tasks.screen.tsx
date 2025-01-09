import { Image, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DelegatedTaskScreen from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskScreen ';
import AllTaskScreen from '~/app/(routes)/HomeComponent/Tasks/AllTaskScreen';
import DashboardStack from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
// import TaskStack from '~/app/(routes)/HomeComponent/Tasks/TaskStack';
import MyAppsScreen from '~/app/(routes)/HomeComponent/Tasks/MyAppsScreen';
import DelegatedTaskStack from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskStack';
import MyTasksStack from './myTask/MyTaskStack';

const Tab = createBottomTabNavigator();

export default function TasksScreen() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#05071E', // Tab bar background
          borderWidth: 1,
          borderColor: '#815BF5',
          height: 56,
          position: 'absolute',
          bottom: 29,
          borderRadius: 30,
          marginHorizontal: 16,
          display: 'flex',
          borderTopWidth:1,
          justifyContent: 'center',
        },
        tabBarIcon: ({ focused }) => {
          // Set images for each tab
          let icon;
          if (route.name === 'Dashboard') {
            icon = require('~/assets/tabBarImages/dashboard.png');
          } else if (route.name === 'My Task') {
            icon = require('~/assets/tabBarImages/mytask.png');
          } else if (route.name === 'My Apps') {
            icon = require('~/assets/tabBarImages/delegatedtask.png');
          } else if (route.name === 'Delegated Task') {
            icon = require('~/assets/tabBarImages/Frame.png');
          } else if (route.name === 'All Task') {
            icon = require('~/assets/tabBarImages/alltask.png');
          }

          return (
            <View
              style={[
                styles.imageContainer,
                focused && styles.activeImageContainer, // Highlight active image background
              ]}>
              <Image source={icon} style={styles.icon} />
            </View>
          );
        },
        tabBarShowLabel: false, // Hides the labels
      })}>
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="My Task" component={MyTasksStack} />
      <Tab.Screen name="My Apps" component={MyAppsScreen} />
      <Tab.Screen name="Delegated Task" component={DelegatedTaskStack} />
      <Tab.Screen name="All Task" component={AllTaskScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24, // Width of the icon image
    height: 24, // Height of the icon image
    resizeMode: 'contain',
  },
  imageContainer: {
    width: 60, // Default background width
    height: 60, // Default background height
    padding: 10,
    borderRadius: 30, // Make the background circular
    marginTop: 16,
    backgroundColor: 'transparent', // Default (non-focused) background color
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeImageContainer: {
    width: 60, // Width of active tab background
    height: 44, // Height of active tab background
    borderRadius: 35, // Rounded background
    backgroundColor: '#815BF5', // Background color for active tab
    alignItems: 'center',
    justifyContent: 'center',
  },
});
