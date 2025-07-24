import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Animated, 
  Easing,
  Dimensions,
  Platform,
  Image
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { backend_Host } from '~/config';
import { useSelector } from 'react-redux';
import { RootState } from '~/redux/store';
import { ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import CustomDeleteModal from '~/components/CustomDeleteModal';

const { width } = Dimensions.get('window');

interface TickitCardProps {
  status: string;
  message: string;
  date: string;
  category: string;
  subCategory: string;
  subject: string;
  id: string;
  userName?: string; // Optional - only shown for admins
}

const TickitCard: React.FC<TickitCardProps> = ({
  status,
  message,
  date,
  category,
  subCategory,
  subject,
  id,
  userName
}: TickitCardProps) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [isVisible, setIsVisible] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initial animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();

    // Pulse animation for status badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,

        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
  
        }),
      ])
    ).start();
  }, []);

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      await handelDeleteTicket(id);
      setIsVisible(false);
      closeDeleteModal();
    } catch (error) {
      console.error("Error in confirmDelete:", error);
      setIsDeleting(false);
    }
  };

  const handelDeleteTicket = async (id: string) => {
    try {
      const response = await axios.delete(`${backend_Host}/tickets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      Alert.alert('Success', 'Ticket deleted successfully.');
    } catch (err: any) {
      console.error('API Error:', err.response || err.message);
      Alert.alert('Error', 'Failed to delete ticket. Please try again.');
      throw err; // Re-throw to handle in confirmDelete
    }
  };

  const navigateToDetail = () => {
    router.push({
      pathname: '/(routes)/profile/Tickits/TickitDetails' as any,
      params: { status, message, date, category, subCategory, subject, id },
    });
  };

  if (!isVisible) {
    return null;
  }

  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          borderColors: ['#FF6B6B', '#FF4757'],
          textColor: '#FF4757'
        };
      case 'resolved':
        return {
          borderColors: ['#2ED573', '#1DB954'],
          textColor: '#1DB954'
        };
      case 'in progress':
        return {
          borderColors: ['#FFCC66', '#FFA502'],
          textColor: '#FFA502'
        };
      default:
        return {
          borderColors: ['#7D5FFF', '#5352ED'],
          textColor: '#5352ED'
        };
    }
  };

  const getStatusIcon = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'resolved':
        return 'check-circle';
      case 'in progress':
        return 'autorenew';
      default:
        return 'info';
    }
  };

  const getFormattedDate = (dateString: string) => {
    return dateString;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={navigateToDetail}
        activeOpacity={0.95}
        onPressIn={() => {
          Animated.spring(scaleAnim, {
            toValue: 0.98,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }}
      >
        {/* Card Background with Gradient */}
        <LinearGradient
          colors={['#1F2235', '#141625']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardBackground}
        />
        
        {/* Card Content */}
        <View style={styles.cardContent}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
          <Animated.View 
              style={[
                styles.statusContainer,
                { transform: [{ scale: pulseAnim }] }
              ]}
            >
              <View style={styles.statusBadge}>
                <LinearGradient
                  colors={getStatusColor().borderColors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.statusBadgeBorder}
                />
                <MaterialIcons 
                  name={getStatusIcon()} 
                  size={14} 
                  color={getStatusColor().textColor} 
                  style={styles.statusIcon} 
                />
                <Text style={[styles.statusText, { color: getStatusColor().textColor }]}>
                  {status}
                </Text>
              </View>
            </Animated.View>
            
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <BlurView intensity={20} tint="dark" style={styles.deleteButtonBlur}>
              <Image
            style={{ width: 44, height: 44 }}
            source={require('../../assets/Tickit/delete.png')}/>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Card Body */}
        
            <Text style={styles.subjectText} numberOfLines={1}>
              {truncateText(subject, 30)}
            </Text>

   
        

          {/* Card Footer */}
          <View style={styles.cardFooter}>
            <View style={styles.footerItem}>
              <MaterialIcons name="event" size={16} color="#A3A9C1" />
              <Text style={styles.footerText}>{getFormattedDate(date)}</Text>
            </View>
            
            
            

          </View>
        </View>
      </TouchableOpacity>

      {/* Custom Delete Modal */}
      <CustomDeleteModal
        visible={showDeleteModal}
        title="Are you sure you want to"
        subtitle="delete this ticket?"
        itemName={`"${truncateText(subject, 40)}"`}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        cancelText="No, Keep It."
        confirmText="Delete"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: width * 0.92,
    marginHorizontal: width * 0.04,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    height:160,
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
  },
  cardContent: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'LatoBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  deleteButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },

  subjectText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'LatoBold',
   
   
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: '#A3A9C1',
    fontSize: 12,
    fontFamily: 'LatoRegular',
    marginLeft: 6,
  },
  footerDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A3A9C1',
    marginHorizontal: 10,
    opacity: 0.5,
  },

statusBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 30,
  backgroundColor: 'transparent',
  position: 'relative',
  overflow: 'hidden',
},
statusBadgeBorder: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  borderRadius: 30,
  opacity: 0.15, // This creates a transparent background with a hint of color
},
statusText: {
  fontSize: 12,
  fontFamily: 'LatoBold',
  textTransform: 'uppercase',
  letterSpacing: 0.8,
},
});

export default TickitCard;