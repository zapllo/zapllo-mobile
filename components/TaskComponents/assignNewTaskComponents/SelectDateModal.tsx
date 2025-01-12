import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';

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
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onCancel}
      style={{ justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>
          {mode === 'date' ? 'Select Date' : 'Select Time'}
        </Text>
        <DateTimePicker
          value={selectedDate}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'} // Use spinner for iOS
          onChange={(event, date) => {
            if (date) onChange(date); // Trigger the onChange only if a date is selected
          }}
        />
        {/* Add action buttons for better control */}
        {Platform.OS === 'ios' && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={onCancel} style={styles.actionButton}>
              <Text style={styles.actionText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onChange(selectedDate)}
              style={styles.actionButton}
            >
              <Text style={styles.actionText}>Confirm</Text>
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
    marginTop: 10,
  },
  actionButton: {
    padding: 10,
    marginHorizontal: 10,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default SelectDateModal;
