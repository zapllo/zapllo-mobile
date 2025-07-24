import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';
import LottieView from 'lottie-react-native';

interface AttendanceReportProps {
  userId?: string;
}

interface AttendanceReportData {
  totalDays: number;
  workingDays: number;
  weekOffs: number;
  holidays: { length: number };
  report: Array<{
    user: string;
    present: number;
    absent: number;
    leave: number;
    reportingManager: string;
  }>;
}

interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  reportingManager?: {
    firstName: string;
    lastName: string;
  } | null;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ userId }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [attendanceData, setAttendanceData] = useState<AttendanceReportData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCustomDateModalVisible, setIsCustomDateModalVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'start' | 'end'>('start');

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAttendanceReport();
    }
  }, [startDate, endDate]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${backend_Host}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.user) {
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchAttendanceReport = async () => {
    if (!userId || !startDate || !endDate) return;

    setAttendanceLoading(true);
    try {
      const response = await axios.post(`${backend_Host}/reports/cumulative`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        employeeId: userId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      Alert.alert('Error', 'Failed to fetch attendance report');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleDateSelection = (target: 'start' | 'end') => {
    setDatePickerTarget(target);
    setIsCustomDateModalVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCustomDateApply = (selectedStartDate: Date, selectedEndDate: Date) => {
    setStartDate(selectedStartDate);
    setEndDate(selectedEndDate);
    setIsCustomDateModalVisible(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const generateReport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchAttendanceReport();
  };

  const renderStatsCard = (title: string, value: number, icon: string, bgColor: string, textColor: string) => (
    <View style={[styles.statsCard, { backgroundColor: bgColor }]}>
      <View style={styles.statsContent}>
        <Text style={styles.statsLabel}>{title}</Text>
        <Text style={[styles.statsValue, { color: textColor }]}>{value}</Text>
      </View>
      <MaterialIcons name={icon as any} size={32} color={textColor} style={styles.statsIcon} />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <LottieView
        source={require('~/assets//Animation/no-data.json')}
        autoPlay
        loop
        style={styles.emptyLottie}
      />
      <Text style={styles.emptyTitle}>No Attendance Data Available</Text>
      <Text style={styles.emptySubtitle}>
        {startDate && endDate
          ? "No attendance records found for the selected date range"
          : "Select a date range to view attendance records"}
      </Text>
      {!startDate || !endDate ? (
        <TouchableOpacity
          style={styles.selectDateButton}
          onPress={() => handleDateSelection('start')}
        >
          <MaterialIcons name="calendar-today" size={16} color="#815BF5" />
          <Text style={styles.selectDateButtonText}>Select Date Range</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderAttendanceTable = () => {
    if (!attendanceData?.report || attendanceData.report.length === 0) {
      return renderEmptyState();
    }

    return (
      <ScrollView style={styles.attendanceList} showsVerticalScrollIndicator={false}>
        {attendanceData.report.map((entry, index) => (
          <View key={index} style={styles.attendanceCard}>
            {/* User Info Section */}
            <View style={styles.userInfoSection}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {entry.user.split(' ').map(name => name.charAt(0)).join('').substring(0, 2)}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{entry.user}</Text>
                <Text style={styles.userManager}>
                  {entry.reportingManager || 
                   (userData?.reportingManager 
                     ? `${userData.reportingManager.firstName} ${userData.reportingManager.lastName}`
                     : 'No Manager Assigned')}
                </Text>
              </View>
            </View>

            {/* Attendance Stats Section */}
            <View style={styles.attendanceStats}>
              <View style={styles.statItem}>
                <View style={[styles.statBadge, styles.presentBadge]}>
                  <MaterialIcons name="check-circle" size={16} color="#10B981" />
                  <Text style={[styles.statValue, { color: '#10B981' }]}>{entry.present}</Text>
                </View>
                <Text style={styles.statLabel}>Present</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statBadge, styles.absentBadge]}>
                  <MaterialIcons name="cancel" size={16} color="#EF4444" />
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>{entry.absent}</Text>
                </View>
                <Text style={styles.statLabel}>Absent</Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statBadge, styles.leaveBadge]}>
                  <MaterialIcons name="event-busy" size={16} color="#F59E0B" />
                  <Text style={[styles.statValue, { color: '#F59E0B' }]}>{entry.leave}</Text>
                </View>
                <Text style={styles.statLabel}>Leave</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.mainTitle}>Attendance Report</Text>
          <Text style={styles.subtitle}>View and analyze employee attendance records</Text>
        </View>

        {/* Date Range Display - Only show when dates are selected */}
        {startDate && endDate && (
          <View style={styles.dateSelectionSection}>
            <View style={styles.dateRangeDisplay}>
              <Text style={styles.dateRangeText}>
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </Text>
              <TouchableOpacity
                style={styles.changeDateButton}
                onPress={() => setIsCustomDateModalVisible(true)}
              >
                <MaterialIcons name="edit" size={16} color="#815BF5" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading State */}
        {attendanceLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#815BF5" />
            <Text style={styles.loadingText}>Loading attendance data...</Text>
          </View>
        )}

        {/* Stats Cards */}
        {attendanceData && !attendanceLoading && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              {renderStatsCard('Total Days', attendanceData.totalDays, 'calendar-today', 'rgba(59, 130, 246, 0.1)', '#3B82F6')}
              {renderStatsCard('Working Days', attendanceData.workingDays, 'work', 'rgba(16, 185, 129, 0.1)', '#10B981')}
            </View>
            <View style={styles.statsRow}>
              {renderStatsCard('Week Offs', attendanceData.weekOffs, 'weekend', 'rgba(245, 158, 11, 0.1)', '#F59E0B')}
              {renderStatsCard('Holidays', attendanceData.holidays.length, 'celebration', 'rgba(239, 68, 68, 0.1)', '#EF4444')}
            </View>
          </View>
        )}

        {/* Attendance Details Section */}
        {attendanceData && !attendanceLoading && (
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Attendance Details</Text>
            <Text style={styles.detailsSubtitle}>
              Summary of attendance from {startDate?.toLocaleDateString()} to {endDate?.toLocaleDateString()}
            </Text>
            
            {renderAttendanceTable()}
          </View>
        )}

        {/* Empty State when no data and not loading */}
        {!attendanceData && !attendanceLoading && renderEmptyState()}

        {/* Custom Date Range Modal */}
        <CustomDateRangeModal
          isVisible={isCustomDateModalVisible}
          onClose={() => setIsCustomDateModalVisible(false)}
          onApply={handleCustomDateApply}
          initialStartDate={startDate || new Date()}
          initialEndDate={endDate || new Date()}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  headerSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  mainTitle: {
    fontFamily: 'LatoBold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
  },
  dateSelectionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  dateButtonText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  generateButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  loadingText: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: '#A9A9A9',
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statsContent: {
    flex: 1,
  },
  statsLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 4,
  },
  statsValue: {
    fontFamily: 'LatoBold',
    fontSize: 24,
  },
  statsIcon: {
    opacity: 0.8,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailsTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  detailsSubtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 16,
  },
  tableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tableHeaderText: {
    flex: 1,
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#815BF5',
    textAlign: 'center',
  },
  tableBody: {
    maxHeight: 300,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tableCell: {
    flex: 1,
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  badgeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  presentBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  absentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  leaveBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeText: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyStateContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyLottie: {
    width: 160,
    height: 160,
  },
  emptyTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
    marginBottom: 16,
  },
  selectDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(129, 91, 245, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 91, 245, 0.3)',
    gap: 8,
  },
  selectDateButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#815BF5',
  },
  dateRangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(129, 91, 245, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 91, 245, 0.3)',
  },
  dateRangeText: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#815BF5',
    flex: 1,
    textAlign: 'center',
  },
  changeDateButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
  },
  selectDateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(129, 91, 245, 0.3)',
    gap: 8,
  },
  selectDateRangeButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#815BF5',
  },
  // New mobile-friendly attendance card styles
  attendanceList: {
    maxHeight: 400,
  },
  attendanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(129, 91, 245, 0.3)',
  },
  userAvatarText: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#815BF5',
    textTransform: 'uppercase',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userManager: {
    fontFamily: 'LatoRegular',
    fontSize: 13,
    color: '#A9A9A9',
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
    gap: 6,
    minWidth: 60,
    justifyContent: 'center',
  },
  statValue: {
    fontFamily: 'LatoBold',
    fontSize: 16,
  },
  statLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    textAlign: 'center',
  },
});

export default AttendanceReport;