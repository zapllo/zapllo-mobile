import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import NavbarTwo from '~/components/navbarTwo';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import moment from 'moment';
import { AntDesign } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import CustomDropdown from '~/components/customDropDown';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';
import ToastAlert from '~/components/ToastAlert';

// Define types for our data
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface RegularizationEntry {
  _id: string;
  userId: User;
  action: string;
  timestamp: string;
  loginTime: string;
  logoutTime: string;
  remarks: string;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  notes?: string;
}

// API endpoints
const API_BASE_URL = 'https://zapllo.com/api';
const REGULARIZATION_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/all-regularization-approvals`,
  APPROVAL: (id: string) => `${API_BASE_URL}/regularization-approvals/${id}`
};

// Define date filter options
const daysData = [
  { label: 'Today', value: 'Today' },
  { label: 'Yesterday', value: 'Yesterday' },
  { label: 'This Week', value: 'This Week' },
  { label: 'Last Week', value: 'Last Week' },
  { label: 'Next Week', value: 'Next Week' },
  { label: 'This Month', value: 'This Month' },
  { label: 'Next Month', value: 'Next Month' },
  { label: 'This Year', value: 'This Year' },
  { label: 'All Time', value: 'All Time' },
  { label: 'Custom', value: 'Custom' },
];

export default function RegularizationDetailsScreen() {
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  const userName = params.userName as string;
  
  const [loading, setLoading] = useState(true);
  const [regularizations, setRegularizations] = useState<RegularizationEntry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  
  // Add date filter states
  const [selectedFilter, setSelectedFilter] = useState('This Week');
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  
  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'delete'>('approve');
  const [selectedRegId, setSelectedRegId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  // Toast alert states
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  // Get date range based on selected filter
  const getDateRange = () => {
    const now = new Date();
    
    switch (selectedFilter) {
      case 'Today':
        return {
          startDate: moment().startOf('day'),
          endDate: moment().endOf('day')
        };
      case 'Yesterday':
        return {
          startDate: moment().subtract(1, 'days').startOf('day'),
          endDate: moment().subtract(1, 'days').endOf('day')
        };
      case 'This Week':
        return {
          startDate: moment().startOf('week'),
          endDate: moment().endOf('week')
        };
      case 'Last Week':
        return {
          startDate: moment().subtract(1, 'weeks').startOf('week'),
          endDate: moment().subtract(1, 'weeks').endOf('week')
        };
      case 'Next Week':
        return {
          startDate: moment().add(1, 'weeks').startOf('week'),
          endDate: moment().add(1, 'weeks').endOf('week')
        };
      case 'This Month':
        return {
          startDate: moment().startOf('month'),
          endDate: moment().endOf('month')
        };
      case 'Next Month':
        return {
          startDate: moment().add(1, 'months').startOf('month'),
          endDate: moment().add(1, 'months').endOf('month')
        };
      case 'This Year':
        return {
          startDate: moment().startOf('year'),
          endDate: moment().endOf('year')
        };
      case 'Custom':
        if (customStartDate && customEndDate) {
          return {
            startDate: moment(customStartDate).startOf('day'),
            endDate: moment(customEndDate).endOf('day')
          };
        }
      default:
        return {
          startDate: moment().subtract(1, 'year'),
          endDate: moment()
        };
    }
  };

  // Fetch regularization data for the specific user
  const fetchRegularizations = async () => {
    try {
      setLoading(true);
      
      // Get date range based on selected filter
      const dateRange = getDateRange();
      
      const response = await axios.get(REGULARIZATION_ENDPOINTS.GET_ALL, {
        params: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        }
      });
      
      if (response.data.success) {
        // Filter regularizations for this specific user
        const userRegularizations = response.data.regularizations.filter(
          (reg: RegularizationEntry) => reg.userId._id === userId
        );
        setRegularizations(userRegularizations);
      }
    } catch (error: any) {
      console.error('Error fetching regularizations:', error);
      Alert.alert(
        "Error",
        `Failed to fetch regularization details: ${error.response?.data?.message || error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRegularizations();
  }, [userId, selectedFilter, customStartDate, customEndDate]);
  
  // Filter regularizations based on selected status and exclude deleted items
  const filteredRegularizations = regularizations.filter(reg => {
    // First check if it matches the status and isn't deleted
    if (reg.approvalStatus !== selectedStatus || deletedIds.includes(reg._id)) {
      return false;
    }

    // Get the date range
    const dateRange = getDateRange();
    const regDate = moment(reg.timestamp);

    // Check if the regularization falls within the selected date range
    return regDate.isBetween(dateRange.startDate, dateRange.endDate, 'day', '[]');
  });
  
  const handleStatusChange = (status: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStatus(status);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return moment(dateString).format('MMM DD, YYYY • hh:mm A');
  };
  
  // Format duration between login and logout
  const formatDuration = (loginTime: string, logoutTime: string) => {
    const start = moment(loginTime, 'HH:mm');
    const end = moment(logoutTime, 'HH:mm');
    const duration = moment.duration(end.diff(start));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;
    
    return `${hours}h ${minutes}m`;
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#06D6A0';
      case 'Rejected':
        return '#EF4444';
      default:
        return '#F97520';
    }
  };
  
  // Open modal for approve action
  const openApproveModal = (regId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalAction('approve');
    setSelectedRegId(regId);
    setNotes('');
    setModalVisible(true);
  };
  
  // Open modal for reject action
  const openRejectModal = (regId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalAction('reject');
    setSelectedRegId(regId);
    setNotes('');
    setModalVisible(true);
  };
  
  // Open modal for delete action
  const openDeleteModal = (regId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setSelectedRegId(regId);
    setDeleteModalVisible(true);
  };
  
  // Handle modal submission (approve or reject)
  const handleModalSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Prepare the data to update the regularization
      const updateData = {
        action: modalAction, // 'approve' or 'reject'
        notes: notes.trim() || undefined
      };
      
      // Make the API call to update the regularization
      const response = await axios.patch(
        REGULARIZATION_ENDPOINTS.APPROVAL(selectedRegId), 
        updateData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Update local state for immediate UI update
        setRegularizations(prevRegs => 
          prevRegs.map(reg => {
            if (reg._id === selectedRegId) {
              return {
                ...reg,
                approvalStatus: modalAction === 'approve' ? 'Approved' : 'Rejected',
                notes: notes.trim() || reg.notes,
                approvedAt: new Date().toISOString()
              };
            }
            return reg;
          })
        );
        
        // Close the modal
        setModalVisible(false);
        
        // Show custom toast alert
        setToastType('success');
        setToastTitle(`Request ${modalAction === 'approve' ? 'Approved' : 'Rejected'}`);
        setToastMessage(`Regularization request ${modalAction === 'approve' ? 'approved' : 'rejected'} successfully`);
        setShowToast(true);
        
        // Refresh data from server
        fetchRegularizations();
      } else {
        throw new Error(response.data.message || 'Failed to update regularization');
      }
    } catch (error) {
      console.error(`Error ${modalAction}ing regularization:`, error);
      Alert.alert(
        "Error",
        `Failed to ${modalAction} regularization: ${error.response?.data?.message || error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle delete action
  const handleDelete = async () => {
    try {
      setSubmitting(true);
      
      // Make API call to delete the regularization
      const response = await axios.delete(REGULARIZATION_ENDPOINTS.APPROVAL(selectedRegId));
      
      if (response.data.success) {
        // Update local state for immediate UI update
        setDeletedIds(prevIds => [...prevIds, selectedRegId]);
        
        // Close the modal
        setDeleteModalVisible(false);
        
        // Show custom toast alert
        setToastType('success');
        setToastTitle('Request Deleted');
        setToastMessage('Regularization request deleted successfully');
        setShowToast(true);
        
        // Refresh data from server
        fetchRegularizations();
      } else {
        throw new Error(response.data.message || 'Failed to delete regularization');
      }
    } catch (error) {
      console.error('Error deleting regularization:', error);
      Alert.alert(
        "Error",
        `Failed to delete regularization: ${error.response?.data?.message || error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  // Add handleCustomDateApply function
  const handleCustomDateApply = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);
    setIsCustomDateModalVisible(false);
  };
  
  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title={`Regularizations`} />
      
      {/* Add date filter dropdown */}
      <View className="w-full items-center">
        <CustomDropdown
          data={daysData}
          placeholder="Select Date Filter"
          selectedValue={selectedFilter}
          onSelect={(value) => {
            setSelectedFilter(value);
            if (value === 'Custom') {
              setIsCustomDateModalVisible(true);
            }
          }}
        />
      </View>
      
      {/* Status tabs */}
      <View className="items-center border border-[#676B93] w-[90%] px-1.5 py-1.5 rounded-full mt-4 mb-6 mx-auto">
        <View className="w-full flex flex-row items-center justify-between">
          <TouchableOpacity
            className="w-1/3 items-center"
            onPress={() => handleStatusChange('Pending')}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={selectedStatus === 'Pending' ? ["#ffbe89", "#FC8929"] : ["#05071E", "#05071E"]}
              style={styles.tablet}
            >
              <Text className={`text-sm ${selectedStatus === 'Pending' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Pending</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-1/3 items-center"
            onPress={() => handleStatusChange('Approved')}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={selectedStatus === 'Approved' ? ["#65e8b6", "#189c65"] : ["#05071E", "#05071E"]}
              style={styles.tablet}
            >
              <Text className={`text-sm ${selectedStatus === 'Approved' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Approved</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-1/3 items-center"
            onPress={() => handleStatusChange('Rejected')}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={selectedStatus === 'Rejected' ? ["#f46868", "#fc2929"] : ["#05071E", "#05071E"]}
              style={styles.tablet}
            >
              <Text className={`text-sm ${selectedStatus === 'Rejected' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Rejected</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#815BF5" />
        </View>
      ) : (
        <ScrollView 
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {filteredRegularizations.length > 0 ? (
            filteredRegularizations.map((reg, index) => (
              <View 
                key={index} 
                className="bg-[#10122d] border border-[#37384B] rounded-2xl p-5 mb-5"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                }}
              >
                {/* Header with status badge */}
                <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <LinearGradient
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      colors={["#815BF5", "#FC8929"]}
                      className="w-1 h-6 rounded-full mr-2"
                    />
                    <Text className="text-white font-bold text-base">
                      {reg.action === 'login' ? 'Login Request' : 'Regularization Request'}
                    </Text>
                  </View>
                  <View 
                    style={{ 
                      backgroundColor: getStatusColor(reg.approvalStatus),
                      shadowColor: getStatusColor(reg.approvalStatus),
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                    className="px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-white text-xs font-bold">{reg.approvalStatus}</Text>
                  </View>
                </View>
                
                {/* Divider */}
                <View className="h-[1px] bg-[#37384B] w-full mb-4 opacity-50" />
                
                {/* Content section */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-3">
                    <View className="w-8 h-8 rounded-full bg-[#1A1C3D] items-center justify-center mr-3">
                      <AntDesign name="calendar" size={16} color="#676B93" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[#676B93] text-xs mb-1">Date & Time</Text>
                      <Text className="text-white font-medium">{formatDate(reg.timestamp)}</Text>
                    </View>
                  </View>
                  
                  {reg.loginTime && reg.logoutTime && (
                    <View className="flex-row items-center mb-3">
                      <View className="w-8 h-8 rounded-full bg-[#1A1C3D] items-center justify-center mr-3">
                        <AntDesign name="clockcircleo" size={16} color="#676B93" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#676B93] text-xs mb-1">Duration</Text>
                        <Text className="text-white font-medium">{formatDuration(reg.loginTime, reg.logoutTime)}</Text>
                      </View>
                    </View>
                  )}
                  
                  {reg.remarks && (
                    <View className="flex-row items-start mb-3">
                      <View className="w-8 h-8 rounded-full bg-[#1A1C3D] items-center justify-center mr-3 mt-0.5">
                        <AntDesign name="filetext1" size={16} color="#676B93" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#676B93] text-xs mb-1">Remarks</Text>
                        <Text className="text-white font-medium">{reg.remarks}</Text>
                      </View>
                    </View>
                  )}
                  
                  {reg.approvalStatus !== 'Pending' && reg.approvedBy && (
                    <View className="flex-row items-center mb-3">
                      <View className="w-8 h-8 rounded-full bg-[#1A1C3D] items-center justify-center mr-3">
                        <AntDesign name="user" size={16} color="#676B93" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#676B93] text-xs mb-1">
                          {reg.approvalStatus === 'Approved' ? 'Approved by' : 'Rejected by'}
                        </Text>
                        <Text className="text-white font-medium">
                          {`${reg.approvedBy.firstName} ${reg.approvedBy.lastName}`}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {reg.approvalStatus !== 'Pending' && reg.approvedAt && (
                    <View className="flex-row items-center mb-3">
                      <View className="w-8 h-8 rounded-full bg-[#1A1C3D] items-center justify-center mr-3">
                        <AntDesign name="checksquareo" size={16} color="#676B93" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#676B93] text-xs mb-1">
                          {reg.approvalStatus === 'Approved' ? 'Approved on' : 'Rejected on'}
                        </Text>
                        <Text className="text-white font-medium">{formatDate(reg.approvedAt)}</Text>
                      </View>
                    </View>
                  )}
                  
                  {reg.notes && (
                    <View className="flex-row items-start mb-3">
                      <View className="w-8 h-8 rounded-full bg-[#1A1C3D] items-center justify-center mr-3 mt-0.5">
                        <AntDesign name="message1" size={16} color="#676B93" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[#676B93] text-xs mb-1">Notes</Text>
                        <Text className="text-white font-medium">{reg.notes}</Text>
                      </View>
                    </View>
                  )}
                </View>
                
                {/* Action buttons for pending regularizations */}
                {selectedStatus === 'Pending' && (
                  <>
                    <View className="h-[1px] bg-[#37384B] w-full mb-4 opacity-50" />
                    <View className="flex-row justify-between">
                      <TouchableOpacity
                        onPress={() => openApproveModal(reg._id)}
                        className="border-[#06D6A0] border justify-center flex items-center py-2.5 px-4 rounded-lg flex-1 mr-2"
                        style={{ 
                          backgroundColor: 'rgba(6, 214, 160, 0.15)',
                          shadowColor: "#06D6A0",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 3,
                          elevation: 2,
                        }}
                      >
                        <View className="flex-row items-center">
                          <AntDesign name="checkcircleo" size={16} color="#06D6A0" style={{ marginRight: 8 }} />
                          <Text className="text-white text-center font-bold text-xs">Approve</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => openRejectModal(reg._id)}
                        className="border-[#EF4444] border py-2.5 px-4 rounded-lg flex-1 mx-2 items-center justify-center"
                        style={{ 
                          backgroundColor: 'rgba(231, 101, 101, 0.15)',
                          shadowColor: "#EF4444",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 3,
                          elevation: 2,
                        }}
                      >
                        <View className="flex-row items-center">
                          <AntDesign name="closecircleo" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                          <Text className="text-white text-center font-bold text-xs">Reject</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        onPress={() => openDeleteModal(reg._id)}
                        className="py-2.5 px-4 rounded-lg flex-1 ml-2 items-center justify-center bg-[#1A1C3D]"
                        style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.2,
                          shadowRadius: 3,
                          elevation: 2,
                        }}
                      >
                        <Image source={require("../../../assets/Tasks/deleteTwo.png")} className='h-6 w-5'/>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-10">
              <LottieView
                source={require('../../../assets/Animation/no-data.json')}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
              />
              <Text className="text-[#787CA5]  text-center" style={{ fontFamily: "LatoBold" }}>
                No {selectedStatus.toLowerCase()} regularization requests found
              </Text>
            </View>
          )}
        </ScrollView>
      )}
      
      {/* Approval/Rejection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-[#10122d] rounded-t-3xl p-5 w-full pb-10">
              <View className="w-12 h-1 bg-[#676B93] rounded-full self-center mb-4" />
              
              <Text className="text-white text-xl font-bold mb-4">
                {modalAction === 'approve' ? 'Approve' : 'Reject'} Regularization
              </Text>
              
              <Text className="text-[#676B93] mb-2">
                {modalAction === 'approve' 
                  ? 'Are you sure you want to approve this regularization request?' 
                  : 'Are you sure you want to reject this regularization request?'}
              </Text>
              
              <View className="bg-[#05071E] rounded-xl p-4 mb-4">
                <Text className="text-white text-sm mb-2">Add Note (Optional)</Text>
                <TextInput
                  className="bg-[#10122d] text-white p-3 rounded-lg"
                  placeholder="Enter your note here..."
                  placeholderTextColor="#676B93"
                  multiline
                  numberOfLines={4}
                  value={notes}
                  onChangeText={setNotes}
                  style={{ textAlignVertical: 'top' }}
                />
              </View>
              
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-[#37384B] py-3 px-4 rounded-lg flex-1 mr-2"
                >
                  <Text className="text-white text-center font-bold">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleModalSubmit}
                  disabled={submitting}
                  className={`py-3 px-4 rounded-lg flex-1 ml-2 ${
                    modalAction === 'approve' ? 'bg-[#06D6A0]' : 'bg-[#EF4444]'
                  } ${submitting ? 'opacity-50' : 'opacity-100'}`}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white text-center font-bold">
                      {modalAction === 'approve' ? 'Approve' : 'Reject'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Delete Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-[#10122d] rounded-t-3xl p-5 w-full pb-10">
              <View className="w-12 h-1 bg-[#676B93] rounded-full self-center mb-4" />
              
              <Text className="text-white text-xl font-bold mb-4">
                Delete Regularization
              </Text>
              
              <View className="items-center justify-center my-4">
                <Image 
                  source={require("../../../assets/Tickit/delIcon.png")} 
                  style={{ width: 80, height: 80, marginBottom: 20 }}
                />
              </View>
              
              <Text className="text-white text-center mb-6">
                Are you sure you want to delete this regularization request? This action cannot be undone.
              </Text>
              
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setDeleteModalVisible(false)}
                  className="bg-[#37384B] py-3 px-4 rounded-lg flex-1 mr-2"
                >
                  <Text className="text-white text-center font-bold">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleDelete}
                  disabled={submitting}
                  className={`py-3 px-4 rounded-lg flex-1 ml-2 bg-[#EF4444] ${
                    submitting ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white text-center font-bold">
                      Delete
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Add CustomDateRangeModal */}
      <CustomDateRangeModal
        isVisible={isCustomDateModalVisible}
        onClose={() => setIsCustomDateModalVisible(false)}
        onApply={handleCustomDateApply}
        initialStartDate={customStartDate || new Date()}
        initialEndDate={customEndDate || new Date()}
      />
      
      {/* Custom Toast Alert */}
      <ToastAlert
        visible={showToast}
        type={toastType}
        title={toastTitle}
        message={toastMessage}
        onHide={() => setShowToast(false)}
        duration={3000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
});