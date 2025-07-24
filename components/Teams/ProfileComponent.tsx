import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import * as Haptics from 'expo-haptics';
import InputContainer from '~/components/ui/InputContainer';
import CustomDropdown from '~/components/customDropDown';
import ToastAlert, { ToastType } from '~/components/ToastAlert';

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
  department: string;
  employeeId: string;
  gender: string;
  workFromHomeAllowed: boolean;
}

interface ProfileComponentProps {
  userId: string;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ userId }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Helper function to show toast
  const showToastMessage = (type: ToastType, title: string, message?: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message || '');
    setShowToast(true);
  };

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${backend_Host}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      showToastMessage('error', 'Error', 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = (field: string, value: string | boolean) => {
    if (user) {
      setUser((prevUser) => ({
        ...prevUser!,
        [field]: value,
      }));
    }
  };

  const handleUpdateAllFields = async () => {
    if (!user) return;

    try {
      setUpdating(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await axios.patch(`${backend_Host}/users/update`, {
        ...user,
        _id: user._id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Show success toast instead of splash screen
        showToastMessage(
          'success',
          'Profile Updated!',
          'Your profile details have been updated successfully.'
        );
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToastMessage('error', 'Update Failed', 'Failed to update user details. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const renderGenderSelector = () => (
    <InputContainer
      label="Gender"
      value=""
    >
      <View style={styles.genderContainer}>
        <View style={styles.genderOptions}>
          {['Male', 'Female', 'Other'].map((gender) => (
            <TouchableOpacity
              key={gender}
              style={styles.genderOption}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleUpdateField('gender', gender);
              }}
            >
              <View style={[
                styles.radioButton,
                user?.gender === gender && styles.radioButtonSelected
              ]}>
                {user?.gender === gender && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
              <Text style={styles.genderText}>{gender}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </InputContainer>
  );

  const renderStaffTypeDropdown = () => {
    const staffTypeOptions = [
      { label: 'Regular Employee', value: 'Regular Employee' },
      { label: 'Contractor', value: 'Contractor' },
      { label: 'Work Basis', value: 'Work Basis' },
    ];

    return (
      <View style={styles.dropdownWrapper}>
        <Text style={styles.dropdownLabel}>Staff Type</Text>
        <CustomDropdown
          data={staffTypeOptions}
          placeholder="Select Staff Type"
          selectedValue={user?.staffType || 'Regular Employee'}
          onSelect={(value) => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleUpdateField('staffType', value);
          }}
        />
      </View>
    );
  };

  const renderWorkFromHomeSwitch = () => (
    <View style={styles.switchWrapper}>
      <Text style={styles.switchLabel}>Work From Home Allowed</Text>
      <TouchableOpacity
        style={[
          styles.switch,
          user?.workFromHomeAllowed && styles.switchActive
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          handleUpdateField('workFromHomeAllowed', !user?.workFromHomeAllowed);
        }}
      >
        <View style={[
          styles.switchThumb,
          user?.workFromHomeAllowed && styles.switchThumbActive
        ]} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC8929" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="person-off" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>User Not Found</Text>
        <Text style={styles.errorText}>Unable to load user profile information.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <View style={styles.formGrid}>
            {/* 1st Field - Name */}
            <InputContainer
              label="Name"
              value={`${user.firstName} ${user.lastName}`}
              editable={false}
            />

            {/* 2nd Field - Contact Number */}
            <InputContainer
              label="Contact Number"
              value={user.whatsappNo || ''}
              editable={false}
            />

            {/* 3rd Field - Reporting Manager */}
            <InputContainer
              label="Reporting Manager"
              value={user.reportingManager
                ? `${user.reportingManager.firstName} ${user.reportingManager.lastName}`
                : 'N/A'}
              editable={false}
            />

            {/* 4th Field - Gender */}
            {renderGenderSelector()}

            {/* 5th Field - Designation */}
            <InputContainer
              label="Designation"
              value={user.designation || ''}
              onChangeText={(text) => handleUpdateField('designation', text)}
            />

            {/* 6th Field - Department */}
            <InputContainer
              label="Department"
              value={user.department || ''}
              onChangeText={(text) => handleUpdateField('department', text)}
            />

            {/* 7th Field - Staff Type */}
            {renderStaffTypeDropdown()}

            {/* 8th Field - Asset */}
            <InputContainer
              label="Asset"
              value={user.asset || ''}
              onChangeText={(text) => handleUpdateField('asset', text)}
            />

            {/* 9th Field - Branch */}
            <InputContainer
              label="Branch"
              value={user.branch || ''}
              onChangeText={(text) => handleUpdateField('branch', text)}
            />

            {/* 10th Field - Work From Home */}
            {renderWorkFromHomeSwitch()}
          </View>
        </View>

        {/* Update Button */}
        <View style={styles.updateButtonContainer}>
          <TouchableOpacity
            style={[styles.updateButton, updating && styles.updateButtonDisabled]}
            onPress={handleUpdateAllFields}
            disabled={updating}
          >
            <LinearGradient
              colors={updating ? ['#6B7280', '#4B5563'] : ['#ad92fd', '#815BF5']}
              style={styles.updateButtonGradient}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <MaterialIcons name="save" size={20} color="#FFFFFF" />
              )}
              <Text style={styles.updateButtonText}>
                {updating ? 'Updating...' : 'Update Details'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    marginBottom:60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#05071E',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  formGrid: {
    gap: 16,
  },
  genderContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 4,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#6B7280',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 56, 75, 1)',
  },
  radioButtonSelected: {
    borderColor: 'transparent',
    backgroundColor: '#FC8929',
  },
  radioButtonInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  genderText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  dropdownWrapper: {
    marginTop: 16,
    width:"107%"
  },
  dropdownLabel: {
    position: 'absolute',
    top: -8,
    left: 8,
    backgroundColor: '#0A0D28',
    paddingHorizontal: 4,
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#6B7280',
    zIndex: 1,
  },
  switchWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 44,
  },
  switchLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#374151',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#815BF5',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  updateButtonContainer: {
    paddingBottom: 20,
  },
  updateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  updateButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default ProfileComponent;