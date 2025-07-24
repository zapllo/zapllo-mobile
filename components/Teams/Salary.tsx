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
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import * as Haptics from 'expo-haptics';
import CustomDeleteModal from '~/components/CustomDeleteModal';
import ToastAlert, { ToastType } from '~/components/ToastAlert';

interface Allowance {
  name: string;
  amount: number;
}

interface SalaryProps {
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

// Default Salary Details
const DEFAULT_SALARY_DETAILS: Allowance[] = [
  { name: 'Basic Salary', amount: 0 },
  { name: 'Dearness Allowance (DA)', amount: 0 },
  { name: 'House Rent Allowance (HRA)', amount: 0 },
  { name: 'Travelling Allowance', amount: 0 },
  { name: 'Internet Allowance', amount: 0 },
  { name: 'Medical Allowance', amount: 0 },
];

const CALCULATION_METHODS = [
  {
    method: 'Calendar Month',
    description: 'Ex: March - 31 Days, April - 30 Days etc (Per day salary = Salary/No. of days in month)'
  },
  {
    method: 'Every Month 30 Days',
    description: 'Ex: March - 30 Days, April - 30 Days etc (Per day salary = Salary/30)'
  },
  {
    method: 'Every Month 28 Days',
    description: 'Ex: March - 28 Days, April - 28 Days etc (Per day salary = Salary/28)'
  },
  {
    method: 'Every Month 26 Days',
    description: 'Ex: March - 26 Days, April - 26 Days etc (Per day salary = Salary/26)'
  },
  {
    method: 'Exclude Weekly Offs',
    description: 'Ex: Month with 31 days and 4 weekly-offs will have 27 payable days (Per day salary = Salary/Payable Days)'
  },
];

const Salary: React.FC<SalaryProps> = ({ userId }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [salaryDetails, setSalaryDetails] = useState<Allowance[]>([]);
  const [customAllowance, setCustomAllowance] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isCalculationDialogOpen, setIsCalculationDialogOpen] = useState(false);
  const [selectedCalculationMethod, setSelectedCalculationMethod] = useState('');
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [allowanceToDelete, setAllowanceToDelete] = useState<{ allowance: Allowance; index: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  useEffect(() => {
    fetchSalaryDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${backend_Host}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      setSelectedCalculationMethod(response.data.user.monthCalculationType || 'Calendar Month');
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to fetch user details');
    }
  };

  // Merge fetched salary details with default values
  const mergeWithDefaultDetails = (fetchedDetails: Allowance[]) => {
    const merged = [...DEFAULT_SALARY_DETAILS];
    fetchedDetails.forEach((fetchedAllowance) => {
      const index = merged.findIndex((item) => item.name === fetchedAllowance.name);
      if (index !== -1) {
        merged[index].amount = fetchedAllowance.amount;
      } else {
        merged.push(fetchedAllowance); // Add custom allowances
      }
    });
    return merged;
  };

  const fetchSalaryDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_Host}/users/${userId}/salary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.salaryDetails) {
        setSalaryDetails(mergeWithDefaultDetails(response.data.salaryDetails));
      } else {
        setSalaryDetails(DEFAULT_SALARY_DETAILS);
      }
    } catch (error) {
      console.error('Error fetching salary details:', error);
      setSalaryDetails(DEFAULT_SALARY_DETAILS); // Fallback to defaults
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show toast
  const showToastMessage = (type: ToastType, title: string, message?: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message || '');
    setShowToast(true);
  };

  const saveSalaryDetails = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const response = await axios.post(`${backend_Host}/users/${userId}/salary`, {
        salaryDetails
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success || response.status === 200) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToastMessage('success', 'Salary Details Saved!', 'Employee salary details have been updated successfully.');
      }
    } catch (error) {
      console.error('Error saving salary details:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToastMessage('error', 'Save Failed', 'Failed to save salary details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveMonthCalculationType = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const response = await axios.patch(`${backend_Host}/users/${userId}/salary`, {
        monthCalculationType: selectedCalculationMethod
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success || response.status === 200) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToastMessage('success', 'Calculation Type Updated!', 'Month calculation type has been saved successfully.');
        setIsCalculationDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving month calculation type:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToastMessage('error', 'Save Failed', 'Failed to save month calculation type. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addCustomAllowance = () => {
    if (!customAllowance.trim()) {
      Alert.alert('Error', 'Please enter allowance name');
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSalaryDetails([...salaryDetails, { 
      name: customAllowance, 
      amount: parseFloat(customAmount) || 0 
    }]);
    setCustomAllowance('');
    setCustomAmount('');
  };

  const openDeleteModal = (allowance: Allowance, index: number) => {
    setAllowanceToDelete({ allowance, index });
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setAllowanceToDelete(null);
    setIsDeleting(false);
  };

  const confirmDeleteAllowance = async () => {
    if (!allowanceToDelete) return;
    
    setIsDeleting(true);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const response = await axios.delete(`${backend_Host}/users/${userId}/salary`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { name: allowanceToDelete.allowance.name }
      });

      if (response.data.salaryDetails) {
        setSalaryDetails(response.data.salaryDetails);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('Allowance deleted successfully');
        closeDeleteModal();
        // No splash screen for delete - just close the modal
      }
    } catch (error) {
      console.error('Error deleting allowance:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to delete allowance');
      setIsDeleting(false);
    }
  };

  const updateAllowanceAmount = (index: number, amount: string) => {
    const updatedSalaryDetails = [...salaryDetails];
    updatedSalaryDetails[index].amount = parseFloat(amount) || 0;
    setSalaryDetails(updatedSalaryDetails);
  };

  const isDefaultAllowance = (allowanceName: string) => {
    return DEFAULT_SALARY_DETAILS.findIndex(
      (defaultAllowance) => defaultAllowance.name === allowanceName
    ) !== -1;
  };

  const getTotalSalary = () => {
    return salaryDetails.reduce((total, allowance) => total + allowance.amount, 0);
  };

  const renderCalculationDialog = () => (
    <Modal
      visible={isCalculationDialogOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsCalculationDialogOpen(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Month Calculation</Text>
          <TouchableOpacity
            onPress={() => setIsCalculationDialogOpen(false)}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {CALCULATION_METHODS.map((option) => (
            <TouchableOpacity
              key={option.method}
              style={[
                styles.calculationOption,
                selectedCalculationMethod === option.method && styles.calculationOptionSelected
              ]}
              onPress={() => setSelectedCalculationMethod(option.method)}
            >
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioButton,
                  selectedCalculationMethod === option.method && styles.radioButtonSelected
                ]}>
                  {selectedCalculationMethod === option.method && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
                <View style={styles.calculationTextContainer}>
                  <Text style={[
                    styles.calculationMethodText,
                    selectedCalculationMethod === option.method && styles.calculationMethodTextSelected
                  ]}>
                    {option.method}
                  </Text>
                  <Text style={[
                    styles.calculationDescriptionText,
                    selectedCalculationMethod === option.method && styles.calculationDescriptionTextSelected
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveMonthCalculationType}
            disabled={loading}
          >
            <LinearGradient
              colors={['#815BF5', '#FC8929']}
              style={styles.saveButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading && salaryDetails.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#815BF5" />
        <Text style={styles.loadingText}>Loading salary details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerInfo}>
              <Text style={styles.title}>Salary Details</Text>
              <Text style={styles.subtitle}>
                Calculated according to - {selectedCalculationMethod}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.selectTypeButton}
              onPress={() => setIsCalculationDialogOpen(true)}
            >
              <LinearGradient
                colors={['#c2affc', '#815BF5']}
                style={styles.selectTypeButtonGradient}
              >
                <Text style={styles.selectTypeButtonText}>Select Salary Type</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Total Salary Card */}
          <View style={styles.totalSalaryCard}>
            <LinearGradient
              colors={['rgba(129, 91, 245, 0.1)', 'rgba(252, 137, 41, 0.05)']}
              style={styles.totalSalaryGradient}
            >
              <Text style={styles.totalSalaryLabel}>Total Monthly Salary</Text>
              <Text style={styles.totalSalaryAmount}>₹{getTotalSalary().toLocaleString()}</Text>
            </LinearGradient>
          </View>

          {/* Allowances List */}
          <View style={styles.allowancesContainer}>
            {salaryDetails.map((allowance, index) => (
              <View key={index} style={styles.allowanceItem}>
                <View style={styles.allowanceInfo}>
                  <Text style={styles.allowanceName}>{allowance.name}</Text>
                  <View style={styles.allowanceInputContainer}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.allowanceInput}
                      value={allowance.amount.toString()}
                      onChangeText={(text) => updateAllowanceAmount(index, text)}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#6B7280"
                    />
                  </View>
                </View>
                
                {!isDefaultAllowance(allowance.name) && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      openDeleteModal(allowance, index);
                    }}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="delete" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Add Custom Allowance */}
          <View style={styles.customAllowanceContainer}>
            <Text style={styles.customAllowanceTitle}>Add Custom Allowance</Text>
            
            {/* First Row - Allowance Name */}
            <View style={styles.allowanceNameRow}>
              <TextInput
                style={styles.allowanceNameInput}
                placeholder="Allowance Name"
                placeholderTextColor="#6B7280"
                value={customAllowance}
                onChangeText={setCustomAllowance}
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
                onPress={addCustomAllowance}
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
            onPress={saveSalaryDetails}
            disabled={loading}
          >
            <LinearGradient
              colors={['#ad92fd', '#815BF5']}
              style={styles.saveDetailsButtonGradient}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveDetailsButtonText}>Save Salary Details</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {renderCalculationDialog()}
      </ScrollView>

      {/* Custom Delete Modal */}
      {allowanceToDelete && (
        <CustomDeleteModal
          visible={showDeleteModal}
          title="Are you sure you want to"
          subtitle="delete this allowance?"
          itemName={allowanceToDelete.allowance.name}
          onCancel={closeDeleteModal}
          onConfirm={confirmDeleteAllowance}
          isDeleting={isDeleting}
          cancelText="Cancel"
          confirmText="Delete"
        />
      )}

      {/* Toast Alert - Now positioned relative to the screen, not the scroll view */}
      <ToastAlert
        visible={showToast}
        type={toastType}
        title={toastTitle}
        message={toastMessage}
        onHide={() => setShowToast(false)}
        position="bottom"
      />
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  selectTypeButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 12,
  },
  selectTypeButtonGradient: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectTypeButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  totalSalaryCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  totalSalaryGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  totalSalaryLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 8,
  },
  totalSalaryAmount: {
    fontFamily: 'LatoBold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  allowancesContainer: {
    marginBottom: 20,
  },
  allowanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  allowanceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allowanceName: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  allowanceInputContainer: {
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
  allowanceInput: {
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
  customAllowanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  customAllowanceTitle: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  // New styles for the updated layout
  allowanceNameRow: {
    marginBottom: 12,
  },
  allowanceNameInput: {
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  calculationOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  calculationOptionSelected: {
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
    borderColor: '#815BF5',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#A9A9A9',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#815BF5',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#815BF5',
  },
  calculationTextContainer: {
    flex: 1,
  },
  calculationMethodText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  calculationMethodTextSelected: {
    color: '#FFFFFF',
  },
  calculationDescriptionText: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    lineHeight: 16,
  },
  calculationDescriptionTextSelected: {
    color: '#E5E7EB',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default Salary;