import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import moment from 'moment';

interface RegularizationApprovalModalProps {
  visible: boolean;
  regularizationId: string;
  timestamp: string;
  loginTime: string;
  logoutTime: string;
  remarks: string;
  onClose: () => void;
  onSubmit: () => void;
  onShowToast?: (type: 'success' | 'error', title: string, message: string) => void;
}

const RegularizationApprovalModal: React.FC<RegularizationApprovalModalProps> = ({
  visible,
  regularizationId,
  timestamp,
  loginTime,
  logoutTime,
  remarks,
  onClose,
  onSubmit,
  onShowToast,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [approvalRemarks, setApprovalRemarks] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject'>('approve');

  const handleSubmit = async () => {
    if (!token) {
      if (onShowToast) {
        onShowToast('error', 'Authentication Error', 'Authentication required');
      } else {
        Alert.alert('Error', 'Authentication required');
      }
      return;
    }

    setLoading(true);
    try {
      // Use PATCH request with action field to match web API structure
      const response = await axios.patch(
        `${backend_Host}/regularization-approvals/${regularizationId}`,
        {
          action: selectedAction, // "approve" or "reject"
          notes: approvalRemarks, // Use notes for both approve and reject
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
        if (onShowToast) {
          if (selectedAction === 'approve') {
            onShowToast('success', 'Regularization Approved', 'The regularization request has been approved successfully');
          } else {
            onShowToast('success', 'Regularization Rejected', 'The regularization request has been rejected successfully');
          }
        }
        
        // Close modal and refresh data
        onSubmit();
        onClose();
      } else {
        throw new Error(
          response.data.message || `Failed to ${selectedAction} regularization.`
        );
      }
    } catch (error: any) {
      console.error(
        `Error ${selectedAction}ing regularization:`,
        error.response?.data || error.message
      );
      
      const errorMessage = `Failed to ${selectedAction} regularization: ${
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
            {selectedAction === 'approve' ? 'Approve' : 'Reject'} Regularization Request
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>
            Please select an action and add a note for the regularization request.
          </Text>

          {/* Action Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Action</Text>
            <View style={styles.toggleWrapper}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedAction === 'approve' && styles.toggleButtonActive,
                  { backgroundColor: selectedAction === 'approve' ? '#06D6A0' : 'rgba(27, 23, 57, 0.6)' }
                ]}
                onPress={() => setSelectedAction('approve')}
              >
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color={selectedAction === 'approve' ? '#FFFFFF' : '#787CA5'} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  { color: selectedAction === 'approve' ? '#FFFFFF' : '#787CA5' }
                ]}>
                  Approve
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  selectedAction === 'reject' && styles.toggleButtonActive,
                  { backgroundColor: selectedAction === 'reject' ? '#EF4444' : 'rgba(27, 23, 57, 0.6)' }
                ]}
                onPress={() => setSelectedAction('reject')}
              >
                <Ionicons 
                  name="close" 
                  size={16} 
                  color={selectedAction === 'reject' ? '#FFFFFF' : '#787CA5'} 
                />
                <Text style={[
                  styles.toggleButtonText,
                  { color: selectedAction === 'reject' ? '#FFFFFF' : '#787CA5' }
                ]}>
                  Reject
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Request Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {moment(timestamp).format('MMM D, YYYY')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Login Time:</Text>
              <Text style={styles.detailValue}>{loginTime || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Logout Time:</Text>
              <Text style={styles.detailValue}>{logoutTime || 'N/A'}</Text>
            </View>
            {remarks && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Employee Remarks:</Text>
                <Text style={styles.detailValue}>{remarks}</Text>
              </View>
            )}
          </View>

          {/* Approval Note Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Approval Note (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={approvalRemarks}
              onChangeText={setApprovalRemarks}
              placeholder="Add a note before approval (optional)"
              placeholderTextColor="#787CA5"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button, 
              selectedAction === 'approve' ? styles.approveButton : styles.rejectButton
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.approveButtonText}>
                {selectedAction === 'approve' ? 'Approve' : 'Reject'}
              </Text>
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
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#787CA5',
    marginBottom: 20,
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
    marginBottom: 12,
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
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'LatoMedium',
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    fontFamily: 'LatoRegular',
    minHeight: 100,
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
  approveButton: {
    backgroundColor: '#815BF5',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  // Toggle styles
  toggleContainer: {
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    fontFamily: 'LatoMedium',
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(27, 23, 57, 0.6)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(48, 41, 86, 0.7)',
    padding: 4,
    gap: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  toggleButtonActive: {
    // No additional styles needed, background color is handled inline
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
});

export default RegularizationApprovalModal;