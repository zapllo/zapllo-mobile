import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
// Removed Picker import as we're using toggle buttons now
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import moment from 'moment';

interface LeaveDay {
  date: string;
  unit:
    | 'Full Day'
    | '1st Half'
    | '2nd Half'
    | '1st Quarter'
    | '2nd Quarter'
    | '3rd Quarter'
    | '4th Quarter';
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface LeaveApprovalModalProps {
  visible: boolean;
  leaveId: string;
  leaveDays: LeaveDay[];
  appliedDays: number;
  leaveReason: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  user: { firstName: string; lastName: string };
  manager: { firstName: string; lastName: string };
  onClose: () => void;
  onUpdate: () => void;
  onShowToast?: (type: 'success' | 'error', title: string, message: string) => void;
}

const LeaveApprovalModal: React.FC<LeaveApprovalModalProps> = ({
  visible,
  leaveId,
  leaveDays,
  appliedDays,
  leaveReason,
  leaveType,
  fromDate,
  toDate,
  user,
  manager,
  onClose,
  onUpdate,
  onShowToast,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [approvalData, setApprovalData] = useState<LeaveDay[]>(
    leaveDays.map((day) => ({
      ...day,
      status: day.status === 'Pending' ? 'Approved' : day.status,
    }))
  );
  const [approvedDaysCount, setApprovedDaysCount] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Calculate the initial number of approved days
  useEffect(() => {
    const approvedDays = approvalData.filter(
      (day) => day.status === 'Approved'
    ).length;
    setApprovedDaysCount(approvedDays);
  }, [approvalData]);

  // Handle the status change (either Approve or Reject)
  const handleStatusChange = (
    date: string,
    newStatus: 'Approved' | 'Rejected'
  ) => {
    console.log(`Updating ${date} to ${newStatus}`);
    setApprovalData((prevData) =>
      prevData.map((day) =>
        day.date === date ? { ...day, status: newStatus } : day
      )
    );
  };

  // Submit the approval/rejection data to the backend
  const handleSubmit = async () => {
    if (!token) {
      if (onShowToast) {
        onShowToast('error', 'Authentication Error', 'Authentication required');
      } else {
        Alert.alert('Error', 'Authentication required');
      }
      return;
    }

    console.log('Submitting data:', approvalData);
    console.log('Submitting remarks:', remarks);

    setLoading(true);
    try {
      const response = await axios.post(
        `${backend_Host}/leaveApprovals/${leaveId}`,
        {
          leaveDays: approvalData,
          remarks,
          action: approvalData.every((day) => day.status === 'Approved')
            ? 'approve'
            : 'reject',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        // Show success toast
        const isFullyApproved = approvalData.every((day) => day.status === 'Approved');
        const isFullyRejected = approvalData.every((day) => day.status === 'Rejected');
        
        if (onShowToast) {
          if (isFullyApproved) {
            onShowToast('success', 'Leave Approved', 'The leave request has been approved successfully');
          } else if (isFullyRejected) {
            onShowToast('success', 'Leave Rejected', 'The leave request has been rejected successfully');
          } else {
            onShowToast('success', 'Leave Processed', 'The leave request has been partially approved');
          }
        }
        
        // Close modal and refresh data
        onUpdate();
        onClose();
      } else {
        console.error('API Error:', response.data.error);
        if (onShowToast) {
          onShowToast('error', 'Processing Failed', response.data.error || 'Failed to process leave request');
        } else {
          Alert.alert('Error', response.data.error || 'Failed to process leave request');
        }
      }
    } catch (error: any) {
      console.error('Request failed:', error);
      const errorMessage = `Failed to process leave request: ${
        error.response?.data?.message || error.message
      }`;
      
      if (onShowToast) {
        onShowToast('error', 'Processing Failed', errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#06D6A0';
      case 'Rejected':
        return '#EF4444';
      default:
        return '#787CA5';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {leaveType} By {user.firstName} {user.lastName}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <View style={styles.userRow}>
              <Text style={styles.userLabel}>Applied By:</Text>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: '#815BF5' }]}>
                  <Text style={styles.avatarText}>
                    {getInitials(user.firstName, user.lastName)}
                  </Text>
                </View>
                <Text style={styles.userName}>
                  {user.firstName} {user.lastName}
                </Text>
              </View>
            </View>

            {manager && (
              <View style={styles.userRow}>
                <Text style={styles.userLabel}>Manager:</Text>
                <View style={styles.userInfo}>
                  <View style={[styles.avatar, { backgroundColor: '#815BF5' }]}>
                    <Text style={styles.avatarText}>
                      {getInitials(manager.firstName, manager.lastName)}
                    </Text>
                  </View>
                  <Text style={styles.userName}>
                    {manager.firstName} {manager.lastName}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Leave Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Leave Type:</Text>
              <Text style={styles.detailValue}>{leaveType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reason:</Text>
              <Text style={styles.detailValue}>{leaveReason}</Text>
            </View>
          </View>

          {/* Date Range */}
          <View style={styles.dateContainer}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>From:</Text>
              <View style={styles.dateInput}>
                <Text style={styles.dateText}>
                  {moment(fromDate).format('MMM D, YYYY')}
                </Text>
              </View>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>To:</Text>
              <View style={styles.dateInput}>
                <Text style={styles.dateText}>
                  {moment(toDate).format('MMM D, YYYY')}
                </Text>
              </View>
            </View>
          </View>

          {/* Leave Days */}
          <View style={styles.leaveDaysContainer}>
            <Text style={styles.sectionTitle}>Leave Days</Text>
            {approvalData?.map((day, index) => (
              <View key={index} style={styles.dayRow}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayDate}>
                    {moment(day.date).format('MMM D, YYYY')}
                  </Text>
                  <Text style={styles.dayUnit}>({day.unit})</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={styles.toggleWrapper}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        day.status === 'Approved' && styles.toggleButtonActive,
                        { backgroundColor: day.status === 'Approved' ? '#06D6A0' : 'rgba(27, 23, 57, 0.6)' }
                      ]}
                      onPress={() => handleStatusChange(day.date, 'Approved')}
                    >
                      <Ionicons 
                        name="checkmark" 
                        size={14} 
                        color={day.status === 'Approved' ? '#FFFFFF' : '#787CA5'} 
                      />
                      <Text style={[
                        styles.toggleButtonText,
                        { color: day.status === 'Approved' ? '#FFFFFF' : '#787CA5' }
                      ]}>
                        Approve
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        day.status === 'Rejected' && styles.toggleButtonActive,
                        { backgroundColor: day.status === 'Rejected' ? '#EF4444' : 'rgba(27, 23, 57, 0.6)' }
                      ]}
                      onPress={() => handleStatusChange(day.date, 'Rejected')}
                    >
                      <Ionicons 
                        name="close" 
                        size={14} 
                        color={day.status === 'Rejected' ? '#FFFFFF' : '#787CA5'} 
                      />
                      <Text style={[
                        styles.toggleButtonText,
                        { color: day.status === 'Rejected' ? '#FFFFFF' : '#787CA5' }
                      ]}>
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Days Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Applied For:</Text>
              <Text style={styles.summaryValue}>{appliedDays} Day(s)</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Approved For:</Text>
              <Text style={styles.summaryValue}>{approvedDaysCount} Day(s)</Text>
            </View>
          </View>

          {/* Remarks */}
          <View style={styles.remarksContainer}>
            <Text style={styles.remarksLabel}>Remarks</Text>
            <TextInput
              style={styles.remarksInput}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Add remarks (optional)"
              placeholderTextColor="#787CA5"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(48, 41, 86, 0.7)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userInfoContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userLabel: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoMedium',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  userName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'LatoRegular',
  },
  detailsContainer: {
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoMedium',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'LatoRegular',
    flex: 2,
    textAlign: 'right',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  dateRow: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoMedium',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
  },
  dateText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'LatoRegular',
  },
  leaveDaysContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 12,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
  },
  dayInfo: {
    flex: 1,
  },
  dayDate: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'LatoMedium',
  },
  dayUnit: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  statusContainer: {
    width: 160,
  },
  // Toggle styles for leave days
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
    padding: 2,
    gap: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 4,
  },
  toggleButtonActive: {
    // No additional styles needed, background color is handled inline
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
  },
  summaryRow: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoMedium',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  remarksContainer: {
    marginBottom: 20,
  },
  remarksLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'LatoMedium',
    marginBottom: 8,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    fontFamily: 'LatoRegular',
    minHeight: 80,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(48, 41, 86, 0.7)',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(27, 23, 57, 0.8)',
    borderWidth: 1,
    borderColor: '#676B93',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  submitButton: {
    backgroundColor: '#815BF5',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
});

export default LeaveApprovalModal;