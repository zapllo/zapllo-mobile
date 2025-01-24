import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import moment from 'moment';

interface CustomDateRangeModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApply: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  isVisible,
  onClose,
  onApply,
  initialStartDate = new Date(),
  initialEndDate = new Date(),
}) => {
  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [endDate, setEndDate] = useState<Date>(initialEndDate);
  const [currentPicker, setCurrentPicker] = useState<'start' | 'end'>('start');
  const [showPicker, setShowPicker] = useState(false);

  const handleApply = () => {
    if (startDate > endDate) {
      onApply(endDate, startDate);
    } else {
      onApply(startDate, endDate);
    }
    onClose();
  };

  const formatDate = (date: Date) => {
    return moment(date).format('MMM DD, YYYY');
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (currentPicker === 'start') {
        setStartDate(selectedDate);
      } else {
        setEndDate(selectedDate);
      }
    }
  };

  const showDatePicker = (pickerType: 'start' | 'end') => {
    setCurrentPicker(pickerType);
    setShowPicker(true);
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      propagateSwipe={true}
      avoidKeyboard={true}
      useNativeDriver={true}
      statusBarTranslucent>
      <View style={styles.container}>
        <View style={styles.handle} />
        
        <Text style={styles.title}>Select Date Range</Text>
        
        <View style={styles.dateSelectors}>
          <TouchableOpacity 
            style={[styles.dateButton]}
            onPress={() => showDatePicker('start')}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dateButton]}
            onPress={() => showDatePicker('end')}>
            <Text style={styles.dateLabel}>End Date</Text>
            <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={currentPicker === 'start' ? startDate : endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              style={styles.datePicker}
              textColor="#FFFFFF"
              themeVariant="dark"
            />
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.applyButton]} 
            onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#0A0D28',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#FFFFFF40',
    borderRadius: 2,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  dateSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  dateButton: {
    padding: 10,
    borderRadius: 8,
    width: '48%',
    backgroundColor: '#1A1D3D',
  },
  dateLabel: {
    fontSize: 14,
    color: '#FFFFFF80',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: Platform.OS === 'ios' ? '#1A1D3D' : 'transparent',
    borderRadius: 8,
  },
  datePicker: {
    width: Platform.OS === 'ios' ? '100%' : 'auto',
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#1A1D3D',
  },
  applyButton: {
    backgroundColor: '#5367CB',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomDateRangeModal;