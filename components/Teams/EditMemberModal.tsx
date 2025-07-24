import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import * as Haptics from 'expo-haptics';
import CustomSplashScreen from '~/components/CustomSplashScreen';
import InputContainer from '~/components/InputContainer';
import { Dropdown } from 'react-native-element-dropdown';
import countryData from '../../data/country.json';

const { width, height } = Dimensions.get('window');

interface User {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  whatsappNo: string;
  reportingManager: string;
  profilePic: string;
  country: string;
  isLeaveAccess: boolean;
  isTaskAccess: boolean;
  password?: string;
}

interface EditMemberModalProps {
  visible: boolean;
  user: User | null;
  users: User[];
  onClose: () => void;
  onUpdate: () => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  visible,
  user,
  users,
  onClose,
  onUpdate,
}) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [editedUser, setEditedUser] = useState<User>({
    _id: '',
    email: '',
    role: 'member',
    firstName: '',
    lastName: '',
    whatsappNo: '',
    reportingManager: '',
    profilePic: '',
    country: 'IN',
    isLeaveAccess: false,
    isTaskAccess: false,
    password: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    whatsappNo: '',
    password: '',
  });
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Country dropdown states
  const [selectedCountry, setSelectedCountry] = useState(
    countryData.find((c) => c.dial_code === '+91') // Default to India
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownAnimation = useState(new Animated.Value(0))[0];

  useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  useEffect(() => {
    if (user && visible) {
      setEditedUser({
        ...user,
        country: user.country || 'IN',
        password: '', // Always start with empty password
      });
      
      // Set country based on user's country
      const userCountry = countryData.find((c) => c.code === (user.country || 'IN'));
      setSelectedCountry(userCountry || countryData.find((c) => c.dial_code === '+91'));
      
      setErrors({
        firstName: '',
        lastName: '',
        email: '',
        whatsappNo: '',
        password: '',
      });
    }
  }, [user, visible]);

  // Function to animate dropdown
  const toggleDropdown = (open: boolean) => {
    setIsDropdownOpen(open);
    Animated.timing(dropdownAnimation, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const validateInputs = () => {
    const newErrors = {
      firstName: !editedUser.firstName.trim() ? 'First Name is required' : '',
      lastName: !editedUser.lastName.trim() ? 'Last Name is required' : '',
      email: !editedUser.email.trim() ? 'Email is required' : 
             !/\S+@\S+\.\S+/.test(editedUser.email) ? 'Invalid email format' : '',
      whatsappNo: !editedUser.whatsappNo.trim() ? 'WhatsApp Number is required' : '',
      password: editedUser.password && editedUser.password.length < 6 ? 'Password must be at least 6 characters long' : '',
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleUpdateUser = async () => {
    if (!validateInputs()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const updateData = {
        ...editedUser,
        reportingManager: editedUser.reportingManager || null,
        country: selectedCountry?.code || 'IN',
      };

      // Remove password from update data if it's empty (don't update password)
      if (!editedUser.password || editedUser.password.trim() === '') {
        delete updateData.password;
      }

      // Use the same API endpoint as your web version
      const response = await axios.patch(
        `${backend_Host}/users/update`,
        updateData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Hide the edit modal first
        setModalVisible(false);
        
        // Show success splash screen immediately after modal is hidden
        setTimeout(() => {
          console.log('Showing success splash screen for member update');
          setShowSuccessSplash(true);
        }, 100);
        
        // Update data and close modal after splash screen
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 3500); // After splash screen duration
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update member'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
    onClose();
  };

  const handleSplashComplete = () => {
    console.log('Member update splash screen completed');
    setShowSuccessSplash(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'orgAdmin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'member':
        return 'Member';
      default:
        return role;
    }
  };

  const renderRoleOption = (role: string, label: string) => (
    <TouchableOpacity
      key={role}
      style={[
        styles.roleOption,
        editedUser.role === role && styles.selectedRoleOption,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEditedUser({ ...editedUser, role });
      }}
    >
      <Text
        style={[
          styles.roleOptionText,
          editedUser.role === role && styles.selectedRoleOptionText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderReportingManagerOption = (manager: User) => (
    <TouchableOpacity
      key={manager._id}
      style={[
        styles.managerOption,
        editedUser.reportingManager === manager._id && styles.selectedManagerOption,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setEditedUser({ ...editedUser, reportingManager: manager._id });
      }}
    >
      <Text
        style={[
          styles.managerOptionText,
          editedUser.reportingManager === manager._id && styles.selectedManagerOptionText,
        ]}
      >
        {manager.firstName} {manager.lastName}
      </Text>
    </TouchableOpacity>
  );

  const renderAccessToggle = (
    title: string,
    subtitle: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    iconName: string
  ) => (
    <View style={styles.accessToggleContainer}>
      <View style={styles.accessToggleInfo}>
        <View style={styles.accessToggleIcon}>
          <MaterialIcons name={iconName as any} size={20} color="#815BF5" />
        </View>
        <View style={styles.accessToggleTextContainer}>
          <Text style={styles.accessToggleTitle}>{title}</Text>
          <Text style={styles.accessToggleSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.toggleSwitch, value && styles.toggleSwitchActive]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(!value);
        }}
      >
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </TouchableOpacity>
    </View>
  );

  if (!user) return null;

  return (
    <>
      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#0A0D28', '#191B3A']}
              style={styles.container}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <View style={styles.headerIcon}>
                    <MaterialIcons name="edit" size={24} color="#815BF5" />
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Edit Member</Text>
                    <Text style={styles.headerSubtitle}>
                      Modify member details and permissions
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <MaterialIcons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {/* Basic Information */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  
             
                    <View style={styles.fullWidthInputContainer}>
                      <InputContainer
                        label="First Name"
                        value={editedUser.firstName}
                        onChangeText={(text) => {
                          setEditedUser({ ...editedUser, firstName: text });
                          if (errors.firstName) {
                            setErrors({ ...errors, firstName: '' });
                          }
                        }}
                        placeholder="Enter first name"
                        passwordError={errors.firstName}
                      />
                      {errors.firstName ? (
                        <View style={styles.errorContainer}>
                          <Ionicons name="close-circle" size={16} color="#EE4848" />
                          <Text style={styles.errorText}>{errors.firstName}</Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.fullWidthInputContainer}>
                      <InputContainer
                        label="Last Name"
                        value={editedUser.lastName}
                        onChangeText={(text) => {
                          setEditedUser({ ...editedUser, lastName: text });
                          if (errors.lastName) {
                            setErrors({ ...errors, lastName: '' });
                          }
                        }}
                        placeholder="Enter last name"
                        passwordError={errors.lastName}
                      />
                      {errors.lastName ? (
                        <View style={styles.errorContainer}>
                          <Ionicons name="close-circle" size={16} color="#EE4848" />
                          <Text style={styles.errorText}>{errors.lastName}</Text>
                        </View>
                      ) : null}
                    </View>
            

                  <View style={styles.fullWidthInputContainer}>
                    <InputContainer
                      label="Email Address"
                      value={editedUser.email}
                      onChangeText={(text) => {
                        setEditedUser({ ...editedUser, email: text });
                        if (errors.email) {
                          setErrors({ ...errors, email: '' });
                        }
                      }}
                      placeholder="Enter email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      passwordError={errors.email}
                    />
                    {errors.email ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="close-circle" size={16} color="#EE4848" />
                        <Text style={styles.errorText}>{errors.email}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.fullWidthInputContainer}>
                    <View style={styles.passwordInputWrapper}>
                      <InputContainer
                        label="Password"
                        value={editedUser.password || ''}
                        onChangeText={(text) => {
                          setEditedUser({ ...editedUser, password: text });
                          if (errors.password) {
                            setErrors({ ...errors, password: '' });
                          }
                        }}
                        placeholder="Leave empty to keep current password"
                        secureTextEntry={!passwordVisible}
                        autoCapitalize="none"
                        passwordError={errors.password}
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <Ionicons name="eye-outline" size={23} color={'#FFFFFF'} />
                        ) : (
                          <Ionicons name="eye-off-outline" size={23} color={'#FFFFFF'} />
                        )}
                      </TouchableOpacity>
                    </View>
                    {errors.password ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="close-circle" size={16} color="#EE4848" />
                        <Text style={styles.errorText}>{errors.password}</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Country Code Dropdown */}
                  <View style={styles.fullWidthInputContainer}>
                    <Dropdown
                      search
                      searchPlaceholder="Search country..."
                      inputSearchStyle={styles.dropdownSearchInput}
                      containerStyle={styles.dropdownContainer}
                      style={styles.dropdownStyle}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      iconStyle={styles.dropdownIcon}
                      data={countryData}
                      labelField="name"
                      valueField="dial_code"
                      placeholder="Select Country"
                      value={selectedCountry?.dial_code}
                      onFocus={() => toggleDropdown(true)}
                      onBlur={() => toggleDropdown(false)}
                      onChange={(item) => {
                        setSelectedCountry(item);
                        setIsDropdownOpen(false);
                        setTimeout(() => {
                          toggleDropdown(false);
                        }, 100);
                      }}
                      renderLeftIcon={() => (
                        <Text style={styles.flagText}>{selectedCountry?.flag}</Text>
                      )}
                      renderItem={(item) => (
                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            selectedCountry?.dial_code === item.dial_code && styles.selectedDropdownItem
                          ]}
                          onPress={() => {
                            setSelectedCountry(item);
                            toggleDropdown(false);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <Text style={styles.flagText}>{item.flag}</Text>
                          <Text style={styles.dropdownItemText}>
                            {item.name} ({item.dial_code})
                          </Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>

                  {/* WhatsApp Number */}
                  <View style={styles.fullWidthInputContainer}>
                    <InputContainer
                      label="WhatsApp Number"
                      value={editedUser.whatsappNo}
                      onChangeText={(text) => {
                        setEditedUser({ ...editedUser, whatsappNo: text });
                        if (errors.whatsappNo) {
                          setErrors({ ...errors, whatsappNo: '' });
                        }
                      }}
                      placeholder="Enter WhatsApp number"
                      keyboardType="numeric"
                      passwordError={errors.whatsappNo}
                    />
                    {errors.whatsappNo ? (
                      <View style={styles.errorContainer}>
                        <Ionicons name="close-circle" size={16} color="#EE4848" />
                        <Text style={styles.errorText}>{errors.whatsappNo}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Role Selection */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Role & Reporting</Text>
                  
                  <View style={styles.fullWidthInputContainer}>
                    <Text style={styles.inputLabel}>Role</Text>
                    <View style={styles.roleContainer}>
                      {renderRoleOption('member', 'Member')}
                      {renderRoleOption('manager', 'Manager')}
                      {renderRoleOption('orgAdmin', 'Admin')}
                    </View>
                  </View>

                  {editedUser.role !== 'orgAdmin' && (
                    <View style={styles.fullWidthInputContainer}>
                      <Text style={styles.inputLabel}>Reporting Manager</Text>
                      <ScrollView
                        style={styles.managersContainer}
                        showsVerticalScrollIndicator={false}
                      >
                        <TouchableOpacity
                          style={[
                            styles.managerOption,
                            !editedUser.reportingManager && styles.selectedManagerOption,
                          ]}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setEditedUser({ ...editedUser, reportingManager: '' });
                          }}
                        >
                          <Text
                            style={[
                              styles.managerOptionText,
                              !editedUser.reportingManager && styles.selectedManagerOptionText,
                            ]}
                          >
                            No Reporting Manager
                          </Text>
                        </TouchableOpacity>
                        {users
                          .filter(u => u._id !== editedUser._id && (u.role === 'manager' || u.role === 'orgAdmin'))
                          .map(renderReportingManagerOption)}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Access Permissions */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Access Permissions</Text>
                  
                  {renderAccessToggle(
                    'Task Management',
                    'Access to create and manage tasks',
                    editedUser.isTaskAccess,
                    (value) => setEditedUser({ ...editedUser, isTaskAccess: value }),
                    'assignment'
                  )}

                  {renderAccessToggle(
                    'Payroll Access',
                    'Access to leave and payroll features',
                    editedUser.isLeaveAccess,
                    (value) => setEditedUser({ ...editedUser, isLeaveAccess: value }),
                    'account-balance-wallet'
                  )}
                </View>

                {/* Extra padding for bottom */}
                <View style={styles.bottomPadding} />
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                  onPress={handleUpdateUser}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ['#6B7280', '#6B7280'] : ['#ad92fd', '#815BF5']}
                    style={styles.saveButtonGradient}
                  >
                    {isLoading ? (
                      <>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Updating...</Text>
                      </>
                    ) : (
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* Custom Splash Screen for Success - Separate Modal */}
      <CustomSplashScreen
        visible={showSuccessSplash}
        lottieSource={require('../../assets/Animation/success.json')}
        mainText="Member Updated!"
        subtitle="Team member details have been updated successfully."
        onDismiss={handleSplashComplete}
        onComplete={handleSplashComplete}
        duration={3000}
        gradientColors={["#05071E", "#0A0D28"]}
        textGradientColors={["#815BF5", "#FC8929"]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: height * 0.9,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
   
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 16,
    paddingLeft:20
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
  },
  fullWidthInputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: '8%',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#EE4848',
    fontFamily: 'Lato-Light',
    marginLeft: 4,
  },
  passwordInputWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  passwordToggle: {
    position: 'absolute',
    right: '8%',
    top: 35,
    zIndex: 1,
  },
  // Country dropdown styles
  dropdownSearchInput: {
    color: 'white',
    borderWidth: 0,
    borderRadius: 15,
    height: 48,
    backgroundColor: '#121212',
  },
  dropdownContainer: {
    backgroundColor: '#121212',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#37384B',
  },
  dropdownStyle: {
    borderWidth: 1,
    borderColor: '#37384B',
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 10,
    height: 55,
    borderRadius: 15,
    marginTop: 20,
    width: '90%',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#787CA5',
  },
  dropdownSelectedText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 5,
  },
  dropdownIcon: {
    width: 18,
    height: 18,
    tintColor: '#787CA5',
  },
  flagText: {
    fontSize: 18,
    marginRight: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    backgroundColor: '#121212',
  },
  selectedDropdownItem: {
    backgroundColor: '#4e5278',
  },
  dropdownItemText: {
    color: 'white',
    flex: 1,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '90%',
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  selectedRoleOption: {
    backgroundColor: 'rgba(129, 91, 245, 0.3)',
    borderColor: '#815BF5',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  selectedRoleOptionText: {
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  managersContainer: {
    maxHeight: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '90%',
  },
  managerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedManagerOption: {
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
  },
  managerOptionText: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  selectedManagerOptionText: {
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  accessToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '90%',
    alignSelf: 'center',
  },
  accessToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accessToggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accessToggleTextContainer: {
    flex: 1,
  },
  accessToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  accessToggleSubtitle: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    marginTop: 2,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#815BF5',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
    backgroundColor: 'rgba(10, 13, 40, 0.95)',
    paddingBottom:30,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
});

export default EditMemberModal;