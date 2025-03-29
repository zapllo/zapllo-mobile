
import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView, Keyboard, TouchableOpacity, TextInput, Animated, Platform, Image , ActivityIndicator } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { ScrollView } from "react-native";
import { TouchableWithoutFeedback } from "react-native";
import Navbar from "~/components/navbar";

import { LinearGradient } from "expo-linear-gradient";
import { EvilIcons, MaterialCommunityIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import LottieView from "lottie-react-native";

interface Holiday {
  _id: string;
  holidayName: string;
  holidayDate: string | Date;
  isEditing?: boolean;
}

// API endpoints for holidays
const API_BASE_URL = 'https://zapllo.com/api';
const HOLIDAYS_API = {
  GET_ALL: `${API_BASE_URL}/holidays`,
  CREATE: `${API_BASE_URL}/holidays`,
  UPDATE: (id: string) => `${API_BASE_URL}/holidays/${id}`,
  DELETE: (id: string) => `${API_BASE_URL}/holidays/${id}`,
  GET_USER: `${API_BASE_URL}/users/me`,
};

export default function HolidaysScreen() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHoliday, setNewHoliday] = useState({ holidayName: '', holidayDate: new Date() });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDatePickerId, setActiveDatePickerId] = useState<string | null>(null);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  
  // User state
  const [role, setRole] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState<string>('');
  const [selectedHolidayName, setSelectedHolidayName] = useState<string>('');
  
  // Date picker modal state (for iOS)
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  
  // Form validation
  const [formError, setFormError] = useState('');
  
  const addButtonAnimation = useRef(new Animated.Value(0)).current;
  const newFormAnimation = useRef(new Animated.Value(0)).current;
  
  // Create a map of refs for each holiday input
  const inputRefs = useRef<{[key: string]: React.RefObject<TextInput>}>({});
  // Add a ref for the new holiday input
  const newHolidayInputRef = useRef<TextInput>(null);
  
  // Fetch user role and holidays on component mount
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        setIsLoading(true);
        
        const res = await fetch(HOLIDAYS_API.GET_USER, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch user details: ${res.status}`);
        }
        
        const data = await res.json();
        const userRole = data.data.role;
        const userIsAdmin = data.data.isAdmin;
        
        setRole(userRole);
        setIsAdmin(userIsAdmin || userRole === 'orgAdmin');
        
        // After getting user details, fetch holidays
        fetchHolidays();
      } catch (error) {
        console.error('Error fetching user details:', error);
        setIsLoading(false);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load user details'
        });
      }
    };
    
    getUserDetails();
  }, []);
  
  // Fetch holidays from API
  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(HOLIDAYS_API.GET_ALL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch holidays: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Convert date strings to Date objects for each holiday
      // Make sure to handle potential invalid dates
      const formattedHolidays = data.holidays.map((holiday: any) => {
        try {
          const date = new Date(holiday.holidayDate);
          // Check if date is valid
          if (isNaN(date.getTime())) {
            // If invalid, use current date
            return {
              ...holiday,
              holidayDate: new Date()
            };
          }
          return {
            ...holiday,
            holidayDate: date
          };
        } catch (e) {
          // Fallback to current date if parsing fails
          return {
            ...holiday,
            holidayDate: new Date()
          };
        }
      });
      
      setHolidays(formattedHolidays);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load holidays'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize refs for existing holidays
  useEffect(() => {
    holidays.forEach(holiday => {
      if (!inputRefs.current[holiday._id]) {
        inputRefs.current[holiday._id] = React.createRef<TextInput>();
      }
    });
  }, [holidays]);

  // Auto-focus on input when edit mode is activated
  useEffect(() => {
    const editingHoliday = holidays.find(h => h.isEditing);
    if (editingHoliday && inputRefs.current[editingHoliday._id]) {
      // Small delay to ensure the component is rendered before focusing
      setTimeout(() => {
        inputRefs.current[editingHoliday._id]?.current?.focus();
      }, 100);
    }
  }, [holidays]);

  // Auto-focus on new holiday input when form appears
  useEffect(() => {
    if (isAddingNew) {
      // Small delay to ensure the animation has started and component is rendered
      setTimeout(() => {
        newHolidayInputRef.current?.focus();
      }, 150);
    }
  }, [isAddingNew]);

  useEffect(() => {
    Animated.timing(newFormAnimation, {
      toValue: isAddingNew ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isAddingNew]);

  const toggleAddNew = () => {
    Animated.sequence([
      Animated.timing(addButtonAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(addButtonAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setIsAddingNew(!isAddingNew);
    if (!isAddingNew) {
      setNewHoliday({ holidayName: '', holidayDate: new Date() });
      setFormError('');
    }
  };

  // Validate form before submission
  const validateHolidayForm = () => {
    if (!newHoliday.holidayName.trim()) {
      setFormError('Please enter a holiday name');
      return false;
    }
    setFormError('');
    return true;
  };

  // Format date to ISO string with timezone handling
  const formatDateForAPI = (date: Date) => {
    // Create a new date object to avoid modifying the original
    const formattedDate = new Date(date);
    // Set time to noon to avoid timezone issues
    formattedDate.setHours(12, 0, 0, 0);
    // Format as YYYY-MM-DD
    return formattedDate.toISOString().split('T')[0];
  };

  // Add a new holiday
  const handleAddHoliday = async () => {
    // Validate form first
    if (!validateHolidayForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format date properly for API
      const dateString = formatDateForAPI(newHoliday.holidayDate);
      
      // Make sure to trim the holiday name to avoid whitespace issues
      const holidayName = newHoliday.holidayName.trim();
      
      const payload = {
        holidayName: holidayName,
        holidayDate: dateString
      };
      
      // Log the payload for debugging
      console.log('Add holiday payload:', payload);
      
      // Use a more robust fetch approach with better error handling
      const response = await fetch(HOLIDAYS_API.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      
      // Get the response text first
      const responseText = await response.text();
      
      // Try to parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response JSON:', responseText);
        throw new Error('Invalid server response format');
      }
      
      if (!response.ok) {
        throw new Error(`Failed to add holiday: ${response.status} - ${data?.message || 'Unknown error'}`);
      }
      
      // Get the created holiday data
      const createdHoliday = data.data || data;
      
      // Create a new holiday object with the data we sent, in case the response is missing data
      const newHolidayObj = {
        _id: createdHoliday._id,
        holidayName: holidayName, // Use the name we sent, not what came back
        holidayDate: new Date(dateString)
      };
      
      // Add the new holiday to the state
      setHolidays(prevHolidays => [...prevHolidays, newHolidayObj]);
      
      // Reset form and close it
      setNewHoliday({ holidayName: '', holidayDate: new Date() });
      setIsAddingNew(false);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Holiday added successfully'
      });
      
      // Refresh the holidays list to ensure we have the latest data
      setTimeout(() => {
        fetchHolidays();
      }, 1000);
      
    } catch (error) {
      console.error('Error adding holiday:', error);
      
      // Even if there's an error, try to refresh the holidays list
      // This handles the case where the holiday was added but the response had an error
      setTimeout(() => {
        fetchHolidays();
      }, 1000);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'There was an issue adding the holiday. Please refresh to see updates.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEdit = (id: string) => {
    setHolidays(holidays.map(holiday => 
      holiday._id === id 
        ? { ...holiday, isEditing: !holiday.isEditing } 
        : { ...holiday, isEditing: false }
    ));
  };

  const updateHoliday = (id: string, field: 'holidayName' | 'holidayDate', value: string | Date) => {
    setHolidays(holidays.map(holiday => 
      holiday._id === id ? { ...holiday, [field]: value } : holiday
    ));
  };

  // Save updated holiday to API
  const saveHolidayChanges = async (id: string) => {
    const holidayToUpdate = holidays.find(h => h._id === id);
    
    if (!holidayToUpdate) return;
    
    // Validate holiday name
    if (!holidayToUpdate.holidayName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Holiday name cannot be empty'
      });
      return;
    }
    
    try {
      setIsUpdating(id);
      
      // Format date properly for API
      const dateString = formatDateForAPI(
        holidayToUpdate.holidayDate instanceof Date 
          ? holidayToUpdate.holidayDate 
          : new Date(holidayToUpdate.holidayDate)
      );
      
      // Trim the holiday name to avoid whitespace issues
      const holidayName = holidayToUpdate.holidayName.trim();
      
      // Create a proper payload with both fields
      const payload = {
        holidayName: holidayName,
        holidayDate: dateString
      };
      
      // Log the payload for debugging
      console.log('Update payload:', payload);
      
      // Use a more robust fetch approach
      const response = await fetch(HOLIDAYS_API.UPDATE(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      
      // Get the response text first
      const responseText = await response.text();
      
      // Try to parse it as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response JSON:', responseText);
        
        // If we can't parse the response but the status is OK, we'll assume it worked
        if (response.ok) {
          // Update the local state with what we sent
          setHolidays(holidays.map(holiday => 
            holiday._id === id 
              ? { 
                  ...holiday, 
                  holidayName: holidayName,
                  holidayDate: new Date(dateString),
                  isEditing: false
                } 
              : holiday
          ));
          
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Holiday updated successfully'
          });
          
          return; // Exit early since we've handled the update
        } else {
          throw new Error('Invalid server response format');
        }
      }
      
      if (!response.ok) {
        throw new Error(`Failed to update holiday: ${response.status} - ${data?.message || 'Unknown error'}`);
      }
      
      // Turn off edit mode
      toggleEdit(id);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Holiday updated successfully'
      });
      
      // Refresh holidays to ensure we have the latest data
      fetchHolidays();
      
    } catch (error) {
      console.error('Error updating holiday:', error);
      
      // Try to refresh holidays list in case the update succeeded but response failed
      setTimeout(() => {
        fetchHolidays();
      }, 1000);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update holiday. Please refresh to see latest changes.'
      });
    } finally {
      setIsUpdating(null);
    }
  };

  // Open delete modal
  const openDeleteModal = (id: string) => {
    const holiday = holidays.find(h => h._id === id);
    if (holiday) {
      setSelectedHolidayId(id);
      setSelectedHolidayName(holiday.holidayName);
      setDeleteModal(true);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModal(false);
  };

  // Confirm delete and call API
  const confirmDelete = async () => {
    try {
      setIsDeleting(selectedHolidayId);
      
      const response = await fetch(HOLIDAYS_API.DELETE(selectedHolidayId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      // Handle non-JSON responses
      if (!response.ok) {
        // Try to get the error message from JSON if possible
        let errorMessage = `Failed to delete holiday: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.message || 'Unknown error'}`;
        } catch (e) {
          // If we can't parse JSON, just use the status text
          errorMessage += ` - ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Update state after successful deletion
      setHolidays(holidays.filter(holiday => holiday._id !== selectedHolidayId));
      
      // Clean up the ref when deleting a holiday
      delete inputRefs.current[selectedHolidayId];
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Holiday deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting holiday:', error);
      
      // Try to refresh holidays list in case the delete succeeded but response failed
      setTimeout(() => {
        fetchHolidays();
      }, 1000);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete holiday. Please refresh to see latest changes.'
      });
    } finally {
      setIsDeleting(null);
      setDeleteModal(false);
    }
  };

  // Handle date change for Android
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate && activeDatePickerId) {
      // Ensure the date is valid
      if (!isNaN(selectedDate.getTime())) {
        // Set time to noon to avoid timezone issues
        selectedDate.setHours(12, 0, 0, 0);
        
        if (activeDatePickerId === 'new') {
          setNewHoliday({ ...newHoliday, holidayDate: selectedDate });
        } else {
          updateHoliday(activeDatePickerId, 'holidayDate', selectedDate);
        }
      }
    }
    
    if (Platform.OS === 'ios') {
      setTempSelectedDate(selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : tempSelectedDate);
    } else {
      setActiveDatePickerId(null);
    }
  };

  // Open date picker based on platform
  const openDatePicker = (id: string) => {
    setActiveDatePickerId(id);
    
    // Set initial date value
    if (id === 'new') {
      setTempSelectedDate(newHoliday.holidayDate);
    } else {
      const holiday = holidays.find(h => h._id === id);
      if (holiday) {
        const holidayDate = holiday.holidayDate instanceof Date 
          ? holiday.holidayDate 
          : new Date(holiday.holidayDate);
        setTempSelectedDate(holidayDate);
      }
    }
    
    if (Platform.OS === 'ios') {
      setDatePickerVisible(true);
    } else {
      setShowDatePicker(true);
    }
  };

  // Confirm date selection for iOS
  const confirmIOSDateSelection = () => {
    if (activeDatePickerId === 'new') {
      // Ensure the date is valid and set time to noon
      const validDate = new Date(tempSelectedDate);
      validDate.setHours(12, 0, 0, 0);
      
      setNewHoliday({ ...newHoliday, holidayDate: validDate });
    } else if (activeDatePickerId) {
      // Ensure the date is valid and set time to noon
      const validDate = new Date(tempSelectedDate);
      validDate.setHours(12, 0, 0, 0);
      
      updateHoliday(activeDatePickerId, 'holidayDate', validDate);
    }
    
    setDatePickerVisible(false);
    setActiveDatePickerId(null);
  };

  // Cancel date selection for iOS
  const cancelIOSDateSelection = () => {
    setDatePickerVisible(false);
    setActiveDatePickerId(null);
  };

  const formHeight = newFormAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 270]
  });

  const formOpacity = newFormAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });

  if (isLoading) {
    return (
      <SafeAreaView className="h-full flex-1 bg-primary">
        <Navbar title="Holidays" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#815BF5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <Navbar title="Holidays" />
      <KeyboardAvoidingView style={{ flex: 1 }} className={`${isAdmin ? "pt-2":" pt-8"}`} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Only show Add New Holiday button for admins */}
            {isAdmin && (
              <TouchableOpacity 
                style={styles.holidayButton}
                onPress={toggleAddNew}
                activeOpacity={0.8}
              >          
                <Animated.View style={{ transform: [{ scale: addButtonAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 0.95, 1]
                }) }] }}>
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={['#c3efc3', '#008800']}
                    style={styles.gradientBorders}
                  >
                    <View className='bg-primary rounded-full p-4 px-7 flex items-center flex-row gap-3'>
                      <AntDesign name={isAddingNew ? "close" : "plus"} size={16} color="#fff" />
                      <Text className='text-white text-sm' style={{fontFamily:"LatoBold"}}>
                        {isAddingNew ? "Cancel" : "Add New Holiday"}
                      </Text>
                    </View>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            )}

            {/* New Holiday Form - only visible for admins */}
            {isAdmin && (
              <Animated.View 
                style={[
                  styles.newHolidayForm, 
                  { height: formHeight, opacity: formOpacity }
                ]}
              >
                <View className="w-full px-4 pt-6">
                  <View className="mb-4">
                    <Text className="text-secondary text-xs mb-2" style={{fontFamily:"LatoBold"}}>Holiday Name</Text>
                    <TextInput
                      ref={newHolidayInputRef}
                      className={`bg-[#10122D] text-white p-3 rounded-lg border ${formError ? 'border-red-500' : 'border-[#37384B]'}`}
                      placeholder="Enter holiday name"
                      placeholderTextColor="#787CA5"
                      value={newHoliday.holidayName}
                      onChangeText={(text) => {
                        setNewHoliday({...newHoliday, holidayName: text});
                        if (text.trim()) setFormError('');
                      }}
                    />
                    {formError ? (
                      <Text className="text-red-500 text-xs mt-1">{formError}</Text>
                    ) : null}
                  </View>
                  
                  <View className="mb-4">
                    <Text className="text-secondary text-xs mb-2" style={{fontFamily:"LatoBold"}}>Date</Text>
                    <TouchableOpacity 
                      className="bg-[#10122D] p-3 rounded-lg border border-[#37384B] flex-row justify-between items-center"
                      onPress={() => openDatePicker('new')}
                    >
                      <Text className="text-white">{format(newHoliday.holidayDate, 'dd MMM yyyy')}</Text>
                      
                      <EvilIcons name="calendar" size={24} color="#787CA5" className="bg-[#1A1C3D]"/>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    onPress={handleAddHoliday}
                    disabled={isSubmitting}
                    className={`w-full ${isSubmitting ? 'bg-[#5a4199]' : 'bg-[#815BF5]'} rounded-full py-3 mt-4 items-center`}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text className="text-white" style={{fontFamily:"LatoBold"}}>Add Holiday</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}

            {/* Holiday List */}
            {holidays.length === 0 && !isLoading ? (
              <View className="flex-1 justify-center items-center mb-36">
               <LottieView
                 source={require('../../../assets/Animation/holiday.json')}
                 autoPlay
                 loop
                 style={{ width: 200, height: 200 }}
               />               
                <Text className="text-white text-lg mt-6" style={{fontFamily:"LatoBold"}}>No holidays found</Text>
              </View>
            ) : (
              holidays.map((holiday, index) => (
                
                <View
                  key={`holiday-${holiday._id || index}`} 
                  className="border w-[90%] border-[#37384B] flex flex-col p-5 rounded-xl mb-4 bg-[#10122D]"
                  style={[
                    styles.holidayCard,
                    holiday.isEditing && styles.holidayCardExpanded
                  ]}
                >
                  {holiday.isEditing ? (
                    // Edit Mode - only for admins
                    <View className="w-full">
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-white text-lg" style={{fontFamily:"LatoBold"}}>Edit Holiday</Text>
                        <TouchableOpacity onPress={() => toggleEdit(holiday._id)}>
                          <AntDesign name="close" size={20} color="#787CA5" />
                        </TouchableOpacity>
                      </View>
                      
                      <View className="mb-4">
                        <Text className="text-secondary text-xs mb-2" style={{fontFamily:"LatoBold"}}>Holiday Name</Text>
                        <TextInput
                          ref={inputRefs.current[holiday._id]}
                          className="bg-[#191B3A] text-white p-3 rounded-lg"
                          value={holiday.holidayName}
                          onChangeText={(text) => updateHoliday(holiday._id, 'holidayName', text)}
                          selectTextOnFocus
                        />
                      </View>
                      
                      <View className="mb-4">
                        <Text className="text-secondary text-xs mb-2" style={{fontFamily:"LatoBold"}}>Date</Text>
                        <TouchableOpacity 
                          className="bg-primary p-3 rounded-lg flex-row justify-between items-center"
                          onPress={() => openDatePicker(holiday._id)}
                        >
                          <Text className="text-white">
                            {format(
                              holiday.holidayDate instanceof Date 
                                ? holiday.holidayDate 
                                : new Date(holiday.holidayDate), 
                              'dd MMM yyyy'
                            )}
                          </Text>
                          <EvilIcons name="calendar" size={24} color="#787CA5" />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity 
                        onPress={() => saveHolidayChanges(holiday._id)}
                        disabled={isUpdating === holiday._id}
                        className={`w-full ${isUpdating === holiday._id ? 'bg-[#5a4199]' : 'bg-[#815BF5]'} rounded-full py-3 mt-4 items-center`}
                      >
                        {isUpdating === holiday._id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text className="text-white" style={{fontFamily:"LatoBold"}}>Save Changes</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    // View Mode
                    <>
                      <View className="flex flex-row justify-between items-start">
                        <View className="flex flex-col gap-4">
                          <View className="flex flex-row items-center gap-2">
                          <View className="w-8 h-8 rounded-full bg-[#1A1C3D] items-center justify-center mr-3">                          
                            <MaterialCommunityIcons name="beach" size={20} color="#787CA5" />
                            </View>
                            <View className="flex justify-center">
                              <Text className="text-secondary text-xs mb-1" style={{fontFamily:"LatoBold"}}>Holiday For</Text>
                              <Text className="text-white mb-1" style={{fontFamily:"LatoBold"}}>{holiday.holidayName}</Text>
                            </View>
                          </View>
                          <View className="flex flex-row items-center gap-2">
                          <View className="w-8 h-8 rounded-full bg-[#1A1C3D] items-center justify-center mr-3">
                            <EvilIcons name="calendar" size={22} color="#787CA5" />
                            </View>
                            <View className="flex justify-center ">
                              <Text className="text-secondary text-xs mb-1" style={{fontFamily:"LatoBold"}}>Date</Text>
                              <Text className="text-white mb-1" style={{fontFamily:"LatoBold"}}>
                                {format(
                                  holiday.holidayDate instanceof Date 
                                    ? holiday.holidayDate 
                                    : new Date(holiday.holidayDate), 
                                  'dd MMM yyyy'
                                )}
                              </Text>
                            </View>
                          </View>
                        </View>
                        
                        {/* Only show edit/delete buttons for admins */}
                        {isAdmin && (
                          <View className="flex flex-row items-center gap-5">
                            <TouchableOpacity 
                              className="h-8 w-8 bg-[#37384B] rounded-full items-center justify-center" 
                              onPress={() => toggleEdit(holiday._id)}
                              disabled={isDeleting === holiday._id}
                            >
                              <Image 
                                className="w-4 h-4" 
                                source={require("../../../assets/Tasks/addto.png")} 
                              />
                            </TouchableOpacity>
                            <TouchableOpacity 
                              className="h-8 w-8 bg-[#37384B] rounded-full items-center justify-center" 
                              onPress={() => openDeleteModal(holiday._id)}
                              disabled={isDeleting === holiday._id}
                            >
                              {isDeleting === holiday._id ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <Image 
                                  className="w-4 h-4" 
                                  source={require("../../../assets/Tasks/deleteTwo.png")} 
                                />
                              )}
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </>
                  )}
                </View>
              ))
            )}
            
            {/* Android Date Picker */}
            {Platform.OS === 'android' && showDatePicker && (
              <DateTimePicker
                value={activeDatePickerId === 'new' 
                  ? newHoliday.holidayDate 
                  : new Date(holidays.find(h => h._id === activeDatePickerId)?.holidayDate || new Date())}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* iOS Date Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          isVisible={datePickerVisible}
          onBackdropPress={cancelIOSDateSelection}
          style={{ justifyContent: 'flex-end', margin: 0 }}
        >
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={cancelIOSDateSelection}>
                <Text style={styles.datePickerCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmIOSDateSelection}>
                <Text style={styles.datePickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempSelectedDate}
              mode="date"
              display="spinner"
              onChange={(event, date) => date && setTempSelectedDate(date)}
              style={styles.datePicker}
            />
          </View>
        </Modal>
      )}

      {/* Delete Modal */}
      <Modal
        isVisible={deleteModal}
        onBackdropPress={cancelDelete}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View
          style={{
            backgroundColor: '#0A0D28',
            padding: 20,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            paddingBottom: 55,
            paddingTop: 35,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Image
              style={{ width: 80, height: 80, marginBottom: 20 }}
              source={require('../../../assets/Tickit/delIcon.png')}
            />
            <Text style={{ color: 'white', fontSize: 24 }}>Are you sure you want to</Text>
            <Text style={{ color: 'white', fontSize: 24, marginBottom: 10 }}>delete this holiday?</Text>
            <Text style={{ color: '#787CA5' }}>You're going to delete the holiday</Text>
            <Text style={{ color: '#787CA5', marginBottom: 20 }}>"{selectedHolidayName}". Are you sure?</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#37384B',
                  padding: 15,
                  borderRadius: 30,
                  flex: 1,
                  marginRight: 10,
                }}
                onPress={cancelDelete}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
                  No, Keep It.
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: '#EF4444', padding: 15, borderRadius: 30, flex: 1 }}
                onPress={confirmDelete}
                disabled={isDeleting !== null}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
                    Delete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Toast message component */}
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gradientBorders: {
    padding: 2,
    borderRadius: 1000,
  },
  holidayButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 20,
    marginBottom: 10,
  },
  newHolidayForm: {
    width: '90%',
    backgroundColor: '#191B3A',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  holidayCard: {
    transition: '0.3s',
  },
  holidayCardExpanded: {
    backgroundColor: '#191B3A',
  },
  datePickerContainer: {
    backgroundColor: '#191B3A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  datePickerCancel: {
    color: '#787CA5',
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerDone: {
    color: '#815BF5',
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    backgroundColor: '#191B3A',
    height: 200,
  },
});
