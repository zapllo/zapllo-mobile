import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import NavbarTwo from '~/components/navbarTwo';
import InputContainer from '~/components/InputContainer';
import ToggleSwitch from '~/components/ToggleSwitch';
import CheckboxTwo from '~/components/CheckBoxTwo';
import axios from 'axios';

interface LeaveType {
  id?: string;
  title: string;
  isPaid: boolean;
  allotted: number;
  description: string;
  backdatedLeaveDays: number;
  advanceLeaveDays: number;
  isFullDay: boolean;
  isHalfDay: boolean;
  isShortLeave: boolean;
  isHoliday: boolean;
  isWeekOff: boolean;
  isReset: boolean;
}
export default function MyLeavesScreen() {
  return (
    <View>
      <Text>MyLeavesScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
