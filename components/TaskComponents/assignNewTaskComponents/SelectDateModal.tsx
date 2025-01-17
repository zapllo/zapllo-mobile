import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import * as Haptics from 'expo-haptics';

interface SelectDateModalProps {
  visible: boolean;
  mode: 'date' | 'time';
  selectedDate: Date;
  onChange: (date: Date) => void;
  onCancel: () => void;
}

const SelectDateModal: React.FC<SelectDateModalProps> = ({
  visible,
  mode,
  selectedDate,
  onChange,
  onCancel,
}) => {
  const handleConfirm = () => {
    Haptics.selectionAsync(); // Trigger haptic feedback
    onChange(selectedDate);
    onCancel();
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
        <Text style={styles.modalTitle}>{mode === 'date' ? 'Select Date' : 'Select Time'}</Text>
        <DateTimePicker
          value={selectedDate}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (date) onChange(date); // Pass valid date to parent
          }}
        />
        {Platform.OS === 'ios' && (
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
              <Text style={[styles.actionText, { color: '#5367cb' }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        )}
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
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {},
  confirmButton: {
    marginLeft: 15,
  },
  actionText: {
    color: '#cb5353',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default SelectDateModal;