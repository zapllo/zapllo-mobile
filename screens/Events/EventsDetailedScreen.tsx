'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import LoadingZapllo from '~/components/LoadingZapllo';
import UserAvatar from '~/components/profile/UserAvatar';
import * as Haptics from 'expo-haptics';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePic?: string;
  email?: string;
}

interface Comment {
  _id: string;
  text: string;
  user: User;
  createdAt: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  capacity: number;
  createdBy: User;
  registrations: {
    user: User;
    registeredAt: string;
  }[];
  comments: Comment[];
}

const EventsDetailedScreen: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [userRegistered, setUserRegistered] = useState(false);
  
  const { token, user } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const { eventId } = useLocalSearchParams();

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_Host}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvent(response.data.data);
      
      // Check if user is registered
      if (user) {
        const isRegistered = response.data.data.registrations.some(
          (reg: any) => reg.user._id === user._id
        );
        setUserRegistered(isRegistered);
      }
    } catch (error: any) {
      console.error('Error fetching event details:', error);
      Alert.alert('Error', 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistration = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to register for events');
      return;
    }

    try {
      setRegistering(true);
      if (userRegistered) {
        await axios.delete(`${backend_Host}/events/${eventId}/register`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('Success', 'Registration cancelled successfully');
        setUserRegistered(false);
      } else {
        await axios.post(`${backend_Host}/events/${eventId}/register`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Alert.alert('Success', 'Successfully registered for event');
        setUserRegistered(true);
      }
      fetchEventDetails();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update registration');
    } finally {
      setRegistering(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim() || !user) return;

    try {
      setSubmitting(true);
      const response = await axios.post(`${backend_Host}/events/${eventId}/comments`, 
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (event) {
        setEvent({
          ...event,
          comments: [...event.comments, response.data.data]
        });
      }
      setComment('');
      Alert.alert('Success', 'Comment posted successfully');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this event: ${event?.title}`,
        url: `zapllo://events/${eventId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return <LoadingZapllo isVisible={true} size="large" showText={true} />;
  }

  if (!event) {
    return (
      <LinearGradient colors={['#04061e', '#0a0d2e']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.customNavbar}>
            <TouchableOpacity 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.back();
              }} 
              style={styles.customBackButton}
            >
              <Ionicons name="chevron-back-sharp" size={20} color="#787CA5" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Event not found</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isEventFull = event.registrations.length >= event.capacity;
  const isPastEvent = new Date(event.endDate) < new Date();

  return (
    <LinearGradient colors={['#04061e', '#0a0d2e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.customNavbar}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.customBackButton}
          >
            <Ionicons name="chevron-back-sharp" size={20} color="#787CA5" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Event Header Image */}
          <View style={styles.headerImageContainer}>
            {event.coverImage ? (
              <Image source={{ uri: event.coverImage }} style={styles.headerImage} />
            ) : (
              <LinearGradient
                colors={['#815BF5', '#FC8929']}
                style={styles.headerImagePlaceholder}
              >
                <MaterialIcons name="event" size={60} color="#FFFFFF" />
              </LinearGradient>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.headerOverlay}
            />
            <View style={styles.headerContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.createdBy}>
                Created by {event.createdBy.firstName} {event.createdBy.lastName}
              </Text>
            </View>
            <View style={styles.headerActions}>
              {isPastEvent && (
                <View style={styles.pastEventBadge}>
                  <Text style={styles.pastEventText}>Past Event</Text>
                </View>
              )}
              <TouchableOpacity style={styles.shareIcon} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleShare();
            }}>
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.contentContainer}>
            {/* Event Details Section */}
            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>About This Event</Text>
              <Text style={styles.description}>{event.description}</Text>
              
              <View style={styles.eventInfoContainer}>
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={20} color="#FC8929" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>{formatDate(event.startDate)}</Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={20} color="#FC8929" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Time</Text>
                    <Text style={styles.infoValue}>
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoRow}>
                  <Ionicons 
                    name={event.isVirtual ? "videocam-outline" : "location-outline"} 
                    size={20} 
                    color="#FC8929" 
                  />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>
                      {event.isVirtual ? 'Virtual Event' : event.location}
                    </Text>
                  </View>
                </View>

                {event.isVirtual && event.meetingLink && userRegistered && (
                  <View style={styles.infoRow}>
                    <Ionicons name="link-outline" size={20} color="#FC8929" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Meeting Link</Text>
                      <TouchableOpacity onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        Linking.openURL(event.meetingLink!);
                      }}>
                        <Text style={styles.linkText}>Join virtual event</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Registration Section */}
            <View style={styles.registrationCard}>
              <View style={styles.registrationHeader}>
                <View style={styles.attendanceInfo}>
                  <Ionicons name="people-outline" size={20} color="#FC8929" />
                  <Text style={styles.attendanceTitle}>Attendance</Text>
                </View>
                <View style={styles.capacityBadge}>
                  <Text style={styles.capacityText}>
                    {event.registrations.length}/{event.capacity} spots filled
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.registerButton,
                  (isPastEvent || (!userRegistered && isEventFull)) && styles.disabledButton
                ]}
                onPress={() => {
                  if (isPastEvent || (!userRegistered && isEventFull) || registering) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                  } else {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleRegistration();
                  }
                }}
                disabled={registering || (!userRegistered && (isEventFull || isPastEvent))}
              >
                <LinearGradient
                  colors={
                    isPastEvent || (!userRegistered && isEventFull)
                      ? ['#FC8929', '#FCA85C']
                      : userRegistered
                      ? ['#FF4444', '#CC0000']
                      : ['#FC8929', '#FCA85C']
                  }
                  style={styles.registerButtonGradient}
                >
                  <Text style={[
                    styles.registerButtonText,
                    { color: '#04061e' }
                  ]}>
                    {registering
                      ? "Processing..."
                      : userRegistered
                      ? "Cancel Registration"
                      : isPastEvent
                      ? "Event Ended"
                      : isEventFull
                      ? "Event Full"
                      : "Register Now"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Registered Users */}
              <View style={styles.attendeesSection}>
                <Text style={styles.attendeesTitle}>Registered Attendees</Text>
                {event.registrations.length > 0 ? (
                  <ScrollView style={styles.attendeesList} nestedScrollEnabled>
                    {event.registrations.map((reg) => (
                      <View key={reg.user._id} style={styles.attendeeRow}>
                        <UserAvatar
                          size={32}
                          borderColor="#FC8929"
                          userId={reg.user._id}
                          name={`${reg.user.firstName} ${reg.user.lastName}`}
                          imageUrl={reg.user.profilePic}
                        />
                        <View style={styles.attendeeInfo}>
                          <Text style={styles.attendeeName}>
                            {reg.user.firstName} {reg.user.lastName}
                          </Text>
                          {reg.user._id === user?._id && (
                            <Text style={styles.youLabel}>You</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.noAttendeesText}>No attendees yet</Text>
                )}
              </View>
            </View>

            {/* Comments Section */}
            <View style={styles.commentsCard}>
              <View style={styles.commentsHeader}>
                <Ionicons name="chatbubble-outline" size={20} color="#FC8929" />
                <Text style={styles.commentsTitle}>
                  Discussion ({event.comments.length})
                </Text>
              </View>

              {userRegistered ? (
                <View style={styles.commentInputSection}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add your comment..."
                    placeholderTextColor="#A9A9A9"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                  />
                  <TouchableOpacity
                    style={[styles.postButton, (!comment.trim() || submitting) && styles.disabledButton]}
                    onPress={() => {
                      if (!comment.trim() || submitting) {
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                      } else {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        handleCommentSubmit();
                      }
                    }}
                    disabled={submitting || !comment.trim()}
                  >
                    <LinearGradient
                      colors={['#FC8929', '#FCA85C']}
                      style={styles.postButtonGradient}
                    >
                      <Text style={[styles.postButtonText, { color: '#04061e' }]}>
                        {submitting ? 'Posting...' : 'Post Comment'}
                      </Text>
                      <Ionicons name="send" size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.loginPrompt}>
                  <Text style={styles.loginPromptText}>
                    Register for this event to join the discussion
                  </Text>
                </View>
              )}

              {/* Comments List */}
              <View style={styles.commentsList}>
                {event.comments.length > 0 ? (
                  event.comments.map((comment) => (
                    <View key={comment._id} style={styles.commentItem}>
                      <UserAvatar
                        size={32}
                        borderColor="#676B93"
                        userId={comment.user._id}
                        name={`${comment.user.firstName} ${comment.user.lastName}`}
                        imageUrl={comment.user.profilePic}
                      />
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentAuthor}>
                            {comment.user.firstName} {comment.user.lastName}
                          </Text>
                          <Text style={styles.commentDate}>
                            {formatCommentDate(comment.createdAt)}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>{comment.text}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noCommentsText}>No comments yet</Text>
                )}
              </View>
            </View>


          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  headerImageContainer: {
    height: 280,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  headerImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  headerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  eventTitle: {
    fontSize: 28,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  createdBy: {
    fontSize: 15,
    fontFamily: 'Lato-Light',
    color: '#E0E0E0',
    opacity: 0.9,
  },
  headerActions: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pastEventBadge: {
    backgroundColor: 'rgba(139, 69, 69, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  shareIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  pastEventText: {
    fontSize: 12,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  contentContainer: {
    padding: 24,
  },
  detailsCard: {
    padding: 0,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 17,
    fontFamily: 'Lato-Light',
    color: '#C4C4C4',
    lineHeight: 26,
    marginBottom: 32,
    letterSpacing: 0.2,
  },
  eventInfoContainer: {
    gap: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.1,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Lato-Light',
    color: '#C4C4C4',
    lineHeight: 22,
  },
  linkText: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#FC8929',
    textDecorationLine: 'underline',
  },
  registrationCard: {
    padding: 0,
    marginBottom: 40,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  attendanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceTitle: {
    fontSize: 20,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  capacityBadge: {
    backgroundColor: '#FC8929',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  capacityText: {
    fontSize: 12,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 17,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  attendeesSection: {
    marginTop: 8,
  },
  attendeesTitle: {
    fontSize: 16,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  attendeesList: {
    maxHeight: 200,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },

  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#FFFFFF',
  },
  youLabel: {
    fontSize: 12,
    fontFamily: 'LatoBold',
    color: '#FC8929',
  },
  noAttendeesText: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  commentsCard: {
    padding: 0,
    marginBottom: 40,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 20,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  commentInputSection: {
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Lato-Light',
    color: '#FFFFFF',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  postButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  postButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  postButtonText: {
    fontSize: 16,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  loginPrompt: {
    backgroundColor: 'rgba(55, 56, 75, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
    textAlign: 'center',
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
  },

  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  commentDate: {
    fontSize: 12,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
    lineHeight: 20,
  },
  noCommentsText: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FC8929',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  customNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  customBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    fontFamily: 'LatoBold',
    color: '#787CA5',
    marginLeft: 4,
  },
});

export default EventsDetailedScreen;