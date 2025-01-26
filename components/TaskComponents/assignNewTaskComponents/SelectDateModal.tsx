import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';

interface SelectDateModalProps {
  visible: boolean;
  selectedDate: Date;
  onChange: (date: Date) => void;
  onCancel: () => void;
}

const SelectDateModal: React.FC<SelectDateModalProps> = ({
  visible,
  selectedDate,
  onChange,
  onCancel,
}) => {
  const [currentMode, setCurrentMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState(selectedDate);

  const handleConfirm = () => {
    Haptics.selectionAsync(); // Trigger haptic feedback
    if (currentMode === 'date') {
      setCurrentMode('time'); // Switch to time mode after confirming date
    } else {
      onChange(tempDate);
      onCancel();
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setTempDate((prevDate) => {
        const newDate = new Date(prevDate);
        if (currentMode === 'date') {
          newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        } else {
          newDate.setHours(date.getHours(), date.getMinutes());
        }
        return newDate;
      });
    }
  };

  const handleCancel = () => {
    Haptics.selectionAsync(); // Trigger haptic feedback
    onCancel();
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onCancel}
      style={{ justifyContent: 'center', alignItems: 'center' }}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{currentMode === 'date' ? 'Select Date' : 'Select Time'}</Text>
        <DateTimePicker
          value={tempDate}
          mode={currentMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={handleCancel}
            style={[styles.actionButton, styles.cancelButton]}
            accessible={true}
            accessibilityLabel="Cancel date selection">
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.actionButton, styles.confirmButton]}
            accessible={true}
            accessibilityLabel="Confirm selected date or time">
            <Text style={[styles.actionText, { color: 'white' }]}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#0A0D28',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap:6,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#1A1D3D',
  },
  confirmButton: {
    marginLeft: 15,
    backgroundColor:"#5367CB"
  },
  actionText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default SelectDateModal;