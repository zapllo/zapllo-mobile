import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type LeaveType = {
  _id: string;
  leaveType: string;
  allotedLeaves: number; // Allotted leave balance for each leave type
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

interface EditLeaveBalanceModalProps {
  visible: boolean;
  user: User | null;
  leaveTypes: LeaveType[]; // All available leave types with allotted leave balances
  onClose: () => void;
  onSubmit: (updatedLeaveBalances: LeaveBalance[]) => Promise<void>;
}

const EditLeaveBalanceModal: React.FC<EditLeaveBalanceModalProps> = ({
  visible,
  user,
  leaveTypes,
  onClose,
  onSubmit,
}) => {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({}); // Track errors for each leave type
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no leave types are provided, create default ones for testing
  const defaultLeaveTypes = [
    { _id: '1', leaveType: 'Leave Without Pay', allotedLeaves: 0 },
    { _id: '2', leaveType: 'Sick Leave', allotedLeaves: 12 },
    { _id: '3', leaveType: 'Earned Leave', allotedLeaves: 24 },
    { _id: '4', leaveType: 'Casual Leave', allotedLeaves: 15 },
    { _id: '5', leaveType: 'Demo', allotedLeaves: 5 },
  ];

  const displayLeaveTypes = leaveTypes.length > 0 ? leaveTypes : defaultLeaveTypes;

  useEffect(() => {
    if (user && displayLeaveTypes.length > 0) {
      // Initialize the leaveBalances state with the user's balances or default to 0
      const initialBalances: LeaveBalance[] = displayLeaveTypes.map((leaveType) => {
        const existingBalance = user.leaveBalances?.find(
          (lb) => lb.leaveTypeId === leaveType._id
        );

        return {
          leaveType: leaveType, // Include the leaveType object
          leaveTypeId: leaveType._id,
          balance: existingBalance ? existingBalance.balance : 0,
          userLeaveBalance: existingBalance
            ? existingBalance.userLeaveBalance
            : leaveType.allotedLeaves, // Default to full allocation if no existing balance
        };
      });

      setLeaveBalances(initialBalances);
      console.log('Initialized leave balances:', initialBalances);
    }
  }, [user, leaveTypes, displayLeaveTypes]);

  const handleBalanceChange = (leaveTypeId: string, newBalance: number) => {
    const leaveType = displayLeaveTypes.find((lt) => lt._id === leaveTypeId);
    if (leaveType) {
      if (newBalance > leaveType.allotedLeaves) {
        setErrors((prev) => ({
          ...prev,
          [leaveTypeId]: `Cannot exceed allotted leave of ${leaveType.allotedLeaves}`,
        }));
      } else if (newBalance < 0) {
        setErrors((prev) => ({
          ...prev,
          [leaveTypeId]: 'Balance cannot be negative',
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [leaveTypeId]: '',
        }));

        const updatedBalances = leaveBalances.map((lb) =>
          lb.leaveTypeId === leaveTypeId
            ? { ...lb, userLeaveBalance: newBalance }
            : lb
        );
        setLeaveBalances(updatedBalances);
      }
    }
  };

  const handleSubmit = async () => {
    const hasErrors = Object.values(errors).some((error) => error !== '');
    
    // Check if any balance has been changed
    const hasChanges = leaveBalances.some((balance) => {
      const originalBalance = user?.leaveBalances.find(
        (lb) => lb.leaveTypeId === balance.leaveTypeId
      )?.userLeaveBalance || 0;
      return balance.userLeaveBalance !== originalBalance;
    });

    if (!hasChanges) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('No Changes', 'No changes were made to the leave balances.');
      return;
    }

    if (!hasErrors) {
      try {
        setIsSubmitting(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        await onSubmit(leaveBalances);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Don't show alert here as the parent component will handle success feedback
        onClose();
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Failed to update leave balance. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please fix the errors before submitting.');
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setErrors({});
    onClose();
  };

  console.log('EditLeaveBalanceModal render - visible:', visible, 'user:', user?.firstName, 'leaveTypes:', leaveTypes.length);
  console.log('LeaveTypes data:', leaveTypes);
  console.log('User leaveBalances:', user?.leaveBalances);

  if (!user) {
    console.log('No user provided to modal');
    return null;
  }

  console.log('Using leave types:', displayLeaveTypes);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Update Leave Balance</Text>
                <Text style={styles.headerSubtitle}>
                  Adjust leave balances for {user.firstName} {user.lastName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={24} color="#787CA5" />
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user.firstName?.[0]?.toUpperCase()}
                  {user.lastName?.[0]?.toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.userSubtitle}>Employee Leave Balances</Text>
              </View>
            </View>

            {/* Leave Balances Form */}
            <ScrollView 
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.formTitle}>Leave Type Balances</Text>
              <Text style={styles.formSubtitle}>
                Adjust the remaining leave days for each leave type
              </Text>
              
              {displayLeaveTypes.length === 0 ? (
                <View style={styles.noDataContainer}>
                  <MaterialIcons name="info" size={48} color="#787CA5" />
                  <Text style={styles.noDataTitle}>No Leave Types Found</Text>
                  <Text style={styles.noDataSubtitle}>
                    No leave types are configured for this organization.
                  </Text>
                </View>
              ) : (
                displayLeaveTypes.map((leaveType, index) => {
                const currentBalance = leaveBalances.find(
                  (lb) => lb.leaveTypeId === leaveType._id
                )?.userLeaveBalance ?? 0;
                
                const hasError = errors[leaveType._id];
                const usedLeaves = leaveType.allotedLeaves - currentBalance;

                // Get icon and color based on leave type
                const getLeaveTypeIcon = (type: string) => {
                  const lowerType = type.toLowerCase();
                  if (lowerType.includes('sick')) return 'local-hospital';
                  if (lowerType.includes('casual')) return 'beach-access';
                  if (lowerType.includes('earned')) return 'star';
                  if (lowerType.includes('demo')) return 'play-circle-outline';
                  return 'event-available';
                };

                const getLeaveTypeColor = (type: string) => {
                  const lowerType = type.toLowerCase();
                  if (lowerType.includes('sick')) return '#EF4444';
                  if (lowerType.includes('casual')) return '#06D6A0';
                  if (lowerType.includes('earned')) return '#FFD700';
                  if (lowerType.includes('demo')) return '#8B5CF6';
                  return '#3B82F6';
                };

                const iconName = getLeaveTypeIcon(leaveType.leaveType);
                const typeColor = getLeaveTypeColor(leaveType.leaveType);

                return (
                  <View key={leaveType._id} style={[styles.balanceItem, { borderLeftColor: typeColor, borderLeftWidth: 4 }]}>
                    <View style={styles.balanceHeader}>
                      <View style={styles.leaveTypeInfo}>
                        <View style={[styles.leaveTypeIcon, { backgroundColor: typeColor }]}>
                          <MaterialIcons name={iconName as any} size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.leaveTypeDetails}>
                          <Text style={styles.leaveTypeName}>{leaveType.leaveType}</Text>
                          <Text style={styles.leaveTypeStats}>
                            Used: {usedLeaves} • Available: {currentBalance} • Total: {leaveType.allotedLeaves}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.inputSection}>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                          <Text style={styles.inputLabel}>Remaining Days</Text>
                          <TextInput
                            style={[
                              styles.balanceInput,
                              hasError && styles.balanceInputError
                            ]}
                            value={currentBalance.toString()}
                            onChangeText={(text) => {
                              const numValue = parseInt(text) || 0;
                              handleBalanceChange(leaveType._id, numValue);
                            }}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#787CA5"
                            maxLength={3}
                          />
                        </View>
                        <Text style={styles.inputSuffix}>days</Text>
                      </View>
                      
                      {/* Progress Bar */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                width: `${Math.min((usedLeaves / leaveType.allotedLeaves) * 100, 100)}%`,
                                backgroundColor: typeColor 
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {Math.round((usedLeaves / leaveType.allotedLeaves) * 100)}% used
                        </Text>
                      </View>
                    </View>
                    
                    {hasError ? (
                      <View style={styles.errorContainer}>
                        <MaterialIcons name="error" size={16} color="#EF4444" />
                        <Text style={styles.errorText}>{hasError}</Text>
                      </View>
                    ) : null}
                  </View>
                );
                })
              )}

              {/* Summary Card */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Summary</Text>
                <View style={styles.summaryGrid}>
                  {displayLeaveTypes.map((leaveType) => {
                    const currentBalance = leaveBalances.find(
                      (lb) => lb.leaveTypeId === leaveType._id
                    )?.userLeaveBalance ?? 0;
                    
                    return (
                      <View key={`summary-${leaveType._id}`} style={styles.summaryItem}>
                        <Text style={styles.summaryLeaveType}>
                          {leaveType.leaveType.length > 8 
                            ? `${leaveType.leaveType.substring(0, 8)}...` 
                            : leaveType.leaveType
                          }
                        </Text>
                        <Text style={styles.summaryBalance}>{currentBalance}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isSubmitting && styles.saveButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={16} color="#FFFFFF" />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1A1C36',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  headerContent: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  closeButton: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(120, 124, 165, 0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#815BF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'LatoBold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    marginBottom: 20,
    lineHeight: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    textAlign: 'center',
    lineHeight: 20,
  },
  balanceItem: {
    backgroundColor: '#2A2D47',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#37384B',
  },
  balanceHeader: {
    marginBottom: 16,
  },
  leaveTypeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaveTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  leaveTypeDetails: {
    flex: 1,
  },
  leaveTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 4,
  },
  leaveTypeStats: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  inputSection: {
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    marginBottom: 6,
  },
  balanceInput: {
    backgroundColor: '#37384B',
    borderWidth: 1,
    borderColor: '#4A4B5C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    textAlign: 'center',
    minWidth: 80,
  },
  balanceInputError: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  inputSuffix: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    marginLeft: 12,
    marginBottom: 12,
    minWidth: 35,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#37384B',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    textAlign: 'right',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#37384B',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily: 'LatoRegular',
    marginLeft: 6,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#1A1C36',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#37384B',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    backgroundColor: '#2A2D47',
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  summaryLeaveType: {
    fontSize: 10,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryBalance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#37384B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#815BF5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#5A4199',
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
});

export default EditLeaveBalanceModal;