import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import NavbarTwo from '~/components/navbarTwo';
import CustomDropdown from '~/components/customDropDown';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import moment from 'moment';
import { getDateRange } from '~/utils/GetDateRange';

// Types
type LeaveType = {
  _id: string;
  leaveType: string;
};

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  reportingManager: {
    firstName: string;
    lastName: string;
    _id: string;
  };
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
  status: "Pending" | "Approved" | "Rejected";
  leaveReason: string;
  appliedDays: number;
  leaveDays: LeaveDay[];
  remarks: string;
  user: User;
  updatedAt: string;
  createdAt: string;
}

interface Regularization {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    reportingManager: {
      firstName: string;
      lastName: string;
    };
  };
  timestamp: string;
  loginTime: string;
  logoutTime: string;
  remarks: string;
  approvalStatus?: "Pending" | "Approved" | "Rejected";
}

const { width, height } = Dimensions.get('window');

const statusColors = {
  "Approved": { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  "Partially Approved": { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  "Rejected": { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  "Pending": { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
};

export default function ApprovalScreen() {
  const { token, userData } = useSelector((state: RootState) => state.auth);
  
  // State management
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [regularizations, setRegularizations] = useState<Regularization[]>([]);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [allRegularizations, setAllRegularizations] = useState<Regularization[]>([]);
  const [filter, setFilter] = useState<"Leave" | "Regularization">("Leave");
  const [selectedStatus, setSelectedStatus] = useState<"Pending" | "Approved" | "Rejected" | "All">("All");
  const [activeTab, setActiveTab] = useState("This Month");
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Date filtering states
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [formattedDateRange, setFormattedDateRange] = useState('');
  
  // Modal states
  const [selectedEntry, setSelectedEntry] = useState<Leave | Regularization | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

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

  // Type guards
  const isRegularization = (entry: Leave | Regularization): entry is Regularization => {
    return (entry as Regularization).loginTime !== undefined;
  };

  const isLeave = (entry: Leave | Regularization): entry is Leave => {
    return (entry as Leave).leaveType !== undefined;
  };

  // Filter data by date range (similar to MyLeavesScreen)
  const filterDataByDate = (data: (Leave | Regularization)[], dateRange: any) => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate || !Object.keys(startDate).length || !Object.keys(endDate).length) {
      return data;
    }
    return data.filter((entry) => {
      const entryDate = moment(isLeave(entry) ? entry.createdAt : entry.timestamp);
      return entryDate.isSameOrAfter(startDate) && entryDate.isBefore(endDate);
    });
  };

  const formatWithSuffix = (date: any) => {
    return moment(date).format('MMM Do YY');
  };

  // Handle date filter changes (similar to MyLeavesScreen)
  useEffect(() => {
    if (activeTab === 'Custom') {
      setIsCustomModalOpen(true);
      return;
    }

    // Get the date range for the selected option
    const allData = filter === "Leave" ? allLeaves : allRegularizations;
    const dateRange = getDateRange(activeTab, allData, customStartDate, customEndDate);

    if (dateRange.startDate && dateRange.endDate) {
      // Format and set the date range display
      if (activeTab === 'Today' || activeTab === 'Yesterday') {
        setFormattedDateRange(formatWithSuffix(dateRange.startDate));
      } else {
        const formattedStart = formatWithSuffix(dateRange.startDate);
        const formattedEnd = formatWithSuffix(dateRange.endDate);
        setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);
      }

      // Filter data based on the selected date range
      const filteredData = filterDataByDate(allData, dateRange);
      if (filter === "Leave") {
        setLeaves(filteredData as Leave[]);
      } else {
        setRegularizations(filteredData as Regularization[]);
      }
    } else {
      setFormattedDateRange('Invalid date range');
    }
  }, [activeTab, allLeaves, allRegularizations, customStartDate, customEndDate, filter]);

  // Handle custom date range selection
  const handleCustomDateApply = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);

    const customDateRange = {
      startDate: moment(startDate).startOf('day'),
      endDate: moment(endDate).endOf('day'),
    };

    const allData = filter === "Leave" ? allLeaves : allRegularizations;
    const customFilteredData = filterDataByDate(allData, customDateRange);
    
    if (filter === "Leave") {
      setLeaves(customFilteredData as Leave[]);
    } else {
      setRegularizations(customFilteredData as Regularization[]);
    }

    const formattedStart = formatWithSuffix(moment(startDate));
    const formattedEnd = formatWithSuffix(moment(endDate));
    setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);

    setIsCustomModalOpen(false);
  };

  // Fetch user role (matching web version)
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!token) {
          console.error("No auth token found");
          setInitialLoading(false);
          return;
        }

        const response = await axios.get(`${backend_Host}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        });
        
        if (response.data && response.data.data.role) {
          setCurrentUserRole(response.data.data.role);
        } else {
          // Fallback to orgAdmin if role not found
          setCurrentUserRole("orgAdmin");
        }
        setInitialLoading(false);
      } catch (error) {
        console.error("Error fetching user role:", error);
        // Fallback to orgAdmin on error
        setCurrentUserRole("orgAdmin");
        setInitialLoading(false);
      }
    };
    fetchUserRole();
  }, [token]);

  // Fetch data when role is available
  useEffect(() => {
    if (!currentUserRole || !token) return;
    fetchData();
  }, [currentUserRole, filter, token]);

  const fetchData = async () => {
    if (filter === "Leave") {
      await fetchLeaveData();
    } else {
      await fetchRegularizationData();
    }
  };

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        console.error("No auth token found for leave data fetch");
        setLoading(false);
        setInitialLoading(false);
        return;
      }

      let response;
      
      // Use mobile app API endpoints (without /api prefix)
      if (currentUserRole === "member") {
        response = await axios.get(`${backend_Host}/leaves`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        });
      } else if (currentUserRole === "orgAdmin" || currentUserRole === "manager") {
        response = await axios.get(`${backend_Host}/leaves/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        });
      } else {
        response = await axios.get(`${backend_Host}/leaves/approvals`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        });
      }

      if (response.data.success && Array.isArray(response.data.leaves)) {
        // Sanitize leaves data to ensure all required properties exist
        const sanitizedLeaves = response.data.leaves.map((leave: any) => ({
          ...leave,
          leaveType: leave.leaveType || {
            _id: 'unknown',
            leaveType: 'Unknown Leave Type',
          },
          user: leave.user || {
            firstName: 'Unknown',
            lastName: 'User',
            _id: 'unknown',
            reportingManager: {
              firstName: 'Unknown',
              lastName: 'Manager',
              _id: 'unknown'
            }
          },
          status: leave.status || 'Pending',
          leaveDays: leave.leaveDays || [],
          appliedDays: leave.appliedDays || 0,
          fromDate: leave.fromDate || new Date().toISOString(),
          toDate: leave.toDate || new Date().toISOString(),
          leaveReason: leave.leaveReason || leave.remarks || 'No reason provided',
          createdAt: leave.createdAt || new Date().toISOString(),
          updatedAt: leave.updatedAt || new Date().toISOString()
        }));
        
        setAllLeaves(sanitizedLeaves);
        setLeaves(sanitizedLeaves);
      } else {
        console.error("Error: No leaves found or invalid data format");
        setAllLeaves([]);
        setLeaves([]);
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
      setAllLeaves([]);
      setLeaves([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const fetchRegularizationData = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        console.error("No auth token found for regularization data fetch");
        setLoading(false);
        setInitialLoading(false);
        return;
      }

      // Use mobile app API endpoints (without /api prefix)
      if (currentUserRole === "member") {
        const response = await fetch(`${backend_Host}/loginEntries`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        
        if (data.entries && Array.isArray(data.entries)) {
          const sanitizedRegularizations = data.entries.map((reg: any) => ({
            ...reg,
            userId: reg.userId || {
              firstName: 'Unknown',
              lastName: 'User',
              reportingManager: {
                firstName: 'Unknown',
                lastName: 'Manager',
              }
            },
            approvalStatus: reg.approvalStatus || 'Pending',
            timestamp: reg.timestamp || new Date().toISOString(),
            loginTime: reg.loginTime || 'N/A',
            logoutTime: reg.logoutTime || 'N/A',
            remarks: reg.remarks || 'No remarks provided'
          }));
          
          setAllRegularizations(sanitizedRegularizations);
          setRegularizations(sanitizedRegularizations);
        } else {
          setAllRegularizations([]);
          setRegularizations([]);
        }
      } else {
        const response = await axios.get(`${backend_Host}/regularizations/approvals`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000
        });

        if (response.data.success && Array.isArray(response.data.regularizations)) {
          const sanitizedRegularizations = response.data.regularizations.map((reg: any) => ({
            ...reg,
            userId: reg.userId || {
              firstName: 'Unknown',
              lastName: 'User',
              reportingManager: {
                firstName: 'Unknown',
                lastName: 'Manager',
              }
            },
            approvalStatus: reg.approvalStatus || 'Pending',
            timestamp: reg.timestamp || new Date().toISOString(),
            loginTime: reg.loginTime || 'N/A',
            logoutTime: reg.logoutTime || 'N/A',
            remarks: reg.remarks || 'No remarks provided'
          }));
          
          setAllRegularizations(sanitizedRegularizations);
          setRegularizations(sanitizedRegularizations);
        } else {
          console.error("Error: No regularizations found or invalid data format");
          setAllRegularizations([]);
          setRegularizations([]);
        }
      }
    } catch (error) {
      console.error("Error fetching regularization data:", error);
      setAllRegularizations([]);
      setRegularizations([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchData()]);
      // Reset to current filter after refresh
      if (activeTab !== 'Custom') {
        const allData = filter === "Leave" ? allLeaves : allRegularizations;
        const dateRange = getDateRange(activeTab, allData, customStartDate, customEndDate);
        if (dateRange.startDate && dateRange.endDate) {
          const filteredData = filterDataByDate(allData, dateRange);
          if (filter === "Leave") {
            setLeaves(filteredData as Leave[]);
          } else {
            setRegularizations(filteredData as Regularization[]);
          }
        }
      }
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter functions (similar to MyLeavesScreen)
  const filterEntriesByStatus = (data: (Leave | Regularization)[]): (Leave | Regularization)[] => {
    return data.filter((entry) => {
      if (selectedStatus === "All") return true;
      
      if (isLeave(entry)) {
        return entry.status === selectedStatus;
      } else {
        return entry.approvalStatus === selectedStatus;
      }
    });
  };

  // Memoize heavy computations
  const filteredData = useMemo(() => {
    const currentData = filter === "Leave" ? leaves : regularizations;
    return filterEntriesByStatus(currentData);
  }, [leaves, regularizations, selectedStatus, filter]);

  const dataCounts = useMemo(() => {
    const currentData = filter === "Leave" ? leaves : regularizations;
    const allCount = currentData.length;
    const pendingCount = currentData.filter((entry) => {
      if (isLeave(entry)) {
        return entry.status === "Pending";
      } else {
        return entry.approvalStatus === "Pending";
      }
    }).length;
    const approvedCount = currentData.filter((entry) => {
      if (isLeave(entry)) {
        return entry.status === "Approved";
      } else {
        return entry.approvalStatus === "Approved";
      }
    }).length;
    const rejectedCount = currentData.filter((entry) => {
      if (isLeave(entry)) {
        return entry.status === "Rejected";
      } else {
        return entry.approvalStatus === "Rejected";
      }
    }).length;
    
    return { allCount, pendingCount, approvedCount, rejectedCount };
  }, [leaves, regularizations, filter]);

  // Action handlers (matching web version API endpoints)
  const handleApprove = async (entry: Leave | Regularization) => {
    try {
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      if (isLeave(entry)) {
        const leaveDays = entry.leaveDays.map(day => ({
          date: day.date,
          unit: day.unit,
          status: "Approved" as const,
        }));

        const response = await axios.post(`${backend_Host}/leaves/approvals/${entry._id}`, {
          action: "approve",
          leaveDays,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          Alert.alert("Success", "Leave approved successfully");
          fetchData();
        } else {
          throw new Error(response.data.message || "Failed to approve leave request.");
        }
      } else {
        const response = await axios.post(`${backend_Host}/regularizations/approvals/${entry._id}/approve`, {}, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.data.success) {
          Alert.alert("Success", "Regularization approved successfully");
          fetchData();
        } else {
          throw new Error(response.data.message || "Failed to approve regularization request.");
        }
      }
    } catch (error: any) {
      console.error("Error approving:", error);
      Alert.alert("Error", `Failed to approve request: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleReject = async () => {
    if (!selectedEntry || !token) return;

    try {
      if (isLeave(selectedEntry)) {
        const leaveDays = selectedEntry.leaveDays.map(day => ({
          date: day.date,
          unit: day.unit,
          status: "Rejected" as const,
        }));

        const response = await axios.post(`${backend_Host}/leaves/approvals/${selectedEntry._id}`, {
          action: "reject",
          leaveDays,
          remarks: rejectRemarks,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.data.success) {
          Alert.alert("Success", "Leave rejected successfully");
          setShowRejectModal(false);
          setRejectRemarks('');
          fetchData();
        } else {
          throw new Error(response.data.message || "Failed to reject leave request.");
        }
      } else {
        const response = await axios.post(`${backend_Host}/regularizations/approvals/${selectedEntry._id}/reject`, {
          remarks: rejectRemarks,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.data.success) {
          Alert.alert("Success", "Regularization rejected successfully");
          setShowRejectModal(false);
          setRejectRemarks('');
          fetchData();
        } else {
          throw new Error(response.data.message || "Failed to reject regularization request.");
        }
      }
    } catch (error: any) {
      console.error("Error rejecting:", error);
      Alert.alert("Error", `Failed to reject request: ${error.response?.data?.message || error.message}`);
    }
  };

  // Delete handlers (matching web version)
  const handleDeleteLeave = async (leaveId: string) => {
    try {
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      const response = await axios.delete(`${backend_Host}/leaves/approvals/${leaveId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        Alert.alert("Success", "Leave request deleted successfully");
        fetchData();
      } else {
        throw new Error(response.data.error || "Failed to delete leave.");
      }
    } catch (error: any) {
      console.error("Error deleting leave:", error);
      Alert.alert("Error", `Error deleting leave: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteRegularization = async (regularizationId: string) => {
    try {
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      const response = await axios.delete(`${backend_Host}/regularizations/approvals/${regularizationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.success) {
        Alert.alert("Success", "Regularization request deleted successfully");
        fetchData();
      } else {
        throw new Error(response.data.error || "Failed to delete regularization.");
      }
    } catch (error: any) {
      console.error("Error deleting regularization:", error);
      Alert.alert("Error", `Error deleting regularization: ${error.response?.data?.message || error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColor = statusColors[status as keyof typeof statusColors] || statusColors["Pending"];
    return statusColor.bg;
  };

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  const handleTabPress = (tabName: "Leave" | "Regularization") => {
    setFilter(tabName);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const renderTabNavigator = () => (
    <View style={styles.tabNavigatorContainer}>
      <View style={styles.tabNavigatorWrapper}>
        <TouchableOpacity
          style={styles.tabNavigatorButton}
          onPress={() => handleTabPress('Leave')}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={filter === 'Leave' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
            style={styles.tabNavigatorGradient}
          >
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={filter === 'Leave' ? '#FFFFFF' : '#676B93'} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabNavigatorText,
              { color: filter === 'Leave' ? '#FFFFFF' : '#676B93' }
            ]}>
              Leave
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabNavigatorButton}
          onPress={() => handleTabPress('Regularization')}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={filter === 'Regularization' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
            style={styles.tabNavigatorGradient}
          >
            <Ionicons 
              name="people-outline" 
              size={16} 
              color={filter === 'Regularization' ? '#FFFFFF' : '#676B93'} 
              style={styles.tabIcon}
            />
            <Text style={[
              styles.tabNavigatorText,
              { color: filter === 'Regularization' ? '#FFFFFF' : '#676B93' }
            ]}>
              Regularization
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatusBadge = (status: string, count: number) => (
    <TouchableOpacity
      key={status}
      style={[
        styles.statusBadge,
        selectedStatus === status && styles.activeStatusBadge
      ]}
      onPress={() => setSelectedStatus(status)}
    >
      <Text style={[
        styles.statusBadgeText,
        selectedStatus === status && styles.activeStatusBadgeText
      ]}>
        {status} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderRequestCard = (entry: Leave | Regularization) => {
    const isLeaveEntry = isLeave(entry);
    const status = isLeaveEntry ? entry.status : (entry.approvalStatus || 'Pending');
    const statusColor = statusColors[status as keyof typeof statusColors] || statusColors["Pending"];
    const userName = isLeaveEntry 
      ? `${entry.user.firstName} ${entry.user.lastName}`
      : `${entry.userId?.firstName || ''} ${entry.userId?.lastName || ''}`;
    const userInitials = isLeaveEntry 
      ? getInitials(entry.user.firstName, entry.user.lastName)
      : getInitials(entry.userId?.firstName || 'U', entry.userId?.lastName);

    return (
      <TouchableOpacity
        key={entry._id}
        style={styles.requestCard}
        onPress={() => {
          setSelectedEntry(entry);
          setShowDetailsModal(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitials}</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userName}</Text>
              {isLeaveEntry ? (
                <Text style={styles.requestDetails}>
                  {entry.leaveType?.leaveType} • {moment(entry.fromDate).format("MMM D")} - {moment(entry.toDate).format("MMM D, YYYY")} • {entry.appliedDays} day{entry.appliedDays > 1 ? 's' : ''}
                </Text>
              ) : (
                <Text style={styles.requestDetails}>
                  {moment(entry.timestamp).format("MMM D, YYYY")} • Login: {entry.loginTime?.substring(0, 5) || "N/A"} • Logout: {entry.logoutTime?.substring(0, 5) || "N/A"}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.statusContainer}>
            {isLeaveEntry && entry.leaveReason === "Penalty" && (
              <View style={styles.penaltyBadge}>
                <Text style={styles.penaltyBadgeText}>Penalty</Text>
              </View>
            )}
            <View style={[
              styles.statusBadgeSmall,
              { backgroundColor: statusColor?.bg, borderColor: statusColor?.border }
            ]}>
              <Text style={[styles.statusBadgeSmallText, { color: statusColor?.text }]}>
                {status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.requestItemDetails}>
          {isLeaveEntry ? (
            <>
              <View style={styles.requestDetailRow}>
                <Text style={styles.requestDetailLabel}>From:</Text>
                <Text style={styles.requestDetailValue}>
                  {moment(entry.fromDate).format("MMM D, YYYY")}
                </Text>
              </View>
              
              <View style={styles.requestDetailRow}>
                <Text style={styles.requestDetailLabel}>To:</Text>
                <Text style={styles.requestDetailValue}>
                  {moment(entry.toDate).format("MMM D, YYYY")}
                </Text>
              </View>
              
              <View style={styles.requestDetailRow}>
                <Text style={styles.requestDetailLabel}>Applied:</Text>
                <Text style={styles.requestDetailValue}>{entry.appliedDays} day(s)</Text>
                <Text style={styles.requestDetailSeparator}>|</Text>
                <Text style={styles.requestDetailLabel}>Approved:</Text>
                <Text style={styles.requestDetailValue}>
                  {entry.leaveDays?.filter((day) => day.status === "Approved").length || 0} day(s)
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.requestDetailRow}>
                <Text style={styles.requestDetailLabel}>Date:</Text>
                <Text style={styles.requestDetailValue}>
                  {moment(entry.timestamp).format("MMM D, YYYY")}
                </Text>
              </View>
              
              <View style={styles.requestDetailRow}>
                <Text style={styles.requestDetailLabel}>Login:</Text>
                <Text style={styles.requestDetailValue}>{entry.loginTime || "N/A"}</Text>
                <Text style={styles.requestDetailSeparator}>|</Text>
                <Text style={styles.requestDetailLabel}>Logout:</Text>
                <Text style={styles.requestDetailValue}>{entry.logoutTime || "N/A"}</Text>
              </View>
            </>
          )}
        </View>

        {currentUserRole === "orgAdmin" && status === "Pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(entry)}
            >
              <Ionicons name="checkmark" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => {
                setSelectedEntry(entry);
                setShowRejectModal(true);
              }}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => {
                Alert.alert(
                  "Confirm Delete",
                  isLeave(entry) 
                    ? "Are you sure you want to delete this leave request? This action cannot be undone."
                    : "Are you sure you want to delete this regularization request? This action cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Delete", 
                      style: "destructive",
                      onPress: () => {
                        if (isLeave(entry)) {
                          handleDeleteLeave(entry._id);
                        } else {
                          handleDeleteRegularization(entry._id);
                        }
                      }
                    }
                  ]
                );
              }}
            >
              <Ionicons name="trash" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <LottieView
        source={require('../../../assets/Animation/no-data.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
      <Text style={styles.emptyStateTitle}>
        No {filter} Requests Found
      </Text>
      <Text style={styles.emptyStateText}>
        {filteredData.length === 0 
          ? `No ${filter.toLowerCase()} requests found for the selected filters (${activeTab}${selectedStatus !== 'All' ? `, ${selectedStatus}` : ''}). Try changing your filter criteria.`
          : `The list is currently empty for the selected filters.`
        }
      </Text>
    </View>
  );

  
  const renderRejectModal = () => (
    <Modal
      visible={showRejectModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowRejectModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Reject Request</Text>
          <TouchableOpacity onPress={() => setShowRejectModal(false)}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalContent}>
          <Text style={styles.rejectLabel}>Reason for rejection (optional)</Text>
          <TextInput
            style={styles.rejectInput}
            multiline
            numberOfLines={4}
            placeholder="Enter rejection reason..."
            value={rejectRemarks}
            onChangeText={setRejectRemarks}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setShowRejectModal(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectConfirmButton}
            onPress={handleReject}
          >
            <Text style={styles.rejectConfirmButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderDetailsModal = () => {
    if (!selectedEntry) return null;

    const isLeaveEntry = isLeave(selectedEntry);
    
    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isLeaveEntry ? 'Leave Details' : 'Regularization Details'}
            </Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {isLeaveEntry ? (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Employee</Text>
                  <Text style={styles.detailValue}>
                    {selectedEntry.user.firstName} {selectedEntry.user.lastName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Leave Type</Text>
                  <Text style={styles.detailValue}>{selectedEntry.leaveType?.leaveType}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>From Date</Text>
                  <Text style={styles.detailValue}>
                    {moment(selectedEntry.fromDate).format("MMM D, YYYY")}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>To Date</Text>
                  <Text style={styles.detailValue}>
                    {moment(selectedEntry.toDate).format("MMM D, YYYY")}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Applied Days</Text>
                  <Text style={styles.detailValue}>{selectedEntry.appliedDays}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedEntry.status) }]}>
                    <Text style={styles.statusText}>{selectedEntry.status}</Text>
                  </View>
                </View>
                {selectedEntry.leaveReason && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reason</Text>
                    <Text style={styles.detailValue}>{selectedEntry.leaveReason}</Text>
                  </View>
                )}
                {selectedEntry.remarks && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Remarks</Text>
                    <Text style={styles.detailValue}>{selectedEntry.remarks}</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Employee</Text>
                  <Text style={styles.detailValue}>
                    {selectedEntry.userId?.firstName} {selectedEntry.userId?.lastName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {moment(selectedEntry.timestamp).format("MMM D, YYYY")}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Login Time</Text>
                  <Text style={styles.detailValue}>{selectedEntry.loginTime || "N/A"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Logout Time</Text>
                  <Text style={styles.detailValue}>{selectedEntry.logoutTime || "N/A"}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedEntry.approvalStatus || 'Pending') }]}>
                    <Text style={styles.statusText}>{selectedEntry.approvalStatus || 'Pending'}</Text>
                  </View>
                </View>
                {selectedEntry.remarks && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Remarks</Text>
                    <Text style={styles.detailValue}>{selectedEntry.remarks}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const { allCount, pendingCount, approvedCount, rejectedCount } = dataCounts;

  // Main loading screen
  if (initialLoading) {
    return (
      <SafeAreaView className="h-full flex-1 bg-primary">
        <NavbarTwo title="Approval Requests" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#815BF5" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <NavbarTwo title="Approval Requests" />
      
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
  

        {/* Tab Navigator */}
        {renderTabNavigator()}

        {/* Date Range Filter Dropdown */}
        <View className='w-full mb-2 flex items-center' >
          <CustomDropdown
            data={daysData}
            placeholder="Select Date Filter"
            selectedValue={activeTab}
            onSelect={(value) => {
              setActiveTab(value);
              if (value === 'Custom') {
                setIsCustomModalOpen(true);
              }
            }}
          />
        </View>

        {/* Status Filter */}
        <View style={styles.statusFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.statusFiltersRow}>
              {renderStatusBadge('All', allCount)}
              {renderStatusBadge('Pending', pendingCount)}
              {renderStatusBadge('Approved', approvedCount)}
              {renderStatusBadge('Rejected', rejectedCount)}
            </View>
          </ScrollView>
        </View>

        {/* Requests List */}
        <View style={styles.requestsSection}>
          <Text style={styles.sectionTitle}>{filter} Requests</Text>
          
          {filteredData.length > 0 ? (
            <View style={styles.requestsList}>
              {filteredData.map(renderRequestCard)}
            </View>
          ) : (
            renderEmptyState()
          )}
        </View>
      </ScrollView>

      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        isVisible={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onApply={handleCustomDateApply}
      />

      {/* Modals */}
      {renderRejectModal()}
      {renderDetailsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Main container styles (matching MyLeavesScreen)
  scrollView: {
    flex: 1,
    backgroundColor: '#05071E',
    marginTop: 33,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  
  // Header styles
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0A0D28',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },

  // Tab Navigator styles (matching billing screen)
  tabNavigatorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabNavigatorWrapper: {
    borderWidth: 1,
    borderColor: '#676B93',
    borderRadius: 9999,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
  },
  tabNavigatorButton: {
    width: '50%',
    alignItems: 'center',
  },
  tabNavigatorGradient: {
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabNavigatorText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'LatoBold',
  },

  // Dropdown container
  dropdownContainer: {
    
    marginBottom: 10,
  },

  // Status filter styles
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

  // Requests section
  requestsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 16,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#0A0D28',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },

  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'LatoBold',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#787CA5',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'LatoRegular',
  },

  // Request card styles
  requestsList: {
    gap: 12,
  },
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'LatoBold',
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
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'LatoMedium',
  },
  // Modal Styles (dark theme)
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  // Reject Modal Styles
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
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#787CA5',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'LatoMedium',
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

  // Details Modal Styles
  detailsContainer: {
    paddingVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(48, 41, 86, 0.7)',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#787CA5',
    flex: 1,
    fontFamily: 'LatoMedium',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 2,
    textAlign: 'right',
    fontFamily: 'LatoRegular',
  },
});