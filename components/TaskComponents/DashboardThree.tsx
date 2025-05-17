import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { DashboardStackParamList } from '~/app/(routes)/HomeComponent/Tasks/Dashboard/DashboardStack';

interface Employee {
  _id: string;
  firstName?: string;
  lastName?: string;
}

interface TaskCardProps {
  title: string;
  count: number;
  tasks: Employee[];
  status?: string;
  backgroundColor?: string;
  borderColor: string;
  onPress?: () => void;
  date?: string;
}

const DashboardThree: React.FC<TaskCardProps> = ({ 
  title, 
  count, 
  tasks = [], // Provide default empty array
  borderColor,
  onPress,
  date 
}) => {
  const screenHeight = Dimensions.get('window').height;
  const navigation = useNavigation<NavigationProp<DashboardStackParamList>>();
  const colors = ['#c3c5f7', '#ccc', '#fff', '#3399FF', '#FF33A6'];

  const getInitials = (employee: Employee): string => {
    if (!employee) return '';
    
    const firstInitial = employee?.firstName ? employee.firstName[0].toUpperCase() : '';
    const lastInitial = employee?.lastName ? employee.lastName[0].toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  // Ensure tasks is an array and filter out any invalid employees
  const validEmployees = Array.isArray(tasks) 
    ? tasks.filter(employee => employee && employee._id) 
    : [];

  return (
    <>
      <View className="flex items-start">
        <Text className="w-[30vh] text-white mb-2" style={{ fontFamily: 'LatoBold' }}>
          {title}
        </Text>
        <Text
          className="text-white text-5xl mt-1"
          style={{ fontFamily: 'LatoBold' }}>
          {count}
        </Text>
        <Text className="w-[40vw] pt-2 text-[10px] text-white" style={{ fontFamily: 'LatoBold' }}>
          {date}
        </Text>
      </View>

      <View className={`flex w-[28vw] flex-row items-center ${
        screenHeight > 900 ? 'mt-12' : 'mt-8'
      }`}>
        <View className="flex flex-row items-start">
          <View className="flex w-full flex-row">
            {validEmployees.slice(0, 2).map((employee, index) => (
              <View key={employee._id} className="relative flex flex-row">
                <View
                  className="-m-1.5 flex h-10 w-10 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor,
                    backgroundColor: colors[index % colors.length],
                  }}>
                  <Text
                    className="text-center text-sm text-black"
                    style={{ fontFamily: 'Lato-Thin' }}>
                    {getInitials(employee)}
                  </Text>
                </View>
              </View>
            ))}
            {validEmployees.length > 2 && (
              <View className="relative -m-1.5 flex flex-row">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full border-2"
                  style={{
                    borderColor,
                    backgroundColor: colors[2 % colors.length],
                  }}>
                  <Text className="text-center text-black">+{validEmployees.length - 2}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
        {onPress && (
          <TouchableOpacity onPress={onPress}>
            <View className="flex h-10 w-10 items-center justify-center self-end rounded-full border border-white">
              <Image className="h-4 w-4" source={require('~/assets/Tasks/goto.png')} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
};

export default DashboardThree;