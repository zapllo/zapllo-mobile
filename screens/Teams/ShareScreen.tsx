import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
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
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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
  country: string;
  bankDetails: {
    bankName: string;
    branchName: string;
    accountNumber: string;
    ifscCode: string;
  };
}

interface ShareScreenProps {
  userId?: string;
  monthYear?: string;
}

export default function ShareScreen({ userId, monthYear }: ShareScreenProps) {
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [payslipData, setPayslipData] = useState<PayslipData | null>(null);
  const [payslipLogData, setPayslipLogData] = useState<PayslipLogData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [totalWorkingDays, setTotalWorkingDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPrint, setLoadingPrint] = useState(false);
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

  const handlePrint = async () => {
    try {
      setLoadingPrint(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (!payslipLogData || !userData || !payslipData) {
        Alert.alert('Error', 'Payslip data not available');
        return;
      }

      const grossPay = payslipLogData.salaryDetails.reduce((total, item) => total + (item.amount || 0), 0);
      const totalDeductions = payslipLogData.deductionDetails.reduce((total, item) => total + (item.amount || 0), 0);
      const netPay = grossPay - totalDeductions;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payslip - ${format(new Date(year, month - 1), "MMMM yyyy")}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: white;
              color: black;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #e5e7eb;
            }
            .header {
              padding: 24px;
              border-bottom: 1px solid #e5e7eb;
            }
            .company-info {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 16px;
            }
            .company-details h1 {
              font-size: 24px;
              font-weight: bold;
              color: #374151;
              margin: 0 0 4px 0;
            }
            .company-details p {
              color: #6b7280;
              font-size: 14px;
              margin: 2px 0;
            }
            .company-logo {
              height: 80px;
              width: auto;
            }
            .payslip-title {
              text-align: center;
              font-size: 20px;
              font-weight: 600;
              margin-top: 16px;
              padding: 12px;
              color: #1d4ed8;
              background-color: #f3f4f6;
              border-radius: 8px;
            }
            .content {
              padding: 24px;
            }
            .section-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 12px;
              color: #374151;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
              font-size: 14px;
              background: white;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 12px 8px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: 600;
            }
            .bg-gray-50 {
              background-color: #f9fafb;
            }
            .text-right {
              text-align: right;
            }
            .text-blue-700 {
              color: #1d4ed8;
            }
            .text-red-700 {
              color: #b91c1c;
            }
            .font-bold {
              font-weight: bold;
            }
            .net-pay-summary {
              background-color: #eff6ff;
              padding: 16px;
              border-radius: 8px;
              margin-bottom: 24px;
              border: 1px solid #bfdbfe;
            }
            .net-pay-content {
              display: flex;
              justify-content: space-between;
              gap: 16px;
            }
            .net-pay-amount {
              font-size: 24px;
              font-weight: bold;
              color: #1d4ed8;
            }
            .footer {
              border-top: 1px solid #e5e7eb;
              padding-top: 16px;
              margin-top: 24px;
            }
            .powered-by {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 8px;
              margin-bottom: 16px;
              font-size: 12px;
              color: #6b7280;
            }
            .zapllo-logo {
              height: 16px;
            }
            .footer-text {
              font-size: 11px;
              color: #6b7280;
              text-align: center;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .container { box-shadow: none; border: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                <div class="company-details">
                  <h1>${payslipData.name}</h1>
                  <p>${payslipData.address}</p>
                  <p>Mob: ${payslipData.contact}</p>
                  <p>${payslipData.emailOrWebsite}</p>
                </div>
                ${payslipData.logo ? `<img src="${payslipData.logo}" alt="Company Logo" class="company-logo" />` : ''}
              </div>
              <h2 class="payslip-title">PAYSLIP - ${format(new Date(year, month - 1), "MMMM yyyy")}</h2>
            </div>

            <!-- Content -->
            <div class="content">
              <!-- Employee Information -->
              <h3 class="section-title">Employee Information</h3>
              <table>
                <tbody>
                  <tr>
                    <td class="bg-gray-50 font-bold">Employee Name:</td>
                    <td>${userData.firstName} ${userData.lastName}</td>
                    <td class="bg-gray-50 font-bold">Employee Code:</td>
                    <td>${userData.employeeId || "-"}</td>
                  </tr>
                  <tr>
                    <td class="bg-gray-50 font-bold">Designation:</td>
                    <td>${userData.designation || "-"}</td>
                    <td class="bg-gray-50 font-bold">Department:</td>
                    <td>${userData.department || "-"}</td>
                  </tr>
                  <tr>
                    <td class="bg-gray-50 font-bold">Work Location:</td>
                    <td>${userData.branch || "-"}</td>
                    <td class="bg-gray-50 font-bold">Working Days:</td>
                    <td>${totalWorkingDays || "-"}</td>
                  </tr>
                </tbody>
              </table>

              ${userData.bankDetails ? `
              <!-- Bank Details -->
              <h3 class="section-title">Bank Details</h3>
              <table>
                <tbody>
                  <tr>
                    <td class="bg-gray-50 font-bold">Bank Name:</td>
                    <td>${userData.bankDetails.bankName || "-"}</td>
                    <td class="bg-gray-50 font-bold">Branch:</td>
                    <td>${userData.bankDetails.branchName || "-"}</td>
                  </tr>
                  <tr>
                    <td class="bg-gray-50 font-bold">Account Number:</td>
                    <td>${userData.bankDetails.accountNumber || "-"}</td>
                    <td class="bg-gray-50 font-bold">IFSC Code:</td>
                    <td>${userData.bankDetails.ifscCode || "-"}</td>
                  </tr>
                </tbody>
              </table>
              ` : ''}

              <!-- Earnings & Deductions -->
              <h3 class="section-title">Earnings & Deductions</h3>
              <table>
                <thead>
                  <tr class="bg-blue-50">
                    <th class="text-blue-700">Standard Salary</th>
                    <th class="text-blue-700 text-right">Amount</th>
                    <th class="text-red-700">Deductions</th>
                    <th class="text-red-700 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${payslipLogData.salaryDetails.map((allowance, index) => `
                    <tr class="${index % 2 === 0 ? 'bg-gray-50' : ''}">
                      <td>${allowance.name}</td>
                      <td class="text-right">₹ ${allowance.amount.toLocaleString('en-IN')}</td>
                      <td>${payslipLogData.deductionDetails[index]?.name || "-"}</td>
                      <td class="text-right">
                        ${payslipLogData.deductionDetails[index]?.amount 
                          ? `₹ ${payslipLogData.deductionDetails[index].amount.toLocaleString('en-IN')}` 
                          : "-"}
                      </td>
                    </tr>
                  `).join('')}
                  <tr class="font-bold bg-gray-100">
                    <td>Gross Pay</td>
                    <td class="text-right text-blue-700">₹ ${grossPay.toLocaleString('en-IN')}</td>
                    <td>Total Deductions</td>
                    <td class="text-right text-red-700">₹ ${totalDeductions.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>

              <!-- Net Pay Summary -->
              <div class="net-pay-summary">
                <div class="net-pay-content">
                  <div>
                    <h3 class="font-bold text-gray-700" style="margin-bottom: 4px;">Net Pay:</h3>
                    <p class="net-pay-amount">₹ ${netPay.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-700" style="margin-bottom: 4px;">Amount in Words:</h3>
                    <p style="font-style: italic;">${numberToWords(netPay)} Only</p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <div class="powered-by">
                  <span class="font-medium">Powered by</span>
                  <img src="https://res.cloudinary.com/dndzbt8al/image/upload/v1743846882/logo-01_1_a2qvzt.png" alt="Zapllo" class="zapllo-logo" />
                </div>
                <p class="footer-text">This is a computer-generated document. No signature is required.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Print.printAsync({
        uri,
        printerUrl: undefined,
      });

      Alert.alert('Success', 'Payslip printed successfully');
    } catch (error) {
      console.error('Error printing payslip:', error);
      Alert.alert('Error', 'Failed to print payslip');
    } finally {
      setLoadingPrint(false);
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

  if (loading || loadingPrint) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Share Payslip" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FC8929" />
          <Text style={styles.loadingText}>
            {loadingPrint ? 'Preparing print...' : 'Loading payslip...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!payslipLogData || !userData || !payslipData) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Share Payslip" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="receipt-long" size={64} color="#F59E0B" />
          <Text style={styles.errorTitle}>No Payslip Data Available</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <NavbarTwo title="Share Payslip" />
      
      {/* Action Buttons - Top Professional Layout */}
      <View style={styles.topActionButtonsContainer}>
        <TouchableOpacity 
          style={styles.topActionButton} 
          onPress={handlePrint}
          disabled={loadingPrint}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.topActionButtonGradient}
          >
            {loadingPrint ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons name="print" size={20} color="#FFFFFF" />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.topActionButton} 
          onPress={sendPayslipEmail}
          disabled={sendingEmail}
        >
          <LinearGradient
            colors={['#3B82F6', '#1E40AF']}
            style={styles.topActionButtonGradient}
          >
            {sendingEmail ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons name="email" size={20} color="#FFFFFF" />
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.topActionButton} 
          onPress={sendPayslipWhatsApp}
          disabled={sendingWhatsApp}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.topActionButtonGradient}
          >
            {sendingWhatsApp ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons name="chat" size={20} color="#FFFFFF" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Payslip Content - Mobile Responsive */}
        <View style={styles.payslipContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.companyInfo}>
              <View style={styles.companyDetails}>
                <Text style={styles.companyName}>{payslipData.name}</Text>
                <Text style={styles.companyAddress}>{payslipData.address}</Text>
                <Text style={styles.companyContact}>Mob: {payslipData.contact}</Text>
                <Text style={styles.companyEmail}>{payslipData.emailOrWebsite}</Text>
              </View>
              {payslipData.logo && (
                <Image
                  source={{ uri: payslipData.logo }}
                  style={styles.companyLogo}
                />
              )}
            </View>
            <Text style={styles.payslipTitle}>
              PAYSLIP - {format(new Date(year, month - 1), "MMMM yyyy")}
            </Text>
          </View>

          {/* Employee Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employee Information</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeaderCell}>Employee Name:</Text>
                <Text style={styles.tableCell}>{userData.firstName} {userData.lastName}</Text>
                <Text style={styles.tableHeaderCell}>Employee Code:</Text>
                <Text style={styles.tableCell}>{userData.employeeId || "-"}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeaderCell}>Designation:</Text>
                <Text style={styles.tableCell}>{userData.designation || "-"}</Text>
                <Text style={styles.tableHeaderCell}>Department:</Text>
                <Text style={styles.tableCell}>{userData.department || "-"}</Text>
              </View>
              <View style={styles.tableRow}>
                <Text style={styles.tableHeaderCell}>Work Location:</Text>
                <Text style={styles.tableCell}>{userData.branch || "-"}</Text>
                <Text style={styles.tableHeaderCell}>Working Days:</Text>
                <Text style={styles.tableCell}>{totalWorkingDays || "-"}</Text>
              </View>
            </View>
          </View>

          {/* Bank Details */}
          {userData.bankDetails && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bank Details</Text>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeaderCell}>Bank Name:</Text>
                  <Text style={styles.tableCell}>{userData.bankDetails.bankName || "-"}</Text>
                  <Text style={styles.tableHeaderCell}>Branch:</Text>
                  <Text style={styles.tableCell}>{userData.bankDetails.branchName || "-"}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeaderCell}>Account Number:</Text>
                  <Text style={styles.tableCell}>{userData.bankDetails.accountNumber || "-"}</Text>
                  <Text style={styles.tableHeaderCell}>IFSC Code:</Text>
                  <Text style={styles.tableCell}>{userData.bankDetails.ifscCode || "-"}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Earnings & Deductions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earnings & Deductions</Text>
            <View style={styles.salaryTable}>
              <View style={styles.salaryHeaderRow}>
                <Text style={styles.salaryHeaderText}>Standard Salary</Text>
                <Text style={styles.salaryHeaderText}>Amount</Text>
                <Text style={styles.salaryHeaderText}>Deductions</Text>
                <Text style={styles.salaryHeaderText}>Amount</Text>
              </View>
              {payslipLogData.salaryDetails.map((allowance, index) => (
                <View key={index} style={[styles.salaryRow, index % 2 === 0 && styles.evenRow]}>
                  <Text style={styles.salaryCell}>{allowance.name}</Text>
                  <Text style={[styles.salaryCell, styles.rightAlign]}>₹ {allowance.amount.toLocaleString('en-IN')}</Text>
                  <Text style={styles.salaryCell}>
                    {payslipLogData.deductionDetails[index]?.name || "-"}
                  </Text>
                  <Text style={[styles.salaryCell, styles.rightAlign]}>
                    {payslipLogData.deductionDetails[index]?.amount 
                      ? `₹ ${payslipLogData.deductionDetails[index].amount.toLocaleString('en-IN')}` 
                      : "-"}
                  </Text>
                </View>
              ))}
              <View style={[styles.salaryRow, styles.totalRow]}>
                <Text style={styles.totalCell}>Gross Pay</Text>
                <Text style={[styles.totalCell, styles.rightAlign, styles.blueText]}>
                  ₹ {grossPay.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.totalCell}>Total Deductions</Text>
                <Text style={[styles.totalCell, styles.rightAlign, styles.redText]}>
                  ₹ {totalDeductions.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>

          {/* Net Pay Summary */}
          <View style={styles.netPaySummary}>
            <View style={styles.netPayContent}>
              <View style={styles.netPayLeft}>
                <Text style={styles.netPayLabel}>Net Pay:</Text>
                <Text style={styles.netPayAmount}>₹ {netPay.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.netPayRight}>
                <Text style={styles.amountInWordsLabel}>Amount in Words:</Text>
                <Text style={styles.amountInWordsText}>
                  {numberToWords(netPay)} Only
                </Text>
              </View>
            </View>
          </View>

          {/* Footer */}
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
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  payslipContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  companyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontFamily: 'LatoBold',
    color: '#374151',
    marginBottom: 4,
  },
  companyAddress: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'LatoRegular',
    marginBottom: 2,
  },
  companyContact: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'LatoRegular',
    marginBottom: 2,
  },
  companyEmail: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'LatoRegular',
  },
  companyLogo: {
    height: 80,
    width: 80,
    resizeMode: 'contain',
  },
  payslipTitle: {
    fontSize: 20,
    fontFamily: 'LatoBold',
    textAlign: 'center',
    marginTop: 16,
    paddingTop: 12,
    color: '#1D4ED8',
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 8,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'LatoBold',
    marginBottom: 12,
    color: '#374151',
  },
  table: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F9FAFB',
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
  },
  tableCell: {
    flex: 1,
    padding: 12,
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
  },
  salaryTable: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  salaryHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
  },
  salaryHeaderText: {
    flex: 1,
    padding: 12,
    fontFamily: 'LatoBold',
    fontSize: 14,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
  },
  salaryRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  evenRow: {
    backgroundColor: '#F9FAFB',
  },
  salaryCell: {
    flex: 1,
    padding: 12,
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
    textAlign: 'center',
  },
  rightAlign: {
    textAlign: 'right',
  },
  totalRow: {
    backgroundColor: '#F3F4F6',
  },
  totalCell: {
    flex: 1,
    padding: 12,
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#000000',
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
    textAlign: 'center',
  },
  blueText: {
    color: '#1D4ED8',
  },
  redText: {
    color: '#B91C1C',
  },
  netPaySummary: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 8,
    margin: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  netPayContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  netPayLeft: {
    flex: 1,
  },
  netPayLabel: {
    fontFamily: 'LatoBold',
    color: '#374151',
    marginBottom: 4,
  },
  netPayAmount: {
    fontSize: 24,
    fontFamily: 'LatoBold',
    color: '#1D4ED8',
  },
  netPayRight: {
    flex: 1,
  },
  amountInWordsLabel: {
    fontFamily: 'LatoBold',
    color: '#374151',
    marginBottom: 4,
  },
  amountInWordsText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    fontStyle: 'italic',
    color: '#000000',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    margin: 24,
    marginTop: 0,
  },
  poweredBy: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  poweredByText: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#6B7280',
  },
  zapploLogo: {
    height: 16,
    width: 60,
    resizeMode: 'contain',
  },
  footerText: {
    fontFamily: 'LatoRegular',
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  topActionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  topActionButton: {
    borderRadius: 50,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  topActionButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});