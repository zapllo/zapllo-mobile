import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TrialExpirationModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  trialExpiresDate: string;
  companyName: string;
}

const { width, height } = Dimensions.get('window');

const TrialExpirationModal: React.FC<TrialExpirationModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  trialExpiresDate,
  companyName,
}) => {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: backdropOpacity }
          ]} 
        />
      </TouchableWithoutFeedback>
      
      <Animated.View 
        style={[
          styles.modalContainer,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.handle} />
        
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Image 
              source={require('../../assets/HomeComponents/ZTask.png')} 
              style={styles.modalIcon}
              resizeMode="contain"
            />
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.modalTitle}>Trial Period Expired</Text>
              <Text style={styles.modalDate}>
                Expired on {trialExpiresDate}
              </Text>
            </View>
          </View>
          
          <Text style={styles.modalText}>
            Your trial period for {companyName} has expired. To continue using Zapllo Task and Attendance features, please upgrade to a premium plan.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={onUpgrade}
            >
              <LinearGradient
                colors={['#815BF5', '#FC8929']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 13, 40, 0.7)',
  },
  modalContainer: {
    backgroundColor: '#1A1D35',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  contentContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  modalTitle: {
    fontFamily: 'LatoBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  modalDate: {
    fontFamily: 'Lato-Light',
    fontSize: 14,
    color: '#FC8929',
    marginTop: 4,
  },
  modalText: {
    fontFamily: 'Lato-Light',
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  upgradeButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    height: 48,
  },
  gradientButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    fontFamily: 'LatoBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  cancelButtonText: {
    fontFamily: 'Lato-Light',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default TrialExpirationModal;