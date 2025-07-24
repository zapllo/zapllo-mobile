import React, { useEffect, useState } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import ToastAlert, { ToastType } from '~/components/ToastAlert';

interface BankDetails {
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
}

interface ContactDetails {
  emergencyContact: string;
  contactPersonName: string;
  relation: string;
  address: string;
}

interface PersonalInfo {
  dateOfBirth: Date | null;
  dateOfJoining: Date | null;
}

interface PersonalDetailsProps {
  userId: string;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = ({ userId }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: '',
    branchName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    dateOfBirth: null,
    dateOfJoining: null,
  });

  const [contactDetails, setContactDetails] = useState<ContactDetails>({
    emergencyContact: '',
    contactPersonName: '',
    relation: '',
    address: '',
  });

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'dateOfBirth' | 'dateOfJoining'>('dateOfBirth');
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_Host}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = response.data.user;

      setBankDetails(user.bankDetails || {
        bankName: '',
        branchName: '',
        accountNumber: '',
        ifscCode: '',
      });

      setContactDetails(user.contactDetails || {
        emergencyContact: '',
        contactPersonName: '',
        relation: '',
        address: '',
      });

      setPersonalInfo({
        dateOfBirth: user.personalInformation?.dateOfBirth ? new Date(user.personalInformation.dateOfBirth) : null,
        dateOfJoining: user.personalInformation?.dateOfJoining ? new Date(user.personalInformation.dateOfJoining) : null,
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to fetch user details');
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

  const updateBankDetails = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const response = await axios.patch(`${backend_Host}/users/update`, {
        _id: userId,
        bankDetails,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToastMessage('success', 'Bank Details Updated!', 'Your bank details have been saved successfully.');
      }
    } catch (error) {
      console.error('Error updating bank details:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToastMessage('error', 'Update Failed', 'Failed to update bank details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateContactDetails = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const response = await axios.patch(`${backend_Host}/users/update`, {
        _id: userId,
        contactDetails,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToastMessage('success', 'Contact Details Updated!', 'Your contact information has been saved successfully.');
      }
    } catch (error) {
      console.error('Error updating contact details:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToastMessage('error', 'Update Failed', 'Failed to update contact details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const savePersonalInformation = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const response = await axios.patch(`${backend_Host}/users/update`, {
        _id: userId,
        personalInformation: personalInfo,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showToastMessage('success', 'Personal Information Updated!', 'Your personal information has been saved successfully.');
      }
    } catch (error) {
      console.error('Error updating personal information:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToastMessage('error', 'Update Failed', 'Failed to update personal information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setPersonalInfo(prev => ({
        ...prev,
        [datePickerTarget]: selectedDate,
      }));
    }
  };

  const openDatePicker = (target: 'dateOfBirth' | 'dateOfJoining') => {
    setDatePickerTarget(target);
    setShowDatePicker(true);
  };

  const toggleSection = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderAccordionSection = (
    title: string,
    sectionKey: string,
    icon: string,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSection === sectionKey;
    
    return (
      <View style={styles.accordionSection}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => toggleSection(sectionKey)}
        >
          <View style={styles.accordionHeaderContent}>
            <MaterialIcons name={icon as any} size={20} color="#815BF5" />
            <Text style={styles.accordionTitle}>{title}</Text>
          </View>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color="#A9A9A9"
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.accordionContent}>
            {content}
          </View>
        )}
      </View>
    );
  };

  const renderBankDetailsContent = () => (
    <View>
      <View style={styles.inputGrid}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Bank Name</Text>
          <TextInput
            style={styles.textInput}
            value={bankDetails.bankName}
            onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
            placeholder="Enter bank name"
            placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Branch Name</Text>
          <TextInput
            style={styles.textInput}
            value={bankDetails.branchName}
            onChangeText={(text) => setBankDetails({ ...bankDetails, branchName: text })}
            placeholder="Enter branch name"
            placeholderTextColor="#6B7280"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Account Number</Text>
          <TextInput
            style={styles.textInput}
            value={bankDetails.accountNumber}
            onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
            placeholder="Enter account number"
            placeholderTextColor="#6B7280"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>IFSC Code</Text>
          <TextInput
            style={styles.textInput}
            value={bankDetails.ifscCode}
            onChangeText={(text) => setBankDetails({ ...bankDetails, ifscCode: text })}
            placeholder="Enter IFSC code"
            placeholderTextColor="#6B7280"
            autoCapitalize="characters"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={updateBankDetails}
        disabled={loading}
      >
        <LinearGradient
          colors={['#ad92fd', '#815BF5']}
          style={styles.saveButtonGradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Bank Details</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderContactDetailsContent = () => (
    <View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Emergency Contact</Text>
        <TextInput
          style={styles.textInput}
          value={contactDetails.emergencyContact}
          onChangeText={(text) => setContactDetails({ ...contactDetails, emergencyContact: text })}
          placeholder="Enter emergency contact number"
          placeholderTextColor="#6B7280"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Contact Person Name</Text>
        <TextInput
          style={styles.textInput}
          value={contactDetails.contactPersonName}
          onChangeText={(text) => setContactDetails({ ...contactDetails, contactPersonName: text })}
          placeholder="Enter contact person name"
          placeholderTextColor="#6B7280"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Relation</Text>
        <TextInput
          style={styles.textInput}
          value={contactDetails.relation}
          onChangeText={(text) => setContactDetails({ ...contactDetails, relation: text })}
          placeholder="Enter relation"
          placeholderTextColor="#6B7280"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={contactDetails.address}
          onChangeText={(text) => setContactDetails({ ...contactDetails, address: text })}
          placeholder="Enter address"
          placeholderTextColor="#6B7280"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={updateContactDetails}
        disabled={loading}
      >
        <LinearGradient
          colors={['#ad92fd', '#815BF5']}
          style={styles.saveButtonGradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Contact Details</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderPersonalInfoContent = () => (
    <View>
      <View style={styles.datePickerGrid}>
        <View style={styles.datePickerContainer}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => openDatePicker('dateOfBirth')}
          >
            <MaterialIcons name="calendar-today" size={20} color="#815BF5" />
            <Text style={styles.datePickerText}>
              {personalInfo.dateOfBirth
                ? personalInfo.dateOfBirth.toDateString()
                : 'Select date'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.datePickerContainer}>
          <Text style={styles.inputLabel}>Date of Joining</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => openDatePicker('dateOfJoining')}
          >
            <MaterialIcons name="calendar-today" size={20} color="#815BF5" />
            <Text style={styles.datePickerText}>
              {personalInfo.dateOfJoining
                ? personalInfo.dateOfJoining.toDateString()
                : 'Select date'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={savePersonalInformation}
        disabled={loading}
      >
        <LinearGradient
          colors={['#ad92fd', '#815BF5']}
          style={styles.saveButtonGradient}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Personal Information</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderLegalDocumentsContent = () => (
    <View style={styles.comingSoonContainer}>
      <MaterialIcons name="description" size={48} color="#6B7280" />
      <Text style={styles.comingSoonTitle}>Legal Documents</Text>
      <Text style={styles.comingSoonText}>
        Document management features will be available soon.
      </Text>
    </View>
  );

  if (loading && !bankDetails.bankName && !contactDetails.emergencyContact) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#815BF5" />
        <Text style={styles.loadingText}>Loading personal details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Personal Details</Text>
          
          <View style={styles.separator} />

          {renderAccordionSection(
            'Bank Details',
            'bankDetails',
            'account-balance',
            renderBankDetailsContent()
          )}

          {renderAccordionSection(
            'Legal Documents',
            'legalDocuments',
            'description',
            renderLegalDocumentsContent()
          )}

          {renderAccordionSection(
            'Contact Information',
            'contactInformation',
            'contact-phone',
            renderContactDetailsContent()
          )}

          {renderAccordionSection(
            'Personal Information',
            'personalInformation',
            'person',
            renderPersonalInfoContent()
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={personalInfo[datePickerTarget] || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </ScrollView>

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
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
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
  accordionSection: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  accordionContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGrid: {
    gap: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  datePickerGrid: {
    gap: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  datePickerText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  comingSoonTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  comingSoonText: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    textAlign: 'center',
    maxWidth: 200,
  },
});

export default PersonalDetails;