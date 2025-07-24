import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ShareScreen from '~/screens/Teams/ShareScreen';

export default function SharePage() {
  const { params } = useLocalSearchParams();
  
  // Extract userId and monthYear from params array
  // Route: /teams/payslip/share/userId/month-year
  const [userId, monthYear] = Array.isArray(params) ? params : [params];
  
  return <ShareScreen userId={userId} monthYear={monthYear} />;
}