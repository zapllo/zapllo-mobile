import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import NavbarTwo from '~/components/navbarTwo';
import * as Haptics from 'expo-haptics';
import ProfileComponent from '~/components/Teams/ProfileComponent';
import PersonalDetails from '~/components/Teams/PersonalDetails';
import Salary from '~/components/Teams/Salary';
import Deductions from '~/components/Teams/Deductions';
import PayslipComponent from '~/components/Teams/PayslipComponent';
import UserLogs from '~/components/Teams/UserLogs';
import AttendanceReport from '~/components/Teams/AttendanceReport';
import CustomSplashScreen from '~/components/CustomSplashScreen';

const { width, height } = Dimensions.get('window');

interface UserDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsappNo: string;
  profilePic: string;
  role: string;
  reportingManager: {
    firstName: string;
    lastName: string;
    whatsappNo: string;
  } | null;
  isLeaveAccess: boolean;
  isTaskAccess: boolean;
  country: string;
  designation: string;
  staffType: string;
  contactNumber: string;
  asset: string;
  branch: string;
  status: string;
  employeeId: string;
}

interface AttendanceData {
  totalDays: number;
  workingDays: number;
  weekOffs: number;
  holidays: any[];
  report: any[];
}

type TabType = 'profile' | 'personal' | 'attendance' | 'salary' | 'deductions' | 'payslip' | 'logs';

const tabs = [
  { id: 'profile', name: 'Profile', icon: 'person' },
  { id: 'personal', name: 'Personal', icon: 'description' },
  { id: 'attendance', name: 'Attendance', icon: 'event' },
  { id: 'salary', name: 'Salary', icon: 'account-balance-wallet' },
  { id: 'deductions', name: 'Deductions', icon: 'remove-circle-outline' },
  { id: 'payslip', name: 'Payslip', icon: 'receipt' },
  { id: 'logs', name: 'Logs', icon: 'history' },
];

const UserDetailsScreen: React.FC = () => {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const { token } = useSelector((state: RootState) => state.auth);
  
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [isPlanEligible, setIsPlanEligible] = useState<boolean>(false);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [showSplashScreen, setShowSplashScreen] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    fetchPlanStatus();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const userRes = await axios.get(`${backend_Host}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentUser = userRes.data.data;
      setCurrentUserRole(currentUser.role);

      if (currentUser.role !== 'orgAdmin') {
        setLoading(false);
        return;
      }

      if (userId) {
        const response = await axios.get(`${backend_Host}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      Alert.alert('Error', 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanStatus = async () => {
    try {
      const response = await axios.get(`${backend_Host}/organization/getById`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { subscribedPlan: plan } = response.data.data;
      const eligiblePlans = ['Money Saver Bundle', 'Zapllo Payroll'];
      setIsPlanEligible(eligiblePlans.includes(plan));
    } catch (error) {
      console.error('Error fetching plan status:', error);
    }
  };

  const handleTabPress = (tabId: TabType) => {
    const isLocked = !isPlanEligible && ['attendance', 'salary', 'deductions', 'payslip', 'logs'].includes(tabId);
    
    if (isLocked) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Upgrade Required', 'Upgrade to Money Saver Bundle to unlock this feature');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!user) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const response = await axios.patch(`${backend_Host}/users/update`, {
        _id: user._id,
        status: status,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUser(response.data.user);
        Alert.alert('Success', `User status changed to ${status}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'orgAdmin':
        return ['#EF4444', '#DC2626'];
      case 'manager':
        return ['#3B82F6', '#1E40AF'];
      case 'member':
        return ['#10B981', '#059669'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'orgAdmin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'member':
        return 'Team Member';
      default:
        return role;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderProfileSection = () => (
    <ScrollView style={styles.sectionContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={20} color="#815BF5" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color="#10B981" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>WhatsApp</Text>
              <Text style={styles.infoValue}>{user?.whatsappNo || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={20} color="#3B82F6" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Contact Number</Text>
              <Text style={styles.infoValue}>{user?.contactNumber || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Work Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MaterialIcons name="work" size={20} color="#F59E0B" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Designation</Text>
              <Text style={styles.infoValue}>{user?.designation || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="business" size={20} color="#8B5CF6" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Branch</Text>
              <Text style={styles.infoValue}>{user?.branch || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="category" size={20} color="#EF4444" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Staff Type</Text>
              <Text style={styles.infoValue}>{user?.staffType || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Access Permissions</Text>
        <View style={styles.infoCard}>
          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <MaterialIcons name="task" size={20} color="#3B82F6" />
              <Text style={styles.permissionLabel}>Task Access</Text>
            </View>
            <View style={[styles.permissionBadge, user?.isTaskAccess ? styles.permissionActive : styles.permissionInactive]}>
              <Text style={[styles.permissionText, user?.isTaskAccess ? styles.permissionActiveText : styles.permissionInactiveText]}>
                {user?.isTaskAccess ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
          
          <View style={styles.permissionRow}>
            <View style={styles.permissionInfo}>
              <MaterialIcons name="event" size={20} color="#10B981" />
              <Text style={styles.permissionLabel}>Leave Access</Text>
            </View>
            <View style={[styles.permissionBadge, user?.isLeaveAccess ? styles.permissionActive : styles.permissionInactive]}>
              <Text style={[styles.permissionText, user?.isLeaveAccess ? styles.permissionActiveText : styles.permissionInactiveText]}>
                {user?.isLeaveAccess ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderPersonalSection = () => (
    <PersonalDetails userId={userId} />
  );

  const renderAttendanceSection = () => (
    <AttendanceReport userId={userId} />
  );

  const renderSalarySection = () => (
    <Salary userId={userId} />
  );

  const renderDeductionsSection = () => (
    <Deductions userId={userId} />
  );

  const renderPayslipSection = () => (
    <PayslipComponent userId={userId} />
  );

  const renderLogsSection = () => (
    <UserLogs userId={userId} />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileComponent userId={userId} />;
      case 'personal':
        return renderPersonalSection();
      case 'attendance':
        return renderAttendanceSection();
      case 'salary':
        return renderSalarySection();
      case 'deductions':
        return renderDeductionsSection();
      case 'payslip':
        return renderPayslipSection();
      case 'logs':
        return renderLogsSection();
      default:
        return <ProfileComponent userId={userId} />;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Employee Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FC8929" />
          <Text style={styles.loadingText}>Loading employee details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentUserRole !== 'orgAdmin') {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Employee Details" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="lock" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorText}>
            You don't have permission to access employee details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <NavbarTwo title="Employee Details" />
        <View style={styles.errorContainer}>
          <MaterialIcons name="person-off" size={64} color="#F59E0B" />
          <Text style={styles.errorTitle}>User Not Found</Text>
          <Text style={styles.errorText}>
            The employee you're looking for doesn't exist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <NavbarTwo title="Employee Details" />
       <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* User Header */}
      <View style={styles.userHeader}>
        <LinearGradient
          colors={['rgba(129, 91, 245, 0.1)', 'rgba(252, 137, 41, 0.05)']}
          style={styles.userHeaderGradient}
        >
          <View style={styles.userHeaderContent}>
            <View style={styles.avatarContainer}>
              {user.profilePic ? (
                <Image source={{ uri: user.profilePic }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={getRoleBadgeColor(user.role)}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(user.firstName, user.lastName)}
                  </Text>
                </LinearGradient>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              
              <LinearGradient
                colors={getRoleBadgeColor(user.role)}
                style={styles.roleBadge}
              >
                <Text style={styles.roleText}>{getRoleDisplayName(user.role)}</Text>
              </LinearGradient>
              
              <View style={styles.userMeta}>
                <View style={styles.userMetaItem}>
                  <MaterialIcons name="badge" size={14} color="#A9A9A9" />
                  <Text style={styles.userMetaText}>ID: {user.employeeId}</Text>
                </View>
                
                {user.designation && (
                  <View style={styles.userMetaItem}>
                    <MaterialIcons name="work" size={14} color="#A9A9A9" />
                    <Text style={styles.userMetaText}>{user.designation}</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={[styles.statusBadge, user.status === 'Active' ? styles.statusActive : styles.statusInactive]}>
              <Text style={[styles.statusText, user.status === 'Active' ? styles.statusActiveText : styles.statusInactiveText]}>
                {user.status || 'Active'}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
      </ScrollView>
      {/* Bottom Tab Bar */}
      <View style={styles.bottomTabContainer}>
        <LinearGradient
          colors={['#352755', '#0A0D28']}
          style={styles.bottomTabGradient}
          
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bottomTabScrollContent}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const isLocked = !isPlanEligible && ['attendance', 'salary', 'deductions', 'payslip', 'logs'].includes(tab.id);
              
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.bottomTabItem, isActive && styles.bottomTabItemActive]}
                  onPress={() => handleTabPress(tab.id as TabType)}
                >
                  <View style={styles.bottomTabIconContainer}>
                    <MaterialIcons
                      name={tab.icon as any}
                      size={20}
                      color={isActive ? '#815BF5' : isLocked ? '#6B7280' : '#A9A9A9'}
                    />
                    {isLocked && (
                      <MaterialIcons
                        name="lock"
                        size={12}
                        color="#6B7280"
                        style={styles.lockIcon}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.bottomTabText,
                      isActive && styles.bottomTabTextActive,
                      isLocked && styles.bottomTabTextLocked,
                    ]}
                  >
                    {tab.name}
                  </Text>
             
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </LinearGradient>
      </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0D28',
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
  userHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userHeaderGradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 16,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  roleText: {
    fontFamily: 'LatoBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  userMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  userMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userMetaText: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusInactive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontFamily: 'LatoBold',
    fontSize: 12,
  },
  statusActiveText: {
    color: '#10B981',
  },
  statusInactiveText: {
    color: '#EF4444',
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    paddingBottom: 100,
  },
  sectionTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  permissionLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  permissionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  permissionActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  permissionInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  permissionText: {
    fontFamily: 'LatoBold',
    fontSize: 10,
  },
  permissionActiveText: {
    color: '#10B981',
  },
  permissionInactiveText: {
    color: '#6B7280',
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  comingSoonTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
    maxWidth: 280,
  },
  payslipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  payslipCardTitle: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  payslipCardDescription: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 20,
  },
  payslipControls: {
    gap: 16,
  },
  monthYearContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  monthYearItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthYearLabel: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
    marginBottom: 4,
  },
  monthYearValue: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
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
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  bottomTabGradient: {
    paddingTop: 8,

  
  },
  bottomTabScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  bottomTabItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 70,
    position: 'relative',
  },
  bottomTabItemActive: {
   
  },
  bottomTabIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  lockIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  bottomTabText: {
    fontFamily: 'LatoRegular',
    fontSize: 10,
    color: '#A9A9A9',
    textAlign: 'center',
  },
  bottomTabTextActive: {
    color: '#815BF5',
    fontFamily: 'LatoBold',
  },
  bottomTabTextLocked: {
    color: '#6B7280',
  },
  bottomTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#815BF5',
    borderRadius: 1,
  },
});

export default UserDetailsScreen;