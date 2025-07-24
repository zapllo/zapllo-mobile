import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import PayslipDetailScreen from '~/screens/Teams/PayslipDetailScreen';

export default function PayslipDetailPage() {
  const { params } = useLocalSearchParams();
  
  // Extract userId and monthYear from params array
  // Route: /teams/payslip/userId/month-year
  const [userId, monthYear] = Array.isArray(params) ? params : [params];
  
  return <PayslipDetailScreen userId={userId} monthYear={monthYear} />;
}