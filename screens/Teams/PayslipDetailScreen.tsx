import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import NavbarTwo from '~/components/navbarTwo';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const numberToWords = (num: number): string => {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (num === 0) return "Zero";
  if (num < 20) return a[num];
  if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ` ${a[num % 10]}` : "");
  if (num < 1000)
    return (
      a[Math.floor(num / 100)] +
      " Hundred" +
      (num % 100 !== 0 ? ` and ${numberToWords(num % 100)}` : "")
    );
  if (num < 1000000)
    return (
      numberToWords(Math.floor(num / 1000)) +
      " Thousand" +
      (num % 1000 !== 0 ? ` ${numberToWords(num % 1000)}` : "")
    );
  return num.toString();
};

interface PayslipData {
  logo: string;
  name: string;
  address: string;
  contact: string;
  emailOrWebsite: string;
}

interface PayslipLogData {
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
}

interface UserData {
  firstName: string;
  lastName: string;
  employeeId: string;
  designation: string;
  branch: string;
  department: string;
  email: string;
  whatsappNo: string;
  bankDetails: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    ifscCode: string;
  };
}

interface PayslipDetailScreenProps {
  userId?: string;
  monthYear?: string;
}

export default function PayslipDetailScreen({ userId, monthYear }: PayslipDetailScreenProps) {
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [payslipLogData, setPayslipLogData] = useState<PayslipLogData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [totalWorkingDays, setTotalWorkingDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // Parse month and year from monthYear parameter
  const [month, year] = monthYear ? monthYear.split("-").map(Number) : [new Date().getMonth() + 1, new Date().getFullYear()];

  useEffect(() => {
    if (userId) {
      fetchPayslipData();
    }
  }, [userId, month, year]);

  const fetchPayslipData = async () => {
    try {
      const [payslipResponse, userResponse] = await Promise.all([
        axios.get(`${backend_Host}/payslip/${userId}/${month}-${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backend_Host}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (payslipResponse.data.success) {
        const { payslipLog, payslip } = payslipResponse.data;
        setPayslipData(payslip);
        setPayslipLogData(payslipLog);
      } else {
        console.error("Error fetching payslip details:", payslipResponse.data.message);
        Alert.alert('Error', 'Failed to load payslip details');
      }

      if (userResponse.status === 200) {
        const { user } = userResponse.data;
        setUserData(user);
      } else {
        console.error("Error fetching user details:", userResponse.data.error);
        Alert.alert('Error', 'Failed to load user details');
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching payslip data:", error);
      Alert.alert('Error', 'Failed to load payslip data');
      setLoading(false);
    }
  };

  const sendPayslipEmail = async () => {
    try {
      setSendingEmail(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const response = await axios.post(`${backend_Host}/payslip/send-email`, {
        userId,
        month,
        year,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.message) {
        Alert.alert('Success', 'Payslip sent to employee email successfully');
      } else {
        Alert.alert('Error', 'Failed to send payslip email');
      }
    } catch (error) {
      console.error('Error sending payslip email:', error);
      Alert.alert('Error', 'Failed to send payslip email');
    } finally {
      setSendingEmail(false);
    }
  };

  const sendPayslipWhatsApp = async () => {
    try {
      setSendingWhatsApp(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await axios.post(`${backend_Host}/payslip/share/whatsapp`, {
        userId,
        month,
        year,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.message) {
        Alert.alert('Success', 'WhatsApp message sent successfully');
      } else {
        Alert.alert('Error', 'Failed to send WhatsApp message');
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      Alert.alert('Error', 'Failed to send WhatsApp message');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const downloadPayslip = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const response = await axios.get(`${backend_Host}/payslip/download/${userId}/${month}-${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        Alert.alert('Success', 'Payslip download started');
      } else {
        Alert.alert('Error', 'Failed to download payslip');
      }
    } catch (error) {
      console.error('Error downloading payslip:', error);
      Alert.alert('Error', 'Failed to download payslip');
    }
  };

  const navigateToShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(routes)/teams/payslip/share/${userId}/${month}-${year}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Payslip Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FC8929" />
          <Text style={styles.loadingText}>Loading payslip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!payslipLogData || !userData || !payslipData) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Payslip Details" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="receipt-long" size={64} color="#F59E0B" />
          <Text style={styles.errorTitle}>No Payslip Data</Text>
          <Text style={styles.errorText}>
            Payslip data is not available for this employee.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate net pay
  const grossPay = payslipLogData.salaryDetails.reduce((total, item) => total + (item.amount || 0), 0);
  const totalDeductions = payslipLogData.deductionDetails.reduce((total, item) => total + (item.amount || 0), 0);
  const netPay = grossPay - totalDeductions;

  const renderCompanyHeader = () => (
    <View style={styles.companyHeader}>
      <LinearGradient
        colors={['rgba(129, 91, 245, 0.1)', 'rgba(252, 137, 41, 0.05)']}
        style={styles.companyHeaderGradient}
      >
        <View style={styles.companyInfo}>
          {payslipData.logo && (
            <Image source={{ uri: payslipData.logo }} style={styles.companyLogo} />
          )}
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>{payslipData.name}</Text>
            <Text style={styles.companyAddress}>{payslipData.address}</Text>
            <Text style={styles.companyContact}>Mob: {payslipData.contact}</Text>
            <Text style={styles.companyEmail}>{payslipData.emailOrWebsite}</Text>
          </View>
        </View>
        <Text style={styles.payslipTitle}>
          PAYSLIP - {format(new Date(year, month - 1), "MMMM yyyy")}
        </Text>
      </LinearGradient>
    </View>
  );

  const renderEmployeeDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Employee Information</Text>
      <View style={styles.employeeCard}>
        <View style={styles.detailsGrid}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Employee Name:</Text>
            <Text style={styles.detailValue}>{userData.firstName} {userData.lastName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Employee Code:</Text>
            <Text style={styles.detailValue}>{userData.employeeId || "-"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Designation:</Text>
            <Text style={styles.detailValue}>{userData.designation || "-"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department:</Text>
            <Text style={styles.detailValue}>{userData.department || "-"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Work Location:</Text>
            <Text style={styles.detailValue}>{userData.branch || "-"}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Working Days:</Text>
            <Text style={styles.detailValue}>{totalWorkingDays || "-"}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBankDetails = () => (
    userData.bankDetails && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bank Details</Text>
        <View style={styles.bankCard}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank Name:</Text>
              <Text style={styles.detailValue}>{userData.bankDetails.bankName || "-"}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Branch:</Text>
              <Text style={styles.detailValue}>{userData.bankDetails.branchName || "-"}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Number:</Text>
              <Text style={styles.detailValue}>{userData.bankDetails.accountNumber || "-"}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>IFSC Code:</Text>
              <Text style={styles.detailValue}>{userData.bankDetails.ifscCode || "-"}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  );

  const renderSalaryBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Earnings & Deductions</Text>
      <View style={styles.salaryCard}>
        {/* Header Row */}
        <View style={styles.salaryHeaderRow}>
          <Text style={styles.salaryHeaderText}>Standard Salary</Text>
          <Text style={styles.salaryHeaderText}>Amount</Text>
          <Text style={styles.salaryHeaderText}>Deductions</Text>
          <Text style={styles.salaryHeaderText}>Amount</Text>
        </View>

        {/* Salary and Deduction Rows */}
        {payslipLogData.salaryDetails.map((allowance, index) => (
          <View key={index} style={styles.salaryRow}>
            <Text style={styles.salaryLabel}>{allowance.name}</Text>
            <Text style={styles.salaryAmount}>₹{allowance.amount.toLocaleString('en-IN')}</Text>
            <Text style={styles.salaryLabel}>
              {payslipLogData.deductionDetails[index]?.name || "-"}
            </Text>
            <Text style={styles.deductionAmount}>
              {payslipLogData.deductionDetails[index]?.amount 
                ? `₹${payslipLogData.deductionDetails[index].amount.toLocaleString('en-IN')}` 
                : "-"}
            </Text>
          </View>
        ))}

        {/* Total Row */}
        <View style={[styles.salaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Gross Pay</Text>
          <Text style={styles.totalAmount}>₹{grossPay.toLocaleString('en-IN')}</Text>
          <Text style={styles.totalLabel}>Total Deductions</Text>
          <Text style={styles.totalDeductionAmount}>₹{totalDeductions.toLocaleString('en-IN')}</Text>
        </View>
      </View>
    </View>
  );

  const renderNetPaySummary = () => (
    <View style={styles.section}>
      <View style={styles.netPayCard}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']}
          style={styles.netPayGradient}
        >
          <View style={styles.netPayContent}>
            <View style={styles.netPayLeft}>
              <Text style={styles.netPayLabel}>Net Pay:</Text>
              <Text style={styles.netPayAmount}>₹{netPay.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.netPayRight}>
              <Text style={styles.amountInWordsLabel}>Amount in Words:</Text>
              <Text style={styles.amountInWordsText}>
                {numberToWords(netPay)} Only
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <Text style={styles.actionButtonsTitle}>Payslip Actions</Text>
      
      <View style={styles.actionButtonsGrid}>
        {/* Send Email Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={sendPayslipEmail}
          disabled={sendingEmail}
        >
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.actionButtonGradient}
          >
            {sendingEmail ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons name="email" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.actionButtonText}>
              {sendingEmail ? 'Sending...' : 'Send Email'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Send WhatsApp Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={sendPayslipWhatsApp}
          disabled={sendingWhatsApp}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.actionButtonGradient}
          >
            {sendingWhatsApp ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons name="chat" size={24} color="#FFFFFF" />
            )}
            <Text style={styles.actionButtonText}>
              {sendingWhatsApp ? 'Opening...' : 'Send WhatsApp'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Download Button */}
        <TouchableOpacity style={styles.actionButton} onPress={downloadPayslip}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.actionButtonGradient}
          >
            <MaterialIcons name="download" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Download</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Share & Print Button */}
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={navigateToShare}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.actionButtonGradient}
          >
            <MaterialIcons name="share" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share & Print</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <View style={styles.poweredBy}>
        <Text style={styles.poweredByText}>Powered by</Text>
        <Image
          source={{ uri: "https://res.cloudinary.com/dndzbt8al/image/upload/v1743846882/logo-01_1_a2qvzt.png" }}
          style={styles.zapploLogo}
        />
      </View>
      <Text style={styles.footerText}>
        This is a computer-generated document. No signature is required.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <NavbarTwo title="Payslip Details" />
      
      {/* Share Button - FAB Style */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={navigateToShare}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FC8929', '#f0be95']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <MaterialIcons name="share" size={28} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {renderCompanyHeader()}
        {renderEmployeeDetails()}
        {renderBankDetails()}
        {renderSalaryBreakdown()}
        {renderNetPaySummary()}
        {renderFooter()}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
  },
  companyHeader: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  companyHeaderGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  companyAddress: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 2,
  },
  companyContact: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 2,
  },
  companyEmail: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
  },
  payslipTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  employeeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bankCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    flex: 1,
  },
  detailValue: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'right',
  },
  salaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  salaryHeaderRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  salaryHeaderText: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#3B82F6',
    flex: 1,
    textAlign: 'center',
  },
  salaryRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  salaryLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 11,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  salaryAmount: {
    fontFamily: 'LatoBold',
    fontSize: 11,
    color: '#10B981',
    flex: 1,
    textAlign: 'center',
  },
  deductionAmount: {
    fontFamily: 'LatoBold',
    fontSize: 11,
    color: '#EF4444',
    flex: 1,
    textAlign: 'center',
  },
  totalRow: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    borderRadius: 8,
    marginTop: 8,
    borderBottomWidth: 0,
  },
  totalLabel: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  totalAmount: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#3B82F6',
    flex: 1,
    textAlign: 'center',
  },
  totalDeductionAmount: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#EF4444',
    flex: 1,
    textAlign: 'center',
  },
  netPayCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  netPayGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
  },
  netPayContent: {
    flexDirection: 'row',
    gap: 16,
  },
  netPayLeft: {
    flex: 1,
  },
  netPayLabel: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 4,
  },
  netPayAmount: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: '#3B82F6',
  },
  netPayRight: {
    flex: 1,
  },
  amountInWordsLabel: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 4,
  },
  amountInWordsText: {
    fontFamily: 'LatoRegular',
    fontSize: 11,
    color: '#FFFFFF',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  actionButtonsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  actionButtonsTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  actionButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  actionButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  footer: {
    marginHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  poweredBy: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  poweredByText: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
  },
  zapploLogo: {
    height: 16,
    width: 60,
    resizeMode: 'contain',
  },
  footerText: {
    fontFamily: 'LatoRegular',
    fontSize: 11,
    color: '#A9A9A9',
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});