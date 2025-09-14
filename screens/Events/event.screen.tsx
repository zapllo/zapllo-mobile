import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import LoadingZapllo from '~/components/LoadingZapllo';
import NavbarTwo from '~/components/navbarTwo';
import LottieView from 'lottie-react-native';

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
  registrations: {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  }[];
}

const { width } = Dimensions.get('window');

const EventsScreen: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const { token } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backend_Host}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const getFilteredEvents = () => {
    const now = new Date();
    switch (activeTab) {
      case 'upcoming':
        return events.filter(event => new Date(event.startDate) > now);
      case 'past':
        return events.filter(event => new Date(event.endDate) < now);
      default:
        return events.filter(event => new Date(event.startDate) > now);
    }
  };

  const renderEventCard = (event: Event) => {
    const isEventEnded = new Date(event.endDate) < new Date();
    
    return (
    <View key={event._id} style={styles.eventCard}>
      <View style={styles.eventImageContainer}>
        {event.coverImage ? (
          <Image source={{ uri: event.coverImage }} style={styles.eventImage} />
        ) : (
          <LinearGradient
            colors={['#815BF5', '#FC8929']}
            style={styles.eventImagePlaceholder}
          >
            <MaterialIcons name="event" size={40} color="#FFFFFF" />
          </LinearGradient>
        )}
      </View>
      
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Ionicons name="calendar-outline" size={16} color="#A9A9A9" />
            <Text style={styles.eventDetailText}>{formatDate(event.startDate)}</Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <Ionicons name="time-outline" size={16} color="#A9A9A9" />
            <Text style={styles.eventDetailText}>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <Ionicons name={event.isVirtual ? "videocam-outline" : "location-outline"} size={16} color="#A9A9A9" />
            <Text style={styles.eventDetailText}>
              {event.isVirtual ? 'Virtual Event' : event.location}
            </Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <Ionicons name="people-outline" size={16} color="#A9A9A9" />
            <Text style={styles.eventDetailText}>
              {event.registrations.length} / {event.capacity} registered
            </Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.viewDetailsButton, { borderColor: '#FC8929' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/HomeComponent/Events/${event._id}`);
            }}
          >
            <Text style={[styles.viewDetailsText, { color: '#FC8929' }]}>View Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.joinButton, isEventEnded && styles.disabledButton]}
            disabled={isEventEnded}
            onPress={() => {
              if (isEventEnded) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              } else {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            }}
          >
            <LinearGradient
              colors={isEventEnded ? ['#FC8929', '#FCA85C'] : ['#FC8929', '#FCA85C']}
              style={styles.joinButtonGradient}
            >
              <Text style={[
                styles.joinButtonText,
                { color: '#04061e' }
              ]}>
                {isEventEnded ? 'Event Ended' : 'Join Event'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LottieView
        source={require('~/assets/Animation/no-data.json')}
        autoPlay
        loop
        style={styles.lottieAnimation}
      />
      <Text style={styles.emptyTitle}>No Events Found</Text>
      <Text style={styles.emptySubtitle}>Check back later for upcoming events</Text>
    </View>
  );

  if (loading) {
    return <LoadingZapllo isVisible={true} size="large" showText={true} />;
  }

  return (
    <LinearGradient colors={['#04061e', '#0a0d2e']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <NavbarTwo title="Events" />
        
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FC8929']}
              tintColor="#FC8929"
            />
          }
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
           
          </View>

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={styles.tabWrapper}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setActiveTab('upcoming');
              }}
            >
              <LinearGradient
                colors={activeTab === 'upcoming' ? ['#815BF5', '#FC8929'] : ['#05071E', '#05071E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tab}
              >
                <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
                  Upcoming Events
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.tabWrapper}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                setActiveTab('past');
              }}
            >
              <LinearGradient
                colors={activeTab === 'past' ? ['#815BF5', '#FC8929'] : ['#05071E', '#05071E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tab}
              >
                <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
                  Past Events
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Events List */}
          <View style={styles.eventsContainer}>
            {getFilteredEvents().length === 0 ? (
              renderEmptyState()
            ) : (
              getFilteredEvents().map(renderEventCard)
            )}
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
    paddingHorizontal: 16,
  },
  headerSection: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#676B93',
    padding: 6,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  tab: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 50,
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: 'LatoBold',
  },
  eventsContainer: {
    paddingBottom: 100,
  },
  eventCard: {
    backgroundColor: 'rgba(10, 13, 40, 0.9)',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#37384B',
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
  eventImageContainer: {
    height: 160,
    width: '100%',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    fontSize: 13,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  viewDetailsButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FC8929',
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    fontFamily: 'LatoBold',
    color: '#FC8929',
  },
  joinButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#CCCCCC',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'LatoBold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#A9A9A9',
    textAlign: 'center',
  },
});

export default EventsScreen;
