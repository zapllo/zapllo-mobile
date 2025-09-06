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
      style={{ justifyContent: 'flex-end', margin: 0 }}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>
        <DateTimePicker
          value={selectedDate}
          mode={currentMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          textColor="#FFFFFF"
          style={styles.datePicker}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#191B3A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  cancelText: {
    color: '#787CA5',
    fontSize: 16,
    fontWeight: '500',
  },
  doneText: {
    color: '#815BF5',
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    backgroundColor: '#191B3A',
    height: 200,
  },
});

export default SelectDateModal;