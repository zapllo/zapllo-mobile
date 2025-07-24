import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';

// Types matching the web version
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

interface EditLeaveBalanceModalProps {
  visible: boolean;
  user: User | null;
  leaveTypes: LeaveType[];
  onClose: () => void;
  onSubmit: (updatedLeaveBalances: LeaveBalance[]) => Promise<void>;
}

export default function EditLeaveBalanceModal({
  visible,
  user,
  leaveTypes,
  onClose,
  onSubmit,
}: EditLeaveBalanceModalProps) {
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Initialize leave balances when user changes
  useEffect(() => {
    if (user && leaveTypes.length > 0) {
      const initialBalances = leaveTypes.map((leaveType) => {
        const existingBalance = user.leaveBalances.find(
          (lb) => lb.leaveTypeId === leaveType._id
        );
        
        return {
          leaveType: leaveType,
          leaveTypeId: leaveType._id,
          balance: existingBalance?.balance || 0,
          userLeaveBalance: existingBalance?.userLeaveBalance || 0,
        };
      });
      
      setLeaveBalances(initialBalances);
    }
  }, [user, leaveTypes]);

  const handleBalanceChange = (leaveTypeId: string, newBalance: number) => {
    const leaveType = leaveTypes.find((lt) => lt._id === leaveTypeId);
    
    if (leaveType) {
      if (newBalance > leaveType.allotedLeaves) {
        setErrors((prev) => ({
          ...prev,
          [leaveTypeId]: `Cannot exceed allotted leave of ${leaveType.allotedLeaves}`,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          [leaveTypeId]: "",
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
    const hasErrors = Object.values(errors).some((error) => error !== "");
    
    if (hasErrors) {
      Alert.alert('Error', 'Please fix the errors before submitting.');
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      await onSubmit(leaveBalances);
      
      // Don't show success alert here - let parent component handle it
      // The parent will show the CustomSplashScreen instead
      // onClose() is also handled by the parent component now
    } catch (error) {
      console.error('Error updating leave balances:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to update leave balances. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={handleClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <View className="rounded-t-3xl bg-[#0A0D28]">
          {/* Header */}
          <View className="px-6 py-4 flex flex-row justify-between items-center border-b border-[#37384B]">
            <Text className="text-lg font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
              Update Leave Balance
            </Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Image source={require('../../assets/commonAssets/cross.png')} className="h-6 w-6" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View className="flex justify-start p-6 py-4 w-full">
            <View className="flex-row items-center gap-2">
              <View className="h-6 w-6 rounded-full bg-[#7c3987] flex items-center justify-center">
                <Text className="text-white text-xs" style={{ fontFamily: 'LatoBold' }}>
                  {user.firstName?.[0]}
                </Text>
              </View>
              <Text className="text-sm text-white" style={{ fontFamily: 'LatoRegular' }}>
                {user.firstName} {user.lastName}
              </Text>
            </View>
          </View>

          {/* Table Content */}
          <View className="px-2 pb-4">
            <View className="min-w-full mt-2">
              {leaveTypes.map((leaveType) => (
                <View key={leaveType._id} className="flex-row items-center py-2 px-4 border-b border-[#37384B]">
                  <View className="flex-1">
                    <Text className="text-xs text-white" style={{ fontFamily: 'LatoRegular' }}>
                      {leaveType.leaveType}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <TextInput
                      className="w-full text-xs p-2 bg-[#1A1C20] text-white border border-[#37384B] rounded"
                      style={{ fontFamily: 'LatoRegular' }}
                      value={
                        leaveBalances.find((lb) => lb.leaveTypeId === leaveType._id)?.userLeaveBalance?.toString() ?? '0'
                      }
                      onChangeText={(text) =>
                        handleBalanceChange(leaveType._id, parseInt(text) || 0)
                      }
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#787CA5"
                      editable={!loading}
                    />
                    {errors[leaveType._id] && (
                      <Text className="text-xs text-red-500 mt-1" style={{ fontFamily: 'LatoRegular' }}>
                        {errors[leaveType._id]}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Footer */}
          <View className="p-6">
            <TouchableOpacity
              className={`w-full text-sm px-4 py-3 rounded ${loading ? 'bg-[#6b7280]' : 'bg-[#815BF5]'}`}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white text-sm text-center" style={{ fontFamily: 'LatoBold' }}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}