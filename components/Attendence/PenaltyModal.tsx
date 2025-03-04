import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';

interface PenaltyModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (settings: PenaltySettings) => void;
  initialSettings?: PenaltySettings;
}

export interface PenaltySettings {
  lateLoginsAllowed: number;
  penaltyLeaveDeductionType: string;
}

const PenaltyModal: React.FC<PenaltyModalProps> = ({
  isVisible,
  onClose,
  onSave,
  initialSettings = {
    lateLoginsAllowed: 3,
    penaltyLeaveDeductionType: 'Half Day',
  },
}) => {
  const [lateLoginsAllowed, setLateLoginsAllowed] = useState(initialSettings.lateLoginsAllowed);
  const [penaltyLeaveDeductionType, setPenaltyLeaveDeductionType] = useState(initialSettings.penaltyLeaveDeductionType);
  const [isDeductionTypeDropdownOpen, setIsDeductionTypeDropdownOpen] = useState(false);
  
  const deductionTypes = ['Quarter Day', 'Half Day', 'Full Day'];

  const handleSave = () => {
    onSave({
      lateLoginsAllowed,
      penaltyLeaveDeductionType,
    });
    onClose();
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

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View className="bg-[#1E1F2E] rounded-t-3xl p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-white text-xl" style={{fontFamily:"LatoBold"}}>Set Penalties</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-[#787CA5]">Cancel</Text>
          </TouchableOpacity>
        </View>

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

        {/* Penalty Leave Deduction Type Section */}
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

        <TouchableOpacity 
          onPress={handleSave}
          className="bg-[#4A65FF] py-4 rounded-xl"
        >
          <Text className="text-white text-center" style={{fontFamily:"LatoBold"}}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default PenaltyModal;