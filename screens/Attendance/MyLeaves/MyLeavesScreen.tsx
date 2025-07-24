import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Platform,
  Animated,
  Easing
} from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Navbar from '~/components/navbar';
import CustomDropdown from '~/components/customDropDown';
import CustomDateRangeModal from '~/components/Dashboard/CustomDateRangeModal';
import LeaveApplyModal from '~/components/Attendence/LeaveApplyModal';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import moment from 'moment';
import { getDateRange } from '~/utils/GetDateRange';

const { width, height } = Dimensions.get('window');

interface LeaveType {
  _id: string;
  leaveType: string;
  allotedLeaves: number;
  userLeaveBalance: number;
}

interface LeaveDay {
  date: string;
  unit: "Full Day" | "1st Half" | "2nd Half" | "1st Quarter" | "2nd Quarter" | "3rd Quarter" | "4th Quarter";
  status: "Pending" | "Approved" | "Rejected";
}

interface Leave {
  _id: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  status: string;
  appliedDays: number;
  leaveDays: LeaveDay[];
  user: {
    firstName: string;
    lastName: string;
    _id: string;
  };
  remarks: string;
  approvedBy?: {
    firstName: string;
    lastName: string;
    _id: string;
  };
  rejectedBy?: {
    firstName: string;
    lastName: string;
    _id: string;
  };
  leaveReason: string;
  createdAt: string;
  updatedAt: string;
}

interface LeaveDetails {
  totalAllotedLeaves: number;
  userLeaveBalance: number;
}

const leaveTypeInfo: Record<string, { title: string; description: string; details: string }> = {
  "Casual Leave": {
    title: "Casual Leave",
    description: "Casual Leave is intended for short-term personal needs such as attending to personal matters, family emergencies, or other unforeseen events.",
    details: "Allotted: 12 days | Type: Paid\nBackdated Leave Days: 60 | Advance Leave Days: 90\nInclude Holidays: false | Include Weekends: false\nUnit: Full Day, Half Day, Short Leave\nDeduction(in Days): Full day - 1, Half Day - 0.5, Short Leave - 0.25",
  },
  "Sick Leave": {
    title: "Sick Leave",
    description: "Sick Leave can be availed by employees when they are ill or need medical attention. This type of leave is intended for health-related absences.",
    details: "Allotted: 12 days | Type: Paid\nBackdated Leave Days: 60 | Advance Leave Days: 90\nInclude Holidays: false | Include Weekends: false\nUnit: Full Day, Half Day, Short Leave\nDeduction(in Days): Full day - 1, Half Day - 0.5, Short Leave - 0.25",
  },
  "Earned Leave": {
    title: "Earned Leave",
    description: "Earned Leave, also known as Annual Leave or Privilege Leave, is accrued based on the length of service and can be used for planned vacations or personal time off.",
    details: "Allotted: 15 days | Type: Paid\nBackdated Leave Days: 60 | Advance Leave Days: 90\nInclude Holidays: false | Include Weekends: false\nUnit: Full Day, Half Day, Short Leave\nDeduction(in Days): Full day - 1, Half Day - 0.5, Short Leave - 0.25",
  },
  "Leave Without Pay": {
    title: "Leave Without Pay",
    description: "Leave Without Pay is granted when an employee has exhausted all other leave types and still needs time off. This leave is unpaid.",
    details: "Allotted: 6 days | Type: Unpaid\nBackdated Leave Days: 60 | Advance Leave Days: 90\nInclude Holidays: false | Include Weekends: false\nUnit: Full Day, Half Day, Short Leave\nDeduction(in Days): Full day - 1, Half Day - 0.5, Short Leave - 0.25",
  },
};

const statusColors = {
  "Approved": { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  "Partially Approved": { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  "Rejected": { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  "Pending": { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
};

export default function MyLeavesScreen() {
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveDetails, setLeaveDetails] = useState<{ [key: string]: LeaveDetails }>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{ title: string; description: string; details: string } | null>(null);
  const [activeTab, setActiveTab] = useState("This Month");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [formattedDateRange, setFormattedDateRange] = useState('');
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [allLeaves, setAllLeaves] = useState<Leave[]>([]);
  const [noLeaveTypes, setNoLeaveTypes] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isLeaveDetailsModalOpen, setIsLeaveDetailsModalOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Apply Leave Form State
  const [applyLeaveForm, setApplyLeaveForm] = useState({
    leaveTypeId: '',
    fromDate: '',
    toDate: '',
    reason: '',
    attachments: [] as Array<{uri: string, name: string, type: string}>,
    dayType: 'Full Day' as string,
    leaveDays: [] as Array<{date: string, unit: string}>,
  });
  
  // Modal and UI State
  const [showLeaveTypeDropdown, setShowLeaveTypeDropdown] = useState(false);
  const [showDayTypeDropdown, setShowDayTypeDropdown] = useState(false);
  const [isFromDatePickerOpen, setIsFromDatePickerOpen] = useState(false);
  const [isToDatePickerOpen, setIsToDatePickerOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(new Date());
  const [tempToDate, setTempToDate] = useState(new Date());
  const [openDropdownDate, setOpenDropdownDate] = useState('');
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  // Date filter options (matching TaskDashboardScreen)
  const daysData = [
    { label: 'Today', value: 'Today' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'This Week', value: 'This Week' },
    { label: 'Last Week', value: 'Last Week' },
    { label: 'This Month', value: 'This Month' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'This Year', value: 'This Year' },
    { label: 'All Time', value: 'All Time' },
    { label: 'Custom', value: 'Custom' },
  ];

  // Shimmer animation setup
  useEffect(() => {
    const shimmer = () => {
      shimmerAnimation.setValue(0);
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => shimmer());
    };
    shimmer();
  }, []);

  const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Filter leaves by date range (similar to TaskDashboardScreen)
  const filterLeavesByDate = (leaves: Leave[], dateRange: any) => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate || !Object.keys(startDate).length || !Object.keys(endDate).length) {
      return leaves;
    }
    return leaves.filter((leave) => {
      const leaveDate = moment(leave.createdAt);
      return leaveDate.isSameOrAfter(startDate) && leaveDate.isBefore(endDate);
    });
  };

  const formatWithSuffix = (date: any) => {
    return moment(date).format('MMM Do YY');
  };

  // Handle date filter changes
  useEffect(() => {
    if (activeTab === 'Custom') {
      setIsCustomModalOpen(true);
      return;
    }

    // Get the date range for the selected option
    const dateRange = getDateRange(activeTab, allLeaves, customStartDate, customEndDate);

    if (dateRange.startDate && dateRange.endDate) {
      // Format and set the date range display
      if (activeTab === 'Today' || activeTab === 'Yesterday') {
        setFormattedDateRange(formatWithSuffix(dateRange.startDate));
      } else {
        const formattedStart = formatWithSuffix(dateRange.startDate);
        const formattedEnd = formatWithSuffix(dateRange.endDate);
        setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);
      }

      // Filter leaves based on the selected date range
      const filteredLeaves = filterLeavesByDate(allLeaves, dateRange);
      setLeaves(filteredLeaves);
    } else {
      setFormattedDateRange('Invalid date range');
    }
  }, [activeTab, allLeaves, customStartDate, customEndDate]);

  // Handle custom date range selection
  const handleCustomDateApply = (startDate: Date, endDate: Date) => {
    setCustomStartDate(startDate);
    setCustomEndDate(endDate);

    const customDateRange = {
      startDate: moment(startDate).startOf('day'),
      endDate: moment(endDate).endOf('day'),
    };

    const customFilteredLeaves = filterLeavesByDate(allLeaves, customDateRange);
    setLeaves(customFilteredLeaves);

    const formattedStart = formatWithSuffix(moment(startDate));
    const formattedEnd = formatWithSuffix(moment(endDate));
    setFormattedDateRange(`${formattedStart} - ${formattedEnd}`);

    setIsCustomModalOpen(false);
  };

  const filterEntriesByMeta = () => {
    // Filter by leave type only (date filtering is now handled by the dropdown)
    return leaves.filter((leave) =>
      selectedLeaveType
        ? leave.leaveType?.leaveType === selectedLeaveType
        : true
    );
  };

  const filterEntriesByDateAndMeta_OLD = () => {
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const todayNormalized = normalizeDate(today);

    let dateFilteredLeaves = leaves;

    switch (activeTab) {
      case "today":
        dateFilteredLeaves = leaves.filter(
          (leave) => normalizeDate(new Date(leave.createdAt)).getTime() === todayNormalized.getTime()
        );
        break;
      case "thisWeek":
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        dateFilteredLeaves = leaves.filter((leave) => {
          const leaveDate = normalizeDate(new Date(leave.createdAt));
          return leaveDate >= normalizeDate(thisWeekStart) && leaveDate <= todayNormalized;
        });
        break;
      case "thisMonth":
        dateFilteredLeaves = leaves.filter((leave) => {
          const leaveDate = normalizeDate(new Date(leave.createdAt));
          return leaveDate >= thisMonthStart && leaveDate <= thisMonthEnd;
        });
        break;
      case "lastMonth":
        dateFilteredLeaves = leaves.filter((leave) => {
          const leaveDate = normalizeDate(new Date(leave.createdAt));
          return leaveDate >= lastMonthStart && leaveDate <= lastMonthEnd;
        });
        break;
      case "custom":
        if (customDateRange.start && customDateRange.end) {
          const startNormalized = normalizeDate(customDateRange.start);
          const endNormalized = normalizeDate(customDateRange.end);
          dateFilteredLeaves = leaves.filter((leave) => {
            const leaveDate = normalizeDate(new Date(leave.createdAt));
            return leaveDate >= startNormalized && leaveDate <= endNormalized;
          });
        }
        break;
      default:
        break;
    }

    let finalFiltered = dateFilteredLeaves
      .filter((leave) => selectedLeaveType ? leave.leaveType?.leaveType === selectedLeaveType : true);

    // Only apply year/month filter if not using date-based tabs
    if (activeTab === "custom") {
      finalFiltered = finalFiltered.filter((leave) => {
        const leaveDate = new Date(leave.fromDate);
        return leaveDate.getFullYear() === selectedYear && leaveDate.getMonth() === selectedMonth;
      });
    }

    return finalFiltered;
  };

  const filterEntriesByStatus = (dateFilteredLeaves: Leave[]): Leave[] => {
    return dateFilteredLeaves.filter((leave) =>
      selectedStatus === "All" ? true : leave.status === selectedStatus
    );
  };

  const fetchLeaveTypes = async () => {
    try {
      if (!token) {
        console.error("No auth token found for leave types fetch");
        setNoLeaveTypes(true);
        setDataFetched(true);
        setInitialLoading(false);
        return;
      }

      const response = await axios.get(`${backend_Host}/leaves/leaveType`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      if (response.data && response.data.length > 0) {
        setLeaveTypes(response.data);
        setNoLeaveTypes(false);
      } else {
        setNoLeaveTypes(true);
      }
      setDataFetched(true);
      setInitialLoading(false);
    } catch (error) {
      console.error("Error fetching leave types:", error);
      setNoLeaveTypes(true);
      setDataFetched(true);
      setInitialLoading(false);
    }
  };

  const fetchLeaveDetails = async (leaveTypes: LeaveType[]) => {
    try {
      if (!token) {
        console.error("No auth token found for leave details fetch");
        setLoading(false);
        return;
      }

      setLoading(true);
      const leaveDetailsMap: { [key: string]: LeaveDetails } = {};
      
      for (const leaveType of leaveTypes) {
        try {
          const response = await axios.get(`${backend_Host}/leaves/${leaveType._id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000
          });
          
          if (response.data.success) {
            leaveDetailsMap[leaveType._id] = {
              totalAllotedLeaves: response.data.data.allotedLeaves,
              userLeaveBalance: response.data.data.userLeaveBalance,
            };
          } else {
            leaveDetailsMap[leaveType._id] = {
              totalAllotedLeaves: 0,
              userLeaveBalance: 0,
            };
          }
        } catch (leaveError) {
          console.error(`Error fetching details for leave type ${leaveType._id}:`, leaveError);
          leaveDetailsMap[leaveType._id] = {
            totalAllotedLeaves: 0,
            userLeaveBalance: 0,
          };
        }
      }
      
      setLeaveDetails(leaveDetailsMap);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leave details:", error);
      setLoading(false);
    }
  };

  const fetchUserLeaves = async () => {
    try {
      if (!token) {
        console.error("No auth token found for user leaves fetch");
        setLoading(false);
        setDataFetched(true);
        setInitialLoading(false);
        return;
      }

      setLoading(true);
      const response = await axios.get(`${backend_Host}/leaves`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });
      
      if (response.data.success && Array.isArray(response.data.leaves)) {
        // Sanitize leaves data to ensure all required properties exist
        const sanitizedLeaves = response.data.leaves.map((leave: any) => ({
          ...leave,
          leaveType: leave.leaveType || {
            _id: 'unknown',
            leaveType: 'Unknown Leave Type',
            allotedLeaves: 0,
            userLeaveBalance: 0
          },
          user: leave.user || {
            firstName: 'Unknown',
            lastName: 'User',
            _id: 'unknown'
          },
          status: leave.status || 'Pending',
          leaveDays: leave.leaveDays || [],
          appliedDays: leave.appliedDays || 0,
          fromDate: leave.fromDate || new Date().toISOString(),
          toDate: leave.toDate || new Date().toISOString(),
          leaveReason: leave.leaveReason || leave.remarks || 'No reason provided',
          createdAt: leave.createdAt || new Date().toISOString(),
          updatedAt: leave.updatedAt || new Date().toISOString()
        }));
        
        setAllLeaves(sanitizedLeaves);
        setLeaves(sanitizedLeaves);
      } else {
        console.error("Error: No leaves found or invalid data format");
        setAllLeaves([]);
        setLeaves([]);
      }
      setLoading(false);
      setDataFetched(true);
      setInitialLoading(false);
    } catch (error) {
      console.error("Error fetching user leaves:", error);
      setLeaves([]);
      setLoading(false);
      setDataFetched(true);
      setInitialLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUserLeaves(), fetchLeaveTypes()]);
      // Reset to current filter after refresh
      if (activeTab !== 'Custom') {
        const dateRange = getDateRange(activeTab, allLeaves, customStartDate, customEndDate);
        if (dateRange.startDate && dateRange.endDate) {
          const filteredLeaves = filterLeavesByDate(allLeaves, dateRange);
          setLeaves(filteredLeaves);
        }
      }
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserLeaves();
      fetchLeaveTypes();
    }
  }, [token]);

  useEffect(() => {
    if (leaveTypes.length > 0 && token) {
      fetchLeaveDetails(leaveTypes);
    }
  }, [leaveTypes, token]);

  const handleInfoClick = (leaveType: string) => {
    if (leaveTypeInfo[leaveType]) {
      setInfoModalContent(leaveTypeInfo[leaveType]);
      setIsInfoModalOpen(true);
    }
  };

  const handleLeaveClick = (leave: Leave) => {
    setSelectedLeave(leave);
    setIsLeaveDetailsModalOpen(true);
  };

  // Apply Leave Form Handlers
  const handleAttachmentPicker = async () => {
    Alert.alert(
      "Select Attachment",
      "Choose how you want to add an attachment",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Camera permission is required to take photos');
              return;
            }
            
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
              const newAttachment = {
                uri: result.assets[0].uri,
                name: `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
              };
              setApplyLeaveForm(prev => ({
                ...prev,
                attachments: [...prev.attachments, newAttachment]
              }));
            }
          }
        },
        {
          text: "Gallery",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission needed', 'Gallery permission is required to select photos');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
              const newAttachment = {
                uri: result.assets[0].uri,
                name: `image_${Date.now()}.jpg`,
                type: 'image/jpeg',
              };
              setApplyLeaveForm(prev => ({
                ...prev,
                attachments: [...prev.attachments, newAttachment]
              }));
            }
          }
        },
        {
          text: "Document",
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
              });

              if (!result.canceled && result.assets[0]) {
                const newAttachment = {
                  uri: result.assets[0].uri,
                  name: result.assets[0].name,
                  type: result.assets[0].mimeType || 'application/octet-stream',
                };
                setApplyLeaveForm(prev => ({
                  ...prev,
                  attachments: [...prev.attachments, newAttachment]
                }));
              }
            } catch (error) {
              console.error('Error picking document:', error);
              Alert.alert('Error', 'Failed to pick document');
            }
          }
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  const removeAttachment = (index: number) => {
    setApplyLeaveForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const resetApplyLeaveForm = () => {
    setApplyLeaveForm({
      leaveTypeId: '',
      fromDate: '',
      toDate: '',
      reason: '',
      attachments: [],
      dayType: 'Full Day', // Reset to default
      leaveDays: [],
    });
    setShowLeaveTypeDropdown(false);
    setShowDayTypeDropdown(false);
    setIsFromDatePickerOpen(false);
    setIsToDatePickerOpen(false);
    setTempFromDate(new Date());
    setTempToDate(new Date());
    setOpenDropdownDate('');
  };

  // Optimized close handlers for better performance
  const handleCloseApplyLeaveModal = useCallback(() => {
    setIsModalAnimating(true);
    Keyboard.dismiss();
    setIsModalOpen(false);
    setOpenDropdownDate(''); // Close any open dropdowns
    // Delay form reset to avoid blocking the close animation
    setTimeout(() => {
      resetApplyLeaveForm();
      setIsModalAnimating(false);
    }, 300);
  }, []);

  const handleCloseInfoModal = useCallback(() => {
    setIsInfoModalOpen(false);
  }, []);

  const handleCloseCustomModal = useCallback(() => {
    setIsCustomModalOpen(false);
  }, []);

  const handleCloseLeaveDetailsModal = useCallback(() => {
    setIsLeaveDetailsModalOpen(false);
  }, []);

  // Date picker handlers
  const handleFromDateSelect = () => {
    setIsModalAnimating(true);
    setIsModalOpen(false); // Close main modal
    setTempFromDate(applyLeaveForm.fromDate ? new Date(applyLeaveForm.fromDate) : new Date());
    setTimeout(() => {
      setIsFromDatePickerOpen(true); // Open date picker modal
    }, 400);
  };

  const handleToDateSelect = () => {
    setIsModalAnimating(true);
    setIsModalOpen(false); // Close main modal
    setTempToDate(applyLeaveForm.toDate ? new Date(applyLeaveForm.toDate) : new Date());
    setTimeout(() => {
      setIsToDatePickerOpen(true); // Open date picker modal
    }, 400);
  };

  const confirmFromDateSelection = () => {
    const formattedDate = tempFromDate.toISOString().split('T')[0];
    setApplyLeaveForm(prev => {
      const newForm = { ...prev, fromDate: formattedDate };
      // Update leave days if both dates are available
      if (newForm.toDate) {
        setTimeout(() => updateLeaveDays(formattedDate, newForm.toDate), 100);
      }
      return newForm;
    });
    setIsFromDatePickerOpen(false);
    reopenMainModal();
  };

  const confirmToDateSelection = () => {
    const formattedDate = tempToDate.toISOString().split('T')[0];
    setApplyLeaveForm(prev => {
      const newForm = { ...prev, toDate: formattedDate };
      // Update leave days if both dates are available
      if (newForm.fromDate) {
        setTimeout(() => updateLeaveDays(newForm.fromDate, formattedDate), 100);
      }
      return newForm;
    });
    setIsToDatePickerOpen(false);
    reopenMainModal();
  };

  const cancelFromDateSelection = () => {
    setIsFromDatePickerOpen(false);
    reopenMainModal();
  };

  const cancelToDateSelection = () => {
    setIsToDatePickerOpen(false);
    reopenMainModal();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Generate dates between from and to date
  const generateDatesBetween = (fromDate: string, toDate: string) => {
    const dates = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dates.push(new Date(date).toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Update leave days when dates change
  const updateLeaveDays = (fromDate: string, toDate: string) => {
    if (fromDate && toDate) {
      const dates = generateDatesBetween(fromDate, toDate);
      const newLeaveDays = dates.map(date => {
        // Check if this date already exists in leaveDays
        const existingDay = applyLeaveForm.leaveDays.find(day => day.date === date);
        return existingDay || {
          date,
          unit: applyLeaveForm.dayType as 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter'
        };
      });
      
      setApplyLeaveForm(prev => ({
        ...prev,
        leaveDays: newLeaveDays
      }));
    }
  };

  // Update day type for a specific date
  const updateDayTypeForDate = (date: string, unit: string) => {
    setApplyLeaveForm(prev => ({
      ...prev,
      leaveDays: prev.leaveDays.map(day => 
        day.date === date 
          ? { ...day, unit: unit as 'Full Day' | '1st Half' | '2nd Half' | '1st Quarter' | '2nd Quarter' | '3rd Quarter' | '4th Quarter' }
          : day
      )
    }));
  };

  // Helper function to reopen the main modal
  const reopenMainModal = () => {
    setTimeout(() => {
      setIsModalAnimating(false);
      setIsModalOpen(true);
    }, 500); // Increased timeout for better reliability
  };

  // Memoize heavy computations
  const filteredLeaves = useMemo(() => {
    return filterEntriesByMeta();
  }, [leaves, selectedLeaveType]);

  const finalFilteredLeaves = useMemo(() => {
    return filterEntriesByStatus(filteredLeaves);
  }, [filteredLeaves, selectedStatus]);

  const leaveCounts = useMemo(() => {
    const allLeavesCount = filteredLeaves.length;
    const pendingCount = filteredLeaves.filter((leave) => leave.status === "Pending").length;
    const approvedCount = filteredLeaves.filter((leave) => leave.status === "Approved").length;
    const rejectedCount = filteredLeaves.filter((leave) => leave.status === "Rejected").length;
    
    return { allLeavesCount, pendingCount, approvedCount, rejectedCount };
  }, [filteredLeaves]);

  const handleSubmitLeave = async () => {
    // Validation
    if (!applyLeaveForm.leaveTypeId) {
      Alert.alert('Error', 'Please select a leave type');
      return;
    }
    if (!applyLeaveForm.fromDate) {
      Alert.alert('Error', 'Please select from date');
      return;
    }
    if (!applyLeaveForm.toDate) {
      Alert.alert('Error', 'Please select to date');
      return;
    }
    if (!applyLeaveForm.reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for leave');
      return;
    }

    setIsSubmittingLeave(true);
    
    try {
      // First, upload attachments if any
      let attachmentUrls: string[] = [];
      
      if (applyLeaveForm.attachments.length > 0) {
        for (const attachment of applyLeaveForm.attachments) {
          try {
            const formData = new FormData();
            formData.append('file', {
              uri: attachment.uri,
              name: attachment.name,
              type: attachment.type,
            } as any);

            const uploadResponse = await axios.post(`${backend_Host}/upload`, formData, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000
            });

            if (uploadResponse.data && uploadResponse.data.url) {
              attachmentUrls.push(uploadResponse.data.url);
            }
          } catch (uploadError) {
            console.error('Error uploading attachment:', uploadError);
            // Continue with other attachments even if one fails
          }
        }
      }

      // Prepare the leave request data
      const leaveRequestData = {
        leaveTypeId: applyLeaveForm.leaveTypeId,
        fromDate: applyLeaveForm.fromDate,
        toDate: applyLeaveForm.toDate,
        leaveReason: applyLeaveForm.reason,
        dayType: applyLeaveForm.dayType,
        leaveDays: applyLeaveForm.leaveDays.length > 0 ? applyLeaveForm.leaveDays : undefined,
        attachments: attachmentUrls,
      };

      console.log('Submitting leave request with data:', leaveRequestData);
      console.log('API endpoint:', `${backend_Host}/leaves`);

      const response = await axios.post(`${backend_Host}/leaves`, leaveRequestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000
      });

      console.log('Leave submission response:', response.data);

      if (response.data.success || response.status === 200 || response.status === 201) {
        // Call the success handler
        handleApplyLeaveSuccess();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to submit leave request');
      }
    } catch (error: any) {
      console.error('Error submitting leave:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to submit leave request';
      
      if (error.response) {
        // Server responded with error status
        console.error('Response error status:', error.response.status);
        console.error('Response error data:', error.response.data);
        console.error('Response error headers:', error.response.headers);
        
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid request data. Please check your input.';
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to apply for leave.';
        } else if (error.response.status === 404) {
          errorMessage = 'Leave service not found. Please contact support.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('Request error:', error.request);
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        // Something else happened
        console.error('Error message:', error.message);
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      Alert.alert('Submit Leave Failed', errorMessage);
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  // Handle successful leave application - similar to web version
  const handleApplyLeaveSuccess = async () => {
    console.log('Leave application success handler called');
    
    // Close the modal and reset form
    setIsModalOpen(false);
    resetApplyLeaveForm();
    
    // Switch to "This Month" tab to show the new leave (similar to web version)
    setActiveTab("This Month");
    setSelectedStatus("All");
    setSelectedLeaveType("");
    
    // Immediately refresh data to get the latest leaves and balances
    try {
      console.log('Refreshing data after successful leave submission...');
      
      // Refresh both leaves and leave details
      await Promise.all([
        fetchUserLeaves(),
        leaveTypes.length > 0 ? fetchLeaveDetails(leaveTypes) : Promise.resolve()
      ]);
      
      console.log('Data refresh completed');
      
      // Show success message after data is refreshed
      Alert.alert(
        'Success', 
        'Leave request submitted successfully! Your leave application is now visible in the "This Month" tab.'
      );
    } catch (error) {
      console.error('Error refreshing data after leave submission:', error);
      
      // Still show success message even if refresh fails
      Alert.alert(
        'Success', 
        'Leave request submitted successfully! Please refresh the page to see your new leave application.'
      );
    }
  };

  const { allLeavesCount, pendingCount, approvedCount, rejectedCount } = leaveCounts;

  // Shimmer skeleton component
  const ShimmerSkeleton = ({ width, height, borderRadius = 8 }: { width: number | string, height: number, borderRadius?: number }) => {
    const translateX = shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-width as number, width as number],
    });

    return (
      <View style={[styles.skeletonContainer, { width, height, borderRadius }]}>
        <Animated.View
          style={[
            styles.shimmerGradient,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    );
  };

  const renderCircularProgress = (consumed: number, total: number) => {
    const percentage = total > 0 ? (consumed / total) * 100 : 0;
    const strokeWidth = 6;
    const radius = 30;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Determine color based on usage percentage
    let progressColor = '#815BF5'; // Default purple
    if (percentage > 80) {
      progressColor = '#EF4444'; // Red for high usage
    } else if (percentage > 60) {
      progressColor = '#F59E0B'; // Orange for medium-high usage
    } else if (percentage > 40) {
      progressColor = '#10B981'; // Green for medium usage
    }

    return (
      <View style={styles.circularProgressContainer}>
        <View style={[styles.circularProgressWrapper, { width: radius * 2, height: radius * 2 }]}>
          {/* Background circle */}
          <View style={[
            styles.circularProgressBackground, 
            { 
              width: radius * 2, 
              height: radius * 2, 
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: '#0A0D28'
            }
          ]} />
          
          {/* Progress circle */}
          <View style={[
            styles.circularProgressForeground, 
            { 
              width: radius * 2, 
              height: radius * 2,
              borderRadius: radius,
              borderWidth: strokeWidth,
              borderColor: progressColor,
              borderTopColor: 'transparent',
              borderRightColor: percentage > 25 ? progressColor : 'transparent',
              borderBottomColor: percentage > 50 ? progressColor : 'transparent',
              borderLeftColor: percentage > 75 ? progressColor : 'transparent',
              transform: [{ rotate: `${(percentage / 100) * 360 - 90}deg` }]
            }
          ]} />
          
          {/* Center text */}
          <View style={styles.circularProgressText}>
            <Text style={[styles.circularProgressNumber, { color: progressColor }]}>{consumed}</Text>
          
          </View>
        </View>
      </View>
    );
  };

  // Loading skeleton components
  const renderHeaderSkeleton = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <ShimmerSkeleton width={200} height={24} />
        <View style={{ marginTop: 8 }}>
          <ShimmerSkeleton width={150} height={16} />
        </View>
      </View>
      <ShimmerSkeleton width={120} height={40} borderRadius={8} />
    </View>
  );

  const renderTabsSkeleton = () => (
    <View style={styles.tabsContainer}>
      <View style={styles.tabsRow}>
        {[1, 2, 3, 4, 5].map((i) => (
          <ShimmerSkeleton key={i} width={80} height={32} borderRadius={16} />
        ))}
      </View>
    </View>
  );

  const renderStatusFiltersSkeleton = () => (
    <View style={styles.statusFilters}>
      <View style={styles.statusFiltersRow}>
        {[1, 2, 3, 4].map((i) => (
          <ShimmerSkeleton key={i} width={70} height={28} borderRadius={14} />
        ))}
      </View>
    </View>
  );

  const renderLeaveCardsSkeleton = () => (
    <View style={styles.leaveCardsContainer}>
      <View style={styles.leaveCardsRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.leaveCard}>
            <View style={styles.leaveCardHeader}>
              <ShimmerSkeleton width={120} height={16} />
              <ShimmerSkeleton width={24} height={24} borderRadius={12} />
            </View>
            <View style={styles.leaveCardContent}>
              <ShimmerSkeleton width={70} height={70} borderRadius={35} />
              <View style={styles.leaveCardDetails}>
                <ShimmerSkeleton width={100} height={12} />
                <View style={{ marginTop: 8 }}>
                  <ShimmerSkeleton width={80} height={14} />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderLeaveItemsSkeleton = () => (
    <View style={styles.leaveApplicationsSection}>
      <ShimmerSkeleton width={150} height={20} />
      <View style={[styles.leavesList, { marginTop: 16 }]}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.leaveItem}>
            <View style={styles.leaveItemHeader}>
              <View style={styles.leaveItemUser}>
                <ShimmerSkeleton width={36} height={36} borderRadius={18} />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <ShimmerSkeleton width={120} height={16} />
                  <View style={{ marginTop: 4 }}>
                    <ShimmerSkeleton width={80} height={14} />
                  </View>
                </View>
              </View>
              <ShimmerSkeleton width={70} height={24} borderRadius={12} />
            </View>
            <View style={styles.separator} />
            <View style={styles.leaveItemDetails}>
              {[1, 2, 3].map((j) => (
                <View key={j} style={styles.leaveDetailRow}>
                  <ShimmerSkeleton width={60} height={14} />
                  <ShimmerSkeleton width={80} height={14} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderLeaveCard = (leaveType: LeaveType) => {
    const leaveDetail = leaveDetails[leaveType._id];
    const totalAllotted = leaveDetail?.totalAllotedLeaves || leaveType.allotedLeaves;
    const remainingBalance = leaveDetail?.userLeaveBalance || 0;
    const usedLeaves = totalAllotted - remainingBalance;
    
    console.log(`Leave Type: ${leaveType.leaveType}`);
    console.log(`Total Allotted: ${totalAllotted}`);
    console.log(`Remaining Balance: ${remainingBalance}`);
    console.log(`Used Leaves: ${usedLeaves}`);
    console.log('---');
    
    return (
      <View key={leaveType._id}
              style={{
                alignItems: 'center',
                width: 250,
                backgroundColor: 'rgba(27, 23, 57, 0.6)', 
                // Properly nest shadowOffset in the style object
                shadowColor: 'rgba(0, 0, 0, 0.8)',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.9,
                shadowRadius: 15,
                borderWidth: 1,
                borderColor: 'rgba(48, 41, 86, 0.7)',
                borderStyle: 'solid',
                position: 'relative',
                overflow: 'hidden',
                padding: 10,
                borderRadius:12
              }}      
      >
        <View style={styles.leaveCardHeader}>
          <Text style={styles.leaveCardTitle}>{leaveType.leaveType}</Text>
          <TouchableOpacity
            
            onPress={() => handleInfoClick(leaveType.leaveType)}
          >
            
          </TouchableOpacity>
        </View>
        
        <View style={styles.leaveCardContent}>
          {renderCircularProgress(usedLeaves, totalAllotted)}
          
          <View style={styles.leaveCardDetails}>
            <Text style={styles.consumedLeavesLabel}>Used leaves</Text>
            {leaveDetail ? (
              <Text style={styles.balanceText}>
                Balance: {remainingBalance} days
              </Text>
            ) : (
              <Text style={styles.loadingText}>Loading...</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

const renderTabButton = (tabKey: string, label: string) => (
  <TouchableOpacity
    key={tabKey}
    style={[
      styles.tabButton,
      activeTab === tabKey && styles.activeTabButton
    ]}
    onPress={() => {
      if (tabKey === 'custom') {
        setIsCustomModalOpen(true);
      } else {
        setActiveTab(tabKey);
      }
    }}
  >
    <Text style={[
      styles.tabButtonText,
      activeTab === tabKey && styles.activeTabButtonText
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const renderStatusBadge = (status: string, count: number) => (
  <TouchableOpacity
    key={status}
    style={[
      styles.statusBadge,
      selectedStatus === status && styles.activeStatusBadge
    ]}
    onPress={() => setSelectedStatus(status)}
  >
    <Text style={[
      styles.statusBadgeText,
      selectedStatus === status && styles.activeStatusBadgeText
    ]}>
      {status} ({count})
    </Text>
  </TouchableOpacity>
);

const renderLeaveItem = (leave: Leave) => {
  const statusColor = statusColors[leave.status as keyof typeof statusColors] || statusColors["Pending"];
  
  return (
    <TouchableOpacity
      key={leave._id}
      style={styles.leaveItem}
      onPress={() => handleLeaveClick(leave)}
    >
      <View style={styles.leaveItemHeader}>
        <View style={styles.leaveItemUser}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {leave.user?.firstName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {leave.user?.firstName || 'Unknown'} {leave.user?.lastName || 'User'}
            </Text>
            <Text style={styles.leaveTypeName}>{leave.leaveType?.leaveType || 'Unknown Leave Type'}</Text>
          </View>
        </View>
        
        <View style={[
          styles.statusBadgeSmall,
          { backgroundColor: statusColor?.bg, borderColor: statusColor?.border }
        ]}>
          <Text style={[styles.statusBadgeSmallText, { color: statusColor?.text }]}>
            {leave.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.separator} />
      
      <View style={styles.leaveItemDetails}>
        <View style={styles.leaveDetailRow}>
          <Text style={styles.leaveDetailLabel}>From:</Text>
          <Text style={styles.leaveDetailValue}>
            {new Date(leave.fromDate).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.leaveDetailRow}>
          <Text style={styles.leaveDetailLabel}>To:</Text>
          <Text style={styles.leaveDetailValue}>
            {new Date(leave.toDate).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.leaveDetailRow}>
          <Text style={styles.leaveDetailLabel}>Applied:</Text>
          <Text style={styles.leaveDetailValue}>{leave.appliedDays} day(s)</Text>
          <Text style={styles.leaveDetailSeparator}>|</Text>
          <Text style={styles.leaveDetailLabel}>Approved:</Text>
          <Text style={styles.leaveDetailValue}>
            {leave.leaveDays?.filter((day) => day.status === "Approved").length || 0} day(s)
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Main loading screen with skeleton
if (initialLoading) {
  return (
    <SafeAreaView className="h-full flex-1 bg-primary">
      <Navbar title="My Leave History" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {renderHeaderSkeleton()}
        {renderTabsSkeleton()}
        {renderStatusFiltersSkeleton()}
        {renderLeaveCardsSkeleton()}
        {renderLeaveItemsSkeleton()}
      </ScrollView>
    </SafeAreaView>
  );
}

return (
<SafeAreaView className="h-full flex-1 bg-primary">
<Navbar title="My Leaves" />
    
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#815BF5']}
          tintColor="#815BF5"
          title="Pull to refresh"
          titleColor="#787CA5"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>My Leave History</Text>
          <Text style={styles.headerSubtitle}>Manage and track your leave applications</Text>
        </View>
        
        <TouchableOpacity
          onPress={() => setIsModalOpen(true)}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={['#815BF5', '#FC8929']}
            style={styles.applyLeaveButton}
          >
            <Text style={styles.applyLeaveButtonText}>+ Apply Leave</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Date Range Filter Dropdown */}
      <View style={styles.dropdownContainer}>
        <CustomDropdown
          data={daysData}
          placeholder="Select Date Filter"
          selectedValue={activeTab}
          onSelect={(value) => {
            setActiveTab(value);
            if (value === 'Custom') {
              setIsCustomModalOpen(true);
            }
          }}
        />

      </View>

      {/* Status Filter */}
      <View style={styles.statusFilters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statusFiltersRow}>
            {renderStatusBadge('All', allLeavesCount)}
            {renderStatusBadge('Pending', pendingCount)}
            {renderStatusBadge('Approved', approvedCount)}
            {renderStatusBadge('Rejected', rejectedCount)}
          </View>
        </ScrollView>
      </View>

      {/* Leave Summary Section */}
      <View style={styles.leaveSummarySection}>
        <Text style={styles.sectionTitle}>Leave Balance Overview</Text>
        
        {noLeaveTypes ? (
          <View style={styles.noLeaveTypesContainer}>
            <View style={styles.emptyStateIcon}>
              <Text style={styles.emptyStateIconText}>⚙️</Text>
            </View>
            <Text style={styles.noLeaveTypesTitle}>No Leave Types Configured</Text>
            <Text style={styles.noLeaveTypesText}>
              Your organization hasn't set up any leave types yet. Please reach out to your administrator to configure leave types.
            </Text>
            <TouchableOpacity style={styles.configureButton}>
              <Text style={styles.configureButtonText}>Contact Administrator</Text>
            </TouchableOpacity>
          </View>
        ) : leaveTypes.length > 0 ? (
          <>
            {/* Quick Stats */}
            <View style={styles.quickStatsContainer}>
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatNumber}>
                  {leaveTypes.reduce((total, type) => total + (type.allotedLeaves - (leaveDetails[type._id]?.userLeaveBalance || 0)), 0)}
                </Text>
                <Text style={styles.quickStatLabel}>Total Used</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatNumber}>
                  {leaveTypes.reduce((total, type) => total + (leaveDetails[type._id]?.userLeaveBalance || 0), 0)}
                </Text>
                <Text style={styles.quickStatLabel}>Remaining</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStatItem}>
                <Text style={styles.quickStatNumber}>
                  {leaveTypes.reduce((total, type) => total + type.allotedLeaves, 0)}
                </Text>
                <Text style={styles.quickStatLabel}>Total Allotted</Text>
              </View>
            </View>

            {/* Leave Balance Cards */}
            <View style={styles.leaveCardsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.leaveCardsRow}>
                  {leaveTypes.map((leaveType) => renderLeaveCard(leaveType))}
                </View>
              </ScrollView>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#815BF5" />
            <Text style={styles.loadingText}>Loading leave types...</Text>
          </View>
        )}
      </View>

      {/* Leave Applications List */}
      <View style={styles.leaveApplicationsSection}>
        <Text style={styles.sectionTitle}>Leave Applications</Text>
        
        {finalFilteredLeaves.length > 0 ? (
          <View style={styles.leavesList}>
            {finalFilteredLeaves.map((leave) => renderLeaveItem(leave))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <LottieView
              source={require('../../../assets/Animation/no-data.json')}
              autoPlay
              loop
              style={styles.lottieAnimation}
            />
            <Text style={styles.emptyStateTitle}>
              {leaves.length === 0 ? 'No Leave Applications Yet' : 'No Leaves Found'}
            </Text>
            <Text style={styles.emptyStateText}>
              {leaves.length === 0 
                ? 'You haven\'t applied for any leaves yet. Start by applying for your first leave.'
                : `No leaves found for the selected filters (${activeTab}${selectedStatus !== 'All' ? `, ${selectedStatus}` : ''}). Try changing your filter criteria or apply for a new leave.`
              }
            </Text>
            <View style={styles.emptyStateActions}>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setIsModalOpen(true)}
              >
                <Text style={styles.emptyStateButtonText}>Apply for Leave</Text>
              </TouchableOpacity>
              {leaves.length > 0 && (
                <TouchableOpacity
                  style={[styles.emptyStateButton, styles.secondaryButton]}
                  onPress={() => {
                    setActiveTab("thisMonth");
                    setSelectedStatus("All");
                    setSelectedLeaveType("");
                  }}
                >
                  <Text style={[styles.emptyStateButtonText, styles.secondaryButtonText]}>Show All Recent</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>)}
      </View>
    </ScrollView>

    {/* Apply Leave Modal */}
    <LeaveApplyModal
      isVisible={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSuccess={handleApplyLeaveSuccess}
      leaveTypes={leaveTypes}
      leaveDetails={leaveDetails}
    />
      
    {/* Info Modal */}
    <Modal
      isVisible={isInfoModalOpen}
      onBackdropPress={handleCloseInfoModal}
      style={styles.bottomModal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={200}
      animationOutTiming={150}
      backdropOpacity={0.3}
      backdropTransitionInTiming={200}
      backdropTransitionOutTiming={150}
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
    >
      <View style={styles.modalContent}>
        {infoModalContent && (
          <>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>{infoModalContent.title}</Text>
              <TouchableOpacity 
                onPress={handleCloseInfoModal}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDescription}>{infoModalContent.description}</Text>
              <View style={styles.modalDetails}>
                {infoModalContent.details.split('\n').map((line, index) => (
                  <Text key={index} style={styles.modalDetailText}>{line}</Text>
                ))}
              </View>
            </ScrollView>
          </>
        )}
      </View>
    </Modal>

    {/* Custom Date Range Modal */}
    <Modal
      isVisible={isCustomModalOpen}
      onBackdropPress={handleCloseCustomModal}
      style={styles.bottomModal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={200}
      animationOutTiming={150}
      backdropOpacity={0.3}
      backdropTransitionInTiming={200}
      backdropTransitionOutTiming={150}
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
    >
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalHeaderTitle}>Custom Date Range</Text>
          <TouchableOpacity 
            onPress={handleCloseCustomModal}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
          <Text style={styles.modalDescription}>
            Select a start and end date to filter your leave applications
          </Text>
          {/* Add date picker components here */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsCustomModalOpen(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                // Handle custom date range application
                setIsCustomModalOpen(false);
                setActiveTab('custom');
              }}
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                colors={['#6f40f0','#8963f2']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>Apply Filter</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>

    {/* Leave Details Modal */}
    <Modal
      isVisible={isLeaveDetailsModalOpen}
      onBackdropPress={handleCloseLeaveDetailsModal}
      style={styles.bottomModal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={200}
      animationOutTiming={150}
      backdropOpacity={0.3}
      backdropTransitionInTiming={200}
      backdropTransitionOutTiming={150}
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={false}
    >
      <View style={styles.modalContent}>
        {selectedLeave && (
          <>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Leave Details</Text>
              <TouchableOpacity 
                onPress={handleCloseLeaveDetailsModal}
               
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalScrollView} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Leave Type */}
              <View style={leaveDetailStyles.leaveDetailRow}>
                <Text style={leaveDetailStyles.leaveDetailLabel}>Leave Type</Text>
                <Text style={leaveDetailStyles.leaveDetailValue}>{selectedLeave.leaveType?.leaveType || 'Unknown Leave Type'}</Text>
              </View>

              {/* Status */}
              <View style={leaveDetailStyles.leaveDetailRow}>
                <Text style={leaveDetailStyles.leaveDetailLabel}>Status</Text>
                <View style={[
                  styles.statusBadgeSmall,
                  { 
                    backgroundColor: (statusColors[selectedLeave.status as keyof typeof statusColors] || statusColors["Pending"])?.bg,
                    borderColor: (statusColors[selectedLeave.status as keyof typeof statusColors] || statusColors["Pending"])?.border
                  }
                ]}>
                  <Text style={[
                    styles.statusBadgeSmallText,
                    { color: (statusColors[selectedLeave.status as keyof typeof statusColors] || statusColors["Pending"])?.text }
                  ]}>
                    {selectedLeave.status}
                  </Text>
                </View>
              </View>

              {/* From Date */}
              <View style={leaveDetailStyles.leaveDetailRow}>
                <Text style={leaveDetailStyles.leaveDetailLabel}>From Date</Text>
                <Text style={leaveDetailStyles.leaveDetailValue}>
                  {new Date(selectedLeave.fromDate).toLocaleDateString()}
                </Text>
              </View>

              {/* To Date */}
              <View style={leaveDetailStyles.leaveDetailRow}>
                <Text style={leaveDetailStyles.leaveDetailLabel}>To Date</Text>
                <Text style={leaveDetailStyles.leaveDetailValue}>
                  {new Date(selectedLeave.toDate).toLocaleDateString()}
                </Text>
              </View>

              {/* Applied Days */}
              <View style={leaveDetailStyles.leaveDetailRow}>
                <Text style={leaveDetailStyles.leaveDetailLabel}>Applied For</Text>
                <Text style={leaveDetailStyles.leaveDetailValue}>{selectedLeave.appliedDays} Day(s)</Text>
              </View>

              {/* Approved Days */}
              <View style={leaveDetailStyles.leaveDetailRow}>
                <Text style={leaveDetailStyles.leaveDetailLabel}>Approved For</Text>
                <Text style={leaveDetailStyles.leaveDetailValue}>
                  {selectedLeave.leaveDays?.filter(day => day.status === 'Approved').length || 0} Day(s)
                </Text>
              </View>

              {/* Reason */}
              <View style={leaveDetailStyles.leaveDetailRow}>
                <Text style={leaveDetailStyles.leaveDetailLabel}>Reason</Text>
                <Text style={leaveDetailStyles.leaveDetailValue}>
                  {selectedLeave.leaveReason || selectedLeave.remarks || 'No reason provided'}
                </Text>
              </View>

              {/* Requested By */}
              <View style={leaveDetailStyles.leaveDetailRow}>
                <Text style={leaveDetailStyles.leaveDetailLabel}>Requested By</Text>
                <Text style={leaveDetailStyles.leaveDetailValue}>
                  {selectedLeave.user?.firstName || 'Unknown'} {selectedLeave.user?.lastName || 'User'}
                </Text>
              </View>

              {/* Approved/Rejected By */}
              {(selectedLeave.approvedBy || selectedLeave.rejectedBy) && (
                <View style={leaveDetailStyles.leaveDetailRow}>
                  <Text style={leaveDetailStyles.leaveDetailLabel}>
                    {selectedLeave.status === 'Approved' ? 'Approved By' : 'Rejected By'}
                  </Text>
                  <Text style={leaveDetailStyles.leaveDetailValue}>
                    {selectedLeave.approvedBy?.firstName || selectedLeave.rejectedBy?.firstName}{' '}
                    {selectedLeave.approvedBy?.lastName || selectedLeave.rejectedBy?.lastName}
                  </Text>
                </View>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </Modal>

    {/* From Date Picker Modal */}
    {Platform.OS === 'ios' ? (
      <Modal
        isVisible={isFromDatePickerOpen}
        onBackdropPress={cancelFromDateSelection}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={cancelFromDateSelection}>
              <Text style={styles.datePickerCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmFromDateSelection}>
              <Text style={styles.datePickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempFromDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => date && setTempFromDate(date)}
            style={styles.datePicker}
          />
        </View>
      </Modal>
    ) : (
      <Modal
        isVisible={isFromDatePickerOpen}
        onBackdropPress={cancelFromDateSelection}
        style={{ margin: 20, justifyContent: 'center' }}
        backdropOpacity={0.5}
      >
        <View style={[styles.datePickerContainer, { padding: 20, alignItems: 'center', borderRadius: 12 }]}>
          <Text style={{ color: 'white', fontSize: 18, marginBottom: 20, fontFamily: 'LatoBold' }}>Select From Date</Text>
          <DateTimePicker
            value={tempFromDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                const formattedDate = selectedDate.toISOString().split('T')[0];
                setApplyLeaveForm(prev => {
                  const newForm = { ...prev, fromDate: formattedDate };
                  // Update leave days if both dates are available
                  if (newForm.toDate) {
                    setTimeout(() => updateLeaveDays(formattedDate, newForm.toDate), 100);
                  }
                  return newForm;
                });
                setIsFromDatePickerOpen(false);
                reopenMainModal();
              }
            }}
            textColor="white"
          />
          <TouchableOpacity 
            onPress={cancelFromDateSelection}
            style={styles.androidCancelButton}
          >
            <Text style={styles.androidCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )}

    {/* To Date Picker Modal */}
    {Platform.OS === 'ios' ? (
      <Modal
        isVisible={isToDatePickerOpen}
        onBackdropPress={cancelToDateSelection}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        backdropOpacity={0.5}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={cancelToDateSelection}>
              <Text style={styles.datePickerCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmToDateSelection}>
              <Text style={styles.datePickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempToDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => date && setTempToDate(date)}
            style={styles.datePicker}
            minimumDate={applyLeaveForm.fromDate ? new Date(applyLeaveForm.fromDate) : undefined}
          />
        </View>
      </Modal>
    ) : (
      <Modal
        isVisible={isToDatePickerOpen}
        onBackdropPress={cancelToDateSelection}
        style={{ margin: 20, justifyContent: 'center' }}
        backdropOpacity={0.5}
      >
        <View style={[styles.datePickerContainer, { padding: 20, alignItems: 'center', borderRadius: 12 }]}>
          <Text style={{ color: 'white', fontSize: 18, marginBottom: 20, fontFamily: 'LatoBold' }}>Select To Date</Text>
          <DateTimePicker
            value={tempToDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                const formattedDate = selectedDate.toISOString().split('T')[0];
                setApplyLeaveForm(prev => {
                  const newForm = { ...prev, toDate: formattedDate };
                  // Update leave days if both dates are available
                  if (newForm.fromDate) {
                    setTimeout(() => updateLeaveDays(newForm.fromDate, formattedDate), 100);
                  }
                  return newForm;
                });
                setIsToDatePickerOpen(false);
                reopenMainModal();
              }
            }}
            textColor="white"
            minimumDate={applyLeaveForm.fromDate ? new Date(applyLeaveForm.fromDate) : undefined}
          />
          <TouchableOpacity 
            onPress={cancelToDateSelection}
            style={styles.androidCancelButton}
          >
            <Text style={styles.androidCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )}

    {/* Custom Date Range Modal */}
    <CustomDateRangeModal
      isVisible={isCustomModalOpen}
      onClose={() => {
        setIsCustomModalOpen(false);
        // Reset to previous filter if custom was cancelled
        if (activeTab === 'Custom') {
          setActiveTab('This Week');
        }
      }}
      onApply={handleCustomDateApply}
      initialStartDate={customStartDate || new Date()}
      initialEndDate={customEndDate || new Date()}
    />

      </SafeAreaView>
      
);
};

// Simple Leave Detail Row Styles
const leaveDetailStyles = StyleSheet.create({
  leaveDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
  },
  leaveDetailLabel: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    flex: 1,
  },
  leaveDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
    flex: 2,
    textAlign: 'right',
  },
});

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#05071E',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#787CA5',
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },

  // Skeleton Loading Styles
  skeletonContainer: {
    backgroundColor: '#37384B',
    overflow: 'hidden',
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4A4B5C',
    opacity: 0.7,
  },

  // Lottie Animation Styles
  lottieAnimation: {
    width: 200,
    height: 200,
    alignSelf: 'center',
  },

  // Date-wise Day Type Selection Styles
  formSubLabel: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
    marginTop: 4,
    marginBottom: 12,
  },
  dateWiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  dateWiseItem: {
    backgroundColor: '#37384B',
    borderRadius: 8,
    padding: 12,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#4A4B5C',
    marginBottom: 8,
    position: 'relative',
  },
  dateWiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateWiseDate: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },

  // Date-wise Dropdown Styles
  dateWiseDropdownButton: {
    backgroundColor: '#2A2B3D',
    borderRadius: 6,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A4B5C',
  },
  dateWiseDropdownText: {
    fontSize: 11,
    color: '#815BF5',
    fontFamily: 'LatoBold',
    flex: 1,
  },
  dateWiseDropdownArrow: {
    fontSize: 10,
    color: '#787CA5',
    marginLeft: 4,
  },
  dateWiseDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#2A2B3D',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A4B5C',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
  },
  dateWiseDropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  dateWiseDropdownItemSelected: {
    backgroundColor: '#815BF5',
  },
  dateWiseDropdownItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateWiseDropdownItemText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  dateWiseDropdownItemTextSelected: {
    color: '#FFFFFF',
  },
  dateWiseDropdownItemCheck: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  dateWiseDropdownItemDescription: {
    fontSize: 10,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  dateWiseDropdownItemDescriptionSelected: {
    color: '#E8E8E8',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,

    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'LatoBold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'Lato-Regular',
  },
  applyLeaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  applyLeaveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },

  // Dropdown Container Styles
  dropdownContainer: {

    paddingVertical: 10,
    paddingRight: 40,
    

    alignItems: 'center',
  },
  dateRangeText: {
    fontSize: 14,
    color: '#815BF5',
    fontFamily: 'LatoBold',
    marginTop: 8,
    textAlign: 'center',
  },

  // Old Tabs Styles (keeping for reference, can be removed later)
  tabsContainer: {
 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#37384B',
    borderWidth: 1,
    borderColor: '#37384B',
  },
  activeTabButton: {
    backgroundColor: '#815BF5',
    borderColor: '#815BF5',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#787CA5',
    fontWeight: '500',
    fontFamily: 'Lato-Regular',
  },
  activeTabButtonText: {
    color: '#ffffff',
    fontFamily: 'LatoBold',
  },

  // Status Filter Styles
  statusFilters: {
 
    paddingVertical: 12,

  },
  statusFiltersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#37384B',
    borderWidth: 1,
    borderColor: '#37384B',
  },
  activeStatusBadge: {
    backgroundColor: '#815BF5',
    borderColor: '#815BF5',
  },
  statusBadgeText: {
    fontSize: 12,
    color: '#787CA5',
    fontWeight: '500',
    fontFamily: 'Lato-Regular',
  },
  activeStatusBadgeText: {
    color: '#ffffff',
    fontFamily: 'LatoBold',
  },

  // Leave Summary Section Styles
  leaveSummarySection: {
 
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#37384B',
  },
  quickStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#37384B',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#815BF5',
    marginBottom: 4,
    fontFamily: 'LatoBold',
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#787CA5',
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#0A0D28',
    marginHorizontal: 8,
  },
  emptyStateIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#37384B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateIconText: {
    fontSize: 24,
  },
  configureButton: {
    backgroundColor: '#815BF5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  configureButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },

  // Leave Cards Styles
  leaveCardsContainer: {
    paddingVertical: 0,
  },
  leaveCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  leaveCard: {
    width: 200,
    backgroundColor: '#37384B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#37384B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaveCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    fontFamily: 'LatoBold',
  },
  infoButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0A0D28',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 12,
    color: '#787CA5',
  },
  leaveCardContent: {
    alignItems: 'center',
  },
  leaveCardDetails: {
    alignItems: 'center',
    marginTop: 12,
  },
  consumedLeavesLabel: {
    fontSize: 12,
    color: '#787CA5',
    marginBottom: 4,
    fontFamily: 'Lato-Regular',
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },

  // Circular Progress Styles
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  circularProgressWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgressBackground: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  circularProgressForeground: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  circularProgressText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  circularProgressNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'LatoBold',
    lineHeight: 18,
  },
  circularProgressTotal: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'Lato-Regular',
    lineHeight: 14,
  },

  // Leave Applications Section
  leaveApplicationsSection: {
    padding: 20,
    paddingBottom: 100, // Add extra bottom padding to ensure full scroll
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    fontFamily: 'LatoBold',
    marginLeft: 24,
  },
  leavesList: {
    gap: 12,
  },

  // Leave Item Styles
  leaveItem: {
    backgroundColor: '#37384B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#37384B',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  leaveItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveItemUser: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#815BF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 2,
    fontFamily: 'LatoBold',
  },
  leaveTypeName: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'Lato-Regular',
  },
  statusBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeSmallText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'LatoBold',
  },
  separator: {
    height: 1,
    backgroundColor: '#0A0D28',
    marginVertical: 12,
  },
  leaveItemDetails: {
    gap: 8,
  },
  leaveDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  leaveDetailLabel: {
    fontSize: 14,
    color: '#787CA5',
    fontFamily: 'Lato-Regular',
  },
  leaveDetailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: 'LatoBold',
  },
  leaveDetailSeparator: {
    fontSize: 14,
    color: '#787CA5',
    marginHorizontal: 4,
  },

  // Empty State Styles
  emptyStateContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#37384B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#37384B',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'LatoBold',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#787CA5',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Lato-Regular',
  },
  emptyStateActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  emptyStateButton: {
    backgroundColor: '#815BF5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'LatoBold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#815BF5',
  },
  secondaryButtonText: {
    color: '#815BF5',
  },

  // No Leave Types Styles
  noLeaveTypesContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#37384B',
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#37384B',
  },
  noLeaveTypesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'LatoBold',
  },
  noLeaveTypesText: {
    fontSize: 14,
    color: '#787CA5',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
    fontFamily: 'Lato-Regular',
  },

  // Modal Styles (matching RegularizationModal)
  bottomModal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0B0D29',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  
  // Apply Leave Modal Styles
  applyLeaveModalContent: {
    backgroundColor: '#0B0D29',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  modalHeaderTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'LatoBold',
  },
  closeButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalScrollView: {
    padding: 20,
  },
  modalSubtitle: {
    color: '#787CA5',
    fontSize: 14,
    marginBottom: 20,
    fontFamily: 'LatoRegular',
    lineHeight: 20,
  },
  
  // Form Styles (matching RegularizationModal)
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'LatoBold',
  },
  
  // Dropdown Styles
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    padding: 14,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'LatoRegular',
    flex: 1,
  },
  placeholderText: {
    color: '#787CA5',
  },
  selectedText: {
    color: '#fff',
    fontFamily: 'LatoBold',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#787CA5',
    marginLeft: 8,
  },
  dropdownMenu: {
    backgroundColor: '#0B0D29',
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#272945',
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#fff',
    fontFamily: 'LatoRegular',
  },
  dropdownItemBalance: {
    fontSize: 12,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  
  // Date Input Styles
  dateRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    padding: 14,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
    justifyContent: 'space-between',
  },
  dateInputText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'LatoRegular',
  },
  calendarIcon: {
    fontSize: 16,
  },
  
  // Text Area Styles
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    textAlignVertical: 'top',
    minHeight: 120,
    fontFamily: 'LatoRegular',
    fontSize: 15,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
  },
  activeTextAreaInput: {
    borderColor: '#815BF5',
    backgroundColor: 'rgba(129, 91, 245, 0.1)',
  },
  
  // Attachment Styles
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#272945',
    borderRadius: 10,
    padding: 14,
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  attachmentButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  attachmentButtonText: {
    fontSize: 15,
    color: '#787CA5',
    fontFamily: 'LatoRegular',
  },
  attachmentsList: {
    marginTop: 12,
  },
  attachmentItem: {
    backgroundColor: 'rgba(39, 41, 69, 0.2)',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#272945',
  },
  attachmentName: {
    fontSize: 14,
    color: '#fff',
    flex: 1,
    fontFamily: 'LatoRegular',
  },
  removeAttachmentButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeAttachmentText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  
  // Submit Button Styles (matching RegularizationModal)
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 15,
    flex: 1,
    marginLeft: 8,
    shadowColor: "#815BF5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'LatoBold',
    marginRight: 8,
  },
  
  // Additional Modal Styles
  statusBadgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalDescription: {
    color: '#787CA5',
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'LatoRegular',
    lineHeight: 20,
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#787CA5',
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'LatoRegular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: 'rgba(39, 41, 69, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#272945',
  },
  cancelButtonText: {
    color: '#787CA5',
    fontSize: 14,
    fontFamily: 'LatoRegular',
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'LatoBold',
  },
  modalDescription: {
    fontSize: 14,
    color: '#787CA5',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Lato-Regular',
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalDetailText: {
    fontSize: 14,
    color: '#787CA5',
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'Lato-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#815BF5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'LatoBold',
  },
  cancelButton: {
    backgroundColor: '#0A0D28',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0A0D28',
  },
  cancelButtonText: {
    color: '#787CA5',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Lato-Regular',
  },
  applyButton: {
    backgroundColor: '#815BF5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'LatoBold',
  },

  // Date Picker Modal Styles
  datePickerContainer: {
    backgroundColor: '#0B0D29',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#272945',
  },
  datePickerCancel: {
    color: '#FC8929',
    fontSize: 16,
    fontFamily: 'LatoRegular',
    padding: 4,
  },
  datePickerDone: {
    color: '#815BF5',
    fontSize: 16,
    fontFamily: 'LatoBold',
    padding: 4,
  },
  datePicker: {
    backgroundColor: '#0B0D29',
    height: 200,
  },
  androidCancelButton: {
    marginTop: 20, 
    padding: 12, 
    backgroundColor: '#37384B', 
    borderRadius: 10,
    paddingHorizontal: 30,
  },
  androidCancelText: {
    color: 'white', 
    fontFamily: 'LatoBold',
    fontSize: 15
  }
});