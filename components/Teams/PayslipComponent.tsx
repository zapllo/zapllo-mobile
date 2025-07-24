import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import CustomDropdown from '~/components/customDropDown';
import CustomSplashScreen from '~/components/CustomSplashScreen';
import * as Haptics from 'expo-haptics';

interface PayslipComponentProps {
  userId: string;
}

export default function PayslipComponent({ userId }: PayslipComponentProps) {
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [showSplashScreen, setShowSplashScreen] = useState(false);

  // Generate month options
  const monthOptions = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  // Generate year options (current year and previous 2 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i < 3; i++) {
    const yearValue = currentYear - i;
    yearOptions.push({ label: yearValue.toString(), value: yearValue });
  }

  const generatePayslip = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await axios.post(`${backend_Host}/payslip/generate`, {
        userId,
        month,
        year,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Show custom splash screen instead of alert
        setShowSplashScreen(true);
      }
    } catch (error) {
      console.error('Error generating payslip:', error);
      Alert.alert('Error', 'Failed to generate payslip');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = () => {
    router.push(`/(routes)/teams/payslip/${userId}/${month}-${year}`);
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          {/* Payslip Generator Card */}
          <View style={styles.payslipCard}>
            <LinearGradient
              colors={['rgba(129, 91, 245, 0.1)', 'rgba(252, 137, 41, 0.05)']}
              style={styles.payslipCardGradient}
            >
              <Text style={styles.payslipCardTitle}>Generate Payslip</Text>
              <Text style={styles.payslipCardDescription}>
                Select month and year to generate employee payslip
              </Text>
              
              {/* Month and Year Selection */}
              <View style={styles.dropdownContainer}>
                <View style={styles.dropdownRow}>
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownLabel}>Month</Text>
                    <CustomDropdown
                      data={monthOptions}
                      placeholder="Select Month"
                      selectedValue={month}
                      onSelect={(value) => setMonth(value)}
                    />
                  </View>
                  
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownLabel}>Year</Text>
                    <CustomDropdown
                      data={yearOptions}
                      placeholder="Select Year"
                      selectedValue={year}
                      onSelect={(value) => setYear(value)}
                    />
                  </View>
                </View>
              </View>

              {/* Selected Month/Year Display */}
              <View style={styles.selectedDisplay}>
                <Text style={styles.selectedLabel}>Selected Period:</Text>
                <Text style={styles.selectedValue}>
                  {monthOptions.find(m => m.value === month)?.label} {year}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={generatePayslip}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={['#815BF5', '#aa90f5']}
                    style={styles.generateButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <MaterialIcons name="receipt" size={20} color="#FFFFFF" />
                    )}
                    <Text style={styles.generateButtonText}>
                      {loading ? 'Generating...' : 'Generate Payslip'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={handleViewPayslip}
                >
                  <LinearGradient
                    colors={['#5c5c5c', '#bbbbbb']}
                    style={styles.viewButtonGradient}
                  >
                    <MaterialIcons name="visibility" size={20} color="#FFFFFF" />
                    <Text style={styles.viewButtonText}>View Payslip</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/* Information Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialIcons name="info" size={24} color="#3B82F6" />
              <Text style={styles.infoTitle}>How it works</Text>
            </View>
            
            <View style={styles.infoContent}>
              <View style={styles.infoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Select the month and year for the payslip</Text>
              </View>
              
              <View style={styles.infoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Click "Generate Payslip" to create the payslip</Text>
              </View>
              
              <View style={styles.infoStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Click "View Payslip" to see the detailed payslip</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Custom Splash Screen for Payslip Generation */}
      <CustomSplashScreen
        visible={showSplashScreen}
        lottieSource={require('../../assets/Animation/success.json')}
        mainText="Success!"
        subtitle="Payslip generated successfully. You can now view or share the payslip."
        duration={3000}
        onComplete={() => setShowSplashScreen(false)}
        onDismiss={() => setShowSplashScreen(false)}
      />
    </>
  );
}

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
    marginBottom: 20,
  },
  headerInfo: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
    maxWidth: 280,
  },
  payslipCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  payslipCardGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  payslipCardTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  payslipCardDescription: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    textAlign: 'center',
    marginBottom: 24,
  },
  dropdownContainer: {
    marginBottom: 20,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownItem: {
    flex: 1,
  },
  dropdownLabel: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  selectedDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  selectedLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 4,
  },
  selectedValue: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#815BF5',
  },
  buttonContainer: {
    gap: 12,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  generateButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  viewButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  viewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  viewButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  infoContent: {
    gap: 12,
  },
  infoStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#815BF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  stepText: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    flex: 1,
    lineHeight: 16,
  },
  bottomPadding: {
    height: 20,
  },
});