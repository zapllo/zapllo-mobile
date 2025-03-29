import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

interface RegularizationDetailsProps {
  isVisible: boolean;
  onClose: () => void;
  regularization: {
    date: string;
    loginTime: string;
    logoutTime: string;
    remarks: string;
    approvalStatus: 'Pending' | 'Approved' | 'Rejected';
    notes?: string;
  };
}

const RegularizationDetailsModal: React.FC<RegularizationDetailsProps> = ({ 
  isVisible, 
  onClose, 
  regularization 
}) => {
  // Format time to 12-hour format
  const formatTime = (time: string) => {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status color based on approval status
  const getStatusColor = () => {
    switch (regularization.approvalStatus) {
      case 'Approved':
        return '#017a5b';
      case 'Rejected':
        return '#d32f2f';
      default:
        return '#f57c00';
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      onBackdropPress={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Regularization Details</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentContainer}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{regularization.approvalStatus}</Text>
          </View>

          {/* Date */}
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="calendar-today" size={20} color="#FC8929" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(regularization.date)}</Text>
            </View>
          </View>

          {/* Login Time */}
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="login" size={20} color="#FC8929" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Login Time</Text>
              <Text style={styles.detailValue}>{formatTime(regularization.loginTime)}</Text>
            </View>
          </View>

          {/* Logout Time */}
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="logout" size={20} color="#FC8929" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Logout Time</Text>
              <Text style={styles.detailValue}>{formatTime(regularization.logoutTime)}</Text>
            </View>
          </View>

          {/* Remarks */}
          <View style={styles.detailRow}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="description" size={20} color="#FC8929" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Remarks</Text>
              <Text style={styles.detailValue}>{regularization.remarks}</Text>
            </View>
          </View>

          {/* Admin Notes (if any) */}
          {regularization.notes && (
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <MaterialIcons name="note" size={20} color="#FC8929" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Admin Notes</Text>
                <Text style={styles.detailValue}>{regularization.notes}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0B0D29',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'LatoBold',
  },
  contentContainer: {
    padding: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    color: '#fff',
    fontFamily: 'LatoBold',
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(252, 137, 41, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    color: '#787CA5',
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'LatoRegular',
  },
  detailValue: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'LatoBold',
  },
  closeButton: {
    marginHorizontal: 16,
    backgroundColor: '#272945',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'LatoBold',
  },
});

export default RegularizationDetailsModal;