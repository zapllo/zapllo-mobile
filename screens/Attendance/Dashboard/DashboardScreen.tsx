
import React, { useState, useEffect } from "react";
import { Keyboard, KeyboardAvoidingView, SafeAreaView, ScrollView, Text, TouchableOpacity, TouchableWithoutFeedback, View, StyleSheet, Image, ActivityIndicator, Platform } from "react-native";
import Navbar from "~/components/navbar";
import { PieChart } from 'react-native-gifted-charts';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { LinearGradient } from "expo-linear-gradient";
import DateRangeDropdown from "~/components/DateRangeDropdown/DateRangeDropdown";
import Modal from 'react-native-modal';

import CustomDropdown from "~/components/customDropDown";
import axios from 'axios';
import { format, startOfWeek, endOfWeek, subWeeks, subMonths, startOfMonth, endOfMonth, endOfDay } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Fontisto } from "@expo/vector-icons";

// Types
interface ChartData {
  value: number;
  color: string;
  label: string;
  focused: boolean;
}

type ReportOption = 'Present' | 'OnLeave' | 'Absent';
type ReportType = "Daily" | "Cumulative" | "Monthly";
type ReportOpctionAdmin = "All" | 'Present' | 'OnLeave' | 'Absent';

interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  reportingManager?: string;
}

interface ReportEntry {
  user: string;
  status: string;
  loginTime: string;
  logoutTime: string;
  totalDuration: string;
}

interface UserwiseReport {
  user: string;
  present: number;
  leave: number;
  absent: number;
  reportingManager: string;
}

interface AttendanceEntry {
  date: string;
  day: string;
  present: number;
  leave: number;
  absent: number;
  total: number;
  holiday: number;
}

interface LeaveEntry {
  leaveType: string;
  fromDate: string;
  toDate: string;
  status: string;
}

interface HolidayEntry {
  holidayName: string;
  holidayDate: string;
}

export default function DashboardScreen() {
  const initialData: ChartData[] = [
    { value: 30, color: '#FDB314', label: 'In Office', focused: true },
    { value: 10, color: '#06D6A0', label: 'Holiday', focused: false },
    { value: 40, color: '#A914DD', label: 'WFH', focused: false },
    { value: 20, color: '#EF4444', label: 'On Leave', focused: false },
  ];
  const [role, setRole] = useState<string | null>(null);
  const allowedRoles = ['orgAdmin', 'manager']; // Roles that can access Team Details
  const adminRoles = ['orgAdmin']; // Roles with full admin privileges
  const disallowedRoles = ['member']; // Roles restricted from Team Details

  // Check if user has appropriate role
  const canAccessTeamDetails = role ? allowedRoles.includes(role) : false;
  const hasAdminPrivileges = role ? adminRoles.includes(role) : false;

  const [data, setData] = useState<ChartData[]>(initialData);
  const [selectedSegment, setSelectedSegment] = useState<ChartData | null>(null);
  const [animatedData, setAnimatedData] = useState<ChartData[]>(
    initialData.map(item => ({ ...item, value: 0 }))
  );
  const [selectedReport, setSelectedReport] = useState<ReportOption>('Present');
  const [selectedReportAdmin, setSelectedReportAdmin] = useState<ReportOpctionAdmin>('All');
  const [selectReportType, setSelectReportType] = useState<ReportType>("Daily");
  const [userRole, setUserRole] = useState<"Admin" | "User">("User"); // Default as User
  const [showBackendView, setShowBackendView] = useState(false);
  
  const chartProgress = useSharedValue(0);
  const chartScale = useSharedValue(1);
  const legendOpacity = useSharedValue(0);
  const [selectedOption, setSelectedOption] = useState('My');
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isManagerSelect, setIsManagerSelect] = useState<string | null>(null);
  const [isEmployeeSelect, setIsEmployeeSelect] = useState<string | null>(null);
  
  // API data states
  const [managers, setManagers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyReport, setDailyReport] = useState<ReportEntry[]>([]);
  const [filteredDailyReport, setFilteredDailyReport] = useState<ReportEntry[]>([]);
  const [dailyTotalCount, setDailyTotalCount] = useState<number>(0);
  const [dailyPresentCount, setDailyPresentCount] = useState<number>(0);
  const [dailyOnLeaveCount, setDailyOnLeaveCount] = useState<number>(0);
  const [dailyAbsentCount, setDailyAbsentCount] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Monthly report states
  const [monthlyReport, setMonthlyReport] = useState<AttendanceEntry[]>([]);
  const [totalDays, setTotalDays] = useState<number>(0);
  const [presentCount, setPresentCount] = useState<number>(0);
  const [leaveCount, setLeaveCount] = useState<number>(0);
  const [absentCount, setAbsentCount] = useState<number>(0);
  const [holidayCount, setHolidayCount] = useState<number>(0);
  const [workingDays, setWorkingDays] = useState<number>(0);
  
  // Cumulative report states
  const [report, setReport] = useState<UserwiseReport[]>([]);
  const [totalCumulativeDays, setTotalCumulativeDays] = useState<number>(0);
  const [holidaysCumulative, setHolidaysCumulative] = useState<number>(0);
  const [weekOffs, setWeekOffs] = useState<number>(0);
  const [period, setPeriod] = useState('thisWeek');
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());
  
  // Date handling
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(`${currentYear}-${currentMonth}`);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(new Date());
  const openDatePicker = () => {
    setTempSelectedDate(date);
    setDatePickerVisible(true);
  };
  
  const cancelIOSDateSelection = () => {
    setDatePickerVisible(false);
  };
  
  const confirmIOSDateSelection = () => {
    setDate(tempSelectedDate);
    setSelectedDate(tempSelectedDate.toISOString().split('T')[0]);
    setFormattedSelectedDate(format(tempSelectedDate, 'EEEE, MMMM dd'));
    fetchDailyReport(tempSelectedDate.toISOString().split('T')[0]);
    setDatePickerVisible(false);
  };
  
  // Generate month options
  const generateMonthOptions = () => {
    const months = [
      { name: 'Jan', value: '01' },
      { name: 'Feb', value: '02' },
      { name: 'Mar', value: '03' },
      { name: 'Apr', value: '04' },
      { name: 'May', value: '05' },
      { name: 'Jun', value: '06' },
      { name: 'Jul', value: '07' },
      { name: 'Aug', value: '08' },
      { name: 'Sep', value: '09' },
      { name: 'Oct', value: '10' },
      { name: 'Nov', value: '11' },
      { name: 'Dec', value: '12' }
    ];
    
    // Return an array with both the display format and the actual value
    return months.map((month) => ({
      display: `${month.name}-${currentYear.toString().slice(-2)}`, // e.g., Sep-24
      value: `${currentYear}-${month.value}` // e.g., 2024-09
    }));
  };
  const [formattedSelectedDate, setFormattedSelectedDate] = useState<string>(format(new Date(), 'EEEE, MMMM dd'));
  const monthOptions = generateMonthOptions();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [myMonthlyReport, setMyMonthlyReport] = useState<AttendanceEntry[]>([]);
  const [mySelectedMonth, setMySelectedMonth] = useState<string>(`${currentYear}-${currentMonth}`);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [monthPickerDate, setMonthPickerDate] = useState(new Date());
  const [isMyReportLoading, setIsMyReportLoading] = useState(false);

  
// Add this function to fetch user's monthly attendance
const fetchMyMonthlyAttendance = async () => {
  setIsMyReportLoading(true);
  try {
    const response = await fetch(`https://zapllo.com/api/userAttendance?date=${mySelectedMonth}`);
    const data = await response.json();

    // Parse the selected month and year
    const [selectedYearStr, selectedMonthStr] = mySelectedMonth.split('-');
    const selectedYear = parseInt(selectedYearStr, 10);
    const selectedMonth = parseInt(selectedMonthStr, 10) - 1; // JavaScript months are 0-based

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Determine startDate and endDate
    const startDate = new Date(selectedYear, selectedMonth, 1);
    let endDate: Date;

    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      // Selected month is current month, so end date is end of today
      endDate = endOfDay(today); // Set to 23:59:59 of today
    } else {
      // Selected month is not current month, so end date is end of selected month
      const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0); // Last day of the selected month
      endDate = endOfDay(lastDayOfMonth); // Set to 23:59:59 of the last day
    }

    // Filter monthlyReport to include only dates up to endDate
    const filteredMonthlyReport = data.monthlyReport.filter((day: AttendanceEntry) => {
      const dayDate = new Date(day.date);
      return dayDate >= startDate && dayDate <= endDate;
    });

    setMyMonthlyReport(filteredMonthlyReport);
  } catch (error) {
    console.error('Error fetching user monthly attendance:', error);
  } finally {
    setIsMyReportLoading(false);
  }
};


useEffect(() => {
  // Only start animations if we have real data
  if (data.some(item => item.value > 0) && selectedSegment) {
    chartProgress.value = withTiming(1, { duration: 1000 });
    chartScale.value = withSequence(
      withTiming(1.1, { duration: 800 }),
      withTiming(1, { duration: 200 })
    );
    legendOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

    // Animate each segment
    data.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => {
          const newData = [...prev];
          newData[index] = {
            ...newData[index],
            value: item.value
          };
          return newData;
        });
      }, index * 300);
    });
  }
}, [data, selectedSegment]);


// Add this useEffect to fetch user's monthly attendance when the selected month changes
useEffect(() => {
  if (mySelectedMonth) {
    fetchMyMonthlyAttendance();
  }
}, [mySelectedMonth]);

// Add this function to handle month selection
const handleMonthChange = (event: any, selectedDate?: Date) => {
  setShowMonthPicker(false);
  if (selectedDate) {
    setMonthPickerDate(selectedDate);
    // Format the date to YYYY-MM
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    setMySelectedMonth(`${year}-${month}`);
  }
};

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setSelectedDate(selectedDate.toISOString().split('T')[0]);
      setFormattedSelectedDate(format(selectedDate, 'EEEE, MMMM dd'));
  
      // Fetch the daily report for the selected date
      fetchDailyReport(selectedDate.toISOString().split('T')[0]);
    }
  };
  
  useEffect(() => {
    const computeCounts = () => {
      setDailyTotalCount(dailyReport?.length || 0);
      setDailyPresentCount(dailyReport?.filter(entry => entry.status === 'Present').length || 0);
      setDailyOnLeaveCount(dailyReport?.filter(entry => entry.status === 'On Leave').length || 0);
      setDailyAbsentCount(dailyReport?.filter(entry => entry.status === 'Absent').length || 0);
    };
  
    computeCounts();
  }, [dailyReport]);
  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("https://zapllo.com/api/users/organization");
        const result = await response.json();

        if (response.ok) {
          // Set managers and employees from the API response
          setManagers(result.data);
          setEmployees(result.data);
        } else {
          console.error("Error fetching users:", result.error);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch user role
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const res = await axios.get('https://zapllo.com/api/users/me');
        const userRole = res.data.data.role;
        setRole(userRole);
        
        // Update userRole state for backward compatibility with existing code
        if (userRole === 'orgAdmin' || userRole === 'manager') {
          setUserRole('Admin');
        } else {
          setUserRole('User');
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    getUserDetails();
  }, []);

  // Initialize chart animations
  useEffect(() => {
    // Initialize with actual values to prevent NaN
    setAnimatedData(initialData);
    
    // Start animations after a short delay to ensure data is properly initialized
    setTimeout(() => {
      chartProgress.value = withTiming(1, { duration: 1000 });
      chartScale.value = withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 200 })
      );
      legendOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

      // Animate each segment
      initialData.forEach((item, index) => {
        setTimeout(() => {
          setAnimatedData(prev => {
            const newData = [...prev];
            newData[index] = {
              ...newData[index],
              value: item.value // Use direct value instead of withTiming
            };
            return newData;
          });
        }, index * 300);
      });
    }, 100);
  }, []);

  // Initialize chart animations
  useEffect(() => {
    // Initialize with actual values to prevent NaN
    setAnimatedData(initialData);
    
    // Start animations after a short delay to ensure data is properly initialized
    setTimeout(() => {
      chartProgress.value = withTiming(1, { duration: 1000 });
      chartScale.value = withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 200 })
      );
      legendOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

      // Animate each segment
      initialData.forEach((item, index) => {
        setTimeout(() => {
          setAnimatedData(prev => {
            const newData = [...prev];
            newData[index] = {
              ...newData[index],
              value: item.value // Use direct value instead of withTiming
            };
            return newData;
          });
        }, index * 300);
      });
    }, 100);
  }, []);

  // Function to fetch the daily report from the server
  const fetchDailyReport = async (date: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('https://zapllo.com/api/reports/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          managerId: isManagerSelect,
          employeeId: isEmployeeSelect,
        }),
      });
      const data = await res.json();
      setDailyReport(data.report);
  
      // Update formatted date display
      setFormattedSelectedDate(format(new Date(date), 'EEEE, MMMM dd'));
  
      // Set the filtered report to include all entries, not just present
      setFilteredDailyReport(data.report);
  
      // Update counts for all statuses
      setDailyTotalCount(data.report.length);

  
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching daily report:', error);
      setIsLoading(false);
    }
  };


  // Fetch monthly attendance data
  const fetchMonthlyReport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`https://zapllo.com/api/attendance?date=${selectedAttendanceDate}`);
      const data = await response.json();

      // Parse the selected month and year
      const [selectedYearStr, selectedMonthStr] = selectedAttendanceDate.split('-');
      const selectedYear = parseInt(selectedYearStr, 10);
      const selectedMonth = parseInt(selectedMonthStr, 10) - 1; // JavaScript months are 0-based

      // Get today's date
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Determine startDate and endDate
      const startDate = new Date(selectedYear, selectedMonth, 1);
      let endDate: Date;

      if (selectedYear === currentYear && selectedMonth === currentMonth) {
        // Selected month is current month, so end date is end of today
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Set to 23:59:59 of today
      } else {
        // Selected month is not current month, so end date is end of selected month
        const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0); // Last day of the selected month
        endDate = new Date(lastDayOfMonth);
        endDate.setHours(23, 59, 59, 999); // Set to 23:59:59 of the last day
      }

      // Filter monthlyReport to include only dates up to endDate
      const filteredMonthlyReport = data.monthlyReport.filter((day: AttendanceEntry) => {
        const dayDate = new Date(day.date);
        return dayDate >= startDate && dayDate <= endDate;
      });

      // Update state with the filtered report
      setMonthlyReport(filteredMonthlyReport);

      // Calculate summary counts using filteredMonthlyReport
      let totalPresent = 0;
      let totalLeave = 0;
      let totalAbsent = 0;
      let totalHoliday = 0;

      filteredMonthlyReport.forEach((day: any) => {
        totalPresent += day.present;
        totalLeave += day.leave;
        totalAbsent += day.absent;
        totalHoliday += day.holiday;
      });

      setPresentCount(totalPresent);
      setLeaveCount(totalLeave);
      setAbsentCount(totalAbsent);
      setHolidayCount(totalHoliday);
      setTotalDays(filteredMonthlyReport.length);
      setWorkingDays(filteredMonthlyReport.length - totalHoliday);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      setIsLoading(false);
    }
  };

  const fetchCumulativeReport = async () => {
    try {
      setIsLoading(true);
      let startDate: Date;
      let endDate: Date;
  
      if (period === 'thisMonth') {
        startDate = startOfMonth(new Date());
        endDate = new Date();
      } else if (period === 'lastMonth') {
        startDate = startOfMonth(subMonths(new Date(), 1));
        endDate = endOfMonth(subMonths(new Date(), 1));
      } else if (period === 'thisWeek') {
        startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
        endDate = new Date();
      } else if (period === 'lastWeek') {
        startDate = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
      } else {
        console.error("Invalid period specified.");
        setIsLoading(false);
        return;
      }
  
      const res = await fetch('https://zapllo.com/api/reports/cumulative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          managerId: isManagerSelect,
          employeeId: isEmployeeSelect,
        }),
      });
      
      const data = await res.json();
      setReport(data.report);
      setTotalCumulativeDays(data.totalDays);
      setWorkingDays(data.workingDays);
      setHolidaysCumulative(data.holidays.length);
      setWeekOffs(data.weekOffs);
      
      // Update chart data based on cumulative report
      updateChartDataFromReport(data.report);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching cumulative report:', error);
      setIsLoading(false);
    }
  };

  // Update chart data based on report
  const updateChartDataFromReport = (reportData: UserwiseReport[]) => {
    if (!reportData || reportData.length === 0) {
      // Set default chart data when no data is available
      const defaultChartData: ChartData[] = [
        { value: 0, color: '#FDB314', label: 'In Office', focused: true },
        { value: 0, color: '#06D6A0', label: 'Holiday', focused: false },
        { value: 0, color: '#A914DD', label: 'WFH', focused: false },
        { value: 0, color: '#EF4444', label: 'On Leave', focused: false },
      ];
      
      setData(defaultChartData);
      setSelectedSegment(defaultChartData[0]);
      return;
    }
    
    // Calculate totals
    const totalPresent = reportData.reduce((sum, entry) => sum + entry.present, 0);
    const totalLeave = reportData.reduce((sum, entry) => sum + entry.leave, 0);
    const totalAbsent = reportData.reduce((sum, entry) => sum + entry.absent, 0);
    const total = totalPresent + totalLeave + totalAbsent + holidaysCumulative;
    
    if (total === 0) {
      // Set default chart data when total is zero
      const defaultChartData: ChartData[] = [
        { value: 0, color: '#FDB314', label: 'In Office', focused: true },
        { value: 0, color: '#06D6A0', label: 'Holiday', focused: false },
        { value: 0, color: '#A914DD', label: 'WFH', focused: false },
        { value: 0, color: '#EF4444', label: 'On Leave', focused: false },
      ];
      
      setData(defaultChartData);
      setSelectedSegment(defaultChartData[0]);
      return;
    }
    
    // Calculate percentages
    const presentPercentage = Math.round((totalPresent / total) * 100);
    const leavePercentage = Math.round((totalLeave / total) * 100);
    const absentPercentage = Math.round((totalAbsent / total) * 100);
    const holidayPercentage = Math.round((holidaysCumulative / total) * 100);
    
    // Update chart data
    const newChartData: ChartData[] = [
      { value: presentPercentage, color: '#FDB314', label: 'In Office', focused: true },
      { value: holidayPercentage, color: '#06D6A0', label: 'Holiday', focused: false },
      { value: absentPercentage, color: '#A914DD', label: 'WFH', focused: false },
      { value: leavePercentage, color: '#EF4444', label: 'On Leave', focused: false },
    ];
    
    setData(newChartData);
    setSelectedSegment(newChartData[0]);
    
    // Animate the new data
    newChartData.forEach((item, index) => {
      setTimeout(() => {
        setAnimatedData(prev => {
          const updatedData = [...prev];
          updatedData[index] = {
            ...updatedData[index],
            value: item.value
          };
          return updatedData;
        });
      }, index * 300);
    });
    
    // Trigger haptic feedback when chart updates
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate chart scale for visual feedback
    chartScale.value = withSequence(
      withTiming(1.05, { duration: 300 }),
      withTiming(1, { duration: 200 })
    );
  };

  // Fetch daily report when date or filters change
  useEffect(() => {
    if (selectedDate) {
      fetchDailyReport(selectedDate);
    }
  }, [selectedDate, isManagerSelect, isEmployeeSelect]);

  // Fetch monthly report when month changes
  useEffect(() => {
    if (selectedAttendanceDate && selectReportType === 'Monthly') {
      fetchMonthlyReport();
    }
  }, [selectedAttendanceDate, selectReportType]);
  useEffect(() => {
    // Fetch cumulative report on component mount to initialize chart with real data
    if (period) {
      fetchCumulativeReport();
    }
  }, []);
  

  // Update report data when report type changes
  useEffect(() => {
    if (selectReportType === 'Daily') {
      fetchDailyReport(selectedDate);
    } else if (selectReportType === 'Monthly') {
      fetchMonthlyReport();
    } else if (selectReportType === 'Cumulative') {
      fetchCumulativeReport();
    }
  }, [selectReportType]);
  useEffect(() => {
    if (selectReportType === 'Cumulative' && period) {
      fetchCumulativeReport();
    }
  }, [period, isManagerSelect, isEmployeeSelect, selectReportType]);

  // Filter daily report based on selected status
  const filterDailyReportByStatus = (reports: ReportEntry[], status: ReportOption) => {
    let filtered = reports;
    
    // If status is not 'All', filter by the selected status
    if (status === 'Present') {
      filtered = reports.filter(entry => entry.status === 'Present');
    } else if (status === 'OnLeave') {
      filtered = reports.filter(entry => entry.status === 'On Leave');
    } else if (status === 'Absent') {
      filtered = reports.filter(entry => entry.status === 'Absent');
    }
    
    setFilteredDailyReport(filtered);
    
    // Update counts
    setDailyTotalCount(reports.length);
    setDailyPresentCount(reports.filter(entry => entry.status === 'Present').length);
    setDailyOnLeaveCount(reports.filter(entry => entry.status === 'On Leave').length);
    setDailyAbsentCount(reports.filter(entry => entry.status === 'Absent').length);
  };


  


  const handleReportTypePress = (option: ReportType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectReportType(option);
  };

  const handleOptionPress = (option: string) => {
    // Always allow access to My Details
    if (option === 'My') {
      setSelectedOption('My');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setShowBackendView(true);
      // Reset to default filter for My view
      filterDailyReportByStatus(dailyReport, selectedReport);
      return;
    }
    
    // For Team Details, only allow access to users with permission
    if (option === 'Team' && !canAccessTeamDetails) {
      // You could show an alert or toast notification here
      return;
    }
    
    setSelectedOption(option);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowBackendView(false);
    
    // Reset to default filter for Team view
    if (selectedReportAdmin === 'All') {
      setFilteredDailyReport(dailyReport);
    } else {
      handleReportOptionPressAdmin(selectedReportAdmin);
    }
  };

  const handleChartPress = (index: number) => {
    if (index >= 0 && index < data.length) {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Update focused state
      const updatedData = data.map((item, idx) => ({
        ...item,
        focused: idx === index
      }));
      setData(updatedData);
      setSelectedSegment(data[index]);

      // Scale animation
      chartScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    console.log('Selected date range:', range);
    // Use the date range as needed
    // For example, filter tasks or fetch data for the selected period
  };
  
  const toggleFilterModal = () => {
    setFilterModalVisible(!isFilterModalVisible);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setIsManagerSelect(null);
    setIsEmployeeSelect(null);
  };

  // Apply filters
  const handleApplyFilters = () => {
    // Fetch data with the selected filters based on current report type
    if (selectReportType === 'Daily') {
      fetchDailyReport(selectedDate);
    } else if (selectReportType === 'Monthly') {
      fetchMonthlyReport();
    } else if (selectReportType === 'Cumulative') {
      fetchCumulativeReport();
    }
    toggleFilterModal();
  };

  // Transform users data for dropdown
  const managerOptions = managers.map(manager => ({
    label: `${manager.firstName} ${manager.lastName}`,
    value: manager._id
  }));

  const employeeOptions = employees.map(employee => ({
    label: `${employee.firstName} ${employee.lastName}`,
    value: employee._id
  }));

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chartScale.value }],
    opacity: chartProgress.value,
  }));

  const legendAnimatedStyle = useAnimatedStyle(() => ({
    opacity: legendOpacity.value,
    transform: [{
      translateX: interpolate(
        legendOpacity.value,
        [0, 1],
        [50, 0]
      )
    }]
  }));

  const handleDateSelection = (date: string) => {
    setSelectedDate(date);
  };

  // Render daily report content

// Render daily report content
const renderDailyReportContent = () => {
  return (
    <>

      

      
      <View className="flex flex-row flex-wrap justify-center gap-2 mb-7">
        <View className="border border-[#37384B] rounded-lg p-2">
          <Text className="text-white text-xs">All: {dailyTotalCount}</Text>
        </View>
        <View className="border border-[#37384B] rounded-lg p-2">
          <Text className="text-green-400 text-xs">Present: {dailyPresentCount}</Text>
        </View>
        <View className="border border-[#37384B] rounded-lg p-2">
          <Text className="text-yellow-400 text-xs">On Leave: {dailyOnLeaveCount}</Text>
        </View>
        <View className="border border-[#37384B] rounded-lg p-2">
          <Text className="text-red-400 text-xs">Absent: {dailyAbsentCount}</Text>
        </View>
      </View>
      
      {isLoading ? (
        <View className="items-center justify-center py-10">
          <ActivityIndicator size="large" color="#815BF5" />
          <Text className="text-white mt-4">Loading report data...</Text>
        </View>
      ) : (
        <View className="border border-[#37384B] rounded-xl mb-4 w-[95%]">
          <View className="flex flex-row bg-[#121435] p-3 rounded-t-xl">
            <Text className="text-[#787CA5] text-xs w-1/4" style={{fontFamily:"Lato"}}>Name</Text>
            <Text className="text-[#787CA5] text-xs w-1/6" style={{fontFamily:"Lato"}}>Status</Text>
            <Text className="text-[#787CA5] text-xs w-1/4" style={{fontFamily:"Lato"}}>Login Time</Text>
            <Text className="text-[#787CA5] text-xs w-1/4" style={{fontFamily:"Lato"}}>Logout Time</Text>
            <Text className="text-[#787CA5] text-xs w-1/5" style={{fontFamily:"Lato"}}>Duration</Text>
          </View>
          
          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
            {filteredDailyReport.length > 0 ? (
              filteredDailyReport.map((entry, index) => (
                <View key={index} className="flex flex-row p-3 border-t border-[#37384B]">
                  <Text className="text-white text-xs w-1/4">{entry.user}</Text>
                  <Text 
                    className={`text-xs w-1/6 ${
                      entry.status === 'Present' ? 'text-green-400' : 
                      entry.status === 'On Leave' ? 'text-yellow-400' : 'text-red-400'
                    }`}
                  >
                    {entry.status}
                  </Text>
                  <Text className="text-white text-xs w-1/4">
                    {entry.loginTime !== 'N/A' && !isNaN(new Date(entry.loginTime).getTime())
                      ? format(new Date(entry.loginTime), 'hh:mm a')
                      : 'N/A'}
                  </Text>
                  <Text className="text-white text-xs w-1/4">
                    {entry.logoutTime !== 'N/A' && !isNaN(new Date(entry.logoutTime).getTime())
                      ? format(new Date(entry.logoutTime), 'hh:mm a')
                      : 'N/A'}
                  </Text>
                  <Text className="text-white text-xs w-1/5">{entry.totalDuration}</Text>
                </View>
              ))
            ) : (
              <View className="p-4">
                <Text className="text-white text-center">No records found for {formattedSelectedDate}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
      

    </>
  );
};


  // Render monthly report content
  const renderMonthlyReportContent = () => {
    return (
      <>

        
        <View className="flex flex-row flex-wrap justify-center gap-2 mb-10">
          <View className="border border-[#37384B] rounded-lg p-2">
            <Text className="text-white text-xs">Total Days: {totalDays}</Text>
          </View>
          <View className="border border-[#37384B] rounded-lg p-2">
            <Text className="text-green-400 text-xs">Present: {presentCount}</Text>
          </View>
          <View className="border border-[#37384B] rounded-lg p-2">
            <Text className="text-yellow-400 text-xs">Leave: {leaveCount}</Text>
          </View>
          <View className="border border-[#37384B] rounded-lg p-2">
            <Text className="text-red-400 text-xs">Absent: {absentCount}</Text>
          </View>
          <View className="border border-[#37384B] rounded-lg p-2">
            <Text className="text-purple-400 text-xs">Holiday: {holidayCount}</Text>
          </View>
        </View>
        
        <View className="border w-[95%] border-[#37384B] rounded-xl mb-4">
          <View className="flex flex-row bg-[#121435] p-3 rounded-t-xl">
            <Text className="text-[#787CA5] text-xs w-1/5" style={{fontFamily:"Lato"}}>Date</Text>
            <Text className="text-[#787CA5] text-xs w-1/6 " style={{fontFamily:"Lato"}}>Day</Text>
            <Text className="text-[#787CA5] text-xs w-1/6"  style={{fontFamily:"Lato"}}>Present</Text>
            <Text className="text-[#787CA5] text-xs w-1/6"style={{fontFamily:"Lato"}}>Leave</Text>
            <Text className="text-[#787CA5] text-xs w-1/6"style={{fontFamily:"Lato"}}>Absent</Text>
            <Text className="text-[#787CA5] text-xs w-1/6"style={{fontFamily:"Lato"}}>Holiday</Text>
          </View>
          
          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
            {monthlyReport.length > 0 ? (
              monthlyReport.map((day, index) => (
                <View key={index} className="flex flex-row p-3 border-t border-[#37384B]">
                  <Text className="text-white text-xs w-1/5 mr-1">
                    {format(new Date(day.date), 'dd/MM/yy')}
                  </Text>
                  <Text className="text-white text-xs w-1/6">{day.day}</Text>
                  <Text className="text-green-400 text-xs w-1/6">{day.present}</Text>
                  <Text className="text-yellow-400 text-xs w-1/6">{day.leave}</Text>
                  <Text className="text-red-400 text-xs w-1/6">{day.absent}</Text>
                  <Text className="text-purple-400 text-xs w-1/6">{day.holiday}</Text>
                </View>
              ))
            ) : (
              <View className="p-4">
                <Text className="text-white text-center">No data available for this month</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </>
    );
  };

  // Render cumulative report content
  const renderCumulativeReportContent = () => {
    return (
      <>

        
        <View className="flex flex-row flex-wrap justify-center gap-2 mb-10 ">
          <View className="border border-[#37384B] rounded-lg p-2">
            <Text className="text-blue-400 text-xs">Total Days: {totalCumulativeDays}</Text>
          </View>
          <View className="border border-[#37384B] rounded-lg p-2">
            <Text className="text-yellow-400 text-xs">Working: {workingDays}</Text>
          </View>
          <View className="border border-[#37384B] rounded-lg p-2">
            <Text className="text-green-400 text-xs">Week Offs: {weekOffs}</Text>
          </View>
          <View className="border border-[#37384B] rounded-lg p-2">
            <Text className="text-red-400 text-xs">Holidays: {holidaysCumulative}</Text>
          </View>
        </View>
        
        <View className="border border-[#37384B] rounded-xl mb-4 w-[95%]">
          <View className="flex flex-row bg-[#121435] p-3 rounded-t-xl">
            <Text className="text-[#787CA5] text-xs w-1/4">Name</Text>
            <Text className="text-[#787CA5] text-xs w-1/6 text-center">Present</Text>
            <Text className="text-[#787CA5] text-xs w-1/6 text-center">Leave</Text>
            <Text className="text-[#787CA5] text-xs w-1/6 text-center">Absent</Text>
            <Text className="text-[#787CA5] text-xs w-2/6">Manager</Text>
          </View>
          
          <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
            {report.length > 0 ? (
              report.map((entry, index) => (
                <View key={index} className="flex flex-row p-3 border-t border-[#37384B]">
                  <Text className="text-white text-xs w-1/4">{entry.user}</Text>
                  <Text className="text-green-400 text-xs w-1/6 text-center">{entry.present}</Text>
                  <Text className="text-yellow-400 text-xs w-1/6 text-center">{entry.leave}</Text>
                  <Text className="text-red-400 text-xs w-1/6 text-center">{entry.absent}</Text>
                  <Text className="text-white text-xs w-2/6">{entry.reportingManager || "Not Assigned"}</Text>
                </View>
              ))
            ) : (
              <View className="p-4">
                <Text className="text-white text-center">No data available for this period</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView className="h-full flex-1 bg-primary ">
      <Navbar title="Dashboard" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, alignItems: 'center',paddingBottom:80 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
 

          {
            userRole === "User" ?
            <></>
            :
            <View className="items-center border border-[#676B93] w-[90%] px-1.5 py-1.5 rounded-full mt-4 mb-2">
            <View className="w-full flex flex-row items-center justify-between">
              <TouchableOpacity
                className="w-1/2 items-center"
                onPress={() => handleOptionPress('My')}
              >
                <LinearGradient
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  colors={selectedOption === 'My' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                  style={styles.tablet}
                >
                  <Text className={`text-sm  ${selectedOption === 'My' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>My Details</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Only render Team Details as active option for allowed roles */}
              {canAccessTeamDetails ? (
                <TouchableOpacity
                  className="w-1/2 items-center"
                  onPress={() => handleOptionPress('Team')}
                >
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={selectedOption === 'Team' ? ["#815BF5", "#FC8929"] : ["#05071E", "#05071E"]}
                    style={styles.tablet}
                  >
                    <Text className={`text-sm  ${selectedOption === 'Team' ? 'text-white' : 'text-[#676B93]'}`} style={{ fontFamily: "LatoBold" }}>Team Details</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View className="w-1/2 items-center opacity-50">
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    colors={["#05071E", "#05071E"]}
                    style={styles.tablet}
                  >
                    <Text className="text-sm text-[#676B93]" style={{ fontFamily: "LatoBold" }}>Team Details</Text>
                  </LinearGradient>
                </View>
              )}
            </View>              
          </View>  
          }
          
          

            <View className="items-center w-[95%] mt-5 rounded-3xl justify-center bg-[#121435] flex flex-row p-6">
              <Animated.View style={[chartAnimatedStyle]} className="items-center">
                <PieChart
                  data={data}
                  showGradient
                  sectionAutoFocus
                  donut
                  radius={80}
                  innerRadius={60}
                  innerCircleColor="#05071E"
                  onPress={handleChartPress}
                  centerLabelComponent={() => (
                    <View className="items-center justify-center">
                      <Text className="text-white text-xl font-bold">
                        {selectedSegment?.value}%
                      </Text>
                      <Text className="text-white text-sm">
                        {selectedSegment?.label}
                      </Text>
                    </View>
                  )}
                />
              </Animated.View>

              <Animated.View 
                className="flex flex-col gap-5 ml-2"
                style={legendAnimatedStyle}
              >
                {data.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleChartPress(index)}
                    className="flex flex-row gap-2 p-2 rounded-lg"
                    style={{
                      backgroundColor: item.focused ? `${item.color}15` : 'transparent',
                    }}
                  >
                    <Text
                      className="text-base font-bold"
                      style={[{
                        color: item.color,
                        opacity: item.focused ? 1 : 0.7
                      }]}
                    >
                      {item.label}
                    </Text>
                    <Text 
                      className="text-xl font-extralight"
                      style={[{
                        color: item.focused ? item.color : "#787CA5",
                        opacity: item.focused ? 1 : 0.7
                      }]}
                    >
                      {animatedData[index].value}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>


          


            {/* only for admin */}
            

            {selectedOption === 'My' 
            ? (
                <View className="w-[93%] mt-9 h-full">
                  <Text className="text-white text-lg mb-4" style={{fontFamily:"LatoBold"}}>My Report</Text>
                  
                  {/* Daily attendance card */}
                  <View className="flex flex-row justify-between p-5 rounded-3xl border border-[#37384B] mb-6">
                    <View>
                      <Text className="text-white text-lg">{format(new Date(selectedDate), 'EEEE')}</Text>
                      <Text className="text-white text-sm">{format(new Date(selectedDate), 'dd/MM/yyyy')}</Text>
                    </View>
                    <Text 
                      className={`text-white self-center p-3 px-5 rounded-2xl text-xs ${
                        dailyReport.find(entry => 
                          entry.user === `${employees.find(emp => emp._id === isEmployeeSelect)?.firstName || ''} ${employees.find(emp => emp._id === isEmployeeSelect)?.lastName || ''}`)?.status === 'Present' 
                          ? 'bg-[#06D6A0]' 
                          : dailyReport.find(entry => 
                            entry.user === `${employees.find(emp => emp._id === isEmployeeSelect)?.firstName || ''} ${employees.find(emp => emp._id === isEmployeeSelect)?.lastName || ''}`)?.status === 'On Leave'
                            ? 'bg-[#FDB314]'
                            : 'bg-[#EF4444]'
                      }`}
                    >
                      {dailyReport.find(entry => 
                        entry.user === `${employees.find(emp => emp._id === isEmployeeSelect)?.firstName || ''} ${employees.find(emp => emp._id === isEmployeeSelect)?.lastName || ''}`)?.status || 'N/A'}
                    </Text>
                  </View>
                  
                  {/* Monthly attendance report */}
                  <View className="mb-4 flex flex-row justify-between items-center">
                    <Text className="text-white text-sm" style={{fontFamily:"LatoBold"}}>Monthly Attendance</Text>
                    <TouchableOpacity 
                      className="border border-[#37384B] rounded-lg p-2 flex flex-row items-center gap-2"
                      onPress={() => setShowMonthPicker(!showMonthPicker)}
                    >
                      <Fontisto name="date" size={16} color="#5f6191" />
                      <Text className="text-white text-xs">
                        {format(new Date(`${mySelectedMonth}-01`), 'MMMM yyyy')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  {showMonthPicker && (
                    <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={monthPickerDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleMonthChange}
                        textColor="white"
                      />
                    </View>
                  )}
                  
                  {isMyReportLoading ? (
                    <View className="items-center justify-center py-10">
                      <ActivityIndicator size="large" color="#815BF5" />
                      <Text className="text-white mt-4">Loading attendance data...</Text>
                    </View>
                  ) : (
                    <View className="border border-[#37384B] mt-5 rounded-xl mb-4">
                      <View className="flex flex-row bg-[#121435] p-3 rounded-t-xl">
                        <Text className="text-[#787CA5] text-xs w-1/4" style={{fontFamily:"Lato"}}>Date</Text>
                        <Text className="text-[#787CA5] text-xs w-1/5" style={{fontFamily:"Lato"}}>Day</Text>
                        <Text className="text-[#787CA5] text-xs w-1/6 text-center" style={{fontFamily:"Lato"}}>Present</Text>
                        <Text className="text-[#787CA5] text-xs w-1/6 text-center" style={{fontFamily:"Lato"}}>Leave</Text>
                        <Text className="text-[#787CA5] text-xs w-1/6 text-center" style={{fontFamily:"Lato"}}>Holiday</Text>
                      </View>
                      
                      <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                        {myMonthlyReport.length > 0 ? (
                          myMonthlyReport.map((day, index) => (
                            <View key={index} className="flex flex-row p-3 border-t border-[#37384B] items-center">
                              <Text className="text-white text-xs w-1/4">
                                {format(new Date(day.date), 'dd MMM yy')}
                              </Text>
                              <Text className="text-white text-xs w-1/6">{day.day}</Text>
                              <View className="w-1/5 items-center justify-center">
                                <View 
                                  className={`w-4 h-4 rounded border ${day.present ? 'bg-[#017a5b] border-[#017a5b]' : 'border-[#37384B]'}`}
                                />
                              </View>
                              <View className="w-1/6 items-center justify-center">
                                <View 
                                  className={`w-4 h-4 rounded border ${day.leave ? 'bg-[#FDB314] border-[#FDB314]' : 'border-[#37384B]'}`}
                                />
                              </View>
                              <View className="w-1/6 items-center justify-center">
                                <View 
                                  className={`w-4 h-4 rounded border ${day.holiday ? 'bg-[#A914DD] border-[#A914DD]' : 'border-[#37384B]'}`}
                                />
                              </View>
                            </View>
                          ))
                        ) : (
                          <View className="p-4">
                            <Text className="text-white text-center">No attendance records found for this month</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              ) :
              <View>
              {/* Modify the filter section to only show for users with admin privileges */}
              {hasAdminPrivileges && (
              <View className="w-full mt-7 flex flex-row justify-center pr-3">
                <View className="w-[69%]">
                {selectReportType === 'Daily' && (
                    <TouchableOpacity 
                      className="border w-[90%] mt-3  border-[#37384B] justify-center rounded-lg items-center flex py-4 flex-row gap-3" 
                      onPress={openDatePicker}
                    >
                      <Fontisto name="date" size={18} color="#5f6191" />
                      <Text className="text-white text-sm">{formattedSelectedDate}</Text>
                    </TouchableOpacity>
                  )}
                  {Platform.OS === 'ios' ? (
              <Modal
                isVisible={datePickerVisible}
                onBackdropPress={cancelIOSDateSelection}
                style={{ justifyContent: 'flex-end', margin: 0 }}
              >
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={cancelIOSDateSelection}>
                      <Text style={styles.datePickerCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmIOSDateSelection}>
                      <Text style={styles.datePickerDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempSelectedDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => date && setTempSelectedDate(date)}
                    style={styles.datePicker}
                  />
                </View>
              </Modal>
            ) : (
              <Modal
                isVisible={datePickerVisible}
                onBackdropPress={cancelIOSDateSelection}
                style={{ margin: 20, justifyContent: 'center' }}
              >
                <View style={[styles.datePickerContainer, { padding: 20, alignItems: 'center' }]}>
                  <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>Select Date</Text>
                  <DateTimePicker
                    value={tempSelectedDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setTempSelectedDate(selectedDate);
                        setDate(selectedDate);
                        setSelectedDate(selectedDate.toISOString().split('T')[0]);
                        setFormattedSelectedDate(format(selectedDate, 'EEEE, MMMM dd'));
                        fetchDailyReport(selectedDate.toISOString().split('T')[0]);
                        setDatePickerVisible(false);
                      }
                    }}
                    textColor="white"
                  />
                  <TouchableOpacity 
                    onPress={cancelIOSDateSelection}
                    style={{ marginTop: 20, padding: 10, backgroundColor: '#37384B', borderRadius: 8 }}
                  >
                    <Text style={{ color: 'white' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            )}
                  {showDatePicker && (
                      <View style={styles.pickerContainer}>
                      <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        textColor="white"
                      />
                      </View>
                    )}
                  
                  {selectReportType === 'Monthly' && (
                    <CustomDropdown
                      data={monthOptions.map(month => ({ label: month.display, value: month.value }))}
                      placeholder="Select Month"
                      onSelect={(value) => setSelectedAttendanceDate(value)}
                      selectedValue={selectedAttendanceDate}
                    />
                  )}
                  
                  {selectReportType === 'Cumulative' && (
                    <CustomDropdown
                      data={[
                        { label: 'This Week', value: 'thisWeek' },
                        { label: 'Last Week', value: 'lastWeek' },
                        { label: 'This Month', value: 'thisMonth' },
                        { label: 'Last Month', value: 'lastMonth' }
                      ]}
                      placeholder="Select Period"
                      onSelect={(value) => setPeriod(value)}
                      selectedValue={period}
                    />
                  )}
                </View>
                  
                {/* filter manager */}
                <TouchableOpacity className="h-14 w-14 rounded-full bg-[#37384B] mt-3" onPress={toggleFilterModal}>
                  <Image source={require('~/assets/commonAssets/filter.png')} className="h-full w-full" />
                </TouchableOpacity>
              </View>
            )}
                <View className="w-[95%] items-center">
                {/* Show message for users without team access permissions */}
                {selectedOption === 'Team' && !canAccessTeamDetails && (
                  <View className="items-center justify-center p-8 mt-8">
                    <Text className="text-white text-lg text-center">
                      You don't have permission to access Team Details.
                    </Text>
                    <Text className="text-[#676B93] text-sm text-center mt-2">
                      Please contact your administrator for access.
                    </Text>
                  </View>
                )}
                <View className="flex flex-row gap-5 items-center mb-7 mt-9 w-full">
                  <TouchableOpacity 
                    className="flex items-center justify-center flex-col w-[29%]"
                    onPress={() => handleReportTypePress('Daily')}
                  >
                    <Text 
                      className={`${selectReportType === 'Daily' ? 'text-white' : 'text-[#787CA5]'} text-xs mb-4`}
                      style={{ fontFamily: "LatoBold" }}
                    >
                      Daily Reports
                    </Text>
                    {selectReportType === 'Daily' && (
                      <View className="h-[2px] bg-white w-full" />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex items-center justify-center flex-col w-[31%]"
                    onPress={() => handleReportTypePress('Cumulative')}
                  >
                    <Text 
                      className={`${selectReportType === 'Cumulative' ? 'text-white' : 'text-[#787CA5]'} text-xs mb-4 w-full`}
                      style={{ fontFamily: "LatoBold" }}
                    >
                    Cumulative Report
                    </Text>
                    {selectReportType === 'Cumulative' && (
                      <View className="h-[2px] bg-white w-full " />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className="flex items-center justify-center flex-col w-[27%]"
                    onPress={() => handleReportTypePress('Monthly')}
                  >
                    <Text 
                      className={`${selectReportType === 'Monthly' ? 'text-white' : 'text-[#787CA5]'} text-xs mb-4`}
                      style={{ fontFamily: "LatoBold" }}
                    >
                      Monthly Report
                    </Text>
                    {selectReportType === 'Monthly' && (
                      <View className="h-[2px] bg-white w-full" />
                    )}
                  </TouchableOpacity>
                </View> 


                  {selectReportType === 'Daily' && renderDailyReportContent()}
                  {selectReportType === 'Monthly' && renderMonthlyReportContent()}
                  {selectReportType === 'Cumulative' && renderCumulativeReportContent()}

                </View>
              </View> 
              }
            
            {/* FILTER MODAL */}
            <Modal 
            isVisible={isFilterModalVisible} 
            onBackdropPress={toggleFilterModal}
            style={{ margin: 0, justifyContent: 'flex-end' }}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            >
              <View className="rounded-t-3xl bg-[#0A0D28] p-5">
                <View className="mb-5 mt-2 flex w-full flex-row items-center justify-between">
                  <Text className="text-2xl font-semibold text-white" style={{ fontFamily: 'LatoBold' }}>
                  Filters 
                  </Text>
                  <TouchableOpacity onPress={toggleFilterModal}>
                    <Image source={require('../../../assets/commonAssets/cross.png')} className="h-8 w-8" />
                  </TouchableOpacity>
                </View>   
                
                {/* Manager dropdown with data from API */}
                <CustomDropdown
                  data={managerOptions}
                  placeholder="Select Manager"
                  onSelect={(value) => setIsManagerSelect(value)}
                  selectedValue={isManagerSelect}
                />

                {/* Employee dropdown with data from API */}
                <CustomDropdown
                  data={employeeOptions}
                  placeholder="Select Employee"
                  onSelect={(value) => setIsEmployeeSelect(value)}
                  selectedValue={isEmployeeSelect}
                />

                 <View className='flex flex-row items-center justify-center gap-5 mt-8'>
                   <TouchableOpacity 
                     className='bg-[#37384B] p-4 rounded-full w-[45%] items-center'
                     onPress={handleClearFilters}
                   >
                     <Text className='text-white text-sm'>Clear All</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                     className='rounded-full w-[45%] items-center'
                     onPress={handleApplyFilters}
                   >
                     <LinearGradient
                       start={{ x: 0, y: 0 }}
                       end={{ x: 1, y: 1 }}
                       colors={["#815BF5", "#FC8929"]}
                       style={styles.gradient}
                     >
                       <Text className='text-white text-sm'>Apply</Text>
                     </LinearGradient>                   
                   </TouchableOpacity>
                 </View>
                  
              </View>
            </Modal>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tablet: {
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width:"100%",
    display:"flex",
    alignItems:"center",
  },
  messageModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  messageText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradient: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5, 
    flexDirection: "row", 
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: Platform.OS === 'ios' ? '#1A1D3D' : 'transparent',
    borderRadius: 8,
  },
  datePickerContainer: {
    backgroundColor: '#191B3A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  datePickerCancel: {
    color: '#787CA5',
    fontSize: 16,
    fontWeight: '500',
  },
  datePickerDone: {
    color: '#815BF5',
    fontSize: 16,
    fontWeight: '600',
  },
  datePicker: {
    backgroundColor: '#191B3A',
    height: 200,
  },
});
