import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import NavbarTwo from '~/components/navbarTwo';
import CustomDropdown from '~/components/customDropDown';
import EditLeaveBalanceModal from '~/components/Attendence/EditLeaveBalanceModal';
import CustomSplashScreen from '~/components/CustomSplashScreen';
import CustomDeleteModal from '~/components/CustomDeleteModal';
import LeaveApprovalModal from '~/components/Attendence/Approvals/LeaveApprovalModal';
import ToastAlert, { ToastType } from '~/components/ToastAlert';
import {
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from 'date-fns';

// Types
type LeaveType = {
  _id: string;
  leaveType: string;
  allotedLeaves: number;
};

type LeaveBalance = {
  leaveType: LeaveType;
  leaveTypeId: string;
  balance: number;
  userLeaveBalance: number;
};

type User = {
  userId: string;
  firstName: string;
  lastName: string;
  leaveBalances: LeaveBalance[];
};

interface LeaveDay {
  date: string;
  unit: "Full Day" | "1st Half" | "2nd Half" | "1st Quarter" | "2nd Quarter" | "3rd Quarter" | "4th Quarter";
  status: "Pending" | "Approved" | "Rejected";
}

interface Leave {
  _id: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  status: string;
  leaveReason: string;
  appliedDays: number;
  leaveDays: LeaveDay[];
  remarks: string;
  attachment?: string[];
  audioUrl?: string;
  user: {
    firstName: string;
    lastName: string;
    _id: string;
    reportingManager: {
      firstName: string;
      lastName: string;
      _id: string;
    };
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
    _id: string;
  };
  rejectedBy?: {
    firstName: string;
    lastName: string;
    _id: string;
  };
  createdAt: string;
  updatedAt: string;
}

const { width } = Dimensions.get('window');

const normalizeDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export default function AllLeavesScreen() {
  const { userData } = useSelector((state: RootState) => state.auth);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [filter, setFilter] = useState<"Pending" | "Approved" | "Rejected" | "All">("All");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [remarks, setRemarks] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"applications" | "balances">("balances");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeaveForDetails, setSelectedLeaveForDetails] = useState<Leave | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [leaveIdToDelete, setLeaveIdToDelete] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<"Today" | "Yesterday" | "This Week" | "This Month" | "Last Month" | "Custom" | "All Time">("This Month");
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [showSplashScreen, setShowSplashScreen] = useState(false);
  
  // CustomDeleteModal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Leave | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // LeaveApprovalModal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedLeaveForApproval, setSelectedLeaveForApproval] = useState<Leave | null>(null);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Toast handler function
  const handleShowToast = (type: ToastType, title: string, message: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message);
    setShowToast(true);
  };

  // Date filter options (matching MyLeavesScreen)
  const daysData = [
    { label: 'Today', value: 'Today' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'This Week', value: 'This Week' },
    { label: 'Last Week', value: 'Last Week' },
    { label: 'This Month', value: 'This Month' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'This Year', value: 'This Year' },
    { label: 'All Time', value: 'All Time' },
    { label: 'Custom', value: 'Custom' },
  ];

  // Fetch user role from API - following the same pattern as other screens
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('https://zapllo.com/api/users/organization');
        const data = await response.json();
        
        if (data.message === "Users fetched successfully") {
          // Find current user by matching with userData from Redux
          const currentUserId = userData?.data?._id || userData?.user?._id;
          const currentUser = data.data.find(user => user._id === currentUserId);
          
          if (currentUser) {
            setIsAdmin(currentUser.isAdmin || currentUser.role === 'orgAdmin');
          } else {
            // Fallback to Redux data if user not found in API response
            setIsAdmin(userData?.data?.role === "orgAdmin" || userData?.user?.role === "orgAdmin");
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        // Fallback to Redux data if API fails
        setIsAdmin(userData?.data?.role === "orgAdmin" || userData?.user?.role === "orgAdmin");
      }
    };
    
    fetchUserRole();
  }, [userData]);

  const fetchAllLeaves = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://zapllo.com/api/leaves/all", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setLeaves(data.leaves);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      Alert.alert("Error", "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalances = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://zapllo.com/api/leaves/getAllUsersBalances", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
        setLeaveTypes(data.data.leaveTypes);
      }
    } catch (error) {
      console.error("Error fetching leave balances:", error);
      Alert.alert("Error", "Failed to fetch leave balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeaves();
    fetchLeaveBalances();
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = users.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(lowerCaseQuery)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAllLeaves(), fetchLeaveBalances()]);
    setRefreshing(false);
  };

  const handleApproval = async (leave: Leave) => {
    try {
      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await fetch(`https://zapllo.com/api/leaveApprovals/${leave._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaveDays: leave.leaveDays.map((day) => ({
            ...day,
            status: "Approved",
          })),
          action: "approve",
        }),
      });

      const data = await response.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        handleShowToast('success', 'Leave Approved', 'Leave request approved successfully');
        fetchAllLeaves();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        handleShowToast('error', 'Approval Failed', data.error || 'Failed to approve leave request');
      }
    } catch (error) {
      console.error("Error approving leave:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      handleShowToast('error', 'Approval Failed', 'Failed to approve leave request');
    }
  };

  const handleReject = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsRejectModalOpen(true);
  };

  const handleDelete = async (leaveId: string) => {
    try {
      // Trigger haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      const response = await fetch(`https://zapllo.com/api/leaveApprovals/${leaveId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        handleShowToast('success', 'Leave Deleted', 'Leave request deleted successfully');
        fetchAllLeaves();
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        handleShowToast('error', 'Delete Failed', data.error || 'Failed to delete leave request');
      }
    } catch (error) {
      console.error("Error deleting leave:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      handleShowToast('error', 'Delete Failed', 'Failed to delete leave request');
    }
  };

  const confirmDelete = () => {
    if (leaveIdToDelete) {
      handleDelete(leaveIdToDelete);
      setIsDeleteDialogOpen(false);
    }
  };

  // Delete modal handlers
  const openDeleteModal = (leave: Leave) => {
    setItemToDelete(leave);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setIsDeleting(false);
  };

  const confirmDeleteFromModal = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await handleDelete(itemToDelete._id);
      // Close modal and refresh data
      closeDeleteModal();
    } catch (error) {
      console.error("Error in confirmDeleteFromModal:", error);
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (leaveId: string) => {
    setLeaveIdToDelete(leaveId);
    setIsDeleteDialogOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!remarks) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      handleShowToast('error', 'Validation Error', 'Please provide rejection remarks');
      return;
    }

    try {
      setLoading(true);
      if (!selectedLeave) return;

      // Trigger haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await fetch(`https://zapllo.com/api/leaveApprovals/${selectedLeave._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leaveDays: selectedLeave.leaveDays.map((day) => ({
            ...day,
            status: "Rejected",
          })),
          remarks,
          action: "reject",
        }),
      });

      const data = await response.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        handleShowToast('success', 'Leave Rejected', 'Leave request rejected successfully');
        fetchAllLeaves();
        setIsRejectModalOpen(false);
        setSelectedLeave(null);
        setRemarks("");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        handleShowToast('error', 'Rejection Failed', data.error || 'Failed to reject leave request');
      }
    } catch (error) {
      console.error("Error rejecting leave:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      handleShowToast('error', 'Rejection Failed', 'Failed to reject leave request');
    } finally {
      setLoading(false);
    }
  };

  // Handle updating leave balance - matches web version API call
  const handleUpdateLeaveBalance = async (updatedLeaveBalances: LeaveBalance[]) => {
    try {
      if (!selectedUser) return;

      // Format the data to match the web version API call exactly
      const formattedBalances = updatedLeaveBalances.map((balance) => ({
        leaveType: balance.leaveTypeId,
        balance: balance.userLeaveBalance,
      }));

      const response = await fetch(`https://zapllo.com/api/leaveBalances/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIdToUpdate: selectedUser.userId,
          leaveBalances: formattedBalances,
        }),
      });

      const data = await response.json();
      if (data.success || response.ok) {
        // Show success feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Close the edit modal first
        setIsEditModalOpen(false);
        setSelectedUser(null);
        
        // Show CustomSplashScreen after a small delay to ensure modal is closed
        setTimeout(() => {
          console.log('Showing splash screen after leave balance update');
          setShowSplashScreen(true);
        }, 300);
        
        // Refresh the leave balances data to get updated values
        const refreshResponse = await fetch("https://zapllo.com/api/leaves/getAllUsersBalances", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setUsers(refreshData.data.users);
          setLeaveTypes(refreshData.data.leaveTypes);
        }
      } else {
        throw new Error(data.error || 'Failed to update leave balance');
      }
    } catch (error) {
      console.error("Error updating leave balance:", error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const filterEntriesByDate = (entries: Leave[]) => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    const todayStart = startOfDay(today);
    const weekStart = startOfWeek(today);
    const thisMonthStart = startOfMonth(today);
    const lastMonthStart = startOfMonth(
      new Date(today.getFullYear(), today.getMonth() - 1, 1)
    );
    const lastMonthEnd = endOfMonth(
      new Date(today.getFullYear(), today.getMonth() - 1, 1)
    );

    return entries.filter((entry) => {
      const entryDate = new Date(entry.createdAt);
      switch (dateFilter) {
        case "Today":
          return normalizeDate(entryDate).getTime() === todayStart.getTime();
        case "Yesterday":
          return normalizeDate(entryDate).getTime() === normalizeDate(yesterday).getTime();
        case "This Week":
          return entryDate >= weekStart && entryDate <= today;
        case "This Month":
          return entryDate >= thisMonthStart && entryDate <= today;
        case "Last Month":
          return entryDate >= lastMonthStart && entryDate <= lastMonthEnd;
        case "Custom":
          if (customDateRange.start && customDateRange.end) {
            return entryDate >= customDateRange.start && entryDate <= customDateRange.end;
          }
          return true;
        case "All Time":
          return true;
        default:
          return true;
      }
    });
  };

  const filteredLeaves = filterEntriesByDate(
    filter === "All" ? leaves : leaves.filter((leave) => leave.status === filter)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#f59e0b';
      case 'Approved': return '#10b981';
      case 'Rejected': return '#ef4444';
      case 'Partially Approved': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getBalanceColor = (balance: number) => {
    if (balance <= 1) return '#ef4444';
    if (balance <= 3) return '#f59e0b';
    if (balance <= 5) return '#3b82f6';
    return '#10b981';
  };

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  const renderLeaveCard = ({ item: leave }: { item: Leave }) => {
    const statusColors = {
      "Approved": { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
      "Partially Approved": { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
      "Rejected": { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
      "Pending": { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
    };

    const statusColor = statusColors[leave.status as keyof typeof statusColors] || statusColors["Pending"];
    const userInitials = getInitials(leave.user.firstName, leave.user.lastName);

    return (
      <TouchableOpacity
        style={styles.requestCard}
        onPress={() => setSelectedLeaveForDetails(leave)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {leave.user.firstName} {leave.user.lastName}
              </Text>
              <Text style={styles.requestDetails}>
                {leave.leaveType?.leaveType} • {format(new Date(leave.fromDate), "MMM d")} - {format(new Date(leave.toDate), "MMM d, yyyy")} • {leave.appliedDays} day{leave.appliedDays > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            {leave.leaveReason === "Penalty" && (
              <View style={styles.penaltyBadge}>
                <Text style={styles.penaltyBadgeText}>Penalty</Text>
              </View>
            )}
            <View style={[
              styles.statusBadgeSmall,
              { backgroundColor: statusColor?.bg, borderColor: statusColor?.border }
            ]}>
              <Text style={[styles.statusBadgeSmallText, { color: statusColor?.text }]}>
                {leave.status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.requestItemDetails}>
          <View style={styles.requestDetailRow}>
            <Text style={styles.requestDetailLabel}>From:</Text>
            <Text style={styles.requestDetailValue}>
              {format(new Date(leave.fromDate), "MMM d, yyyy")}
            </Text>
          </View>
          
          <View style={styles.requestDetailRow}>
            <Text style={styles.requestDetailLabel}>To:</Text>
            <Text style={styles.requestDetailValue}>
              {format(new Date(leave.toDate), "MMM d, yyyy")}
            </Text>
          </View>
          
          <View style={styles.requestDetailRow}>
            <Text style={styles.requestDetailLabel}>Applied:</Text>
            <Text style={styles.requestDetailValue}>{leave.appliedDays} day(s)</Text>
            <Text style={styles.requestDetailSeparator}>|</Text>
            <Text style={styles.requestDetailLabel}>Approved:</Text>
            <Text style={styles.requestDetailValue}>
              {leave.leaveDays?.filter((day) => day.status === "Approved").length || 0} day(s)
            </Text>
          </View>
        </View>

        {isAdmin && leave.status === "Pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedLeaveForApproval(leave);
                setShowApprovalModal(true);
              }}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedLeave(leave);
                setIsRejectModalOpen(true);
              }}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                openDeleteModal(leave);
              }}
            >
              <Image source={require("../../../assets/Tasks/deleteTwo.png")} className='h-6 w-5'/>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderUserBalance = ({ item: user }: { item: User }) => (
    <View style={styles.userBalanceCard}>
      <View style={styles.userBalanceHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.firstName[0]}{user.lastName[0]}
            </Text>
          </View>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => {
            setSelectedUser(user);
            setIsEditModalOpen(true);
          }}
        >
          <Image
          className='w-6 h-6'
            source={require('~/assets/Tasks/addto.png')}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.balanceGrid}>
        {leaveTypes.map((leaveType) => {
          const balance = user.leaveBalances.find(
            (lb) => lb.leaveTypeId === leaveType._id
          )?.userLeaveBalance || 0;
          
          return (
            <View key={leaveType._id} style={styles.balanceItem}>
              <View style={[styles.balanceCircle, { backgroundColor: getBalanceColor(balance) }]}>
                <Text style={styles.balanceNumber}>{balance}</Text>
              </View>
              <Text style={styles.balanceLabel} numberOfLines={1}>
                {leaveType.leaveType}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const renderTabButton = (tab: "applications" | "balances", title: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTab(tab);
      }}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderStatusBadge = (status: string, count: number) => (
    <TouchableOpacity
      key={status}
      style={[
        styles.statusBadge,
        filter === status && styles.activeStatusBadge
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFilter(status as any);
      }}
    >
      <Text style={[
        styles.statusBadgeText,
        filter === status && styles.activeStatusBadgeText
      ]}>
        {status} ({count})
      </Text>
    </TouchableOpacity>
  );

  
  const renderCustomDateModal = () => (
    <Modal
      visible={isCustomModalOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setIsCustomModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.customDateModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Custom Date Range</Text>
            <TouchableOpacity onPress={() => setIsCustomModalOpen(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateInputs}>
            <View style={styles.dateInputGroup}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>
                  {customDateRange.start ? format(customDateRange.start, 'dd/MM/yyyy') : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateInputGroup}>
              <Text style={styles.dateLabel}>End Date</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>
                  {customDateRange.end ? format(customDateRange.end, 'dd/MM/yyyy') : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsCustomModalOpen(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.applyButton]}
              onPress={() => {
                if (customDateRange.start && customDateRange.end) {
                  setDateFilter("Custom");
                  setIsCustomModalOpen(false);
                }
              }}
            >
              <Text style={styles.applyButtonText}>Apply Range</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRejectModal = () => (
    <Modal
      visible={isRejectModalOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsRejectModalOpen(false)}
      >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Reject Request</Text>
          <TouchableOpacity onPress={() => {
            setIsRejectModalOpen(false);
            setRemarks("");
          }}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContent}>
            <Text style={styles.rejectLabel}>Reason for rejection (optional)</Text>
            <TextInput
              style={styles.rejectInput}
              multiline
              numberOfLines={4}
              placeholder="Enter rejection reason..."
              placeholderTextColor="#787CA5"
              value={remarks}
              onChangeText={setRemarks}
              textAlignVertical="top"
            />
          </View>
        </TouchableWithoutFeedback>

        <View style={[styles.modalFooter, { 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 16,
          backgroundColor: '#0A0D28',
          gap: 12,
        }]}>
          <TouchableOpacity
            style={[styles.cancelButton, {
              flex: 1,
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: 'rgba(27, 23, 57, 0.8)',
              borderWidth: 1,
              borderColor: '#676B93',
            }]}
            onPress={() => {
              setIsRejectModalOpen(false);
              setRemarks("");
            }}
          >
            <Text style={[styles.cancelButtonText, {
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
              fontFamily: 'LatoBold',
            }]}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.rejectConfirmButton, {
              flex: 1,
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: '#ef4444',
            }]}
            onPress={handleRejectSubmit}
          >
            <Text style={[styles.rejectConfirmButtonText, {
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
              fontFamily: 'LatoBold',
            }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
    </Modal>
  );

  const renderDeleteDialog = () => (
    <Modal
      visible={isDeleteDialogOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsDeleteDialogOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.deleteDialog}>
          <Text style={styles.deleteTitle}>Confirm Delete</Text>
          <Text style={styles.deleteMessage}>
            Are you sure you want to delete this leave request? This action cannot be undone.
          </Text>
          
          <View style={styles.deleteActions}>
            <TouchableOpacity
              style={[styles.deleteActionButton, styles.cancelDeleteButton]}
              onPress={() => setIsDeleteDialogOpen(false)}
            >
              <Text style={styles.cancelDeleteText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.deleteActionButton, styles.confirmDeleteButton]}
              onPress={confirmDelete}
            >
              <Text style={styles.confirmDeleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = (message: string, subtitle: string) => (
    <View style={styles.emptyStateContainer}>
      <LottieView
        source={require('../../../assets/Animation/no-data.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
      <Text style={styles.emptyStateTitle}>{message}</Text>
      <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
    </View>
  );

  if (loading && leaves.length === 0 && users.length === 0) {
    return (
      <SafeAreaView className="h-full flex-1 bg-primary">
        <NavbarTwo title="Leave Management" />
      
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#815BF5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Leave Management" />
      
            
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#815BF5']}
            tintColor="#815BF5"
            title="Pull to refresh"
            titleColor="#787CA5"
          />
        }
        showsVerticalScrollIndicator={false}
      >


        {/* Date Range Filter Dropdown */}
        <View style={styles.dropdownContainer}>
          <CustomDropdown
            data={daysData}
            placeholder="Select Date Filter"
            selectedValue={dateFilter}
            onSelect={(value) => {
              setDateFilter(value as any);
              if (value === 'Custom') {
                setIsCustomModalOpen(true);
              }
            }}
          />
        </View>

        {/* Tab Navigation - Billing Screen Style Toggle */}
        <View className="items-center border border-[#676B93] w-[80%] px-1.5 py-1.5 rounded-full  mb-8 self-center">
          <View className="w-full flex flex-row items-center justify-between">
            <TouchableOpacity
              className="w-1/2 items-center"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setActiveTab('balances');
              }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={activeTab === 'balances' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                style={styles.tablet}
              >
                <Text className={`text-sm  ${activeTab === 'balances' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Leave Balances</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-1/2 items-center"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setActiveTab('applications');
              }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={activeTab === 'applications' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                style={styles.tablet}
              >
                <Text className={`text-sm ${activeTab === 'applications' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Applications</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        
        {/* Content */}
        {activeTab === "balances" && (
          <View style={styles.balancesTab}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { color:"white"}]}
                placeholder="Search users"
                placeholderTextColor={"white"}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Text style={styles.userCount}>{filteredUsers.length} Users</Text>
            </View>

            {/* User Balances List */}
            {filteredUsers.length === 0 ? (
              renderEmptyState("No Users Found", "Try adjusting your search criteria")
            ) : (
              <FlatList
                data={filteredUsers}
                renderItem={renderUserBalance}
                keyExtractor={(item) => item.userId}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {activeTab === "applications" && (
          <View style={styles.applicationsTab}>
            {/* Status Filter */}
            <View style={styles.statusFilters}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.statusFiltersRow}>
                  {renderStatusBadge('All', filteredLeaves.length)}
                  {renderStatusBadge('Pending', filteredLeaves.filter(leave => leave.status === 'Pending').length)}
                  {renderStatusBadge('Approved', filteredLeaves.filter(leave => leave.status === 'Approved').length)}
                  {renderStatusBadge('Rejected', filteredLeaves.filter(leave => leave.status === 'Rejected').length)}
                </View>
              </ScrollView>
            </View>

            {/* Leave Applications List */}
            {filteredLeaves.length === 0 ? (
              renderEmptyState("No Leaves Found", "The list is currently empty for the selected filters")
            ) : (
              <FlatList
                data={filteredLeaves}
                renderItem={renderLeaveCard}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {renderCustomDateModal()}
      {renderRejectModal()}
      {renderDeleteDialog()}

      {/* Edit Leave Balance Modal */}
      <EditLeaveBalanceModal
        visible={isEditModalOpen}
        user={selectedUser}
        leaveTypes={leaveTypes}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUpdateLeaveBalance}
      />

      {/* LeaveApprovalModal */}
      {selectedLeaveForApproval && (
        <LeaveApprovalModal
          visible={showApprovalModal}
          leaveId={selectedLeaveForApproval._id}
          leaveDays={selectedLeaveForApproval.leaveDays}
          appliedDays={selectedLeaveForApproval.appliedDays}
          leaveReason={selectedLeaveForApproval.leaveReason}
          leaveType={selectedLeaveForApproval.leaveType?.leaveType || 'Unknown'}
          fromDate={selectedLeaveForApproval.fromDate}
          toDate={selectedLeaveForApproval.toDate}
          user={{
            firstName: selectedLeaveForApproval.user.firstName,
            lastName: selectedLeaveForApproval.user.lastName,
          }}
          manager={{
            firstName: selectedLeaveForApproval.user.reportingManager?.firstName || 'Unknown',
            lastName: selectedLeaveForApproval.user.reportingManager?.lastName || 'Manager',
          }}
          onClose={() => {
            setShowApprovalModal(false);
            setSelectedLeaveForApproval(null);
          }}
          onUpdate={() => {
            fetchAllLeaves();
            setShowApprovalModal(false);
            setSelectedLeaveForApproval(null);
          }}
          onShowToast={handleShowToast}
        />
      )}

      {/* Custom Splash Screen for Leave Balance Update */}
      {showSplashScreen && (
        <CustomSplashScreen
          visible={showSplashScreen}
          lottieSource={require('../../../assets/Animation/success.json')}
          mainText="Leave Balance Updated!"
          subtitle="The leave balance has been successfully updated for the selected user."
          onDismiss={() => setShowSplashScreen(false)}
          onComplete={() => setShowSplashScreen(false)}
          duration={3000}
          gradientColors={["#05071E", "#0A0D28"]}
          textGradientColors={["#815BF5", "#FC8929"]}
        />
      )}

      {/* Custom Delete Modal */}
      {itemToDelete && (
        <CustomDeleteModal
          visible={showDeleteModal}
          title="Are you sure you want to"
          subtitle="delete this leave request?"
          itemName={`${itemToDelete.leaveType?.leaveType || 'Leave'} request from ${itemToDelete.user.firstName} ${itemToDelete.user.lastName}`}
          onCancel={closeDeleteModal}
          onConfirm={confirmDeleteFromModal}
          isDeleting={isDeleting}
          cancelText="No, Keep It."
          confirmText="Delete"
        />)}

      {/* Toast Alert */}
      <ToastAlert
        visible={showToast}
        type={toastType}
        title={toastTitle}
        message={toastMessage}
        onHide={() => setShowToast(false)}
        duration={4000}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#05071E',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#787CA5',
    textAlign: 'center',
    fontFamily: 'LatoRegular',
  },
  tablet: {
    borderRadius: 99,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',

  },
  
  // Header Styles (matching MyLeavesScreen)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'LatoBold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },

  // Dropdown Container Styles (matching MyLeavesScreen)
  dropdownContainer: {
    paddingVertical: 10,

    alignItems: 'center',
  },
  // Status Filter Styles (matching MyLeavesScreen)
  statusFilters: {
    paddingVertical: 12,
  },
  statusFiltersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#37384B',
    borderWidth: 1,
    borderColor: '#37384B',
  },
  activeTabButton: {
    backgroundColor: '#815BF5',
    borderColor: '#815BF5',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  activeTabButtonText: {
    color: '#ffffff',
    fontFamily: 'LatoBold',
  },
  
  // Status Badge Styles (matching MyLeavesScreen)
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
    fontFamily: 'LatoRegular',
  },
  activeStatusBadgeText: {
    color: '#ffffff',
    fontFamily: 'LatoBold',
  },
  // Content Sections (matching MyLeavesScreen)
  balancesTab: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  applicationsTab: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  // Search Container Styles (matching MyLeavesScreen)
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
    color: '#fff',
    fontFamily: 'LatoRegular',
    
  },
  userCount: {
    fontSize: 14,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontFamily: 'LatoRegular',
  },
  userBalanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#815BF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    fontFamily: 'LatoBold',
    marginBottom: 4,
  },
  editButton: {
   
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  balanceItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  balanceCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceNumber: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 60,
  },

  // Request card styles (matching ApprovalScreen)
  requestCard: {
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
    shadowColor: 'rgba(0, 0, 0, 0.8)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  userDetails: {
    flex: 1,
  },
  requestDetails: {
    fontSize: 12,
    color: '#787CA5',
    lineHeight: 16,
    fontFamily: 'LatoRegular',
  },

  // Status badge styles
  statusContainer: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBadgeSmallText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'LatoMedium',
  },
  penaltyBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  penaltyBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'LatoMedium',
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: 'rgba(48, 41, 86, 0.7)',
    marginHorizontal: 16,
  },

  // Request item details
  requestItemDetails: {
    padding: 16,
  },
  requestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestDetailLabel: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    marginRight: 8,
  },
  requestDetailValue: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'LatoMedium',
    marginRight: 8,
  },
  requestDetailSeparator: {
    fontSize: 12,
    color: '#787CA5',
    marginHorizontal: 8,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  approveButton: {
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
    borderColor: '#06D6A0',
    borderWidth: 1,
  },
  rejectButton: {
    backgroundColor: 'rgba(231, 101, 101, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'LatoMedium',
  },

  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
    // Empty State Styles (matching MyLeavesScreen)
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'LatoBold',
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    textAlign: 'center',
    fontFamily: 'LatoRegular',
    lineHeight: 20,
  },
  // Modal Styles (matching MyLeavesScreen)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(48, 41, 86, 0.7)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  closeButton: {
    fontSize: 20,
    color: '#787CA5',
    padding: 4,
  },
  customDateModal: {
    backgroundColor: '#37384B',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  dateInputs: {
    marginBottom: 20,
  },
  dateInputGroup: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'LatoBold',
  },
  dateInput: {
    backgroundColor: '#2A2B3D',
    borderWidth: 1,
    borderColor: '#4A4B5C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateInputText: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#2A2B3D',
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  applyButton: {
    backgroundColor: '#815BF5',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#787CA5',
    fontWeight: '500',
    fontFamily: 'LatoRegular',
  },
  applyButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'LatoBold',
  },
  rejectModal: {
    backgroundColor: '#37384B',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  rejectContent: {
    marginBottom: 20,
  },
  rejectLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'LatoMedium',
  },
  rejectInput: {
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 100,
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    fontFamily: 'LatoRegular',
  },
  rejectSubmitButton: {
    backgroundColor: '#dc2626',
  },
  rejectSubmitButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'LatoBold',
  },
  deleteDialog: {
    backgroundColor: '#37384B',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  deleteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'LatoBold',
  },
  deleteMessage: {
    fontSize: 14,
    color: '#787CA5',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: 'LatoRegular',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelDeleteButton: {
    backgroundColor: '#2A2B3D',
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  confirmDeleteButton: {
    backgroundColor: '#dc2626',
  },
  cancelDeleteText: {
    fontSize: 14,
    color: '#787CA5',
    fontWeight: '500',
    fontFamily: 'LatoRegular',
  },
  confirmDeleteText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'LatoBold',
  },

  // Modal Styles (dark theme) - matching ApprovalScreen
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(48, 41, 86, 0.7)',
  },
  rejectConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#ef4444',
    marginLeft: 8,
  },
  rejectConfirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
});