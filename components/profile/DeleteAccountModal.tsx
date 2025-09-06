import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, AntDesign, Ionicons, Entypo } from '@expo/vector-icons';
import axios from 'axios';
import { backend_Host } from '~/config';

interface DeleteAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  token: string;
  userEmail: string;
}

export default function DeleteAccountModal({ 
  isVisible, 
  onClose, 
  onSuccess,
  token,
  userEmail
}: DeleteAccountModalProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetForm = useCallback(() => {
    setStep(1);
    setEmail('');
    setPassword('');
    setConfirmDelete(false);
    setIsDeleting(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    Keyboard.dismiss();
    onClose();
    setTimeout(() => {
      resetForm();
    }, 300);
  }, [onClose, resetForm]);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleDeleteAccount = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (email !== userEmail) {
      Alert.alert('Error', 'Email does not match your account email');
      return;
    }

    if (!confirmDelete) {
      Alert.alert('Error', 'Please confirm that you understand the consequences');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await axios.post(
        `${backend_Host}/users/delete-account`,
        { email, password },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        setStep(2);
        onSuccess?.();
      } else {
        Alert.alert('Error', response.data.error || 'Failed to delete account');
      }
    } catch (error: any) {
      console.error('Delete Account Error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete account. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => setModalVisible(false)}
      style={{ margin: 0, justifyContent: 'flex-end', marginTop: 10 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.75}
      backdropTransitionOutTiming={300}
      useNativeDriver={true}
    >
      <ScrollView              
       contentContainerStyle={{ flexGrow: 1 }}
       showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.modalHandle} />
        <View className="mt-16 rounded-t-3xl bg-[#0A0D28] p-5 pb-20">
          
          {/* Task Details Header */}
          <View style={styles.taskHeaderContainer}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              Account Deletion Request
            </Text>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={handleCloseModal}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
              <Entypo name="cross" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubtitle}>
            We're sorry to see you go. Please review the information below before proceeding.
          </Text>

          {step === 1 ? (
            <>
              {/* Warning Section */}
              <View style={styles.attachmentSection}>
                <View style={styles.attachmentHeader}>
                  <MaterialIcons 
                    className='p-1.5 mr-2 rounded-full '
                    name="warning" 
                    size={12} 
                    color={"#FC8929"} 
                    style={{backgroundColor:"rgba(252, 137, 41, 0.2)"}}
                  />
                  <Text style={styles.attachmentTitle}>Important Information</Text>
                </View>
                <Text style={styles.emptyAttachmentText}>
                  Account deletion is permanent and cannot be undone. All your data will be permanently removed.
                </Text>
              </View>

              {/* What happens section */}
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionLabel}>What happens when you delete your account?</Text>
                
                <View style={styles.infoItem}>
                  <MaterialIcons name="delete" size={16} color="#EF4444" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Data that will be permanently deleted:</Text>
                    <Text style={styles.bulletText}>• Your profile information (name, email, contact details)</Text>
                    <Text style={styles.bulletText}>• Your leave history and balances</Text>
                    <Text style={styles.bulletText}>• Your attendance records</Text>
                    <Text style={styles.bulletText}>• Your task history</Text>
                    <Text style={styles.bulletText}>• Your face recognition data</Text>
                    <Text style={styles.bulletText}>• Your bank and legal document information</Text>
                  </View>
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.infoItem}>
                  <Ionicons name="time" size={16} color="#FC8929" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Deletion timeline:</Text>
                    <Text style={styles.infoDescription}>
                      Your account deletion request will be processed within 14 days. During this period, 
                      your account will be deactivated but not permanently deleted, giving you time to change your mind.
                    </Text>
                  </View>
                </View>

                <View style={styles.sectionDivider} />

                <View style={styles.infoItem}>
                  <MaterialIcons name="business" size={16} color="#815BF5" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>Organization data:</Text>
                    <Text style={styles.infoDescription}>
                      If you are an organization admin, you must transfer ownership or delete your 
                      organization before deleting your account.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Form Section */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionLabel}>Request Account Deletion</Text>
                <Text style={styles.formSubtitle}>
                  Please verify your identity to proceed with account deletion
                </Text>
              </View>

              <View style={styles.descriptionInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
                  placeholderTextColor="#787CA5"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.descriptionInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#787CA5"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setConfirmDelete(!confirmDelete)}
              >
                <View style={[styles.checkbox, confirmDelete && styles.checkboxChecked]}>
                  {confirmDelete && <Entypo name="check" size={16} color="#815BF5" />}
                </View>
                <Text style={styles.checkboxText}>
                  I understand that deleting my account is permanent and cannot be undone. 
                  All my data will be permanently deleted as described above.
                </Text>
              </TouchableOpacity>

              {/* Support Link */}
              <View style={styles.supportSection}>
                <Text style={styles.supportText}>
                  Need assistance?{' '}
                  <Text style={styles.supportLink}>Contact our support team</Text>
                </Text>
              </View>

              {/* Footer Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.updateButton, isDeleting && styles.deleteButtonDisabled]}
                  onPress={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  <LinearGradient
                    colors={['#EF4444', '#DC2626']}
                    style={styles.updateButtonGradient}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="delete" size={18} color="#fff" style={styles.updateButtonIcon} />
                        <Text style={styles.updateButtonText}>Delete My Account</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Success Step */
            <>
              <View style={styles.successSection}>
                <View style={styles.successIconContainer}>
                  <MaterialIcons name="check-circle" size={48} color="#815BF5" />
                </View>
                
                <Text style={styles.taskTitle}>Deletion Request Submitted</Text>
                <Text style={styles.descriptionText}>
                  Your account deletion request has been received. Your account is now deactivated.
                </Text>
                <Text style={styles.emptyAttachmentText}>
                  All your data will be permanently deleted within 14 days. If you change your mind,
                  please contact our support team immediately.
                </Text>

                <View style={styles.descriptionContainer}>
                  <Text style={styles.sectionLabel}>What happens next?</Text>
                  <View style={styles.stepsList}>
                    <View style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>1</Text>
                      </View>
                      <Text style={styles.stepText}>Your account is now in a deactivated state for 14 days</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>2</Text>
                      </View>
                      <Text style={styles.stepText}>You'll receive a confirmation email with details about the deletion process</Text>
                    </View>
                    <View style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>3</Text>
                      </View>
                      <Text style={styles.stepText}>After 14 days, all your data will be permanently removed from our systems</Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleCloseModal}
              >
                <LinearGradient
                  colors={['#815BF5', '#FC8929']}
                  style={styles.updateButtonGradient}
                >
                  <Text style={styles.updateButtonText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalHandle: {
    width: 60,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  taskHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 6,
  },
  taskTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    flexShrink: 1,
    width: '85%',
    lineHeight: 26,
    letterSpacing: 0.2,
  },
  closeButton: {
    padding: 4,
    marginTop: 2,
    backgroundColor: 'rgba(55, 56, 75, 0.5)',
    borderRadius: 20,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#787CA5',
    marginBottom: 16,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  attachmentSection: {
    marginBottom: 22,
  },
  attachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
  },
  attachmentTitle: {
    fontSize: 10,
    color: '#787CA5',
    fontFamily: 'LatoBold',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  emptyAttachmentText: {
    fontSize: 12,
    color: '#787CA5',
    fontStyle: 'italic',
    marginLeft: 8,
  },
  descriptionContainer: {
    marginBottom: 22,
    backgroundColor: 'rgba(55, 56, 75, 0.2)',
    borderRadius: 16,
    padding: 14,
  },
  sectionLabel: {
    fontSize: 11,
    color: '#787CA5',
    marginBottom: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 12,
    color: '#787CA5',
    lineHeight: 16,
    marginBottom: 2,
    fontFamily: 'LatoRegular',
  },
  infoDescription: {
    fontSize: 12,
    color: '#787CA5',
    lineHeight: 18,
    fontFamily: 'LatoRegular',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 16,
  },
  detailSection: {
    flexDirection: 'column',
    marginBottom: 22,
    backgroundColor: 'rgba(55, 56, 75, 0.2)',
    borderRadius: 16,
    padding: 14,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#787CA5',
    marginTop: 4,
    lineHeight: 16,
    fontFamily: 'LatoRegular',
  },
  descriptionInputContainer: {
    borderWidth: 1,
    borderColor: '#37384B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    backgroundColor: 'rgba(55, 56, 75, 0.2)',
  },
  textInput: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'LatoRegular',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#37384B',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    backgroundColor: '#37384B',
  },
  checkboxChecked: {
    backgroundColor: '#37384B',
    borderColor: '#37384B',
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: '#787CA5',
    lineHeight: 16,
    fontFamily: 'LatoRegular',
  },
  supportSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  supportText: {
    fontSize: 12,
    color: '#787CA5',
    textAlign: 'center',
    fontFamily: 'LatoRegular',
  },
  supportLink: {
    color: '#815BF5',
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(55, 56, 75, 0.5)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'LatoBold',
  },
  updateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    flex: 1,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  updateButtonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'LatoBold',
    letterSpacing: 0.5,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 19,
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#815BF5',
    fontFamily: 'LatoBold',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#787CA5',
    lineHeight: 16,
    fontFamily: 'LatoRegular',
  },
});