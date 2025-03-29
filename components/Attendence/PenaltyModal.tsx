import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import Modal from 'react-native-modal';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface PenaltyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (settings: PenaltySettings) => void;
  onFetchSettings?: (settings: PenaltySettings) => void;
  initialSettings?: PenaltySettings;
}

export interface PenaltySettings {
  lateLoginsAllowed: number;
  penaltyLeaveDeductionType: string;
  penaltyOption?: string;
  penaltySalaryAmount?: number;
}

const PenaltyModal: React.FC<PenaltyModalProps> = ({
  isVisible,
  onClose,
  onSave,
  onFetchSettings,
  initialSettings = {
    lateLoginsAllowed: 3,
    penaltyLeaveDeductionType: 'Half Day',
    penaltyOption: 'leave',
    penaltySalaryAmount: 0
  },
}) => {
  const [lateLoginsAllowed, setLateLoginsAllowed] = useState(initialSettings.lateLoginsAllowed);
  const [penaltyLeaveDeductionType, setPenaltyLeaveDeductionType] = useState(initialSettings.penaltyLeaveDeductionType);
  const [penaltyOption, setPenaltyOption] = useState(initialSettings.penaltyOption || 'leave');
  const [penaltySalaryAmount, setPenaltySalaryAmount] = useState(initialSettings.penaltySalaryAmount || 0);
  const [salaryAmountText, setSalaryAmountText] = useState(initialSettings.penaltySalaryAmount?.toString() || '0');
  const [isDeductionTypeDropdownOpen, setIsDeductionTypeDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingSettings, setFetchingSettings] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Get auth token from Redux store
  const { token } = useSelector((state: RootState) => state.auth);
  
  const deductionTypes = ['Quarter Day', 'Half Day', 'Full Day'];

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Fetch current penalty settings when modal opens
  useEffect(() => {
    if (isVisible) {
      fetchPenaltySettings();
    }
  }, [isVisible]);

  const fetchPenaltySettings = async () => {
    try {
      setFetchingSettings(true);
      
      // Fetch organization data to get penalty settings
      const response = await axios.get('https://zapllo.com/api/organization/getById', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.data) {
        const orgData = response.data.data;
        
        // Create updated settings object based on organization data
        const updatedSettings: PenaltySettings = {
          lateLoginsAllowed: orgData.lateLoginThreshold || initialSettings.lateLoginsAllowed,
          penaltyLeaveDeductionType: orgData.penaltyLeaveType || initialSettings.penaltyLeaveDeductionType,
          penaltyOption: orgData.penaltyOption || initialSettings.penaltyOption,
          penaltySalaryAmount: orgData.penaltySalaryAmount || initialSettings.penaltySalaryAmount
        };
        
        // Update local state
        setLateLoginsAllowed(updatedSettings.lateLoginsAllowed);
        setPenaltyLeaveDeductionType(updatedSettings.penaltyLeaveDeductionType || 'Half Day');
        setPenaltyOption(updatedSettings.penaltyOption || 'leave');
        setPenaltySalaryAmount(updatedSettings.penaltySalaryAmount || 0);
        setSalaryAmountText((updatedSettings.penaltySalaryAmount || 0).toString());
        
        // Notify parent component of fetched settings
        if (onFetchSettings) {
          onFetchSettings(updatedSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching penalty settings:', error);
    } finally {
      setFetchingSettings(false);
    }
  };

  const handleSave = async () => {
    try {
      Keyboard.dismiss();
      setLoading(true);
      
      // Prepare the data for the API
      const penaltyData = {
        penaltyOption: penaltyOption,
        lateLoginThreshold: lateLoginsAllowed,
        penaltyLeaveType: penaltyLeaveDeductionType,
        penaltySalaryAmount: penaltySalaryAmount
      };
      
      // Make the API call
      const response = await axios.patch(
        'https://zapllo.com/api/organization/penalty-config',
        penaltyData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Create updated settings object
        const updatedSettings: PenaltySettings = {
          lateLoginsAllowed,
          penaltyLeaveDeductionType,
          penaltyOption,
          penaltySalaryAmount
        };
        
        // Show success alert
        Alert.alert(
          'Success',
          'Penalty settings updated successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Call the onSave callback with the updated settings
                onSave(updatedSettings);
                
                // Close the modal
                onClose();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to save penalty settings');
      }
    } catch (error) {
      console.error('Error saving penalty settings:', error);
      Alert.alert(
        'Error',
        'Failed to save penalty settings. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePenaltyTypeChange = (type: string) => {
    setPenaltyOption(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const increaseAllowedLateLogins = () => {
    setLateLoginsAllowed(prev => Math.min(prev + 1, 10));
  };

  const decreaseAllowedLateLogins = () => {
    setLateLoginsAllowed(prev => Math.max(prev - 1, 0));
  };

  const toggleDeductionTypeDropdown = () => {
    setIsDeductionTypeDropdownOpen(!isDeductionTypeDropdownOpen);
  };

  const selectDeductionType = (type: string) => {
    setPenaltyLeaveDeductionType(type);
    setIsDeductionTypeDropdownOpen(false);
  };

  const handleSalaryAmountChange = (text: string) => {
    // Only allow numbers and decimal points
    const filteredText = text.replace(/[^0-9.]/g, '');
    setSalaryAmountText(filteredText);
    
    // Convert to number and update state
    const numValue = parseFloat(filteredText);
    if (!isNaN(numValue)) {
      // Limit to 0-100 range
      const limitedValue = Math.min(Math.max(numValue, 0), 100);
      setPenaltySalaryAmount(limitedValue);
    } else {
      setPenaltySalaryAmount(0);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {
        dismissKeyboard();
        onClose();
      }}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
      avoidKeyboard={true}
      propagateSwipe={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: 'flex-end' }}
   
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View className="bg-[#1E1F2E] rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl" style={{fontFamily:"LatoBold"}}>Set Penalties</Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-[#787CA5]">Cancel</Text>
              </TouchableOpacity>
            </View>

            {fetchingSettings ? (
              <View className="items-center justify-center py-8">
                <ActivityIndicator color="#4A65FF" size="large" />
                <Text className="text-white mt-4">Loading settings...</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Penalty Type Tabs with LinearGradient */}
                <View className="items-center border border-[#676B93] w-full px-1.5 py-1.5 rounded-full mb-2">
                  <View className="w-full flex flex-row items-center justify-between">
                    <TouchableOpacity
                      className="w-1/2 items-center"
                      onPress={() => handlePenaltyTypeChange('leave')}
                    >
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        colors={penaltyOption === 'leave' ? ["#6641d5", "#262739"] : ["#1E1F2E", "#1E1F2E"]}
                        style={styles.tablet}
                      >
                        <Text className={`text-sm ${penaltyOption === 'leave' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Leave</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-1/2 items-center"
                      onPress={() => handlePenaltyTypeChange('salary')}
                    >
                      <LinearGradient
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        colors={penaltyOption === 'salary' ? ["#6641d5", "#262739"] : ["#1E1F2E", "#1E1F2E"]}
                        style={styles.tablet}
                      >
                        <Text className={`text-sm ${penaltyOption === 'salary' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Salary</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className='text-xs mb-6 text-[#676B93]'>You can either select the leave or salary penalty type</Text>

                {/* Late Logins Allowed Section */}
                <View className="mb-6">
                  <Text className="text-white mb-2" style={{fontFamily:"Lato"}}>No. of Late Logins Allowed</Text>
                  <View className="flex-row items-center justify-between border border-[#37384B] rounded-xl p-4">
                    <TouchableOpacity 
                      onPress={decreaseAllowedLateLogins}
                      className="bg-[#37384B] w-8 h-8 rounded-full items-center justify-center"
                    >
                      <Text className="text-white text-xl">-</Text>
                    </TouchableOpacity>
                    
                    <Text className="text-white text-lg" style={{fontFamily:"LatoBold"}}>{lateLoginsAllowed}</Text>
                    
                    <TouchableOpacity 
                      onPress={increaseAllowedLateLogins}
                      className="bg-[#37384B] w-8 h-8 rounded-full items-center justify-center"
                    >
                      <Text className="text-white text-xl">+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Conditional rendering based on penalty type */}
                {penaltyOption === 'leave' ? (
                  /* Penalty Leave Deduction Type Section */
                  <View className="mb-6">
                    <Text className="text-white mb-2" style={{fontFamily:"Lato"}}>Penalty Leave Deduction Type</Text>
                    <TouchableOpacity 
                      onPress={toggleDeductionTypeDropdown}
                      className="border border-[#37384B] rounded-xl p-4 flex-row justify-between items-center"
                    >
                      <Text className="text-white" style={{fontFamily:"Lato"}}>{penaltyLeaveDeductionType}</Text>
                      <Text className="text-white">{isDeductionTypeDropdownOpen ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    
                    {isDeductionTypeDropdownOpen && (
                      <View className="border border-[#37384B] rounded-xl mt-1 overflow-hidden">
                        <ScrollView style={{ maxHeight: 150 }}>
                          {deductionTypes.map((type, index) => (
                            <TouchableOpacity 
                              key={index}
                              onPress={() => selectDeductionType(type)}
                              className={`p-4 ${index !== deductionTypes.length - 1 ? 'border-b border-[#37384B]' : ''} ${type === penaltyLeaveDeductionType ? 'bg-[#37384B]' : ''}`}
                            >
                              <Text className="text-white" style={{fontFamily:"Lato"}}>{type}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                ) : (
                  /* Salary Deduction Amount Section with TextInput */
                  <View className="mb-6">
                    <Text className="text-white mb-2" style={{fontFamily:"Lato"}}>Salary Deduction Amount </Text>
                    <View className="border border-[#37384B] rounded-xl p-4">
                      <View className="flex-row items-center">
                        <TextInput
                          className="flex-1 text-white text-center "
                          value={salaryAmountText}
                          onChangeText={handleSalaryAmountChange}
                          keyboardType="numeric"
                          placeholder="Enter percentage"
                          placeholderTextColor="#676B93"
                          style={{ fontFamily: "LatoBold" }}
                          maxLength={5} 
                        />
                      </View>
                    </View>
              
                  </View>
                )}

                <TouchableOpacity 
                  onPress={handleSave}
                  className="bg-[#4A65FF] py-4 rounded-xl mb-4"
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text className="text-white text-center" style={{fontFamily:"LatoBold"}}>Save Changes</Text>
                  )}
                </TouchableOpacity>
                
                {/* Add extra padding at the bottom when keyboard is visible */}
                {keyboardVisible && Platform.OS === 'ios' && <View style={{ height: 100 }} />}
              </ScrollView>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
});

export default PenaltyModal;