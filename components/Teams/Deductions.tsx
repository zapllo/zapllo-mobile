import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import * as Haptics from 'expo-haptics';
import CustomDeleteModal from '~/components/CustomDeleteModal';
import ToastAlert from '~/components/ToastAlert';

interface Deduction {
  name: string;
  amount: number;
}

interface DeductionsProps {
  userId: string;
}

interface UserDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsappNo: string;
  profilePic: string;
  role: string;
  reportingManager: {
    firstName: string;
    lastName: string;
    whatsappNo: string;
  } | null;
  isLeaveAccess: boolean;
  isTaskAccess: boolean;
  country: string;
  designation: string;
  staffType: string;
  contactNumber: string;
  asset: string;
  branch: string;
  status: string;
  employeeId: string;
  monthCalculationType: string;
}

// Default Deduction Details
const DEFAULT_DEDUCTION_DETAILS: Deduction[] = [
  { name: 'Provident Fund (PF)', amount: 0 },
  { name: 'Professional Tax', amount: 0 },
  { name: 'Pension', amount: 0 },
  { name: 'Medical Insurance', amount: 0 },
  { name: 'Loans', amount: 0 },
];

const Deductions: React.FC<DeductionsProps> = ({ userId }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [deductionDetails, setDeductionDetails] = useState<Deduction[]>([]);
  const [customDeduction, setCustomDeduction] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deductionToDelete, setDeductionToDelete] = useState<{ deduction: Deduction; index: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast Alert states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    fetchDeductionDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${backend_Host}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to fetch user details');
    }
  };

  // Merge fetched deduction details with default values
  const mergeWithDefaultDetails = (fetchedDetails: Deduction[]) => {
    const merged = [...DEFAULT_DEDUCTION_DETAILS];
    fetchedDetails.forEach((fetchedDeduction) => {
      const index = merged.findIndex((item) => item.name === fetchedDeduction.name);
      if (index !== -1) {
        merged[index].amount = fetchedDeduction.amount;
      } else {
        merged.push(fetchedDeduction); // Add custom deductions
      }
    });
    return merged;
  };

  const fetchDeductionDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_Host}/users/${userId}/deduction`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.deductionDetails) {
        setDeductionDetails(mergeWithDefaultDetails(response.data.deductionDetails));
      } else {
        setDeductionDetails(DEFAULT_DEDUCTION_DETAILS);
      }
    } catch (error) {
      console.error('Error fetching deduction details:', error);
      setDeductionDetails(DEFAULT_DEDUCTION_DETAILS); // Fallback to defaults
    } finally {
      setLoading(false);
    }
  };

  const handleToastHide = () => {
    setShowToast(false);
    setToastMessage('');
  };

  const saveDeductionDetails = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const response = await axios.post(`${backend_Host}/users/${userId}/deduction`, {
        deductionDetails
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success || response.status === 200) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('Deduction details saved successfully');
        
        // Show toast alert
        setToastMessage('Deduction Details Saved Successfully!');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error saving deduction details:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save deduction details');
    } finally {
      setLoading(false);
    }
  };

  const addCustomDeduction = () => {
    if (!customDeduction.trim()) {
      Alert.alert('Error', 'Please enter deduction name');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeductionDetails([...deductionDetails, { 
      name: customDeduction, 
      amount: parseFloat(customAmount) || 0 
    }]);
    setCustomDeduction('');
    setCustomAmount('');
  };

  const openDeleteModal = (deduction: Deduction, index: number) => {
    setDeductionToDelete({ deduction, index });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeductionToDelete(null);
    setIsDeleting(false);
  };

  const confirmDeleteDeduction = async () => {
    if (!deductionToDelete) return;
    
    setIsDeleting(true);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const response = await axios.delete(`${backend_Host}/users/${userId}/deduction`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { name: deductionToDelete.deduction.name }
      });

      if (response.data.deductionDetails) {
        setDeductionDetails(response.data.deductionDetails);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('Deduction deleted successfully');
        closeDeleteModal();
      }
    } catch (error) {
      console.error('Error deleting deduction:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to delete deduction');
      setIsDeleting(false);
    }
  };

  const updateDeductionAmount = (index: number, amount: string) => {
    const updatedDeductionDetails = [...deductionDetails];
    updatedDeductionDetails[index].amount = parseFloat(amount) || 0;
    setDeductionDetails(updatedDeductionDetails);
  };

  const isDefaultDeduction = (deductionName: string) => {
    return DEFAULT_DEDUCTION_DETAILS.findIndex(
      (defaultDeduction) => defaultDeduction.name === deductionName
    ) !== -1;
  };

  const getTotalDeductions = () => {
    return deductionDetails.reduce((total, deduction) => total + deduction.amount, 0);
  };

  if (loading && deductionDetails.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#815BF5" />
        <Text style={styles.loadingText}>Loading deduction details...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Deduction Details</Text>
              <Text style={styles.subtitle}>
                Manage employee salary deductions
              </Text>
            </View>
          </View>

          {/* Total Deductions Card */}
          <View style={styles.totalDeductionsCard}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)']}
              style={styles.totalDeductionsGradient}
            >
              <Text style={styles.totalDeductionsLabel}>Total Monthly Deductions</Text>
              <Text style={styles.totalDeductionsAmount}>₹{getTotalDeductions().toLocaleString()}</Text>
            </LinearGradient>
          </View>

          {/* Deductions List */}
          <View style={styles.deductionsContainer}>
            {deductionDetails.map((deduction, index) => (
              <View key={index} style={styles.deductionItem}>
                <View style={styles.deductionInfo}>
                  <Text style={styles.deductionName}>{deduction.name}</Text>
                  <View style={styles.deductionInputContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.deductionInput}
                      value={deduction.amount.toString()}
                      onChangeText={(text) => updateDeductionAmount(index, text)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#6B7280"
                    />
                  </View>
                </View>
                
                {!isDefaultDeduction(deduction.name) && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      openDeleteModal(deduction, index);
                    }}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="delete" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Add Custom Deduction */}
          <View style={styles.customDeductionContainer}>
            <Text style={styles.customDeductionTitle}>Add Custom Deduction</Text>
            
            {/* First Row - Deduction Name */}
            <View style={styles.deductionNameRow}>
              <TextInput
                style={styles.deductionNameInput}
                placeholder="Deduction Name"
                placeholderTextColor="#6B7280"
                value={customDeduction}
                onChangeText={setCustomDeduction}
              />
            </View>
            
            {/* Second Row - Amount and Add Button */}
            <View style={styles.amountAndButtonRow}>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Amount"
                  placeholderTextColor="#6B7280"
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  keyboardType="numeric"
                />
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={addCustomDeduction}
              >
                <LinearGradient
                  colors={['#815BF5', '#FC8929']}
                  style={styles.addButtonGradient}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveDetailsButton}
            onPress={saveDeductionDetails}
            disabled={loading}
          >
            <LinearGradient
              colors={['#ad92fd', '#815BF5']}
              style={styles.saveDetailsButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveDetailsButtonText}>Save Deduction Details</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Delete Modal */}
      {deductionToDelete && (
        <CustomDeleteModal
          visible={showDeleteModal}
          title="Are you sure you want to"
          subtitle="delete this deduction?"
          itemName={deductionToDelete.deduction.name}
          onCancel={closeDeleteModal}
          onConfirm={confirmDeleteDeduction}
          isDeleting={isDeleting}
          cancelText="cancel"
          confirmText="Delete"
        />
      )}

      {/* Toast Alert */}
      <ToastAlert
        visible={showToast}
        type="success"
        title={toastMessage}
        onHide={handleToastHide}
        duration={3000}
        position="bottom"
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0D28',
  },
  loadingText: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
  },
  totalDeductionsCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  totalDeductionsGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  totalDeductionsLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 8,
  },
  totalDeductionsAmount: {
    fontFamily: 'LatoBold',
    fontSize: 28,
    color: '#EF4444',
  },
  deductionsContainer: {
    marginBottom: 20,
  },
  deductionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  deductionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deductionName: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  deductionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  currencySymbol: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    marginRight: 4,
  },
  deductionInput: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
  },
  deleteButton: {
    marginLeft: 12,
    padding: 8,
  },
  customDeductionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  customDeductionTitle: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  // New styles for the updated layout (same as Salary component)
  deductionNameRow: {
    marginBottom: 12,
  },
  deductionNameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
    width: '100%',
  },
  amountAndButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flex: 1,
  },
  amountInput: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 8,
  },
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveDetailsButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveDetailsButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDetailsButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default Deductions;