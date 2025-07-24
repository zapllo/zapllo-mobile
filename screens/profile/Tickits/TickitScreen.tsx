import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { ScrollView } from 'react-native';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import Modal from 'react-native-modal';
import axios from 'axios';
import moment from 'moment';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Components
import NavbarTwo from '~/components/navbarTwo';
import TickitCard from '~/components/profile/TickitCard';
import InputContainer from '~/components/InputContainer';
import CustomDropdown from '~/components/customDropDown';
import ToastAlert from '~/components/ToastAlert';

// Config & Redux
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

const categoryData = [
  { label: 'Report An Error', value: 'Report An Error' },
  { label: 'Provide Feedback', value: 'Provide Feedback' },
  { label: 'Payment/Subscription Issue', value: 'Payment/Subscription Issue' },
  { label: 'Delete My Accunt', value: 'Delete My Accunt' },
];

const subCategoryData = [
  { label: 'Task Delegation', value: 'Task Delegation' },
  { label: 'My Team', value: 'My Team' },
  { label: 'Intranet', value: 'Intranet' },
  { label: 'Leaves', value: 'Leaves' },
  { label: 'Attendance', value: 'Attendance' },
  { label: 'Other', value: 'Other' },
];

export default function TickitScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { token, userData } = useSelector((state: RootState) => state.auth);
  const [searchTickit, setSearchTickit] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [category, setCategory] = useState('Report An Error');
  const [subCategory, setSubCategory] = useState('Task Delegation');
  const [isDescriptionFocused, setDescriptionFocused] = useState(false);
  const [tickitDescription, setTickitDescription] = useState('');
  const [showFabLabel, setShowFabLabel] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const fabAnim = useRef(new Animated.Value(1)).current;
  const fabLabelAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => setDescriptionFocused(true);
  const handleBlur = () => setDescriptionFocused(false);

  // Start animations immediately on component mount
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start FAB pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animate in the FAB label
    Animated.timing(fabLabelAnim, {
      toValue: 1,
      duration: 500,
      delay: 1000,
      useNativeDriver: true,
    }).start();

    // Hide the FAB label after 3 seconds
    const timer = setTimeout(() => {
      Animated.timing(fabLabelAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowFabLabel(false));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get(`${backend_Host}/tickets/get`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log("resssssssssssssss",response.data)
        setTickets(response?.data)
      } catch (err: any) {
        console.error('API Error:', err.response || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
   
  }, [token]);

  const filteredTickets = useMemo(() => {
    const lowerCaseQuery = searchTickit.toLowerCase();
    return tickets.filter(
      (ticket:any) =>
        ticket?.subject.toLowerCase().includes(lowerCaseQuery) ||
        ticket?.description.toLowerCase().includes(lowerCaseQuery) ||
        ticket?.category?.toLowerCase().includes(lowerCaseQuery) ||
        ticket?.subCategory?.toLowerCase().includes(lowerCaseQuery)
    );
  }, [searchTickit, tickets]);

  const showToastMessage = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
  };

  const handelAddNewTicket = async () => {
    if (!newTicketMessage) {
      showToastMessage('error', 'Subject is required!');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${backend_Host}/tickets`,
        {
          user: userData?.data?._id || userData?.data?._id,
          subject: newTicketMessage,
          description: tickitDescription,
          category: category,
          subcategory: subCategory
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Ticket created successfully:', response.data);
      setTickets([...tickets, response?.data]);
      
      // Clear form fields first
      setNewTicketMessage('');
      setTickitDescription('');
      
      // Close modal
      setModalVisible(false);
      
      // Show success toast
      setTimeout(() => {
        showToastMessage('success', 'Ticket submitted successfully!');
      }, 500);
      
    } catch (error) {
      console.error('Error creating ticket:', error);
      showToastMessage('error', 'Failed to create ticket. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openTicketModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  };

  const closeTicketModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(false);
  };

  const handleFabPress = () => {
    // Show the label again if it's hidden
    if (!showFabLabel) {
      setShowFabLabel(true);
      Animated.timing(fabLabelAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      // Hide it again after 3 seconds
      setTimeout(() => {
        Animated.timing(fabLabelAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowFabLabel(false));
      }, 3000);
    }
    
    openTicketModal();
  };

  // Function to handle ticket deletion from child component
  const handleTicketDeleted = (deletedTicketId: string) => {
    setTickets(tickets.filter((ticket: any) => ticket._id !== deletedTicketId));
    showToastMessage('success', 'Ticket deleted successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        
        <NavbarTwo title="Support Tickets" />
        
        {/* Search Bar */}
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }]
            }
          ]}
        >
          <View style={styles.searchIconContainer}>
            <MaterialIcons name="search" size={22} color="#787CA5" />
          </View>
          <TextInput
            style={styles.searchInput}
            value={searchTickit}
            onChangeText={(value) => setSearchTickit(value)}
            placeholder="Search tickets..."
            placeholderTextColor="#787CA5"
          />
          {searchTickit.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchTickit('')}
            >
              <MaterialIcons name="close" size={18} color="#787CA5" />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Tickets List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#815BF5" />
              <Text style={styles.loadingText}>Loading tickets...</Text>
            </View>
          ) : filteredTickets.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                {searchTickit ? 'Search Results' : isAdmin ? 'All User Tickets' : 'Your Tickets'}
              </Text>
              {filteredTickets.map((ticket: any, index) => (
                <TickitCard
                  key={index}
                  status={ticket?.status}
                  message={ticket?.description}
                  date={moment(ticket?.createdAt).format('ddd, MMMM D - h:mm A')}
                  category={ticket?.category}
                  subCategory={ticket?.subcategory}
                  subject={ticket?.subject}
                  id={ticket?._id}
                  onTicketDeleted={handleTicketDeleted}
                  // Add user name prop for admin view
                  userName={isAdmin ? ticket?.user?.name || "Unknown User" : undefined}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
                <LottieView
                  style={{width: 250, height: 250}}
                  source={require('../../../assets/Animation/no-tickit.json')}
                  autoPlay
                  loop={false}
                  progress={1} // Shows the last frame of the animation
                />
              <Text style={styles.emptyStateTitle}>No tickets found</Text>
              <Text style={styles.emptyStateDescription}>
                {searchTickit 
                  ? "We couldn't find any tickets matching your search." 
                  : "You haven't created any support tickets yet."}
              </Text>
              {searchTickit && (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={() => setSearchTickit('')}
                >
                  <Text style={styles.clearSearchText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Extra space at bottom for FAB */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Action Button */}
        <View style={styles.fabContainer}>
          {showFabLabel && (
            <Animated.View 
              style={[
                styles.fabLabelContainer,
                {
                  opacity: fabLabelAnim,
                  transform: [
                    { translateX: fabLabelAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              <LinearGradient
                colors={['#ebdba5', '#d7ae48']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.fabLabel}
              >
                <Text style={styles.fabLabelText}>Raise a Ticket</Text>
              </LinearGradient>
            </Animated.View>
          )}
          
          <Animated.View 
            style={{
              transform: [{ scale: fabAnim }]
            }}
          >
            <TouchableOpacity
              style={styles.fab}
              onPress={handleFabPress}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FC8929', '#f7a15a']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.fabGradient}
              >
                <MaterialIcons name="add" size={28} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Create Ticket Modal */}
        <Modal
          isVisible={modalVisible}
          onBackdropPress={closeTicketModal}
          backdropOpacity={0.5}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          style={styles.modal}
          backdropTransitionInTiming={300}
          backdropTransitionOutTiming={300}
          animationInTiming={400}
          animationOutTiming={400}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardAvoid}
          >
            <View style={styles.modalContent}>
             
              
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalDragHandle} />
                  <Text style={styles.modalTitle}>Raise a Ticket</Text>
                  <Text style={styles.modalSubtitle}>
                    Tell us how we can help you today
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={closeTicketModal}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <BlurView intensity={20} tint="dark" style={styles.modalCloseButtonBlur}>
                    <MaterialIcons name="close" size={22} color="#FFFFFF" />
                  </BlurView>
                </TouchableOpacity>
              </View>

              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollViewContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.formSection}>
                  <Text style={styles.formSectionTitle}>Ticket Details</Text>
                  
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Category</Text>
                    <CustomDropdown
                      data={categoryData}
                      selectedValue={category}
                      onSelect={(value) => setCategory(value)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>Sub-Category</Text>
                    <CustomDropdown
                      data={subCategoryData}
                      selectedValue={subCategory}
                      onSelect={(value) => setSubCategory(value)}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    
                    <InputContainer
                      placeholder="Enter a brief subject for your ticket"
                      value={newTicketMessage}
                      onChangeText={(value) => setNewTicketMessage(value)}backgroundColor="#0A0D28"
                      passwordError={''}
                      keyboardType="default"
                      label='Subject'
                    />
                  </View>

                  <View >
                    <Text style={styles.formLabel}>Description</Text>
                    <View
                      style={[
                        styles.textAreaContainer,
                        {
                          borderColor: isDescriptionFocused ? '#815BF5' : '#37384B',
                        },
                      ]}>
                      <TextInput
                        multiline
                        style={styles.textArea}
                        value={tickitDescription}
                        onChangeText={(value) => setTickitDescription(value)}
                        placeholder="Provide details about your issue..."
                        placeholderTextColor="#787CA5"
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.cancelButton, { opacity: isLoading ? 0.5 : 1 }]}
                  onPress={closeTicketModal}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.submitButton, { opacity: isLoading ? 0.8 : 1 }]}
                  onPress={handelAddNewTicket}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#6f40f0','#8963f2', ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>Submit Ticket</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </KeyboardAvoidingView>

      {/* Toast Alert */}
      <ToastAlert
        visible={showToast}
        type={toastType}
        title={toastMessage}
        onHide={() => setShowToast(false)}
        duration={3000}
        position="bottom"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05071E',
  },
  keyboardAvoidingView: {
    flex: 1,
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#0A0D28',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#37384B',
    height: 50,
    paddingHorizontal: 12,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'LatoRegular',
    height: '100%',
  },
  clearButton: {
    padding: 6,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 100,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'LatoBold',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'LatoRegular',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'LatoBold',
    marginBottom: 8,
  },
  emptyStateDescription: {
    color: '#787CA5',
    fontSize: 16,
    fontFamily: 'LatoRegular',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearSearchButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(129, 91, 245, 0.2)',
    borderRadius: 12,
  },
  clearSearchText: {
    color: '#815BF5',
    fontSize: 14,
    fontFamily: 'LatoBold',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  fabLabelContainer: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fabLabel: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  fabLabelText: {
    color: '#000000',
    fontSize: 14,
    fontFamily: 'LatoBold',
    letterSpacing: 0.3,
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
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoid: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#0A0D28',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: height * 0.85,
    width: '100%',
  },
  modalGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeaderContent: {
    flex: 1,
    alignItems: 'center',
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    marginBottom: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'LatoBold',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: '#787CA5',
    fontSize: 14,
    fontFamily: 'LatoRegular',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  modalCloseButtonBlur: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalScrollView: {
    maxHeight: height * 0.6,
  },
  modalScrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formSection: {
    marginTop: 20,
    width: '100%',
  },
  formSectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'LatoBold',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
    width: '110%',
  
  },
  formLabel: {
    color: '#787CA5',
    fontSize: 14,
    fontFamily: 'LatoBold',
    marginBottom: 8,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 120,
  },
  textArea: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'LatoRegular',
    minHeight: 100,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'LatoBold',
  },
  submitButton: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'LatoBold',
  },
});