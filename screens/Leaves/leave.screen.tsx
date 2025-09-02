import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import Navbar from '~/components/navbar';
import axios from 'axios';
import { backend_Host } from '~/config';

const { width } = Dimensions.get('window');

interface LeaveType {
  _id: string;
  leaveType: string;
  allotedLeaves: number;
  userLeaveBalance: number;
}

interface Leave {
  _id: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  status: string;
  appliedDays: number;
  leaveReason: string;
  createdAt: string;
}

const LeavesScreen: React.FC = () => {
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaveData = useCallback(async () => {
    try {
      if (!token) return;

      const [leavesResponse, leaveTypesResponse] = await Promise.all([
        axios.get(`${backend_Host}/leaves`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${backend_Host}/leaves/leaveType`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (leavesResponse.data.success) {
        setLeaves(leavesResponse.data.leaves || []);
      }
      if (leaveTypesResponse.data) {
        setLeaveTypes(leaveTypesResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchLeaveData();
  }, [fetchLeaveData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaveData();
  }, [fetchLeaveData]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'rejected': return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
      case 'pending': return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const renderLeaveTypeCard = (leaveType: LeaveType) => {
    const usedLeaves = leaveType.allotedLeaves - leaveType.userLeaveBalance;
    const percentage = leaveType.allotedLeaves > 0 ? (usedLeaves / leaveType.allotedLeaves) * 100 : 0;

    return (
      <View key={leaveType._id} style={styles.leaveTypeCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.leaveTypeName}>{leaveType.leaveType}</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>{leaveType.userLeaveBalance}</Text>
            <Text style={styles.balanceLabel}>Available</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={percentage > 80 ? ['#EF4444', '#DC2626'] : ['#815BF5', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {usedLeaves} of {leaveType.allotedLeaves} used
          </Text>
        </View>
      </View>
    );
  };

  const renderLeaveItem = (leave: Leave) => {
    const statusColor = getStatusColor(leave.status);
    const fromDate = new Date(leave.fromDate).toLocaleDateString();
    const toDate = new Date(leave.toDate).toLocaleDateString();

    return (
      <TouchableOpacity key={leave._id} style={styles.leaveItem}>
        <View style={styles.leaveHeader}>
          <View style={styles.leaveInfo}>
            <Text style={styles.leaveTypeText}>{leave.leaveType?.leaveType || 'Unknown'}</Text>
            <Text style={styles.leaveDates}>{fromDate} - {toDate}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg, borderColor: statusColor.border }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>{leave.status}</Text>
          </View>
        </View>
        
        <View style={styles.leaveDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#787CA5" />
            <Text style={styles.detailText}>{leave.appliedDays} day(s)</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="document-text-outline" size={16} color="#787CA5" />
            <Text style={styles.detailText} numberOfLines={2}>
              {leave.leaveReason || 'No reason provided'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Navbar title="My Leaves" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#815BF5" />
          <Text style={styles.loadingText}>Loading leave information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Navbar title="My Leaves" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#815BF5']}
            tintColor="#815BF5"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Leave Management</Text>
            <Text style={styles.headerSubtitle}>Track and manage your leave applications</Text>
          </View>
          
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => router.push('/screens/Attendance/MyLeaves/MyLeavesScreen')}
          >
            <LinearGradient
              colors={['#815BF5', '#FC8929']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <MaterialIcons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.buttonText}>Apply Leave</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Leave Balance Overview */}
        {leaveTypes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Leave Balance Overview</Text>
            <View style={styles.leaveTypesContainer}>
              {leaveTypes.map(renderLeaveTypeCard)}
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="pending-actions" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>
                {leaves.filter(l => l.status.toLowerCase() === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="check-circle" size={24} color="#10B981" />
              </View>
              <Text style={styles.statNumber}>
                {leaves.filter(l => l.status.toLowerCase() === 'approved').length}
              </Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MaterialIcons name="cancel" size={24} color="#EF4444" />
              </View>
              <Text style={styles.statNumber}>
                {leaves.filter(l => l.status.toLowerCase() === 'rejected').length}
              </Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>
        </View>

        {/* Recent Leave Applications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Applications</Text>
            <TouchableOpacity
              onPress={() => router.push('/screens/Attendance/MyLeaves/MyLeavesScreen')}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {leaves.length > 0 ? (
            <View style={styles.leavesContainer}>
              {leaves.slice(0, 3).map(renderLeaveItem)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="event-busy" size={48} color="#787CA5" />
              <Text style={styles.emptyTitle}>No Leave Applications</Text>
              <Text style={styles.emptySubtitle}>
                You haven't applied for any leaves yet. Start by applying for your first leave.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/screens/Attendance/MyLeaves/MyLeavesScreen')}
              >
                <Text style={styles.emptyButtonText}>Apply for Leave</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/screens/Attendance/MyLeaves/MyLeavesScreen')}
            >
              <View style={styles.actionIcon}>
                <MaterialIcons name="history" size={24} color="#815BF5" />
              </View>
              <Text style={styles.actionTitle}>Leave History</Text>
              <Text style={styles.actionSubtitle}>View all your leave applications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/screens/Attendance/Dashboard/attendanceDashboard.screen')}
            >
              <View style={styles.actionIcon}>
                <MaterialIcons name="schedule" size={24} color="#FC8929" />
              </View>
              <Text style={styles.actionTitle}>Attendance</Text>
              <Text style={styles.actionSubtitle}>Check your attendance records</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05071E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
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
    fontFamily: 'LatoBold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  applyButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#815BF5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'LatoBold',
    marginLeft: 8,
  },

  // Section Styles
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#815BF5',
    fontFamily: 'LatoBold',
  },

  // Leave Type Cards
  leaveTypesContainer: {
    gap: 12,
  },
  leaveTypeCard: {
    backgroundColor: '#37384B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    flex: 1,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#815BF5',
    fontFamily: 'LatoBold',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#0A0D28',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },

  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#37384B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    textAlign: 'center',
  },

  // Leave Items
  leavesContainer: {
    gap: 12,
  },
  leaveItem: {
    backgroundColor: '#37384B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leaveInfo: {
    flex: 1,
  },
  leaveTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 4,
  },
  leaveDates: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  leaveDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    flex: 1,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#37384B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#815BF5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },

  // Action Cards
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#37384B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default LeavesScreen;
