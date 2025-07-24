import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  Dimensions,
  Linking,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { backend_Host } from '~/config';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import CustomDeleteModal from '~/components/CustomDeleteModal';
import EditMemberModal from '~/components/Teams/EditMemberModal';
import AddMemberModal from '~/components/Teams/AddMemberModal';
import ToastAlert, { ToastType } from '~/components/ToastAlert';

const { width } = Dimensions.get('window');

interface User {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  whatsappNo: string;
  reportingManager: string;
  profilePic: string;
  country: string;
  isLeaveAccess: boolean;
  isTaskAccess: boolean;
}

interface TeamTabsProps {
  currentUser: User | null;
  isTrialExpired: boolean;
}

type TabType = 'all' | 'orgAdmin' | 'manager' | 'member';

const TeamTabs: React.FC<TeamTabsProps> = ({ currentUser, isTrialExpired }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReportingManager, setSelectedReportingManager] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reportingManagerNames, setReportingManagerNames] = useState<{[key: string]: string}>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<ToastType>('success');
  const [toastTitle, setToastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  // Helper function to show toast
  const showToastMessage = (type: ToastType, title: string, message?: string) => {
    setToastType(type);
    setToastTitle(title);
    setToastMessage(message || '');
    setShowToast(true);
  };

  const fetchUsers = useCallback(async (isRefreshing = false) => {
    try {
      if (!token) return;
      
      if (!isRefreshing) setIsLoading(true);

      const response = await axios.get(`${backend_Host}/users/organization`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (response.data?.data) {
        setUsers(response.data.data);
        await fetchReportingManagerNames(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToastMessage('error', 'Error', 'Failed to fetch team members. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers(true);
  }, [fetchUsers]);

  const fetchReportingManagerNames = async (usersList: User[]) => {
    const managerNames: { [key: string]: string } = {};
    
    for (const user of usersList) {
      if (user.reportingManager) {
        try {
          const response = await axios.get(`${backend_Host}/users/${user.reportingManager}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.data?.data) {
            managerNames[user._id] = response.data.data.firstName;
          }
        } catch (error) {
          console.error(`Error fetching manager for user ${user._id}:`, error);
        }
      }
    }
    
    setReportingManagerNames(managerNames);
  };

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(user => 
        user.role.toLowerCase().includes(activeTab.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }

    // Filter by reporting manager
    if (selectedReportingManager) {
      filtered = filtered.filter(user => 
        user.reportingManager === selectedReportingManager
      );
    }

    setFilteredUsers(filtered);
  }, [users, activeTab, searchQuery, selectedReportingManager]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  useEffect(() => {
    if (!isLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoading, fadeAnim, slideAnim]);

  const handleDeleteUser = (user: User) => {
    if (user._id === currentUser?._id) {
      showToastMessage('error', 'Error', 'You cannot delete yourself');
      return;
    }

    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const response = await axios.delete(`${backend_Host}/users/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { userIdToDelete: userToDelete._id },
      });

      if (response.data?.success) {
        showToastMessage(
          'success', 
          'Member Deleted!', 
          `${userToDelete.firstName} ${userToDelete.lastName} has been successfully removed from the team.`
        );
        fetchUsers();
        closeDeleteModal();
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      showToastMessage(
        'error', 
        'Delete Failed', 
        'Failed to delete team member. Please try again.'
      );
      setIsDeleting(false);
    }
  };

  const openWhatsApp = (phoneNumber: string) => {
    const url = `whatsapp://send?phone=${phoneNumber}`;
    Linking.openURL(url).catch(() => {
      showToastMessage('error', 'Error', 'WhatsApp is not installed on this device');
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'orgAdmin':
        return '#B4173B';
      case 'manager':
        return '#3B82F6';
      case 'member':
        return '#007A5A';
      default:
        return '#6B7280';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'orgAdmin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'member':
        return 'Member';
      default:
        return role;
    }
  };

  const handleUserCardPress = (user: User) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to user details screen
    router.push(`/(routes)/teams/user-details/${user._id}` as any);
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      key={tab}
      style={styles.tabButton}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setActiveTab(tab);
      }}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tab && styles.activeTabButtonText,
        ]}
      >
        {label}
      </Text>
      {activeTab === tab && (
        <View style={styles.tabUnderline} />
      )}
    </TouchableOpacity>
  );

  const renderUserCard = ({ item: user }: { item: User }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleUserCardPress(user)}
      style={styles.userCardTouchable}
    >
      <Animated.View
        style={[
          styles.userCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.userCardContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {user.profilePic ? (
                <Image source={{ uri: user.profilePic }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={['#815BF5', '#FC8929']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(user.firstName, user.lastName)}
                  </Text>
                </LinearGradient>
              )}
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user.firstName} {user.lastName}
              </Text>
              
              <View style={styles.userMetaContainer}>
                <View style={styles.userMetaItem}>
                  <MaterialIcons name="email" size={12} color="#A9A9A9" />
                  <Text style={styles.userMetaText}>{user.email}</Text>
                </View>
                
                {user.whatsappNo && (
                  <View style={styles.userMetaItem}>
                    <MaterialIcons name="phone" size={12} color="#25D366" />
                    <Text style={styles.userMetaText}>{user.whatsappNo}</Text>
                  </View>
                )}
                
                {reportingManagerNames[user._id] && (
                  <View style={styles.userMetaItem}>
                    <MaterialIcons name="person" size={12} color="#A9A9A9" />
                    <Text style={styles.userMetaText}>
                      Reports to {reportingManagerNames[user._id]}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.userActions}>
            <View style={styles.badgeContainer}>
              {user.isTaskAccess && (
                <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <Text style={[styles.badgeText, { color: '#3B82F6' }]}>Tasks</Text>
                </View>
              )}
              {user.isLeaveAccess && (
                <View style={[styles.badge, { backgroundColor: 'rgba(129, 91, 245, 0.2)' }]}>
                  <Text style={[styles.badgeText, { color: '#815BF5' }]}>Payroll</Text>
                </View>
              )}
            </View>

            <View style={[styles.roleTag, { backgroundColor: getRoleColor(user.role) }]}>
              <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
            </View>

            {currentUser?.role === 'orgAdmin' && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedUser(user);
                    setIsEditModalVisible(true);
                  }}
                >
                  <MaterialIcons name="edit" size={16} color="#3B82F6" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleDeleteUser(user);
                  }}
                  disabled={user._id === currentUser?._id}
                >
                  <MaterialIcons 
                    name="delete" 
                    size={16} 
                    color={user._id === currentUser?._id ? "#6B7280" : "#EF4444"} 
                  />
                </TouchableOpacity>

                {user.whatsappNo && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      openWhatsApp(user.whatsappNo);
                    }}
                  >
                    <MaterialIcons name="message" size={16} color="#25D366" />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="groups" size={64} color="#6B7280" />
      <Text style={styles.emptyStateTitle}>No team members found</Text>
      <Text style={styles.emptyStateText}>
        {activeTab !== 'all'
          ? `No members with ${activeTab === 'orgAdmin' ? 'admin' : activeTab} role found.`
          : searchQuery
          ? 'No members match your search criteria.'
          : 'Start building your team by adding members.'}
      </Text>
      {currentUser?.role === 'orgAdmin' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsAddModalVisible(true);
          }}
        >
          <MaterialIcons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Member</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FC8929" />
        <Text style={styles.loadingText}>Loading team members...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FC8929']}
            tintColor="#FC8929"
            title="Pull to refresh"
            titleColor="#FC8929"
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <LinearGradient
              colors={['rgba(129, 91, 245, 0.15)', 'rgba(252, 137, 41, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerIcon}>
                  <MaterialIcons name="groups" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.headerTextContainer}>
                  <Text style={styles.headerTitle}>Team Management</Text>
                  <Text style={styles.headerSubtitle}>
                    Organize and manage your team members
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {renderTabButton('all', 'All')}
            {renderTabButton('orgAdmin', 'Admin')}
            {renderTabButton('manager', 'Manager')}
            {renderTabButton('member', 'Member')}
          </View>

          {/* Search and Filters */}
          <View style={styles.filtersContainer}>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#A9A9A9" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search team members..."
                placeholderTextColor="#A9A9A9"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {currentUser?.role === 'orgAdmin' && (
              <TouchableOpacity
                style={styles.addMemberButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setIsAddModalVisible(true);
                }}
              >
                <LinearGradient
                  colors={['#017a5b', '#15624f']}
                  style={styles.addMemberGradient}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addMemberText}>Add Member</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Team Count */}
          <View style={styles.countContainer}>
            <LinearGradient
              colors={['#815BF5', '#FC8929']}
              style={styles.countGradient}
            >
              <MaterialIcons name="groups" size={16} color="#FFFFFF" />
              <Text style={styles.countText}>{filteredUsers.length} Members</Text>
            </LinearGradient>
          </View>

          {/* User List */}
          <View style={styles.listContainer}>
            {filteredUsers.length === 0 ? (
              renderEmptyState()
            ) : (
              filteredUsers.map((user) => (
                <View key={user._id}>
                  {renderUserCard({ item: user })}
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Add Member Modal */}
      <AddMemberModal
        visible={isAddModalVisible}
        users={users}
        currentUser={currentUser}
        onClose={() => setIsAddModalVisible(false)}
        onUpdate={() => {
          fetchUsers();
          setIsAddModalVisible(false);
        }}
      />

      {/* Edit Member Modal */}
      <EditMemberModal
        visible={isEditModalVisible}
        user={selectedUser}
        users={users}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedUser(null);
        }}
        onUpdate={() => {
          fetchUsers();
          setIsEditModalVisible(false);
          setSelectedUser(null);
        }}
      />

      {/* Custom Delete Modal */}
      {userToDelete && (
        <CustomDeleteModal
          visible={showDeleteModal}
          title="Are you sure you want to"
          subtitle="delete this team member?"
          itemName={`${userToDelete.firstName} ${userToDelete.lastName}`}
          onCancel={closeDeleteModal}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
          cancelText="No, Keep "
          confirmText="Delete "
        />
      )}

      {/* Toast Alert - Now positioned relative to the screen, not the scroll view */}
      <ToastAlert
        visible={showToast}
        type={toastType}
        title={toastTitle}
        message={toastMessage}
        onHide={() => setShowToast(false)}
        position="bottom"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerGradient: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: 'LatoBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Lato-Light',
    fontSize: 14,
    color: '#A9A9A9',
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 5,
  },
  tabButtonText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    marginBottom: 4,
  },
  activeTabButtonText: {
    color: '#815BF5',
    fontFamily: 'LatoBold',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: '#815BF5',
    borderRadius: 2,
    shadowColor: '#815BF5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#FFFFFF',
  },
  addMemberButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addMemberGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
  },
  addMemberText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  countContainer: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  countGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  countText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  listContainer: {
    flexGrow: 1,
  },
  userCardTouchable: {
    marginBottom: 12,
  },
  userCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  userCardContent: {
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: 12,
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
    fontSize: 18,
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userMetaContainer: {
    gap: 4,
  },
  userMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userMetaText: {
    fontFamily: 'LatoRegular',
    fontSize: 12,
    color: '#A9A9A9',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontFamily: 'LatoRegular',
    fontSize: 10,
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontFamily: 'LatoBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'LatoRegular',
    fontSize: 14,
    color: '#A9A9A9',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 280,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#017a5b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'LatoRegular',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 16,
  },
});

export default TeamTabs;