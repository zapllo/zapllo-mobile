import { NavigationContainer } from '@react-navigation/native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardScreen';
import MyTaskScreen from '~/app/(routes)/HomeComponent/Tasks/MyTaskScreen';
import DelegatedTaskScreen from '~/app/(routes)/HomeComponent/Tasks/DelegatedTaskScreen ';
import AllTaskScreen from '~/app/(routes)/HomeComponent/Tasks/AllTaskScreen';
import { Ionicons } from '@expo/vector-icons';
import DashboardStack from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';
import TaskStack from '~/app/(routes)/HomeComponent/Tasks/TaskStack';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { AppTabParamList } from '~/navigation/navigation';

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function TasksScreen() {
  const { userData } = useSelector((state: RootState) => state.auth);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#05071E', // Tab bar background
          borderWidth: 2,
          borderColor: '#815BF5',
          height: 56,
          position: 'absolute',
          bottom: 20,
          borderRadius: 30,
          marginHorizontal: 16,
          display: 'flex',

          justifyContent: 'center',
        },
        tabBarIcon: ({ focused }) => {
          // Set images for each tab
          let icon;
          if (route.name === 'Dashboard') {
            icon = require('~/assets/tabBarImages/dashboard.png');
          } else if (route.name === 'My Task') {
            icon = require('~/assets/tabBarImages/mytask.png');
          } else if (route.name === 'Delegated Task') {
            icon = require('~/assets/tabBarImages/delegatedtask.png');
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
      <Tab.Screen name="My Task" component={TaskStack} />
      <Tab.Screen name="Delegated Task" component={DelegatedTaskScreen} />
      <Tab.Screen name="All Task" component={AllTaskScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 25, // Width of the icon image
    height: 26, // Height of the icon image
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
    width: 75, // Width of active tab background
    height: 48, // Height of active tab background
    borderRadius: 35, // Rounded background
    backgroundColor: '#815BF5', // Background color for active tab
    alignItems: 'center',
    justifyContent: 'center',
  },
});
