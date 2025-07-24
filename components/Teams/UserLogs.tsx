import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

interface PayslipLogData {
  _id: string;
  salaryDetails: {
    name: string;
    amount: number;
  }[];
  deductionDetails: {
    name: string;
    amount: number;
  }[];
  month: number;
  year: number;
  publicLink: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  employeeId: string;
  designation: string;
  branch: string;
  department: string;
  bankDetails: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    ifscCode: string;
  };
}

interface UserLogsProps {
  userId: string;
}

const UserLogs: React.FC<UserLogsProps> = ({ userId }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  
  const [payslipLogData, setPayslipLogData] = useState<PayslipLogData[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    fetchPayslipDetails();
    fetchUserDetails();
  }, [userId]);

  const fetchPayslipDetails = async () => {
    try {
      const response = await axios.get(`${backend_Host}/payslip/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const { payslipLogs } = response.data;
        setPayslipLogData(payslipLogs || []);
      } else {
        console.error('Error fetching payslip details:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching payslip details:', error);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`${backend_Host}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        const { user } = response.data;
        setUserData(user);
      } else {
        console.error('Error fetching user details:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handlePayslipPress = async (payslip: PayslipLogData) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      if (payslip.publicLink) {
        // Navigate to payslip detail screen
        router.push(`/(routes)/teams/payslip/${userId}/${payslip.month}-${payslip.year}` as any);
      } else {
        Alert.alert('Error', 'Payslip link not available');
      }
    } catch (error) {
      console.error('Error opening payslip:', error);
      Alert.alert('Error', 'Failed to open payslip');
    }
  };

  const formatMonthYear = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const renderAccordionSection = (
    title: string,
    sectionKey: string,
    icon: string,
    content: React.ReactNode
  ) => {
    const isExpanded = expandedSection === sectionKey;
    
    return (
      <View style={styles.accordionSection}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={() => toggleSection(sectionKey)}
        >
          <View style={styles.accordionHeaderContent}>
            <MaterialIcons name={icon as any} size={20} color="#815BF5" />
            <Text style={styles.accordionTitle}>{title}</Text>
          </View>
          <MaterialIcons
            name={isExpanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color="#A9A9A9"
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.accordionContent}>
            {content}
          </View>
        )}
      </View>
    );
  };

  const renderPayslipLogs = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#815BF5" />
          <Text style={styles.loadingText}>Loading payslip logs...</Text>
        </View>
      );
    }

    if (payslipLogData && payslipLogData.length > 0) {
      return (
        <View style={styles.payslipLogsContainer}>
          {payslipLogData.map((payslip) => (
            <TouchableOpacity
              key={payslip._id}
              style={styles.payslipLogItem}
              onPress={() => handlePayslipPress(payslip)}
            >
              <View style={styles.payslipLogContent}>
                <View style={styles.payslipLogIcon}>
                  <MaterialIcons name="receipt" size={20} color="#815BF5" />
                </View>
                <View style={styles.payslipLogInfo}>
                  <Text style={styles.payslipLogTitle}>
                    {formatMonthYear(payslip.month, payslip.year)}
                  </Text>
                  <Text style={styles.payslipLogSubtitle}>
                    Tap to view payslip details
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#A9A9A9" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <View style={styles.emptyStateIcon}>
          <MaterialIcons name="receipt-long" size={48} color="#6B7280" />
        </View>
        <Text style={styles.emptyStateTitle}>No Payslips Generated</Text>
        <Text style={styles.emptyStateText}>
          Payslip logs will appear here once they are generated for this employee.
        </Text>
      </View>
    );
  };

  if (loading && !payslipLogData.length) {
    return (
      <View style={styles.mainLoadingContainer}>
        <ActivityIndicator size="large" color="#815BF5" />
        <Text style={styles.mainLoadingText}>Loading user logs...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>User Logs</Text>
          <Text style={styles.subtitle}>
            View employee activity and generated documents
          </Text>
        </View>

        {/* Separator */}
        <View style={styles.separator} />

        {/* Payslip Logs Accordion */}
        {renderAccordionSection(
          'Payslip Logs',
          'payslipLogs',
          'receipt',
          renderPayslipLogs()
        )}

        {/* Future sections can be added here */}
        {/* Example: Attendance Logs, Leave Logs, etc. */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
    
  },
  mainLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0D28',
    paddingVertical: 40,
  },
  mainLoadingText: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  accordionSection: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accordionTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  accordionContent: {
    padding: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    marginLeft: 8,
  },
  payslipLogsContainer: {
    gap: 8,
  },
  payslipLogItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  payslipLogContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  payslipLogIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  payslipLogInfo: {
    flex: 1,
  },
  payslipLogTitle: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  payslipLogSubtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});

export default UserLogs;