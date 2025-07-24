import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import NavbarTwo from '~/components/navbarTwo';
import InputContainer from '../../../../components/InputContainer';
import ToggleSwitch from '../../../../components/ToggleSwitch';
import CheckboxTwo from '~/components/CheckBoxTwo';
import ToastAlert from '~/components/ToastAlert';
import axios from 'axios';

interface LeaveType {
  id?: string;
  title: string;
  isPaid: boolean;
  allotted: number;
  description: string;
  backdatedLeaveDays: number;
  advanceLeaveDays: number;
  isFullDay: boolean;
  isHalfDay: boolean;
  isShortLeave: boolean;
  isHoliday: boolean;
  isWeekOff: boolean;
  isReset: boolean;
}

export default function LeaveTypeScreen() {
  const [alloteds, setalloteds] = useState<'All' | 'Paid' | 'Unpaid'>('All');
  const [isModalVisible, setModalVisible] = useState(false);
  const [resetOrCarry, setResetOrCarry] = useState('Reset');
  const [paidOrnonPaid, setpaidOrnonPaid] = useState<'Paid' | 'Unpaid'>('Paid');
  const [leaveTitle, setLeaveTitle] = useState("");
  const [description, setDescripction] = useState("");
  const [allotedLeave, setAllotedLeave] = useState("0");
  const [backdatedLeaveDays, setBackdatedLeaveDays] = useState("0");
  const [advanceLeaveDays, setAdvanceLeaveDays] = useState("0");
  const [isDescriptionFocused, setDescriptionFocused] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isFullDay, setIsFullDay] = useState(false);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [isShortLeave, setIsShortLeave] = useState(false);
  const [isHoliday, setIsHoliday] = useState(false);
  const [isWeekOff, setIsWeekOff] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);
  const [leaveToDelete, setLeaveToDelete] = useState<LeaveType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLeavesAllotted, setTotalLeavesAllotted] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [updateBalanceModal, setUpdateBalanceModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showUpdateBalanceToast, setShowUpdateBalanceToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTitle, setToastTitle] = useState('');

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  useEffect(() => {
    // Calculate counts whenever leaveTypes changes
    calculateCounts();
  }, [leaveTypes]);

  const calculateCounts = () => {
    let total = 0;
    let paid = 0;
    let unpaid = 0;

    leaveTypes.forEach(leave => {
      total += leave.allotted;
      if (leave.isPaid) {
        paid++;
      } else {
        unpaid++;
      }
    });

    setTotalLeavesAllotted(total);
    setPaidCount(paid);
    setUnpaidCount(unpaid);
  };

  // Updated fetchLeaveTypes function to match the actual API response format
  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://zapllo.com/api/leaves/leaveType');
      
      if (Array.isArray(response.data)) {
        // Transform API data to match our component's data structure
        const transformedData = response.data.map((item: any) => ({
          id: item._id,
          title: item.leaveType,
          isPaid: item.type === 'Paid',
          allotted: item.allotedLeaves,
          description: item.description,
          backdatedLeaveDays: item.backdatedLeaveDays,
          advanceLeaveDays: item.advanceLeaveDays,
          isFullDay: item.unit.includes('Full Day'),
          isHalfDay: item.unit.includes('Half Day'),
          isShortLeave: item.unit.includes('Short Leave'),
          isHoliday: item.includeHolidays,
          isWeekOff: item.includeWeekOffs,
          isReset: item.leaveReset === 'Reset' || item.leaveReset === 'Yearly',
        }));
        
        setLeaveTypes(transformedData);
      } else {
        console.error('Unexpected API response format:', response.data);
        Alert.alert('Error', 'Received unexpected data format from server');
      }
    } catch (error) {
      console.error('Error fetching leave types:', error);
      Alert.alert('Error', 'Failed to load leave types. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFocus = () => setDescriptionFocused(true);
  const handleBlur = () => setDescriptionFocused(false);

  const handleReportOptionPressAdmin = (option: 'All' | 'Paid' | 'Unpaid') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setalloteds(option);
  };

  const toggleModal = () => {
    setModalVisible(prevState => !prevState);
    if (isModalVisible) {
      setEditingLeaveType(null);
      resetModal();
    }
  };

  const handleOptionPress = (option: string) => {
    setResetOrCarry(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handlePaidOrNonPaid = (option: 'Paid' | 'Unpaid') => {
    setpaidOrnonPaid(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleDelete = (leave: LeaveType) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setLeaveToDelete(leave);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (leaveToDelete) {
      setIsLoading(true);
      try {
        // Using axios instead of fetch for consistency
        await axios.delete(`https://zapllo.com/api/leaves/leaveType/${leaveToDelete.id}`);
        
        setLeaveTypes(leaveTypes.filter(leave => leave.id !== leaveToDelete.id));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Show delete success toast
        setToastTitle('Leave Type Deleted!');
        setToastMessage(`${leaveToDelete.title} has been deleted successfully.`);
        setShowDeleteToast(true);
      } catch (error) {
        console.error('Error deleting leave type:', error);
        Alert.alert('Error', 'Failed to delete leave type. Please try again.');
      } finally {
        setIsLoading(false);
        setLeaveToDelete(null);
        setDeleteModal(false);
      }
    }
  };

  const cancelDelete = () => {
    Haptics.selectionAsync();
    setDeleteModal(false);
    setLeaveToDelete(null);
  };

  // Updated addLeaveType function to match the API expectations
  const addLeaveType = async () => {
    if (!leaveTitle.trim()) {
      Alert.alert('Error', 'Leave type title is required');
      return;
    }

    // Validate at least one unit is selected
    if (!isFullDay && !isHalfDay && !isShortLeave) {
      Alert.alert('Error', 'Please select at least one unit (Full Day, Half Day, or Short Leave)');
      return;
    }

    setIsLoading(true);
    
    // Prepare the unit array based on checkbox selections
    const unit = [];
    if (isFullDay) unit.push('Full Day');
    if (isHalfDay) unit.push('Half Day');
    if (isShortLeave) unit.push('Short Leave');
    
    // Prepare the payload according to the API expectations
    const payload = { 
      leaveType: leaveTitle,
      description: description,
      allotedLeaves: parseInt(allotedLeave, 10) || 0,
      type: paidOrnonPaid,
      backdatedLeaveDays: parseInt(backdatedLeaveDays, 10) || 0,
      advanceLeaveDays: parseInt(advanceLeaveDays, 10) || 0,
      includeHolidays: isHoliday,
      includeWeekOffs: isWeekOff,
      unit: unit,
      leaveReset: resetOrCarry === 'Reset' ? 'Reset' : 'CarryForward'
    };

    try {
      if (editingLeaveType) {
        // Update existing leave type
        await axios.put(`https://zapllo.com/api/leaves/leaveType/${editingLeaveType.id}`, payload);
      } else {
        // Create new leave type
        await axios.post('https://zapllo.com/api/leaves/leaveType', payload);
      }

      // Refresh leave types from server to get updated data
      await fetchLeaveTypes();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toggleModal(); // This will call resetModal() as well
      
      // Show success toast
      setShowSuccessToast(true);
      
    } catch (error) {
      console.error('Error saving leave type:', error);
      let errorMessage = 'An unknown error occurred';
      
      if (axios.isAxiosError(error) && error.response) {
        // Get the error message from the response if possible
        errorMessage = error.response.data.message || `Failed to ${editingLeaveType ? 'update' : 'create'} leave type`;
      }
      
      Alert.alert('Error', `Failed to ${editingLeaveType ? 'update' : 'add'} leave type. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumericInput = (value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (/^\d*$/.test(value)) {
      setter(value);
    }
  };

  const filteredLeaveTypes = leaveTypes.filter(leave => {
    if (alloteds === 'All') return true;
    return alloteds === 'Paid' ? leave.isPaid : !leave.isPaid;
  });

  const openEditModal = (leave: LeaveType) => {
    setLeaveTitle(leave.title);
    setpaidOrnonPaid(leave.isPaid ? 'Paid' : 'Unpaid');
    setAllotedLeave(leave.allotted.toString());
    setDescripction(leave.description);
    setBackdatedLeaveDays(leave.backdatedLeaveDays.toString());
    setAdvanceLeaveDays(leave.advanceLeaveDays.toString());
    setIsFullDay(leave.isFullDay);
    setIsHalfDay(leave.isHalfDay);
    setIsShortLeave(leave.isShortLeave);
    setIsHoliday(leave.isHoliday);
    setIsWeekOff(leave.isWeekOff);
    setResetOrCarry(leave.isReset ? 'Reset' : 'Carry Forward');
    setEditingLeaveType(leave);
    setModalVisible(true);
  };

  const resetModal = () => {
    setLeaveTitle("");
    setAllotedLeave("0");
    setDescripction("");
    setBackdatedLeaveDays("0");
    setAdvanceLeaveDays("0");
    setIsFullDay(false);
    setIsHalfDay(false);
    setIsShortLeave(false);
    setIsHoliday(false);
    setIsWeekOff(false);
    setResetOrCarry('Reset');
    setpaidOrnonPaid('Paid');
  };

  const updateLeaveBalance = async () => {
    setIsLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
  
      for (const leave of leaveTypes) {
        // Prepare the unit array based on leave type settings
        const unit = [];
        if (leave.isFullDay) unit.push('Full Day');
        if (leave.isHalfDay) unit.push('Half Day');
        if (leave.isShortLeave) unit.push('Short Leave');
        
        const payload = {
          leaveType: leave.title,
          description: leave.description,
          allotedLeaves: leave.allotted,
          type: leave.isPaid ? "Paid" : "Unpaid",
          backdatedLeaveDays: leave.backdatedLeaveDays,
          advanceLeaveDays: leave.advanceLeaveDays,
          includeHolidays: leave.isHoliday,
          includeWeekOffs: leave.isWeekOff,
          leaveReset: leave.isReset ? "Reset" : "CarryForward",
          unit: unit
        };
  
        await axios.put(`https://zapllo.com/api/leaves/leaveType/${leave.id}`, payload);
      }
  
      // Show update balance success toast
      setToastTitle('Leave Balances Updated!');
      setToastMessage(`Leave balances updated for ${nextYear}. If you want to carry forward balances, update leave reset criteria accordingly.`);
      setShowUpdateBalanceToast(true);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      await fetchLeaveTypes(); // Refresh leave types
  
    } catch (error) {
      console.error('Error updating leave balance:', error);
      Alert.alert('Error', 'Failed to update leave balances. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
    <NavbarTwo title="Leave Type" />
    {isLoading && (
      <View style={StyleSheet.absoluteFill} className="bg-black/50 items-center justify-center z-50">
        <ActivityIndicator size="large" color="#815BF5" />
      </View>
    )}
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-[90%] mt-8 flex">
            <View className="w-full items-center flex flex-row justify-between">
              <TouchableOpacity className="w-12 h-12" onPress={toggleModal}>
                <Image className="w-full h-full" source={require("../../../../assets/Attendence/Add.png")} />
              </TouchableOpacity>
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={['#815BF5', '#FC8929']}
                style={styles.gradientBorder}
                >
              <TouchableOpacity
                  onPress={() => setUpdateBalanceModal(true)}
                  className='flex h-[3rem] px-7 items-center justify-center rounded-full bg-primary'>
                  <Text className='text-white text-xs' style={{ fontFamily: 'LatoBold' }}>Update Leave Balance for 2025</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            <View className="w-full items-end mt-2 flex mb-10 ">
              <Text className="text-white mr-4" style={{ fontFamily: 'LatoBold' }}>Total Leaves Alloted: {totalLeavesAllotted}</Text>
            </View>

            {/* Status Filter - Matching ApprovalScreen Style */}
            <View style={styles.statusFilters}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.statusFiltersRow}>
                  <TouchableOpacity
                    style={[
                      styles.statusBadge,
                      alloteds === 'All' && styles.activeStatusBadge
                    ]}
                    onPress={() => handleReportOptionPressAdmin('All')}
                  >
                    <Text style={[
                      styles.statusBadgeText,
                      alloteds === 'All' && styles.activeStatusBadgeText
                    ]}>
                      All ({leaveTypes.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusBadge,
                      alloteds === 'Paid' && styles.activeStatusBadge
                    ]}
                    onPress={() => handleReportOptionPressAdmin('Paid')}
                  >
                    <Text style={[
                      styles.statusBadgeText,
                      alloteds === 'Paid' && styles.activeStatusBadgeText
                    ]}>
                      Paid ({paidCount})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusBadge,
                      alloteds === 'Unpaid' && styles.activeStatusBadge
                    ]}
                    onPress={() => handleReportOptionPressAdmin('Unpaid')}
                  >
                    <Text style={[
                      styles.statusBadgeText,
                      alloteds === 'Unpaid' && styles.activeStatusBadgeText
                    ]}>
                      Unpaid ({unpaidCount})
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>

            {filteredLeaveTypes.map((leave, index) => (
            <View key={index} className="border border-[#37384B] p-5 rounded-xl mb-4 bg-[#10122D]">
              {/* Header with title and actions */}
              <View className="flex flex-row items-center justify-between mb-3">
                <View className="flex flex-row items-center gap-3">
                  <View className="w-2 h-10 rounded-full" style={{ backgroundColor: leave.isPaid ? '#06D6A0' : '#FDB314' }} />
                  <View>
                    <Text className="text-white text-lg font-bold" style={{ fontFamily: 'LatoBold' }}>{leave.title}</Text>
                    <Text className={`text-xs ${leave.isPaid ? 'text-[#06D6A0]' : 'text-[#FDB314]'}`}>
                      {leave.isPaid ? 'Paid Leave' : 'Unpaid Leave'}
                    </Text>
                  </View>
                </View>

                <View className="flex flex-row items-center gap-5">
                  <TouchableOpacity 
                    className="h-8 w-8 bg-[#37384B] rounded-full items-center justify-center" 
                    onPress={() => openEditModal(leave)}
                  >
                    <Image 
                      className="w-4 h-4" 
                      source={require("../../../../assets/Tasks/addto.png")} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="h-8 w-8 bg-[#37384B] rounded-full items-center justify-center" 
                    onPress={() => handleDelete(leave)}
                  >
                    <Image 
                      className="w-4 h-4" 
                      source={require("../../../../assets/Tasks/deleteTwo.png")} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View className="h-[1px] bg-[#37384B] w-full my-3" />

              {/* Leave details */}
              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-3">
                  <Text className="text-[#787CA5] text-xs mb-1">Leaves Allotted</Text>
                  <Text className="text-white text-base font-semibold">{leave.allotted}</Text>
                </View>
                
                <View className="w-1/2 mb-3">
                  <Text className="text-[#787CA5] text-xs mb-1">Reset Policy</Text>
                  <Text className="text-white text-base font-semibold">{leave.isReset ? 'Reset Yearly' : 'Carry Forward'}</Text>
                </View>
                
                <View className="w-1/2 mb-3">
                  <Text className="text-[#787CA5] text-xs mb-1">Backdated Days</Text>
                  <Text className="text-white text-base font-semibold">{leave.backdatedLeaveDays}</Text>
                </View>
                
                <View className="w-1/2 mb-3">
                  <Text className="text-[#787CA5] text-xs mb-1">Advance Days</Text>
                  <Text className="text-white text-base font-semibold">{leave.advanceLeaveDays}</Text>
                </View>
              </View>

              {/* Leave units */}
              <View className="flex-row mt-1">
                <Text className="text-[#787CA5] text-xs mr-2">Units:</Text>
                <View className="flex-row flex-wrap">
                  {leave.isFullDay && (
                    <View className="bg-[#37384B] rounded-full px-2 py-1 mr-2 mb-1">
                      <Text className="text-white text-xs">Full Day</Text>
                    </View>
                  )}
                  {leave.isHalfDay && (
                    <View className="bg-[#37384B] rounded-full px-2 py-1 mr-2 mb-1">
                      <Text className="text-white text-xs">Half Day</Text>
                    </View>
                  )}
                  {leave.isShortLeave && (
                    <View className="bg-[#37384B] rounded-full px-2 py-1 mr-2 mb-1">
                      <Text className="text-white text-xs">Short Leave</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Holidays and weekoffs */}
              {(leave.isHoliday || leave.isWeekOff) && (
                <View className="flex-row mt-2">
                  <Text className="text-[#787CA5] text-xs mr-2">Includes:</Text>
                  <View className="flex-row">
                    {leave.isHoliday && (
                      <View className="bg-[#37384B] rounded-full px-2 py-1 mr-2">
                        <Text className="text-white text-xs">Holidays</Text>
                      </View>
                    )}
                    {leave.isWeekOff && (
                      <View className="bg-[#37384B] rounded-full px-2 py-1">
                        <Text className="text-white text-xs">Week Offs</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
            ))}
          </View>

            <Modal
              isVisible={isModalVisible}
              onBackdropPress={toggleModal}
              style={{ margin: 0, justifyContent: 'flex-end' }}
              animationIn="slideInUp"
              animationOut="slideOutDown"
            >
              <ScrollView className="rounded-t-3xl flex-1 bg-[#0A0D28] py-5 mt-20 pb-16">
                <View className="px-5 mb-10 mt-2 flex w-full flex-row items-center justify-between">
                  <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                    {editingLeaveType ? "Edit Leave Type" : "New Leave Type"}
                  </Text>
                  <TouchableOpacity onPress={toggleModal}>
                    <Image source={require('../../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
                  </TouchableOpacity>
                </View>

                <View className="px-5">
                  <View className="items-center border border-[#676B93] w-full px-1.5 py-1.5 rounded-full mb-4">
                    <View className="w-full flex flex-row items-center justify-between">
                      <TouchableOpacity
                        className="w-1/2 items-center"
                        onPress={() => handleOptionPress('Reset')}
                      >
                        <LinearGradient
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          colors={resetOrCarry === 'Reset' ? ["#815BF5", "#FC8929"] : ["#0A0D28", "#0A0D28"]}
                          style={styles.tablet}
                        >
                          <Text className={`text-sm ${resetOrCarry === 'Reset' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>All Reset</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="w-1/2 items-center"
                        onPress={() => handleOptionPress('Carry Forward')}
                      >
                        <LinearGradient
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          colors={resetOrCarry === 'Carry Forward' ? ["#815BF5", "#FC8929"] : ["#0A0D28", "#0A0D28"]}
                          style={styles.tablet}
                        >
                          <Text className={`text-sm ${resetOrCarry === 'Carry Forward' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Carry Forward</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View className="w-[100%] items-center flex flex-col ">
                  <InputContainer
                    label="Leave Type"
                    value={leaveTitle}
                    onChangeText={(value) => setLeaveTitle(value)}
                    placeholder=""
                    className="flex-1 text-sm text-[#787CA5]"
                    passwordError={''}
                    backgroundColor="#0A0D28"
                  />
                  <View
                    style={[
                      styles.input,
                      {
                        height: 100,
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        borderColor: isDescriptionFocused ? '#815BF5' : '#37384B',
                      },
                    ]}
                  >
                    <TextInput
                      multiline
                      style={[
                        styles.inputSome,
                        { textAlignVertical: 'top', paddingTop: 5, width: '100%' },
                      ]}
                      value={description}
                      onChangeText={(value) => setDescripction(value)}
                      placeholder="description"
                      placeholderTextColor="#787CA5"
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </View>

                  <InputContainer
                    label="Alloted Leaves"
                    value={allotedLeave}
                    onChangeText={(value) => handleNumericInput(value, setAllotedLeave)}
                    placeholder=""
                    className="flex-1 text-sm text-[#787CA5]"
                    passwordError={''}
                    keyboardType="numeric"
                    backgroundColor="#0A0D28"
                  />

                  <View className="px-5 mt-6 w-[90%] mb-6">
                  <Text className=" text-sm text-[#787CA5] ml-3 mb-2">Type</Text>
                  <View className="items-center border border-[#676B93] w-full px-1.5 py-1.5 rounded-full mb-4">
                    <View className="w-full flex flex-row items-center justify-between">
                      <TouchableOpacity
                        className="w-1/2 items-center"
                        onPress={() => handlePaidOrNonPaid('Paid')}
                      >
                        <LinearGradient
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          colors={paidOrnonPaid === 'Paid' ? ["#815BF5", "#FC8929"] : ["#0A0D28", "#0A0D28"]}
                          style={styles.tablet}
                        >
                          <Text className={`text-sm ${paidOrnonPaid === 'Paid' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Paid</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="w-1/2 items-center"
                        onPress={() => handlePaidOrNonPaid('Unpaid')}
                      >
                        <LinearGradient
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          colors={paidOrnonPaid === 'Unpaid' ? ["#815BF5", "#FC8929"] : ["#0A0D28", "#0A0D28"]}
                          style={styles.tablet}
                        >
                          <Text className={`text-sm ${paidOrnonPaid === 'Unpaid' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Unpaid</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                  <View className="bg-primary w-full items-center justify-center pb-12">
                    <InputContainer
                      label="Backdated Leave Days"
                      value={backdatedLeaveDays}
                      onChangeText={(value) => handleNumericInput(value, setBackdatedLeaveDays)}
                      placeholder=""
                      className="flex-1 text-sm text-[#787CA5]"
                      passwordError={''}
                      keyboardType="numeric"
                    />

                    <InputContainer
                      label="Advance Leave Days"
                      value={advanceLeaveDays}
                      onChangeText={(value) => handleNumericInput(value, setAdvanceLeaveDays)}
                      placeholder=""
                      className="flex-1 text-sm text-[#787CA5]"
                      passwordError={''}
                      keyboardType="numeric"
                    />
                  </View>
                  <ToggleSwitch title={"Include Holidays"} isOn={isHoliday} onToggle={setIsHoliday} />
                  <ToggleSwitch title={"Include Week Offs"} isOn={isWeekOff} onToggle={setIsWeekOff} />
                  <Text className="text-[#787CA5] w-[90%] mt-5 mb-4 text-sm">Unit</Text>
                  <View className="flex flex-row justify-between items-center w-[90%]">
                    <View className="flex flex-row items-center gap-2">
                      <CheckboxTwo
                        isChecked={isFullDay}
                        onPress={() => setIsFullDay(!isFullDay)}
                      />
                      <Text className="text-white text-lg" style={{ fontFamily: "LatoBold" }}>Full Day</Text>
                    </View>
                    <View className="flex flex-row items-center gap-2" >
                      <CheckboxTwo
                        isChecked={isHalfDay}
                        onPress={() => setIsHalfDay(!isHalfDay)}
                      />
                      <Text className="text-white text-lg" style={{ fontFamily: "LatoBold" }}>Half Day</Text>
                    </View>
                    <View className="flex flex-row items-center gap-2">
                      <CheckboxTwo
                        isChecked={isShortLeave}
                        onPress={() => setIsShortLeave(!isShortLeave)}
                      />
                      <Text className="text-white text-lg" style={{ fontFamily: "LatoBold" }}>Short Leave</Text>
                    </View>
                  </View>
                  <Text className="text-xs text-[#787CA5] mb-7 mt-3">Deduction (in Days) : Full Day - 1, Half Day - 0.5, Short Leave - 0.25</Text>

                  <TouchableOpacity className="bg-[#37384B] flex items-center p-5 rounded-full mb-10 w-[90%]" onPress={addLeaveType}>
                    <Text className="text-white" style={{ fontFamily: "LatoBold" }}>{editingLeaveType ? "Update Leave Type" : "Add Leave Type"}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </Modal>

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
                    source={require('../../../../assets/Tickit/delIcon.png')}
                  />
                  <Text style={{ color: 'white', fontSize: 24 }}>Delete Leave Type</Text>
                  <Text style={{ color: '#787CA5' }} className='mb-10 '>Are you sure you want to delete this leave type? This action cannot be undone.</Text>
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
                    >
                      <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

        <Modal
          isVisible={updateBalanceModal}
          onBackdropPress={() => setUpdateBalanceModal(false)}
          style={{ justifyContent: 'center', margin: 20 }}
        >
          <View
            style={{
              backgroundColor: '#0A0D28',
              padding: 25,
              borderRadius: 20,
              alignItems: 'center',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image
                style={{ width: 60, height: 60, marginBottom: 15 }}
                source={require('../../../../assets/Tickit/delIcon.png')}
              />
              <Text style={{ color: 'white', fontSize: 20, fontFamily: 'LatoBold', textAlign: 'center', marginBottom: 10 }}>
                Update Leave Balances
              </Text>
              <Text style={{ color: '#787CA5', fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
                By default, leave balances will reset to the number of allotted leaves. If you want to carry forward the previous year's balance, please edit each leave type and update the Leave Reset criteria.
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#37384B',
                  padding: 15,
                  borderRadius: 12,
                  flex: 1,
                }}
                onPress={() => setUpdateBalanceModal(false)}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ 
                  backgroundColor: '#815BF5', 
                  padding: 15, 
                  borderRadius: 12, 
                  flex: 1 
                }}
                onPress={() => {
                  setUpdateBalanceModal(false);
                  updateLeaveBalance();
                }}
              >
                <Text style={{ color: 'white', textAlign: 'center', fontFamily: 'LatoBold' }}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Toast Notifications - Outside ScrollView for proper positioning */}
      {/* Success Toast */}
      <ToastAlert
        visible={showSuccessToast}
        type="success"
        title={editingLeaveType ? "Leave Type Updated!" : "Leave Type Created!"}
        message={editingLeaveType ? "Leave type has been updated successfully and is now available for use." : "New leave type has been created successfully and is now available for use."}
        onHide={() => setShowSuccessToast(false)}
        duration={4000}
        position="bottom"
      />

      {/* Delete Toast */}
      <ToastAlert
        visible={showDeleteToast}
        type="success"
        title={toastTitle}
        message={toastMessage}
        onHide={() => setShowDeleteToast(false)}
        duration={4000}
        position="bottom"
      />

      {/* Update Balance Toast */}
      <ToastAlert
        visible={showUpdateBalanceToast}
        type="success"
        title={toastTitle}
        message={toastMessage}
        onHide={() => setShowUpdateBalanceToast(false)}
        duration={5000}
        position="bottom"
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 400,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5, 
    flexDirection: "row", 
  },
  gradientBorder: {
    borderRadius: 100,
    padding: 1 ,
    width:"75%",
  },
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: '#37384B',
    padding: 10,
    marginTop: 25,
    borderRadius: 25,
    width: '90%',
    height: 57,
    position: 'relative',
  },
  inputSome: {
    flex: 1,
    padding: 8,
    color: '#fff',
    fontSize: 13,
    fontFamily: 'LatoBold',
  },
  baseName: {
    color: '#787CA5',
    position: 'absolute',
    top: -9,
    left: 25,
    backgroundColor: '#05071E',
    paddingRight: 5,
    paddingLeft: 5,
    fontSize: 13,
    fontWeight: 400,
    fontFamily: 'lato',
  },
  statusFilters: {
  paddingHorizontal: 16,
  marginBottom: 36,
},
statusFiltersRow: {
  flexDirection: 'row',
  paddingHorizontal: 20,
  gap: 8,
},
statusBadge: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
  backgroundColor: '#37384B',
  borderWidth: 1,
  borderColor: '#37384B',
},
activeStatusBadge: {
  backgroundColor: '#815BF5',
  borderColor: '#815BF5',
},
statusBadgeText: {
  fontSize: 12,
  color: '#787CA5',
  fontWeight: '500',
  fontFamily: 'Lato-Regular',
},
activeStatusBadgeText: {
  color: '#ffffff',
  fontFamily: 'LatoBold',
},
});